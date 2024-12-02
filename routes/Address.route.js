const express = require('express');
const router = express.Router();
const { createAddress, updateAddress, deleteAddress, getUserAddresses, getDefaultAddress } = require('../controllers/AdressController');

router.post('/', (req, res, next) => {
    console.log('Received request to create address:', req.body);
    next(); // Proceed to the next middleware/route handler
  });
  
// Get all addresses for a user
router.get('/:userId', getUserAddresses);
// Create new address
router.post('/new', createAddress);

// Update address
router.put('/:addressId', updateAddress);

// Delete address
router.delete('/:addressId', deleteAddress);

// Get all addresses for a user
router.get('/:userId', getUserAddresses);

// Get default address for a user
router.get('/default/:userId', getDefaultAddress);

module.exports = router;
