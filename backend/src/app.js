const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const sweetsRoutes = require('./routes/sweets.routes');
const cartRoutes = require('./routes/cart.routes');
const app = express();
app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://tdd-kata-sweet-shop-management-system-1-v02m.onrender.com"
    ],
    credentials: true
  })
);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);
app.use('/api/cart', cartRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});
module.exports = app;
