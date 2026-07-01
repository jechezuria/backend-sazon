const express = require('express');
const usersController = require('../controllers/users.controller');
const asyncHandler = require('../lib/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Rutas estáticas antes de /:id para que Express no lo interprete como ID
router.put('/me', requireAuth, asyncHandler(usersController.updateMe));
router.put('/me/password', requireAuth, asyncHandler(usersController.changePassword));

router.get('/:id', asyncHandler(usersController.getById));
router.get('/:id/recipes', asyncHandler(usersController.getRecipesByUser));

module.exports = router;
