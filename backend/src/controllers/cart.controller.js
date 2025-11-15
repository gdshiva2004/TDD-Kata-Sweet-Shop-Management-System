// controllers/cart.controller.js
const Cart = require('../models/Cart');
const Sweet = require('../models/Sweet');
const mongoose = require('mongoose');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.sweet');
    res.json(cart || { user: req.user.id, items: [] });
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { sweetId, qty = 1 } = req.body;
    if (!sweetId) return res.status(400).json({ error: 'sweetId required' });
    const q = Math.max(1, Math.floor(Number(qty) || 1));

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [{ sweet: sweetId, qty: q }] });
      await cart.save();
      await cart.populate('items.sweet');
      return res.status(201).json(cart);
    }

    const existing = cart.items.find(it => String(it.sweet) === String(sweetId));
    if (existing) {
      existing.qty = (existing.qty || 0) + q;
    } else {
      cart.items.push({ sweet: sweetId, qty: q });
    }
    await cart.save();
    await cart.populate('items.sweet');
    res.json(cart);
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params; // id is cart item _id
    let { qty } = req.body;
    qty = Number(qty);
    if (!Number.isInteger(qty) || qty < 0) return res.status(400).json({ error: 'Invalid qty' });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    // find index and mutate array (safer than relying on subdoc methods)
    const idx = cart.items.findIndex(it => String(it._id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });

    if (qty === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].qty = qty;
    }

    await cart.save();
    await cart.populate('items.sweet');
    res.json(cart);
  } catch (err) { next(err); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params; // cart item _id
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const idx = cart.items.findIndex(it => String(it._id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });

    cart.items.splice(idx, 1);
    await cart.save();
    await cart.populate('items.sweet');
    res.json(cart);
  } catch (err) { next(err); }
};

// Checkout: atomically decrement sweets quantity, fail if insufficient stock
exports.checkout = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: req.user.id }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // load sweets with lock
    const sweetIds = cart.items.map(i => i.sweet);
    const sweets = await Sweet.find({ _id: { $in: sweetIds } }).session(session);

    // map for quick lookup
    const map = new Map(sweets.map(s => [String(s._id), s]));

    // validate stock
    for (const it of cart.items) {
      const s = map.get(String(it.sweet));
      if (!s) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: `Item not found: ${it.sweet}` });
      }
      if (s.quantity < it.qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Insufficient stock for ${s.name}` });
      }
    }

    // decrement stock
    for (const it of cart.items) {
      const s = map.get(String(it.sweet));
      s.quantity -= it.qty;
      await s.save({ session });
    }

    // optional: create order document here (omitted for brevity)

    // clear cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Checkout successful' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
