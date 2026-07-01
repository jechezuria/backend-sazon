const prisma = require('../lib/prisma');
const { difficultyToDb } = require('../lib/difficulty');
const { toApiRecipe } = require('../lib/serializers');

const RECIPE_INCLUDE = {
  ingredients: true,
  steps: { orderBy: { order: 'asc' } },
  author: { select: { id: true, name: true, username: true, avatarUrl: true } },
};

// GET /api/recipes?category=Desayuno&difficulty=Fácil&search=avena&authorId=...
async function getAll(req, res) {
  const { category, difficulty, search, authorId } = req.query;

  const where = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficultyToDb(difficulty);
  if (authorId) where.authorId = authorId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search.toLowerCase()] } },
      { ingredients: { some: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const recipes = await prisma.recipe.findMany({
    where,
    include: RECIPE_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  res.json(recipes.map(toApiRecipe));
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
  res.json(toApiRecipe(recipe));
}

async function create(req, res) {
  const { title, description, imageUrl, category, difficulty, cookTime, servings, tags, authorId, ingredients, steps } = req.body;

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      imageUrl,
      category,
      difficulty: difficultyToDb(difficulty),
      cookTime,
      servings,
      tags: tags ?? [],
      authorId,
      ingredients: { create: ingredients ?? [] },
      steps: { create: steps ?? [] },
    },
    include: RECIPE_INCLUDE,
  });

  res.status(201).json(toApiRecipe(recipe));
}

async function update(req, res) {
  const { id } = req.params;
  const { title, description, imageUrl, category, difficulty, cookTime, servings, tags, ingredients, steps } = req.body;

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      title,
      description,
      imageUrl,
      category,
      difficulty: difficulty ? difficultyToDb(difficulty) : undefined,
      cookTime,
      servings,
      tags,
      // Reemplaza ingredientes y pasos si vienen en el body
      ...(ingredients && {
        ingredients: { deleteMany: {}, create: ingredients },
      }),
      ...(steps && {
        steps: { deleteMany: {}, create: steps },
      }),
    },
    include: RECIPE_INCLUDE,
  });

  res.json(toApiRecipe(recipe));
}

async function remove(req, res) {
  const { id } = req.params;
  await prisma.recipe.delete({ where: { id } });
  res.status(204).send();
}

// POST /api/recipes/:id/like — requiere auth. Toggle: si ya tenía like lo quita, sino lo agrega.
async function toggleLike(req, res) {
  const { id: recipeId } = req.params;
  const userId = req.userId;

  const existing = await prisma.like.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return res.json({ liked: false });
  }

  await prisma.like.create({ data: { userId, recipeId } });
  res.json({ liked: true });
}

// GET /api/recipes/liked/mine — requiere auth. Recetas que le gustan al usuario logueado.
async function getLikedByMe(req, res) {
  const likes = await prisma.like.findMany({
    where: { userId: req.userId },
    include: { recipe: { include: RECIPE_INCLUDE } },
  });

  res.json(likes.map(like => toApiRecipe(like.recipe)));
}

module.exports = { getAll, getById, create, update, remove, toggleLike, getLikedByMe };
