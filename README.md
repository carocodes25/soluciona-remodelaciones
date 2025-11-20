# Soluciona Remodelaciones - MVP

Marketplace web que conecta clientes con maestros/profesionales de remodelación en Colombia, con foco en confiabilidad, rapidez y transparencia.

## 🏗️ Arquitectura

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Base de datos**: PostgreSQL
- **Cache/Colas**: Redis + BullMQ
- **Storage**: Simulado local (S3-compatible)
- **WebSocket**: Chat en tiempo real
- **Documentación API**: Swagger/OpenAPI

## 🚀 Inicio Rápido

### Prerequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)

### Levantar el proyecto completo

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar todos los servicios
docker-compose up -d

# 3. Esperar a que los servicios estén listos (30-60s)
# El backend ejecutará migraciones y seed automáticamente

# 4. Acceder a:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:4000
# - Swagger Docs: http://localhost:4000/api/docs
```

## 👥 Usuarios Demo

### Admin
- Email: `admin@soluciona.co`
- Password: `Admin123!`

### Maestro Verificado (Oro)
- Email: `carlos.pintor@gmail.com`
- Password: `Demo123!`

### Cliente
- Email: `maria.cliente@gmail.com`
- Password: `Demo123!`

## 📁 Estructura del Proyecto

```
/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── modules/  # Módulos funcionales
│   │   ├── prisma/   # Schema y migraciones
│   │   └── common/   # Guards, decorators, utils
│   └── test/
├── frontend/         # Next.js App
│   ├── app/          # App Router pages
│   ├── components/   # Componentes React
│   ├── lib/          # Utils, API client, stores
│   └── public/
├── infra/            # Docker y scripts
│   ├── docker-compose.yml
│   └── scripts/
└── docs/             # Documentación y diagramas
    ├── architecture.md
    ├── api-spec.json
    └── diagrams/
```

## 🔑 Features Implementadas

### ✅ Autenticación y Autorización
- Registro con email/contraseña
- Login con JWT (access + refresh tokens)
- OTP por SMS/WhatsApp (stub)
- Roles: Cliente, Maestro, Admin
- RBAC en todos los endpoints

### ✅ Onboarding Maestros
- Verificación KYC/KYB (stub Truora/MetaMap)
- Upload cédula (frente/reverso)
- Selfie liveness (simulado)
- Carga de certificados (Policía, Procuraduría, Contraloría)
- Badges: Bronce/Plata/Oro según nivel de verificación

### ✅ Perfiles y Portafolio
- Bio, foto, categorías/oficios
- Radio de servicio y ciudades
- Portafolio con fotos antes/después
- Rating promedio y reseñas
- Badges de verificación visibles

### ✅ Búsqueda Inteligente
- Algoritmo de scoring:
  - 35% match textual (FTS + trigram)
  - 25% nivel verificación
  - 20% rating
  - 10% disponibilidad
  - 10% proximidad
- Filtros: ciudad, categoría, verificación, rating, precio
- Ordenación por relevancia

### ✅ Solicitudes de Trabajo
- Formulario guiado por categoría
- Upload fotos/videos
- Selector de ubicación con mapa
- Rango de presupuesto
- Urgencia (horas/días)

### ✅ Cotizaciones y Propuestas
- Múltiples maestros pueden cotizar
- Comparación lado a lado
- Precio, ETA, alcance, notas
- Aceptación con un clic

### ✅ Contratos por Hitos
- Definición de hitos con montos y fechas
- Timeline visual del progreso
- Upload de evidencias por hito
- Aprobación/rechazo cliente
- Sistema de disputas

### ✅ Pagos con Custodia
- Integración stub Wompi/PayU
- Pago bloqueado por hito (escrow)
- Liberación tras aprobación
- Comisión plataforma configurable
- Reembolsos en caso de disputa

### ✅ Reseñas Verificadas
- Solo clientes con contrato pagado
- 1-5 estrellas + texto + fotos
- Antifraude básico (IP, duplicados)
- Moderación admin
- Decay temporal en ponderación

### ✅ Chat y Comunicación
- Chat in-app con WebSocket
- Adjuntos de archivos
- Estados de entrega
- Deeplink a WhatsApp con consentimiento
- Notificaciones push (stub)

### ✅ Panel de Administración
- Bandeja de verificación (aprobar/rechazar KYC)
- Moderación de reseñas reportadas
- Gestión de disputas
- Reportes y métricas:
  - GMV, take rate
  - Conversión (solicitud→contrato→pago)
  - Tiempo primera respuesta
  - % maestros verificados
  - Rating promedio, % disputas
  - NPS (placeholder)
- Logs de auditoría exportables

### ✅ Seguridad y Privacidad
- CORS, CSRF, rate limiting
- Cifrado en tránsito
- Consentimiento explícito (Ley 1581/2012)
- Audit logs para acciones sensibles
- RBAC granular

## 🗄️ Base de Datos

El proyecto incluye seed data realista:
- 20 maestros en diferentes ciudades y categorías
- 30 clientes
- 10 solicitudes de trabajo
- 25 propuestas
- 10 contratos con múltiples hitos
- 35+ reseñas con fotos
- Conversaciones de chat

## 🧪 Tests

```bash
# Backend - Unit tests
cd backend
npm run test

