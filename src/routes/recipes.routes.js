const express = require('express');
const recipesController = require('../controllers/recipes.controller');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(recipesController.getAll));
router.get('/:id', asyncHandler(recipesController.getById));
router.post('/', asyncHandler(recipesController.create));
router.put('/:id', asyncHandler(recipesController.update));
router.delete('/:id', asyncHandler(recipesController.remove));

module.exports = router;
