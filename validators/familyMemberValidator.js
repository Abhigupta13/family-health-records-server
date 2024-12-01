const { body } = require('express-validator');

// Define the validation rules for adding a family member
const validateFamilyMember = [
  body('name').not().isEmpty().withMessage('Name is required'), // Name should not be empty
  body('relation').not().isEmpty().withMessage('Relation is required'), // Relation should not be empty
  body('birth_date').optional().isISO8601().withMessage('Invalid date format for birth_date'), // Validate birth_date if provided
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender value'), // Validate gender
  body('contact_info').optional().isString().withMessage('Contact info must be a string'), // Optional field validation for contact_info
  body('address').optional().isString().withMessage('Address must be a string') // Optional field validation for address
];

module.exports = { validateFamilyMember };
