const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { signToken } = require('../lib/jwt');
const { toApiUser } = require('../lib/serializers');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'name, username, email y password son obligatorios' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 1 letra y 1 número' });
  }
  if (!/^[a-zA-Z0-9]+$/.test(password)) {
    return res.status(400).json({ error: 'La contraseña solo puede contener letras y números' });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese email o username' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, username, email, passwordHash },
  });

  const token = signToken(user.id);
  res.status(201).json({ token, user: toApiUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user?.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  const token = signToken(user.id);
  res.json({ token, user: toApiUser(user) });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.json(toApiUser(user));
}

module.exports = { register, login, me };
