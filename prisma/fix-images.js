/**
 * Actualiza las imageUrl de las recetas del seed (autores sofia y marco).
 * No toca recetas creadas por usuarios de la app.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapa título → URL fresca y verificada
const SEED_IMAGES = {
  // ── Desayuno ──────────────────────────────────────────────────────────────
  'Panqueques de Avena':          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  'Tostada Aguacate':             'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=800',
  'Tostadas con Ricotta y Miel':  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800',
  'Huevos Revueltos con Espinaca':'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
  'Smoothie Bowl de Frutillas':   'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800',
  'Omelette de Queso y Jamón':    'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800',
  'Yogur con Granola Casera':     'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',

  // ── Almuerzo ──────────────────────────────────────────────────────────────
  'Bowl Mediterráneo':            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  'Ensalada César':               'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
  'Milanesa con Puré':            'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800',
  'Risotto de Hongos':            'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800',
  'Empanadas de Carne':           'https://images.unsplash.com/photo-1604467707321-7e167bb8d72c?w=800',
  'Sándwich de Pollo Grillado':   'https://images.unsplash.com/photo-1521390188846-e2a3a97453ca?w=800',
  'Wok de Vegetales y Tofu':      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',

  // ── Cena ──────────────────────────────────────────────────────────────────
  'Pasta Carbonara Clásica':      'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
  'Tacos de Pollo':               'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
  'Salmón al Horno con Espárragos':'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  'Pizza Casera Margherita':      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
  'Hamburguesas Caseras':         'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  'Curry de Garbanzos':           'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
  'Pollo al Limón con Papas':     'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',

  // ── Postre ────────────────────────────────────────────────────────────────
  'Mousse de Chocolate':          'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=800',
  'Bizcochuelo de Naranja':       'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800',
  'Flan Casero':                  'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
  'Brownies de Chocolate':        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
  'Tarta de Manzana':             'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=800',
  'Helado de Vainilla Casero':    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800',
  'Alfajores de Maicena':         'https://images.unsplash.com/photo-1499636136210-6f4ee915583a?w=800',

  // ── Snack ─────────────────────────────────────────────────────────────────
  'Hummus con Bastones de Verdura':'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  'Palomitas Caseras':            'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=800',
  'Barras de Cereal':             'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=800',
  'Guacamole con Nachos':         'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
  'Bruschettas de Tomate':        'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800',

  // ── Vegetariano ───────────────────────────────────────────────────────────
  'Berenjenas a la Parmesana':    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'Tarta de Acelga':              'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=800',
  'Falafel con Salsa de Yogur':   'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800',
  'Sopa de Calabaza':             'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800',
  'Lentejas Estofadas':           'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800',
};

async function main() {
  // Solo recetas de los autores del seed
  const seedAuthors = await prisma.user.findMany({
    where: { email: { in: ['sofia@sazon.app', 'marco@sazon.app'] } },
    select: { id: true },
  });

  const authorIds = seedAuthors.map(u => u.id);

  if (authorIds.length === 0) {
    console.log('No se encontraron los usuarios del seed.');
    return;
  }

  const recipes = await prisma.recipe.findMany({
    where: { authorId: { in: authorIds } },
    select: { id: true, title: true, imageUrl: true },
  });

  console.log(`📋 ${recipes.length} recetas del seed encontradas\n`);

  let updated = 0;
  let skipped = 0;
  let noMap = 0;

  for (const recipe of recipes) {
    const freshUrl = SEED_IMAGES[recipe.title];

    if (!freshUrl) {
      console.log(`  ⚠️  Sin mapeo: "${recipe.title}"`);
      noMap++;
      continue;
    }

    // Solo actualiza si la URL cambió
    if (recipe.imageUrl === freshUrl) {
      skipped++;
      continue;
    }

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imageUrl: freshUrl },
    });

    console.log(`  ✅ "${recipe.title}"`);
    updated++;
  }

  console.log(`\nListo — ${updated} actualizadas, ${skipped} sin cambios, ${noMap} sin mapeo.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
