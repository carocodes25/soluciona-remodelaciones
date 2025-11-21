# 🚂 Despliegue en Railway - Soluciona Remodelaciones

## 📋 Pasos para Desplegar

### 1️⃣ Crear Cuenta en Railway

1. Ve a **https://railway.app**
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con tu cuenta de **GitHub**

### 2️⃣ Crear los Servicios

#### A) Crear Base de Datos PostgreSQL

1. En Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. Copia la variable `DATABASE_URL` (la necesitarás para el backend)

#### B) Desplegar Backend

1. Haz clic en **"+ New"** → **"GitHub Repo"**
2. Selecciona el repositorio: **`carocodes25/soluciona-remodelaciones`**
3. Railway detectará automáticamente que es un monorepo
4. Configura el servicio:
   - **Name**: `soluciona-backend`
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

5. **Configura las Variables de Entorno** (en Settings → Variables):

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=4000

# Seguridad (CAMBIAR estos valores)
JWT_SECRET=tu-secreto-super-seguro-cambiar-esto-12345
JWT_REFRESH_SECRET=tu-refresh-secreto-super-seguro-cambiar-esto-67890

# URLs (actualizar después de crear frontend)
APP_URL=https://tu-frontend-url.up.railway.app
CORS_ORIGINS=https://tu-frontend-url.up.railway.app

# Admin por defecto
ADMIN_DEFAULT_EMAIL=admin@soluciona.co
ADMIN_DEFAULT_PASSWORD=Admin123!ChangeMe

# Proveedores (modo demo)
STORAGE_PROVIDER=local
KYC_PROVIDER=stub
PAYMENTS_PROVIDER=stub
EMAIL_PROVIDER=stub
SMS_PROVIDER=stub
PUSH_PROVIDER=stub
MAPS_PROVIDER=leaflet

# Configuración
PLATFORM_FEE_PERCENTAGE=10
LOG_LEVEL=info
UPLOAD_PATH=/tmp/uploads
```

6. En **Settings → Networking**, activa **"Generate Domain"**
7. Copia la URL generada (ej: `https://soluciona-backend.up.railway.app`)

#### C) Desplegar Frontend

1. Haz clic en **"+ New"** → **"GitHub Repo"**
2. Selecciona el mismo repositorio: **`carocodes25/soluciona-remodelaciones`**
3. Configura el servicio:
   - **Name**: `soluciona-frontend`
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. **Configura las Variables de Entorno**:

```bash
NODE_ENV=production

# URL del backend (usa la URL que copiaste del backend)
NEXT_PUBLIC_API_URL=https://soluciona-backend.up.railway.app

# WebSocket URL
NEXT_PUBLIC_WS_URL=wss://soluciona-backend.up.railway.app

# URL del frontend (se genera automáticamente)
NEXT_PUBLIC_APP_URL=https://tu-frontend-url.up.railway.app

# Mapas
NEXT_PUBLIC_MAPS_PROVIDER=leaflet
```

5. En **Settings → Networking**, activa **"Generate Domain"**
6. Copia la URL generada del frontend

### 3️⃣ Actualizar Variables del Backend

1. Ve al servicio **Backend** en Railway
2. En **Variables**, actualiza:
   - `APP_URL` → URL del frontend
   - `CORS_ORIGINS` → URL del frontend

3. El backend se redesplegará automáticamente

### 4️⃣ Actualizar Variable del Frontend

1. Ve al servicio **Frontend** en Railway
2. En **Variables**, actualiza:
   - `NEXT_PUBLIC_APP_URL` → URL del frontend (la que Railway generó)

3. El frontend se redesplegará automáticamente

### 5️⃣ Ejecutar el Seed (Primera vez)

Para cargar datos de prueba en la base de datos:

1. Ve al servicio **Backend**
2. Abre la **Terminal** (en la parte superior)
3. Ejecuta:
```bash
npm run prisma:seed
```

## ✅ ¡Listo!

Tu aplicación ya está en línea en:
- **Frontend**: `https://tu-frontend-url.up.railway.app`
- **Backend API**: `https://tu-backend-url.up.railway.app`
- **Documentación**: `https://tu-backend-url.up.railway.app/api/docs`

## 🔐 Credenciales de Prueba

```
Admin:
  Email: admin@soluciona.co
  Password: Admin123!ChangeMe

Cliente:
  Email: maria.gonzález@gmail.com
  Password: Demo123!

Maestro:
  Email: carlos.pintor@gmail.com
  Password: Demo123!
```

## 💰 Costos Estimados

- **Railway Free Tier**: $5 de crédito gratis/mes
- **Plan Hobby**: $5/mes por servicio activo
- **Estimado Total**: ~$10-15/mes para 3 servicios (DB + Backend + Frontend)

## 🎯 Próximos Pasos Recomendados

1. **Dominio Personalizado**: Compra un dominio en Namecheap/GoDaddy y conéctalo en Railway
2. **SSL**: Railway provee SSL automáticamente
3. **Monitoreo**: Configura alertas en Railway
4. **Backups**: Configura backups automáticos de PostgreSQL
5. **Variables de Producción**: Cambia todos los secretos y passwords

## 🆘 Solución de Problemas

### Error: "Cannot find module"
- Verifica que el `Root Directory` esté configurado correctamente
- Asegúrate de que `npm install` esté en el Build Command

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada
- Asegúrate de usar `${{Postgres.DATABASE_URL}}` en el backend

### Frontend no se conecta al Backend
- Verifica que `NEXT_PUBLIC_API_URL` apunte a la URL correcta del backend
- Verifica que `CORS_ORIGINS` en el backend incluya la URL del frontend

### Migraciones no se ejecutan
- Ejecuta manualmente: `npx prisma migrate deploy` en la terminal del backend
- Luego ejecuta el seed: `npm run prisma:seed`

## 📞 Soporte

Si tienes problemas, revisa los logs en Railway:
1. Ve al servicio que falla
2. Haz clic en **"Deployments"**
3. Selecciona el deployment más reciente
4. Revisa los **"Build Logs"** y **"Deploy Logs"**
