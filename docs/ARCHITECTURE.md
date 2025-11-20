# Arquitectura del Sistema - Soluciona Remodelaciones

## Visión General

Soluciona Remodelaciones es un marketplace web que conecta clientes con maestros/profesionales de remodelación en Colombia, con foco en confiabilidad, rapidez y transparencia.

## Stack Tecnológico

### Backend
- **Framework**: NestJS 10 (TypeScript)
- **Base de Datos**: PostgreSQL 15 con extensiones (pg_trgm para búsqueda full-text)
- **ORM**: Prisma 5
- **Cache & Cola**: Redis 7 + BullMQ
- **WebSocket**: Socket.IO para chat en tiempo real
- **Documentación**: Swagger/OpenAPI
- **Seguridad**: JWT, bcrypt, Helmet, rate limiting

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS + shadcn/ui
- **Estado**: Zustand
- **Queries**: React Query (TanStack Query)
- **Formularios**: React Hook Form + Zod
- **Mapas**: Leaflet (MVP) / Mapbox (producción)
- **Real-time**: Socket.IO Client

### Infraestructura
- **Containerización**: Docker + Docker Compose
- **Base de Datos**: PostgreSQL con persistent volumes
- **Cache**: Redis
- **Storage**: Local en MVP, S3-compatible para producción
- **CDN**: CloudFront/Cloudflare (producción)
- **Monitoring**: Logs estructurados, métricas expuestas

## Arquitectura de Alto Nivel

```
┌─────────────────┐
│                 │
│   Usuarios      │
│   (Browser)     │
│                 │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────────────────────────────┐
│                                             │
│            Load Balancer / CDN              │
│         (CloudFront / Cloudflare)           │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌──────────────────┐
│               │    │                  │
│   Frontend    │    │    Backend API   │
│   (Next.js)   │◄───┤    (NestJS)      │
│   Port 3000   │    │    Port 4000     │
│               │    │                  │
└───────────────┘    └────────┬─────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
            ┌──────────┐ ┌──────┐ ┌──────────┐
            │PostgreSQL│ │ Redis│ │  Socket  │
            │  (ACID)  │ │(Cache│ │   .IO    │
            │  Port    │ │Queue)│ │ (Chat)   │
            │  5432    │ │6379  │ │ Port 4001│
            └──────────┘ └──────┘ └──────────┘
                    │
                    │
            ┌───────┴───────┐
            │               │
            ▼               ▼
    ┌────────────┐  ┌─────────────┐
    │   S3 / FS  │  │  External   │
    │  (Storage) │  │  Services   │
    └────────────┘  └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌─────────┐ ┌─────────┐
        │   KYC    │ │ Payments│ │  Email  │
        │ Provider │ │ Provider│ │   SMS   │
        │(Truora)  │ │(Wompi)  │ │ WhatsApp│
        └──────────┘ └─────────┘ └─────────┘
```

## Modelo de Datos

### Entidades Principales

#### 1. Usuarios y Autenticación
- **User**: Datos básicos del usuario, credenciales, rol
- **RefreshToken**: Tokens de renovación JWT
- **OtpCode**: Códigos OTP para 2FA y verificación telefónica

#### 2. Perfiles de Profesionales
- **Pro**: Perfil del maestro/profesional
- **Verification**: Estado y datos de verificación KYC/KYB
- **Document**: Documentos subidos (cédula, certificados, fotos)
- **PortfolioItem**: Trabajos previos con fotos antes/después

#### 3. Catálogo de Servicios
- **Category**: Categorías de servicios (pintura, drywall, etc.)
- **Skill**: Habilidades específicas dentro de cada categoría
- **ProSkill**: Relación muchos-a-muchos entre pros y skills
- **City**: Ciudades colombianas con coordenadas
- **ProServiceArea**: Áreas de servicio de cada pro

#### 4. Trabajos y Propuestas
- **Job**: Solicitud de trabajo por el cliente
- **Proposal**: Cotización enviada por un pro
- **Contract**: Contrato resultante de propuesta aceptada
- **Milestone**: Hitos del contrato con montos y fechas

