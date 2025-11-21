# 🚀 DEPLOY EN VERCEL - PASO A PASO (3 MINUTOS)

## ✅ LO MÁS FÁCIL: Backend en Render + Frontend en Vercel

### PARTE 1: Backend en Render (5 minutos)
1. Ve a https://render.com/
2. Clic en "Get Started" o "Sign Up"
3. Conecta con tu GitHub (carocodes25/soluciona-remodelaciones)
4. Clic en "New +" → "PostgreSQL"
   - Name: `soluciona-db`
   - Region: Oregon (Free)
   - Clic en "Create Database"
   - **COPIA LA URL QUE APARECE** (la necesitarás)

5. Clic en "New +" → "Web Service"
   - Repository: `carocodes25/soluciona-remodelaciones`
   - Name: `soluciona-backend`
   - Region: Oregon (Free)
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/main.js`

6. En "Environment Variables" agrega:
```
DATABASE_URL = (pega la URL que copiaste en paso 4)
JWT_SECRET = mi-super-secreto-123-abc
JWT_REFRESH_SECRET = mi-refresh-secreto-456-def
REDIS_HOST = redis-15678.c1.us-east1-2.gce.cloud.redislabs.com
REDIS_PORT = 15678
REDIS_PASSWORD = (deja vacío si no tienes Redis)
NODE_ENV = production
PORT = 10000
```

7. Clic en "Create Web Service"
8. **ESPERA 3-5 MINUTOS** hasta que diga "Live"
9. **COPIA LA URL** que te da (ejemplo: https://soluciona-backend-abc123.onrender.com)

### PARTE 2: Frontend en Vercel (2 minutos)
1. Ve a https://vercel.com/
2. Clic en "Sign Up" (usa tu cuenta de GitHub)
3. Clic en "Add New..." → "Project"
4. Busca `carocodes25/soluciona-remodelaciones` y clic en "Import"
5. En "Configure Project":
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. En "Environment Variables" agrega:
```
NEXT_PUBLIC_API_URL = (pega la URL de Render del paso 9 anterior)
```

7. Clic en "Deploy"
8. **ESPERA 2 MINUTOS**
9. **¡LISTO! TE DA LA URL PÚBLICA** 🎉

---

## 🆘 SI TIENES PROBLEMAS:

### Render dice "Build failed"
- Ve a los logs y busca el error
- Usualmente es por falta de variables de entorno

### Vercel dice "Build failed"
- Asegúrate de que pusiste `frontend` en Root Directory
- Verifica que la variable NEXT_PUBLIC_API_URL tenga el https:// completo

### "Cannot connect to database"
- Verifica que copiaste bien la DATABASE_URL completa
- Asegúrate de que la base de datos de Render esté "Available"

---

## 📝 COMANDOS QUE NECESITAS EJECUTAR LOCALMENTE:

```powershell
# 1. Asegúrate de tener todo commiteado
git add .
git commit -m "Ready for Vercel and Render deployment"
git push origin main
```

---

## 🎯 RESUMEN:
1. Render → Backend + Base de Datos (FREE)
2. Vercel → Frontend (FREE)
3. Conectar los dos con variables de entorno
4. ¡Listo! Tienes tu app pública

**TIEMPO TOTAL: 10 minutos**
**COSTO: $0 (100% gratis)**
