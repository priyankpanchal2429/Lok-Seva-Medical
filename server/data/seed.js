/**
 * Seed Script
 * Generates the default user with a bcrypt-hashed password.
 * Run: npm run seed
 *
 * Default credentials:
 *   ID:       Priyank001
 *   Password: Panchal009
 */

const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const { hashPassword } = require('../utils/hashUtil');

async function seed() {
  try {
    console.log('[SEED] Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);

    const passwordHash = await hashPassword('Panchal009');

    const defaultUser = {
      id: 'Priyank001',
      name: 'Priyank',
      passwordHash,
    };

    // Upsert the user (update if exists, insert if not)
    await User.findOneAndUpdate(
      { id: defaultUser.id },
      defaultUser,
      { upsert: true, new: true }
    );

    console.log(`[SEED] Success! Default user ready in MongoDB.`);
    console.log(`[SEED] User ID: Priyank001`);
    
    await mongoose.disconnect();
    console.log('[SEED] Disconnected from MongoDB.');
  } catch (error) {
    console.error('[SEED] Failed to seed database:', error.message);
    process.exit(1);
  }
}

seed();
