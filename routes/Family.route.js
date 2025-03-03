const express = require('express');
const {
    addFamilyMembers,
    getFamilyMembers,
    updateFamilyMembers,
    deleteFamilyMembers,
} = require('../controllers/familyAuthController');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.js');

const router = express.Router();

// POST route to add a new family member with image upload
router.post('/', isAuthenticated, upload.single('image'), addFamilyMembers);

// GET route to retrieve family members
router.get('/', isAuthenticated, getFamilyMembers);

// PUT route to update a family member (supports image update)
router.put('/:id', isAuthenticated, upload.single('image'), updateFamilyMembers);

// DELETE route to remove a family member by ID
router.delete('/:id', isAuthenticated, deleteFamilyMembers);

module.exports = router;
