require('dotenv').config();
const mongoose = require('mongoose');

console.log('Trying to connect to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connection succeeded');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error('Connection failed:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  });
