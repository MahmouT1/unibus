const { body } = require('express-validator');

const studentRegistrationValidation = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('college').trim().notEmpty().withMessage('College is required'),
    body('grade').isIn(['freshman', 'sophomore', 'junior', 'senior', 'graduate']).withMessage('Valid grade is required'),
    body('major').trim().notEmpty().withMessage('Major is required')
];

const subscriptionValidation = [
    body('planType').isIn(['Basic', 'Standard', 'Premium']).withMessage('Valid plan type is required'),
    body('amount').isNumeric().isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('paymentMethod').isIn(['cash', 'bank_transfer', 'credit_card', 'debit_card']).withMessage('Valid payment method is required')
];

const supportTicketValidation = [
    body('category').isIn(['emergency', 'general', 'academic', 'technical', 'billing']).withMessage('Valid category is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters')
];

module.exports = {
    studentRegistrationValidation,
    subscriptionValidation,
    supportTicketValidation
};