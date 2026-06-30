const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const author = await prisma.user.upsert({
    where: { email: 'sofia@sazon.app' },
    update: {},
    create: {
      name: 'Sofia Chen',
      username: 'sofia',
      email: 'sofia@sazon.app',
      bio: 'Cocinera apasionada 🍳 Comparto lo que cocino con amor.',
    },
  });

  await prisma.recipe.create({
    data: {
      title: 'Panqueques de Avena',
      description: 'Panqueques esponjosos y saludables hechos con avena y banana.',
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
      category: 'Desayuno',
      difficulty: 'Facil',
      cookTime: '20 min',
      servings: 4,
      tags: ['desayuno', 'saludable', 'avena'],
      authorId: author.id,
      ingredients: {
        create: [
          { name: 'Avena', amount: '1 taza' },
          { name: 'Banana madura', amount: '1 grande' },
          { name: 'Huevos', amount: '2 unidades' },
        ],
      },
      steps: {
        create: [
          { order: 1, description: 'Licuá todos los ingredientes hasta obtener una mezcla homogénea.' },
          { order: 2, description: 'Cociná en sartén antiadherente 2-3 minutos por lado.' },
        ],
      },
    },
  });

  console.log('Seed completado ✅');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
