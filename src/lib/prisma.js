const { PrismaClient } = require('@prisma/client');

// Singleton: una sola instancia de PrismaClient para toda la app.
// Crear una nueva por cada request agotaría las conexiones a la base.
const prisma = new PrismaClient();

module.exports = prisma;
