const Product = require('../models/Product');
const InventoryBatch = require('../models/InventoryBatch');
const { INVENTORY_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Safely reserves stock for a list of order items using atomic Mongoose operations
 * Prevents overselling during concurrent checkouts.
 * @param {Array} items Array of { productId, quantity }
 */
const reserveStock = async (items) => {
  const reservedProducts = [];

  try {
    for (const item of items) {
      // Atomic deduction: only decrements if available stockQuantity >= item.quantity
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stockQuantity: { $gte: item.quantity },
          isAvailable: true,
        },
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        // Find product to provide meaningful error message
        const prod = await Product.findById(item.productId);
        const name = prod ? prod.name : 'Selected product';
        const available = prod ? prod.stockQuantity : 0;
        throw new Error(
          `Insufficient stock for '${name}'. Requested: ${item.quantity}, Available: ${available}`
        );
      }

      reservedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });

      // Deduct from batches using First-Expired First-Out (FEFO)
      await allocateBatchStock(item.productId, item.quantity);
    }

    return true;
  } catch (error) {
    // Rollback any stock deducted prior to failure
    logger.warn('Stock reservation failed, rolling back reserved items...');
    for (const reserved of reservedProducts) {
      await Product.findByIdAndUpdate(reserved.productId, {
        $inc: { stockQuantity: reserved.quantity },
      });
      await restoreBatchStock(reserved.productId, reserved.quantity);
    }
    throw error;
  }
};

/**
 * Allocates stock from active inventory batches based on FEFO (First-Expired First-Out)
 */
const allocateBatchStock = async (productId, quantityToDeduct) => {
  let remainingNeeded = quantityToDeduct;

  const activeBatches = await InventoryBatch.find({
    product: productId,
    status: INVENTORY_STATUS.ACTIVE,
    expiryDate: { $gt: new Date() },
    remainingQuantity: { $gt: 0 },
  }).sort({ expiryDate: 1 });

  for (const batch of activeBatches) {
    if (remainingNeeded <= 0) break;

    const deduction = Math.min(batch.remainingQuantity, remainingNeeded);
    batch.remainingQuantity -= deduction;
    remainingNeeded -= deduction;

    if (batch.remainingQuantity === 0) {
      batch.status = INVENTORY_STATUS.DEPLETED;
    }
    await batch.save();
  }
};

/**
 * Restores stock back to inventory upon valid order cancellation
 */
const restoreStock = async (items) => {
  for (const item of items) {
    const productId = item.product?._id || item.product || item.productId;
    const quantity = item.quantity;

    await Product.findByIdAndUpdate(productId, {
      $inc: { stockQuantity: quantity },
    });

    await restoreBatchStock(productId, quantity);
  }
  logger.info(`Restored stock for ${items.length} items.`);
};

/**
 * Restores stock back into the latest active batch
 */
const restoreBatchStock = async (productId, quantityToRestore) => {
  const latestBatch = await InventoryBatch.findOne({
    product: productId,
    expiryDate: { $gt: new Date() },
  }).sort({ expiryDate: -1 });

  if (latestBatch) {
    latestBatch.remainingQuantity += quantityToRestore;
    if (latestBatch.status === INVENTORY_STATUS.DEPLETED) {
      latestBatch.status = INVENTORY_STATUS.ACTIVE;
    }
    await latestBatch.save();
  }
};

module.exports = {
  reserveStock,
  restoreStock,
  allocateBatchStock,
};
