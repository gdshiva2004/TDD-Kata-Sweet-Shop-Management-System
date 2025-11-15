const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', cartController.getCart);
router.post('/', cartController.addItem); // body: { sweetId, qty }
router.put('/:id', cartController.updateItem); // id = cart item id
router.delete('/:id', cartController.deleteItem);
router.post('/checkout', cartController.checkout);

module.exports = router;
