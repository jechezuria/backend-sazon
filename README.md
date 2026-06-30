# Backend Sazón

API REST para la app de recetas Sazón. Node.js + Express + Prisma + PostgreSQL.

## Stack

- **Express** — servidor HTTP y rutas
- **Prisma** — ORM hacia PostgreSQL (migraciones + cliente con tipos)
- **PostgreSQL** (Supabase en producción)

## Setup inicial (una sola vez)

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo (gratis)
2. En el dashboard del proyecto, click en el botón **Connect** (arriba)
3. Elegí la pestaña **ORM → Prisma** — te muestra el contenido exacto para pegar en `.env.local`

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Pegá ahí las dos variables que te dio Supabase:
- `DATABASE_URL` — conexión pooled (puerto 6543), la usa la app en cada query
- `DIRECT_URL` — conexión directa (puerto 5432), la usa Prisma solo para correr migraciones

### 3. Instalar dependencias

```bash
npm install
```

### 4. Crear las tablas en la base de datos

```bash
npm run prisma:migrate
```

Esto lee `prisma/schema.prisma`, crea las tablas en Supabase y genera el cliente de Prisma. Te va a pedir un nombre para la migración (ej: `init`).

### 5. Cargar datos de prueba

```bash
npm run prisma:seed
```

Crea 2 usuarios (Sofia Chen y Marco Rizzi) y las 8 recetas que también existen mockeadas en el frontend (`sazon/data/mockData.ts`), con sus ingredientes, pasos y algunos likes ya cargados.

Para loguearte con cualquiera de los dos usuarios de prueba, la contraseña es `sazon123`:
- `sofia@sazon.app`
- `marco@sazon.app`

> Si corrés el seed más de una vez vas a duplicar las recetas (no hay protección contra eso, a propósito, para que sea fácil de reiniciar). Para volver a un estado limpio usá `npx prisma migrate reset --force` — esto borra todo y corre el seed de nuevo automáticamente.

## Levantar el servidor en local

```bash
npm run dev
```

Esto inicia el servidor con `nodemon` (se reinicia solo al guardar cambios) en `http://localhost:4000`.

Probalo:
```bash
curl http://localhost:4000/health
# { "status": "ok" }

curl http://localhost:4000/api/recipes
# [ ... lista de recetas ... ]
```

## Endpoints disponibles

🔒 = requiere header `Authorization: Bearer <token>`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Chequeo de que el servidor está vivo |
| **Recetas** | | |
| GET | `/api/recipes` | Lista recetas. Acepta query params: `category`, `difficulty`, `search`, `authorId` |
| GET | `/api/recipes/:id` | Una receta por id, con ingredientes, pasos y autor |
| POST | `/api/recipes` | Crea una receta |
| PUT | `/api/recipes/:id` | Actualiza una receta |
| DELETE | `/api/recipes/:id` | Borra una receta |
| GET 🔒 | `/api/recipes/liked/mine` | Recetas con like del usuario logueado |
| POST 🔒 | `/api/recipes/:id/like` | Toggle de like en una receta |
| **Usuarios** | | |
| GET | `/api/users/:id` | Perfil público de un usuario (sin password) |
| GET | `/api/users/:id/recipes` | Recetas publicadas por ese usuario |
| **Autenticación** | | |
| POST | `/api/auth/register` | `{ name, username, email, password }` → crea usuario, devuelve `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → devuelve `{ token, user }` |
| GET 🔒 | `/api/auth/me` | Devuelve el usuario del token actual |

### Ejemplos de filtros de búsqueda

```bash
curl "http://localhost:4000/api/recipes?category=Postre"
curl "http://localhost:4000/api/recipes?difficulty=Fácil"
curl "http://localhost:4000/api/recipes?search=avena"
curl "http://localhost:4000/api/recipes?authorId=<uuid-del-autor>"
```

### Ejemplo de login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sofia@sazon.app","password":"sazon123"}'

# { "token": "eyJ...", "user": { "id": "...", "name": "Sofia Chen", ... } }
```

El `token` se usa en cualquier ruta marcada con 🔒:
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJ..."
```

## Comandos útiles de Prisma

```bash
npm run prisma:studio    # interfaz visual para ver/editar datos en el navegador
npm run prisma:generate  # regenera el cliente de Prisma (después de tocar el schema)
npm run prisma:migrate   # crea una nueva migración después de modificar schema.prisma
```

## Deploy (cuando esté listo)

- **Base de datos**: ya vive en Supabase, no hay que migrar nada
- **Servidor**: se sube a [Render](https://render.com) como Web Service, con la misma `DATABASE_URL` como variable de entorno (usando esta vez la connection string **directa**, sin pooling, o la de Supabase recomendada para servidores persistentes)

## Estructura del proyecto

```
backend-sazon/
├── prisma/
│   ├── schema.prisma     → modelos de la base de datos
│   └── seed.js           → datos de prueba
├── src/
│   ├── server.js         → arranca el servidor
│   ├── app.js             → configuración de Express (middlewares, rutas)
│   ├── routes/            → define qué URL llama a qué controlador
│   ├── controllers/       → la lógica de cada endpoint
│   ├── middleware/
│   │   └── auth.js        → exige JWT válido, agrega req.userId
│   └── lib/
│       ├── prisma.js      → instancia única del cliente Prisma
│       ├── asyncHandler.js → wrapper para manejar errores en rutas async
│       ├── jwt.js         → firma y verifica tokens
│       ├── difficulty.js  → traduce dificultad entre DB (sin tilde) y API (con tilde)
│       └── serializers.js → da forma final a la respuesta (oculta passwordHash, traduce dificultad)
└── .env                   → variables de entorno (no se sube a git)
```

## Notas de diseño

- **`difficulty` sin tilde en la base**: Postgres/Prisma no manejan bien enums con acentos, así que en la base se guarda `Facil`/`Medio`/`Dificil` y `src/lib/difficulty.js` lo traduce a `Fácil`/`Medio`/`Difícil` para que la API hable el mismo idioma que el frontend (`types/index.ts`).
- **`passwordHash` nunca sale de la API**: tanto en `/api/users/:id` como anidado dentro de `author` en cada receta, se filtra con `toApiUser()` antes de responder.
- **JWT sin refresh token**: por simplicidad el token dura 7 días y no hay refresh — alcanza para esta etapa, se puede agregar después si hace falta.
