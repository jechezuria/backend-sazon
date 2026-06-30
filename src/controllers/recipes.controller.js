const prisma = require('../lib/prisma');

// Incluye ingredientes, pasos y datos básicos del autor en cada receta
const RECIPE_INCLUDE = {
  ingredients: true,
  steps: { orderBy: { order: 'asc' } },
  author: { select: { id: true, name: true, username: true, avatarUrl: true } },
};

async function getAll(req, res) {
  const recipes = await prisma.recipe.findMany({
    include: RECIPE_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  res.json(recipes);
}

async function getById(req, res) {
  const { id } = req.params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: RECIPE_INCLUDE,
  });

  if (!recipe) {
    return res.status(404).json({ error: 'Receta no encontrada' });
  }
  res.json(recipe);
}

async function create(req, res) {
  const { title, description, imageUrl, category, difficulty, cookTime, servings, tags, authorId, ingredients, steps } = req.body;

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      imageUrl,
      category,
      difficulty,
      cookTime,
      servings,
      tags: tags ?? [],
      authorId,
      ingredients: { create: ingredients ?? [] },
      steps: { create: steps ?? [] },
    },
    include: RECIPE_INCLUDE,
  });

  res.status(201).json(recipe);
}

async function update(req, res) {
  const { id } = req.params;
  const { title, description, imageUrl, category, difficulty, cookTime, servings, tags } = req.body;

  const recipe = await prisma.recipe.update({
    where: { id },
    data: { title, description, imageUrl, category, difficulty, cookTime, servings, tags },
    include: RECIPE_INCLUDE,
  });

  res.json(recipe);
}

async function remove(req, res) {
  const { id } = req.params;
  await prisma.recipe.delete({ where: { id } });
  res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove };
