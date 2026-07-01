const prisma = require('../lib/prisma');
const { toApiUser, toApiRecipe } = require('../lib/serializers');

async function getById(req, res) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.json(toApiUser(user));
}

async function getRecipesByUser(req, res) {
  const { id } = req.params;
  const recipes = await prisma.recipe.findMany({
    where: { authorId: id },
    include: {
      ingredients: true,
      steps: { orderBy: { order: 'asc' } },
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(recipes.map(toApiRecipe));
}

async function updateMe(req, res) {
  const { name, bio, avatarUrl } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(name      !== undefined && { name }),
      ...(bio       !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });

  res.json(toApiUser(user));
}

module.exports = { getById, getRecipesByUser, updateMe };