#### 5. Pagos y Transacciones
- **Payment**: Registro de pago con custodia (escrow)
- **Payout**: Transferencia al pro tras aprobación
- **Dispute**: Disputas sobre contratos/pagos

#### 6. Comunicación y Feedback
- **Conversation**: Conversación entre usuarios
- **ConversationUser**: Participantes de la conversación
- **Message**: Mensajes individuales con attachments
- **Review**: Reseñas y calificaciones (1-5 estrellas)

#### 7. Administración y Auditoría
- **Notification**: Notificaciones enviadas a usuarios
- **AuditLog**: Registro de todas las acciones sensibles

### Relaciones Clave

```
User 1───1 Pro
User 1───N Job (como cliente)
User 1───N Proposal (como pro)
Pro  1───N Verification
Pro  N───N Skill (via ProSkill)
Pro  N───N City (via ProServiceArea)
Job  1───N Proposal
Proposal 1───1 Contract
Contract 1───N Milestone
Milestone 1───1 Payment
Contract 1───0..1 Dispute
User N───N Conversation (via ConversationUser)
Conversation 1───N Message
```

## Módulos del Backend (NestJS)

### 1. Auth Module
**Responsabilidad**: Autenticación y gestión de sesiones

**Endpoints**:
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión (retorna JWT)
- `POST /auth/refresh` - Renovar access token
- `POST /auth/send-otp` - Enviar código OTP
- `POST /auth/verify-otp` - Verificar código OTP
- `POST /auth/logout` - Cerrar sesión

**Funcionalidades**:
- Hash de contraseñas con bcrypt
- Generación de JWT (access + refresh tokens)
- Envío de OTP por SMS/WhatsApp
- Verificación telefónica
- Auditoría de logins

### 2. Users Module
**Responsabilidad**: Gestión de perfiles de usuario

**Endpoints**:
- `GET /users/profile` - Obtener perfil propio
- `PUT /users/profile` - Actualizar perfil
- `PUT /users/password` - Cambiar contraseña
- `PUT /users/avatar` - Subir foto de perfil
- `GET /users/:id` - Ver perfil público

### 3. Pros Module
**Responsabilidad**: Perfiles de maestros y verificación

**Endpoints**:
- `GET /pros` - Listar pros con filtros
- `GET /pros/:id` - Ver perfil de pro
- `PUT /pros/profile` - Actualizar perfil de pro
- `POST /pros/verification` - Enviar documentos para verificación
- `POST /pros/portfolio` - Agregar trabajo al portafolio
- `DELETE /pros/portfolio/:id` - Eliminar trabajo

**Procesos de Verificación**:
1. **Bronce** (básico):
   - Cédula (frente y reverso)
   - Selfie con liveness
   - Tiempo: ~24h

2. **Plata** (intermedio):
   - Todo lo de Bronce +
   - Certificado de antecedentes de Policía
   - RUT (si aplica)
   - Tiempo: 2-3 días

3. **Oro** (completo):
   - Todo lo de Plata +
   - Certificado de Procuraduría
   - Certificado de Contraloría
   - Tiempo: 5-7 días

### 4. Categories Module
**Responsabilidad**: Gestión de categorías y habilidades

**Endpoints**:
- `GET /categories` - Listar categorías activas
- `GET /categories/:id/skills` - Habilidades de una categoría
- `POST /categories` (admin) - Crear categoría
- `PUT /categories/:id` (admin) - Actualizar categoría

### 5. Jobs Module
**Responsabilidad**: Solicitudes de trabajo

**Endpoints**:
- `POST /jobs` - Crear solicitud
- `GET /jobs` - Mis solicitudes
- `GET /jobs/:id` - Ver solicitud
- `PUT /jobs/:id` - Actualizar solicitud
- `POST /jobs/:id/publish` - Publicar solicitud
- `POST /jobs/:id/close` - Cerrar solicitud

