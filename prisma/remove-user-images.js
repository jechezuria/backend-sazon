const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ver todas las recetas llamadas "Panqueque"
  const found = await prisma.recipe.findMany({
    where: { title: { contains: 'Panqueque', mode: 'insensitive' } },
    select: { id: true, title: true, imageUrl: true, author: { select: { email: true, name: true } } },
  });

  console.log('Recetas encontradas:');
  found.forEach(r => console.log(`  id=${r.id} | title="${r.title}" | imageUrl="${r.imageUrl}" | autor=${r.author.email}`));

  // Borra la imagen de las que NO son del seed original (título exacto distinto al seed)
  // El seed tiene "Panqueques de Avena", no "Panqueque"
  const toFix = found.filter(r => r.title === 'Panqueque');
  for (const r of toFix) {
    await prisma.recipe.update({ where: { id: r.id }, data: { imageUrl: '' } });
    console.log(`Imagen removida de "${r.title}" (${r.author.email})`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
