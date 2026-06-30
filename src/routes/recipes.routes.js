const express = require('express');
const recipesController = require('../controllers/recipes.controller');
const asyncHandler = require('../lib/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Rutas estáticas antes de "/:id" — si no, Express interpreta "liked" como un id
router.get('/liked/mine', requireAuth, asyncHandler(recipesController.getLikedByMe));

router.get('/', asyncHandler(recipesController.getAll));
router.get('/:id', asyncHandler(recipesController.getById));
router.post('/', asyncHandler(recipesController.create));
router.put('/:id', asyncHandler(recipesController.update));
router.delete('/:id', asyncHandler(recipesController.remove));
router.post('/:id/like', requireAuth, asyncHandler(recipesController.toggleLike));

module.exports = router;
