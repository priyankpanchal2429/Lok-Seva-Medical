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

    const users = [
      {
        id: 'Priyank001',
        name: 'Priyank',
        passwordHash: await hashPassword('Panchal009'),
      },
      {
        id: 'Staff001',
        name: 'Medical Staff',
        passwordHash: await hashPassword('Medical123'),
      }
    ];

    for (const userData of users) {
      await User.findOneAndUpdate(
        { id: userData.id },
        userData,
        { upsert: true, new: true }
      );
    }

    console.log(`[SEED] Success! Default users ready in MongoDB.`);
    console.log(`[SEED] Added: Priyank001, Staff001`);
    
    await mongoose.disconnect();
    console.log('[SEED] Disconnected from MongoDB.');
  } catch (error) {
    console.error('[SEED] Failed to seed database:', error.message);
    process.exit(1);
  }
}

seed();
