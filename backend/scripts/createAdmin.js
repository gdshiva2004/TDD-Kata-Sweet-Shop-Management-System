// backend/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not set in environment');

    // adjust path if your models folder structure differs
    const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));

    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const email = process.argv[2] || 'admin@example.com';
    const pass = process.argv[3] || 'adminpass123';
    const name = process.argv[4] || 'Admin';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`User ${email} exists — promoting to admin.`);
      existing.role = 'admin';
      await existing.save();
      console.log('Promotion complete.');
    } else {
      const user = new User({ name, email, password: pass, role: 'admin' });
      await user.save();
      console.log(`Created admin user: ${email} (password: ${pass})`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
