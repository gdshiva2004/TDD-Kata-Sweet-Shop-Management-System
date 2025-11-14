const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const sweetsController = require('../controllers/sweets.controller');
const { protect, adminOnly } = require('../middleware/auth');
router.post('/',
  protect,
  adminOnly,
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('price').isFloat({ gt: 0 }),
  body('quantity').isInt({ min: 0 }),
  sweetsController.createSweet
);
router.get('/', sweetsController.listSweets);
router.get('/search', sweetsController.searchSweets);
router.get('/:id', sweetsController.getSweet);
router.put('/:id', protect, adminOnly, sweetsController.updateSweet);
router.delete('/:id', protect, adminOnly, sweetsController.deleteSweet);
router.post('/:id/purchase', protect, sweetsController.purchaseSweet);
router.post('/:id/restock', protect, adminOnly, sweetsController.restockSweet);
module.exports = router;
