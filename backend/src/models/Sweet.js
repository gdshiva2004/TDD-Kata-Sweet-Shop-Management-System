const mongoose = require('mongoose');
const SweetSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  description: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Sweet', SweetSchema);
