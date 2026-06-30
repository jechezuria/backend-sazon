// Postgres/Prisma no maneja bien tildes en identificadores de enum,
// así que en la base se guarda sin tilde y se traduce en los dos sentidos
// para que la API hable el mismo idioma que el frontend (types/index.ts).

const DB_TO_API = {
  Facil: 'Fácil',
  Medio: 'Medio',
  Dificil: 'Difícil',
};

const API_TO_DB = {
  'Fácil': 'Facil',
  Medio: 'Medio',
  'Difícil': 'Dificil',
};

function difficultyToApi(value) {
  return DB_TO_API[value] ?? value;
}

function difficultyToDb(value) {
  return API_TO_DB[value] ?? value;
}

module.exports = { difficultyToApi, difficultyToDb };
