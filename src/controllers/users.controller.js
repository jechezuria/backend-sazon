const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { toApiUser, toApiRecipe } = require('../lib/serializers');

const SALT_ROUNDS = 10;

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

async function changePassword(req, res) {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'La nueva contraseña es obligatoria' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 1 letra y 1 número' });
  }
  if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
    return res.status(400).json({ error: 'La contraseña solo puede contener letras y números' });
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: req.userId },
    data: { passwordHash },
  });

  res.json({ message: 'Contraseña actualizada correctamente' });
}

module.exports = { getById, getRecipesByUser, updateMe, changePassword };
