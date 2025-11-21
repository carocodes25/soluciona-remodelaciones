## 🚀 GUÍA RÁPIDA - DEPLOY EN RAILWAY

### PASO 1: Crear Base de Datos
1. En Railway, clic en **"New Project"**
2. Selecciona **"Provision PostgreSQL"**
3. Espera 30 segundos a que se cree

### PASO 2: Agregar Backend
1. En el mismo proyecto, clic en **"New Service"** o **"+"**
2. Selecciona **"GitHub Repo"**
3. Busca: `carocodes25/soluciona-remodelaciones`
4. Railway te preguntará el Root Directory: escribe `backend`

### PASO 3: Variables de Entorno (Automáticas)
Railway conectará automáticamente la base de datos. Solo agrega estas:

```
JWT_SECRET=soluciona-jwt-secret-production-2024
JWT_REFRESH_SECRET=soluciona-refresh-secret-production-2024
NODE_ENV=production
PORT=4000
CORS_ORIGINS=https://tu-frontend.vercel.app
```

### PASO 4: Deploy
Railway hará deploy automáticamente. Espera 3-5 minutos.

### PASO 5: Obtener URL
Railway te dará una URL como: `https://backend-production-xxxx.up.railway.app`

¡Esa URL la usarás para conectar el frontend!
