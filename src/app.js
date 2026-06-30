const express = require('express');
const cors = require('cors');
const recipesRoutes = require('./routes/recipes.routes');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/recipes', recipesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Manejo de errores centralizado: cualquier throw o rechazo de promesa en un
// controlador termina acá en lugar de tirar abajo el servidor.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
