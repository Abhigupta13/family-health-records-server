const express = require('express');
const {
    addFamilyMembers,
    getFamilyMembers,
    updateFamilyMembers,
    deleteFamilyMembers,
} = require('../controllers/familyAuthController');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST route to add a new family member
router.post('/', isAuthenticated, addFamilyMembers);

// Route for getting family members (Authenticated)
router.get('/', isAuthenticated, getFamilyMembers);

// PUT endpoint to update a family member
router.put('/:id', isAuthenticated, updateFamilyMembers);

// DELETE /family/:id - Delete family member by ID
router.delete('/:id', isAuthenticated, deleteFamilyMembers);

module.exports = router;
