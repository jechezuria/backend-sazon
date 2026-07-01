const express = require('express');
const usersController = require('../controllers/users.controller');
const asyncHandler = require('../lib/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Ruta estática antes de /:id para que Express no lo interprete como ID
router.put('/me', requireAuth, asyncHandler(usersController.updateMe));

router.get('/:id', asyncHandler(usersController.getById));
router.get('/:id/recipes', asyncHandler(usersController.getRecipesByUser));

module.exports = router;
