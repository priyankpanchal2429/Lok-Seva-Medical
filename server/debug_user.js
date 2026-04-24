const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/env');

async function check() {
  try {
    await mongoose.connect(config.mongodbUri);
    const user = await User.findOne({ id: 'Priyank001' });
    if (user) {
      console.log('--- USER FOUND ---');
      console.log('ID:', user.id);
      console.log('Name:', user.name);
      console.log('Hash exists:', !!user.passwordHash);
      console.log('Hash length:', user.passwordHash?.length);
      
      const { comparePassword } = require('./utils/hashUtil');
      const match = await comparePassword('Panchal009', user.passwordHash);
      console.log('Password Match Test (Panchal009):', match);
    } else {
      console.log('User NOT found in database.');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