# Backend - E2E tests
npm run test:e2e

# Frontend - Tests
cd frontend
npm run test
```

## 📊 Métricas y Monitoreo

Endpoint de métricas: `GET /api/admin/metrics`

- Maestros verificados (Plata/Oro)
- % solicitudes con ≥1 propuesta <24h
- Tiempo promedio primera respuesta
- Tasa solicitud→contrato
- Tasa contrato→pago
- GMV y take rate
- Rating promedio
- % disputas
- NPS (placeholder)

## 🔧 Desarrollo Local

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar DATABASE_URL y otras vars
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## 🌐 Variables de Entorno

Ver `.env.example` para la lista completa. Variables principales:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret para tokens
- `JWT_REFRESH_SECRET`: Secret para refresh tokens
- `APP_URL`: URL del frontend
- `PAYMENTS_PROVIDER`: `stub` | `wompi` | `payu`
- `KYC_PROVIDER`: `stub` | `truora` | `metamap`
- `SENDGRID_API_KEY`: (opcional) para emails
- `TWILIO_*`: (opcional) para SMS/WhatsApp
- `MAPBOX_TOKEN`: (opcional) para mapas

## 🚢 Deployment / Despliegue

### 🚀 Deployment Rápido (1 comando)

```bash
./deploy.sh
```

Selecciona:
- **Opción 1**: Development (con hot-reload)
- **Opción 2**: Production (optimizado)

### 📚 Guías de Deployment

- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - ⚡ Guía rápida (30 min)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 📖 Guía completa con SSL, Nginx, backups

### 🌐 Opciones de Hosting

#### Opción 1: VPS Tradicional (DigitalOcean, AWS, Linode)
```bash
# En tu servidor
git clone https://github.com/carocodes25/soluciona-remodelaciones.git
cd soluciona-remodelaciones
cp .env.production.example .env.production
nano .env.production  # Configurar
./deploy.sh  # Opción 2 (Production)
```

**Costo**: $6-12/mes | **Tiempo**: 30-60 min | **Dificultad**: Media

#### Opción 2: Railway (PaaS - Más Fácil)
1. Ve a https://railway.app
2. Conecta GitHub
3. Importa `soluciona-remodelaciones`
4. Configura variables de entorno
5. Deploy automático en 5 min

**Costo**: $10-20/mes | **Tiempo**: 5-10 min | **Dificultad**: Fácil

#### Opción 3: Docker Compose Local
```bash
docker-compose up -d
```

**Costo**: Gratis | **Tiempo**: 2 min | **Dificultad**: Muy fácil

### 🔒 SSL/HTTPS Gratis

Certificados gratis con Let's Encrypt incluidos en las guías.

```bash
# Obtener certificado SSL
sudo certbot certonly --standalone -d tudominio.com
```

### 📊 Scripts Útiles

```bash
./deploy.sh              # Deployment automático
./scripts/backup.sh      # Backup de base de datos
./scripts/health-check.sh # Verificar estado de servicios
```

### 🌍 Dominios Recomendados

- **Namecheap**: $8-12/año (.com)
- **Cloudflare**: $8-10/año + CDN gratis
- **Google Domains**: $12/año

Ver [QUICK_DEPLOY.md](QUICK_DEPLOY.md) para más opciones.

## 📖 Documentación Adicional

- [Arquitectura del Sistema](docs/architecture.md)
- [Modelo de Datos](docs/data-model.md)
- [Guía de Integraciones](docs/integrations.md)
- [OpenAPI Spec](docs/api-spec.json)

## 🤝 Contribuir

Este es un MVP. Para producción considerar:
- Implementar proveedores reales (KYC, Payments, Notifications)
- Hardening de seguridad
- Performance tuning y caching avanzado
- Elasticsearch para búsqueda a escala
- CDN para assets
- WAF y DDoS protection
- Monitoring y alerting (DataDog, New Relic)
- CI/CD pipeline

## 📄 Licencia

Propietario - Soluciona Remodelaciones © 2025

---

**Hecho con ❤️ por el equipo de Soluciona**
# soluciona-remodelaciones
