# BIMterra

**Control inteligente de obras mediante BIM, planificación y datos de terreno.**

Plataforma web para la gestión integral de obras: modelo BIM (GLB/IFC), carta Gantt interactiva, dashboard de indicadores, curva S, fotografías, fotogrametría con drones e IA aplicada al control de proyectos.

## Estructura del repositorio

```
BIMterra/
├── frontend/     # React + TypeScript + Vite + Tailwind + Three.js
├── backend/      # Node.js + Express + Prisma + PostgreSQL
├── storage/      # Archivos subidos (modelos GLB, fotos) — no versionado
└── docs/         # Documentación técnica y de producto
```

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm

## Puesta en marcha — Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tu cadena de conexión de PostgreSQL y un JWT_SECRET propio

npm install
npx prisma migrate dev --name init
npm run dev
```

La API queda disponible en `http://localhost:4000/api`. Puedes verificar que está viva en `GET /api/health`.

`npx prisma migrate dev` ejecuta automáticamente el seed y crea un usuario y proyecto de demostración:

| Correo | Contraseña |
|--------|------------|
| `demo@bimterra.cl` | `demo1234` |

Si ya migraste antes y quieres volver a correr el seed manualmente: `npm run prisma:seed`.

## Puesta en marcha — Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Sprint 1 — Alcance implementado

- ✅ Autenticación (registro / login / perfil) con JWT y contraseñas hasheadas (bcrypt)
- ✅ Gestión de proyectos (crear, listar, ver detalle, editar, eliminar)
- ✅ Base de datos con Prisma, incluyendo el modelo de datos completo pensado para
  Gantt, dependencias, elementos BIM y su vínculo con actividades (evita migraciones
  dolorosas en sprints futuros)
- ✅ Menú lateral y layout general de la app
- ✅ Dashboard inicial con indicadores agregados

## Sprint 2 — Alcance implementado

- ✅ Carta Gantt editable: crear, editar (fechas, presupuesto), eliminar actividades
- ✅ Dependencias entre actividades (fin-a-inicio, con selección predecesora → sucesora)
- ✅ Ruta crítica calculada con el método de la ruta crítica (CPM: forward pass +
  backward pass), marcando `esCritica` y mostrando holgura por actividad
- ✅ Avance físico registrado por actividad (con historial en la tabla `Avance`),
  actualiza automáticamente el estado (`PENDIENTE` / `EN_CURSO` / `COMPLETADA`)
- ✅ Visualización tipo Gantt (barras por fecha, resaltado de ruta crítica, overlay
  de avance físico)

## Próximos sprints

| Sprint | Alcance |
|--------|---------|
| 2 | Carta Gantt editable, dependencias, ruta crítica, avance físico/económico |
| 3 | Visor 3D del modelo BIM (GLB), selección de elementos, fotografías |
| 4 | Vínculo bidireccional BIM ↔ Gantt |
| 5 | Dashboard con SPI, CPI, TCPI, curva S, alertas |
| 6 | Control de costos por actividad |
| 7 | Fotogrametría (ortomosaicos, nube de puntos, 360°) |
| 8 | IA para preguntas sobre el estado del proyecto |

## Modelo de datos

El esquema completo vive en `backend/prisma/schema.prisma`. Ya incluye, además de
usuarios y proyectos, los modelos `Actividad`, `DependenciaActividad`, `Avance`,
`ModeloBim`, `ElementoBim` y la tabla puente `ActividadElementoBim` que conectará
cada actividad del Gantt con su mesh correspondiente dentro del GLB (clave para el
Sprint 4).

## Identidad visual

BIMterra usa una estética de **plano técnico**: fondo azul de plano (`blueprint`),
acento amarillo de obra (`obra`), tipografía monoespaciada (IBM Plex Mono) para
títulos y etiquetas tipo "cota" de plano — inspirado en el lenguaje visual de los
planos de construcción con los que ya trabajas a diario.