**Flujo**:
1. Cliente crea job en estado DRAFT
2. Completa formulario guiado por categoría
3. Sube fotos/videos (opcional)
4. Define presupuesto y urgencia
5. Publica → Estado PUBLISHED
6. Pros pueden enviar propuestas

### 6. Proposals Module
**Responsabilidad**: Cotizaciones de pros

**Endpoints**:
- `POST /proposals` - Crear cotización
- `GET /proposals` - Mis cotizaciones
- `GET /proposals/:id` - Ver cotización
- `POST /proposals/:id/accept` - Aceptar (crea contrato)
- `POST /proposals/:id/reject` - Rechazar
- `POST /proposals/:id/withdraw` - Retirar propuesta

**Validaciones**:
- Pro no puede cotizar su propio trabajo
- Solo pros verificados (mínimo Bronce) pueden cotizar
- Job debe estar en estado PUBLISHED
- Expiración automática después de 7 días

### 7. Contracts Module
**Responsabilidad**: Contratos y hitos

**Endpoints**:
- `GET /contracts` - Mis contratos
- `GET /contracts/:id` - Ver contrato
- `POST /contracts/:id/milestones` - Agregar hito
- `POST /milestones/:id/evidence` - Subir evidencia
- `POST /milestones/:id/approve` - Aprobar hito
- `POST /milestones/:id/reject` - Rechazar hito
- `POST /contracts/:id/dispute` - Crear disputa

**Flujo de Hitos**:
```
PENDING → IN_PROGRESS → AWAITING_APPROVAL → APPROVED
                                          ↘
                                         REJECTED (vuelta a IN_PROGRESS)
```

### 8. Payments Module
**Responsabilidad**: Pagos con custodia

**Endpoints**:
- `POST /payments` - Crear pago
- `GET /payments/:id` - Ver estado
- `POST /payments/:id/release` - Liberar fondos (tras aprobación)
- `POST /payments/webhook` - Webhook de proveedor

**Flujo de Custodia**:
1. Cliente paga hito → Estado: HELD_IN_ESCROW
2. Fondos bloqueados en plataforma
3. Pro ejecuta trabajo y sube evidencia
4. Cliente aprueba → Pago: RELEASED
5. Se calcula comisión plataforma (10% default)
6. Se transfiere al pro (90%)

**Proveedores Soportados**:
- **Stub** (desarrollo): Simula pagos exitosos
- **Wompi**: Pasarela colombiana
- **PayU**: Pasarela regional

### 9. Reviews Module
**Responsabilidad**: Reseñas y calificaciones

**Endpoints**:
- `POST /reviews` - Crear reseña
- `GET /reviews/pro/:proId` - Reseñas de un pro
- `POST /reviews/:id/report` - Reportar reseña

**Reglas**:
- Solo clientes con hitos APPROVED pueden reseñar
- Una reseña por contrato
- Calificación 1-5 estrellas + texto + fotos
- Anti-fraude: verificación de IP, detección de duplicados

**Algoritmo de Rating con Decay Temporal**:
```typescript
const DECAY_MONTHS = 12;
reviews.forEach(review => {
  const ageMonths = monthsSince(review.createdAt);
  const weight = Math.exp(-ageMonths / DECAY_MONTHS);
  weightedSum += review.rating * weight;
  weightedCount += weight;
});
averageRating = weightedSum / weightedCount;
```

### 10. Search Module
**Responsabilidad**: Búsqueda inteligente de pros

**Endpoint**:
- `GET /search/pros` - Buscar con scoring

**Algoritmo de Relevancia**:
```
score = 0.35 * match_textual +
        0.25 * nivel_verificacion +
        0.20 * rating +
        0.10 * disponibilidad +
        0.10 * proximidad
```

**Componentes**:
1. **match_textual** (35%):
   - PostgreSQL Full-Text Search (to_tsvector, ts_rank)
   - Trigram similarity (pg_trgm) para nombres
   - Busca en: nombre, bio, skills

2. **nivel_verificacion** (25%):
   - GOLD = 1.0
   - SILVER = 0.7
   - BRONZE = 0.4
   - NONE = 0.0

