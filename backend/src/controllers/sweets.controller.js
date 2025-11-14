const { validationResult } = require('express-validator');
const Sweet = require('../models/Sweet');
exports.createSweet = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const data = req.body;
    const sweet = new Sweet(data);
    await sweet.save();
    res.status(201).json(sweet);
  } catch (err) { next(err); }
};
exports.listSweets = async (req, res, next) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json(sweets);
  } catch (err) { next(err); }
};
exports.getSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Not found' });
    res.json(sweet);
  } catch (err) { next(err); }
};
exports.searchSweets = async (req, res, next) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const q = {};
    if (name) q.name = new RegExp(name, 'i');
    if (category) q.category = category;
    if (minPrice || maxPrice) q.price = {};
    if (minPrice) q.price.$gte = Number(minPrice);
    if (maxPrice) q.price.$lte = Number(maxPrice);
    const sweets = await Sweet.find(q);
    res.json(sweets);
  } catch (err) { next(err); }
};
exports.updateSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sweet) return res.status(404).json({ error: 'Not found' });
    res.json(sweet);
  } catch (err) { next(err); }
};
exports.deleteSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
exports.purchaseSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Not found' });
    if (sweet.quantity <= 0) return res.status(400).json({ error: 'Out of stock' });
    sweet.quantity -= 1;
    await sweet.save();
    res.json({ message: 'Purchased', sweet });
  } catch (err) { next(err); }
};
exports.restockSweet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!Number.isInteger(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Not found' });
    sweet.quantity += amount;
    await sweet.save();
    res.json({ message: 'Restocked', sweet });
  } catch (err) { next(err); }
};
