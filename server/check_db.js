require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, { id: 1, name: 1, _id: 0 });
    console.log("Users in DB:");
    console.log(users);
  } catch (error) {
    console.error("DB Error:", error);
  } finally {
    mongoose.disconnect();
  }
}
check();
