const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const { ROLES } = require('../config/constants');

/**
 * Creates the initial administrative account and test delivery agent account.
 * Reads credentials securely from environment variables.
 */
async function createAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_bakery_cafe';
  console.log(`[Admin Setup] Connecting to: ${uri}`);
  await mongoose.connect(uri);

  const adminName = process.env.INITIAL_ADMIN_NAME || 'Admin Manager';
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@smartbakery.com').toLowerCase();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword123!';
  const adminPhone = process.env.INITIAL_ADMIN_PHONE || '9876543210';

  console.log(`[Admin Setup] Ensuring admin account exists for: ${adminEmail}`);

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: ROLES.ADMIN,
      phone: adminPhone,
    });
    await admin.save();
    console.log(`[Admin Setup] Successfully created new Admin account: ${adminEmail}`);
  } else {
    admin.role = ROLES.ADMIN;
    admin.password = adminPassword; // Triggers pre-save hash
    await admin.save();
    console.log(`[Admin Setup] Existing admin account password and role updated: ${adminEmail}`);
  }

  // Also create a demo delivery agent account
  const agentEmail = 'delivery@smartbakery.com';
  let agent = await User.findOne({ email: agentEmail });
  if (!agent) {
    agent = new User({
      name: 'Ravi Delivery Partner',
      email: agentEmail,
      password: 'DeliverySecurePass123!',
      role: ROLES.DELIVERY_AGENT,
      phone: '9812345678',
    });
    await agent.save();
    console.log(`[Admin Setup] Created demo Delivery Agent account: ${agentEmail} (Password: DeliverySecurePass123!)`);
  }

  // Also create a demo customer account with a verified address within 5 km
  const customerEmail = 'customer@smartbakery.com';
  let customer = await User.findOne({ email: customerEmail });
  if (!customer) {
    customer = new User({
      name: 'Priya Sharma (Gourmet Customer)',
      email: customerEmail,
      password: 'CustomerPass123!',
      role: ROLES.CUSTOMER,
      phone: '9876543210',
      addresses: [
        {
          label: 'Home',
          street: 'Flat 402, Barakhamba Road, Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          postalCode: '110001',
          landmark: 'Near Metro Gate No. 2',
          coordinates: {
            lat: 28.6315,
            lng: 77.2167,
          },
          isDefault: true,
        },
      ],
    });
    await customer.save();
    console.log(`[Admin Setup] Created demo Customer account: ${customerEmail} (Password: CustomerPass123!)`);
  }

  await mongoose.disconnect();
  console.log('[Admin Setup] Setup complete. You can now log into the Admin portal.');
  process.exit(0);
}

if (require.main === module) {
  createAdmin().catch((err) => {
    console.error(`[Admin Setup Error] Failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = createAdmin;