3. **rating** (20%):
   - Normalizado: rating / 5.0

4. **disponibilidad** (10%):
   - Disponible en 72h = 1.0
   - Disponible en 7 días = 0.5
   - Más de 7 días = 0.0

5. **proximidad** (10%):
   - 0-10 km = 1.0
   - 10-25 km = 0.7
   - 25-50 km = 0.4
   - >50 km = 0.0

**Filtros Aplicables**:
- Ciudad
- Categoría/Skills
- Nivel de verificación mínimo
- Rating mínimo
- Rango de precio
- Disponibilidad

### 11. Messaging Module
**Responsabilidad**: Chat en tiempo real

**WebSocket Events**:
- `connection` - Conexión autenticada con JWT
- `message:send` - Enviar mensaje
- `message:delivered` - Confirmar entrega
- `message:read` - Marcar como leído
- `typing:start/stop` - Indicadores de escritura

**REST Endpoints**:
- `GET /conversations` - Mis conversaciones
- `GET /conversations/:id/messages` - Historial
- `POST /conversations` - Crear conversación
- `PUT /messages/:id/read` - Marcar mensajes como leídos

**Funcionalidades**:
- Chat bidireccional en tiempo real
- Adjuntos (imágenes, documentos)
- Estados de entrega y lectura
- Deeplink a WhatsApp (con consentimiento)
- Persistencia de historial

### 12. Admin Module
**Responsabilidad**: Panel de administración

**Endpoints**:
- `GET /admin/verifications` - Cola de verificación
- `POST /admin/verifications/:id/approve` - Aprobar KYC
- `POST /admin/verifications/:id/reject` - Rechazar KYC
- `GET /admin/reviews/reported` - Reseñas reportadas
- `POST /admin/reviews/:id/moderate` - Moderar reseña
- `GET /admin/disputes` - Disputas abiertas
- `POST /admin/disputes/:id/resolve` - Resolver disputa
- `GET /admin/metrics` - Métricas de negocio
- `GET /admin/audit-logs` - Logs de auditoría

**Métricas Calculadas**:
- GMV (Gross Merchandise Value)
- Take rate (% comisión plataforma)
- Maestros verificados por nivel
- % solicitudes con ≥1 propuesta en <24h
- Tiempo promedio primera respuesta
- Tasa conversión: solicitud → contrato
- Tasa conversión: contrato → pago
- Rating promedio plataforma
- % disputas
- NPS (Net Promoter Score) - placeholder

### 13. Files Module
**Responsabilidad**: Gestión de archivos

**Endpoints**:
- `POST /files/upload` - Subir archivo
- `GET /files/:id` - Obtener archivo (signed URL)
- `DELETE /files/:id` - Eliminar archivo

**Características**:
- Validación de tipo de archivo
- Límites de tamaño por tipo
- Generación de thumbnails (Sharp)
- Storage local en MVP
- S3-compatible para producción
- URLs firmadas con expiración

### 14. Notifications Module
**Responsabilidad**: Envío de notificaciones

**Canales**:
- Email (SendGrid/SES)
- SMS (Twilio/Sinch)
- WhatsApp (Twilio)
- Push (FCM)
- In-App

**Eventos que Disparan Notificaciones**:
- Nueva propuesta en job → Email cliente
- Propuesta aceptada → SMS pro
- Pago recibido en custodia → WhatsApp pro
- Evidencia subida → Push cliente
- Hito aprobado → Email ambos
- Review recibida → Email pro
- Verificación aprobada/rechazada → Email + SMS pro
- Disputa creada → Email ambos + admin

### 15. Audit Module
**Responsabilidad**: Registro de auditoría

**Eventos Auditados**:
- Registro/login de usuarios
- Cambios en perfil
- Verificaciones enviadas/revisadas
- Contratos creados/modificados
- Pagos procesados/liberados
- Disputas creadas/resueltas
- Acciones admin (suspensiones, moderaciones)
- Subida/eliminación de archivos

**Campos Registrados**:
- userId, action, entity, entityId
- changes (JSON con before/after)
- ipAddress, userAgent
- timestamp

