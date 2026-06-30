const { difficultyToApi } = require('./difficulty');

// Nunca devolver passwordHash al frontend, ni desde /users ni anidado en author.
function toApiUser(user) {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
}

function toApiRecipe(recipe) {
  return {
    ...recipe,
    difficulty: difficultyToApi(recipe.difficulty),
    author: recipe.author ? toApiUser(recipe.author) : recipe.author,
  };
}

module.exports = { toApiUser, toApiRecipe };
