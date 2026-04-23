const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/env');

async function test() {
  try {
    console.log('Testing connection...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected.');
    const user = await User.findOne({ id: 'Priyank001' });
    console.log('User found:', user ? user.id : 'NOT FOUND');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