## Patrones de Seguridad

### Autenticación
- JWT con tokens de corta duración (15 min)
- Refresh tokens con rotación
- OTP para verificación telefónica
- 2FA opcional

### Autorización
- RBAC (Role-Based Access Control)
- Guards de NestJS: JwtAuthGuard, RolesGuard
- Decoradores: @Roles(), @Public()
- Validación de propiedad de recursos

### Validación de Datos
- DTOs con class-validator
- Pipes de validación en todos los endpoints
- Sanitización de inputs
- Protección contra SQL injection (Prisma)

### Rate Limiting
- Throttler de NestJS
- Límites por IP
- Límites por usuario autenticado
- Diferentes límites para operaciones sensibles

### Protección de Datos
- Hashing de contraseñas (bcrypt, salt rounds: 10)
- Cifrado de datos sensibles en reposo
- HTTPS obligatorio en producción
- CORS configurado estrictamente
- Helmet.js para headers de seguridad

### Privacidad y Cumplimiento
- Consentimiento explícito para KYC (Ley 1581/2012)
- Política de retención de datos
- Derecho al olvido
- Anonimización de datos en auditoría post-eliminación

## Escalabilidad y Performance

### Caching
- Redis para:
  - Resultados de búsqueda (TTL: 5 min)
  - Perfiles de pros populares (TTL: 10 min)
  - Categorías (TTL: 1 hora)

### Optimización de Base de Datos
- Índices en:
  - Foreign keys
  - Campos de búsqueda (email, slug)
  - Campos de filtrado (status, createdAt)
  - Full-text search (GIN index en tsvector)
  - Trigram (GIN index con pg_trgm)
- Paginación en todos los listados
- Consultas N+1 evitadas con Prisma include/select

### Background Jobs (BullMQ)
- Envío de notificaciones
- Procesamiento de imágenes (thumbnails)
- Expiración automática de propuestas
- Cálculos pesados de métricas
- Limpieza de datos obsoletos

### Monitoreo
- Logs estructurados (Winston)
- Métricas de API (response time, error rate)
- Healthcheck endpoints
- Prisma query logging (desarrollo)

## Despliegue

### Desarrollo Local
```bash
docker-compose up -d
```

### Producción (AWS Ejemplo)
- **Frontend**: ECS Fargate + CloudFront CDN
- **Backend**: ECS Fargate detrás de ALB
- **Base de Datos**: RDS PostgreSQL Multi-AZ
- **Cache**: ElastiCache Redis
- **Storage**: S3 con CloudFront
- **Logs**: CloudWatch
- **Secrets**: AWS Secrets Manager

### CI/CD
- GitHub Actions
- Build de imágenes Docker
- Push a ECR
- Deploy a ECS con rolling updates
- Ejecución de migraciones automáticas
- Health checks antes de routing

## Próximos Pasos (Post-MVP)

1. **Búsqueda Avanzada**:
   - Elasticsearch para búsqueda a gran escala
   - Filtros facetados
   - Búsqueda por imágenes

2. **Machine Learning**:
   - Recomendación de pros basada en historial
   - Detección de fraude mejorada
   - Predicción de precios

3. **Mobile Apps**:
   - React Native para iOS/Android
   - Notificaciones push nativas
   - Geolocalización en tiempo real

4. **Integraciones Adicionales**:
   - Seguros para proyectos
   - Financiamiento
   - Facturación electrónica

5. **Features Avanzadas**:
   - Video llamadas in-app
   - AR para visualización de proyectos
   - Marketplace de materiales

## Conclusión

Esta arquitectura está diseñada para:
- ✅ Escalar horizontalmente
- ✅ Mantener alta disponibilidad
- ✅ Garantizar seguridad de datos
- ✅ Facilitar mantenimiento y evolución
- ✅ Cumplir regulaciones colombianas
- ✅ Proveer excelente experiencia de usuario

El MVP establece las bases sólidas para crecer el producto y la base de usuarios de forma sostenible.
