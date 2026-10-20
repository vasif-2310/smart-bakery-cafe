const Product = require('../models/Product');
const ApiResponse = require('../utils/apiResponse');
const { CATEGORIES } = require('../config/constants');

/**
 * @desc    Get all products with category filter, search, sort & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      isVegetarian,
      search,
      minPrice,
      maxPrice,
      availableOnly,
      sortBy,
      page = 1,
      limit = 30,
    } = req.query;

    const query = {};

    // Filter by Category
    if (category && Object.values(CATEGORIES).includes(category)) {
      query.category = category;
    }

    // Filter by Vegetarian / Non-Vegetarian
    if (isVegetarian !== undefined) {
      query.isVegetarian = isVegetarian === 'true';
    }

    // Filter by Availability
    if (availableOnly === 'true') {
      query.isAvailable = true;
      query.stockQuantity = { $gt: 0 };
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by product name
    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Sorting Logic
    let sort = {};
    if (sortBy === 'price_asc') sort.price = 1;
    else if (sortBy === 'price_desc') sort.price = -1;
    else if (sortBy === 'prep_time') sort.preparationTime = 1;
    else if (sortBy === 'popular') sort.isPopular = -1;
    else if (sortBy === 'rating') sort.averageRating = -1;
    else sort.createdAt = -1; // Default newest first

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sort).skip(skip).limit(limitNum);

    return ApiResponse.success(
      res,
      {
        products,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
      'Products retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or Slug
 * @route   GET /api/products/:identifier
 * @access  Public
 */
const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let product;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    } else {
      product = await Product.findOne({ slug: identifier });
    }

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    return ApiResponse.success(res, { product }, 'Product details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products, bestsellers, and rule-based smart combo recommendations
 * @route   GET /api/products/meta/featured-and-combos
 * @access  Public
 */
const getFeaturedAndCombos = async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeatured: true, isAvailable: true }).limit(6);
    const bestsellers = await Product.find({ isPopular: true, isAvailable: true }).limit(6);

    // Rule-Based Smart Combos:
    // Combo 1: Artisan Coffee + Gourmet Pastry
    const coffeeItem = await Product.findOne({ category: CATEGORIES.CAFE, name: 'Cappuccino' });
    const pastryItem = await Product.findOne({ category: CATEGORIES.BAKERY, name: 'Red Velvet Pastry' });

    // Combo 2: Gourmet Burger + Cold Beverage
    const burgerItem = await Product.findOne({ category: CATEGORIES.NON_VEGETARIAN, name: 'Chicken Burger' });
    const coldDrink = await Product.findOne({ category: CATEGORIES.CAFE, name: 'Cold Coffee' });

    // Combo 3: Croissant + Espresso (Morning Parisian Breakfast)
    const croissant = await Product.findOne({ category: CATEGORIES.BAKERY, name: 'Croissant' });
    const espresso = await Product.findOne({ category: CATEGORIES.CAFE, name: 'Espresso' });

    const combos = [
      {
        id: 'combo-1',
        title: 'Afternoon Indulgence',
        description: 'Silky Hot Cappuccino paired with decadent Red Velvet Pastry.',
        discountPercent: 15,
        items: [coffeeItem, pastryItem].filter(Boolean),
      },
      {
        id: 'combo-2',
        title: 'Savory Delight Feast',
        description: 'Crisp Chicken Burger accompanied by thick gourmet Cold Coffee.',
        discountPercent: 12,
        items: [burgerItem, coldDrink].filter(Boolean),
      },
      {
        id: 'combo-3',
        title: 'Morning Parisian Ritual',
        description: 'Flaky Golden Croissant served with authentic double-shot Espresso.',
        discountPercent: 10,
        items: [croissant, espresso].filter(Boolean),
      },
    ];

    return ApiResponse.success(
      res,
      {
        featured,
        bestsellers,
        combos,
      },
      'Featured items and curated combinations retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return ApiResponse.created(res, { product }, 'Product created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    return ApiResponse.success(res, { product }, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }
    return ApiResponse.success(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductByIdOrSlug,
  getFeaturedAndCombos,
  createProduct,
  updateProduct,
  deleteProduct,
};
