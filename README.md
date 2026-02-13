# Auth Service API

API de autenticación con Node.js, Express, TypeScript y Prisma.

## 🚀 Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus valores:

```bash
cp .env.example .env
```

#### Para conectar con Neon:
1. Ve a [Neon](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia tu **connection string** (tiene este formato: `postgresql://usuario:password@tu-proyecto.neon.tech/neondb?sslmode=require`)
4. Pégalo en tu archivo `.env` en la variable `DATABASE_URL`

### 3. Generar cliente de Prisma y ejecutar migraciones

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Ejecutar el proyecto

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

## 📁 Estructura

- `/src/modules` - Módulos de la aplicación (auth, users, sessions)
- `/src/config` - Configuración (db, env)
- `/src/middlewares` - Middlewares (auth, roles)
- `/src/utils` - Utilidades (hash, jwt, tokens)
- `/prisma` - Schema y migraciones de Prisma

## 🗄️ Base de Datos

El proyecto usa **PostgreSQL** con Prisma ORM. Los modelos definidos son:

- **User** - Usuarios del sistema
- **Session** - Sesiones de autenticación

Para ver tus datos en una interfaz visual:
```bash
npx prisma studio
```
