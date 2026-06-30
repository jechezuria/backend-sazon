const express = require('express');
const usersController = require('../controllers/users.controller');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

router.get('/:id', asyncHandler(usersController.getById));
router.get('/:id/recipes', asyncHandler(usersController.getRecipesByUser));

module.exports = router;
