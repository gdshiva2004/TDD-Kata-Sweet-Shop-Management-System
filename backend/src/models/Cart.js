const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  sweet: { type: mongoose.Schema.Types.ObjectId, ref: 'Sweet', required: true },
  qty: { type: Number, required: true, min: 1, default: 1 }
}, { _id: true });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
