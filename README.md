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

### 5. (Opcional) Cargar datos de prueba

```bash
npm run prisma:seed
```

Crea un usuario y una receta de ejemplo para probar los endpoints.

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

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Chequeo de que el servidor está vivo |
| GET | `/api/recipes` | Lista todas las recetas |
| GET | `/api/recipes/:id` | Una receta por id |
| POST | `/api/recipes` | Crea una receta |
| PUT | `/api/recipes/:id` | Actualiza una receta |
| DELETE | `/api/recipes/:id` | Borra una receta |

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
│   └── lib/
│       ├── prisma.js      → instancia única del cliente Prisma
│       └── asyncHandler.js → wrapper para manejar errores en rutas async
└── .env                   → variables de entorno (no se sube a git)
```
