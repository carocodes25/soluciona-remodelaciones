# 🚀 GUÍA DE DEPLOYMENT CON DOCKER

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Preparación del Servidor](#preparación-del-servidor)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Deployment en Producción](#deployment-en-producción)
5. [Configuración de Dominio y SSL](#configuración-de-dominio-y-ssl)
6. [Monitoreo y Logs](#monitoreo-y-logs)
7. [Backup y Recuperación](#backup-y-recuperación)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

### En tu Servidor (VPS/Cloud)

- **Sistema Operativo**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Mínimo 2GB (Recomendado 4GB+)
- **Disco**: Mínimo 20GB
- **CPU**: 2 cores recomendado
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+

### Software Necesario

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

---

## 🖥️ Preparación del Servidor

### 1. Conectar al Servidor

```bash
ssh usuario@tu-servidor-ip
```

### 2. Crear Directorio del Proyecto

```bash
mkdir -p /opt/soluciona
cd /opt/soluciona
```

### 3. Clonar el Repositorio

```bash
git clone https://github.com/carocodes25/soluciona-remodelaciones.git .
```

### 4. Configurar Firewall

```bash
# Permitir puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## ⚙️ Configuración de Variables de Entorno

### 1. Copiar archivo de ejemplo

```bash
cp .env.production.example .env.production
```

### 2. Editar variables de entorno

```bash
nano .env.production
```

### 3. Configurar valores importantes

```bash
# CAMBIAR ESTOS VALORES OBLIGATORIAMENTE:
POSTGRES_PASSWORD=tu_password_seguro_aqui
REDIS_PASSWORD=tu_redis_password_aqui
JWT_SECRET=tu_jwt_secret_minimo_32_caracteres
JWT_REFRESH_SECRET=tu_refresh_secret_minimo_32_caracteres
ADMIN_EMAIL=tu-email@dominio.com
ADMIN_PASSWORD=tu_password_admin_seguro

# URLs (cambiar yourdomain.com por tu dominio real)
APP_URL=https://tudominio.com
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_WS_URL=wss://api.tudominio.com
NEXT_PUBLIC_APP_URL=https://tudominio.com
CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com

# Email (ejemplo con Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM=noreply@tudominio.com
```

### 4. Generar Secrets Seguros

```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar JWT_REFRESH_SECRET
openssl rand -base64 32

# Generar passwords seguros
openssl rand -base64 24
```

---

## 🚀 Deployment en Producción

### Opción 1: Deployment Rápido (Sin SSL)

```bash
# Construir y levantar servicios
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

### Opción 2: Deployment Completo (Con Nginx + SSL)

#### Paso 1: Configurar Dominio

1. Apuntar tu dominio a la IP del servidor:
   - `A Record`: `tudominio.com` → `IP_SERVIDOR`
   - `A Record`: `www.tudominio.com` → `IP_SERVIDOR`
   - `A Record`: `api.tudominio.com` → `IP_SERVIDOR`

2. Esperar propagación DNS (5-30 minutos)

#### Paso 2: Obtener Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Detener Nginx si está corriendo
docker-compose -f docker-compose.prod.yml stop nginx

# Obtener certificados
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com -d api.tudominio.com

# Copiar certificados a la carpeta del proyecto
sudo mkdir -p infra/nginx/ssl
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem infra/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem infra/nginx/ssl/key.pem
sudo chmod 644 infra/nginx/ssl/*.pem
```

#### Paso 3: Actualizar configuración de Nginx

```bash
# Editar nginx.conf
nano infra/nginx/nginx.conf

# Reemplazar "yourdomain.com" con tu dominio real
# Buscar y reemplazar todas las ocurrencias
```

#### Paso 4: Levantar todos los servicios

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Paso 5: Renovación Automática de SSL

```bash
# Crear script de renovación
sudo nano /etc/cron.daily/certbot-renew

# Agregar contenido:
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/tudominio.com/fullchain.pem /opt/soluciona/infra/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/tudominio.com/privkey.pem /opt/soluciona/infra/nginx/ssl/key.pem
docker-compose -f /opt/soluciona/docker-compose.prod.yml restart nginx

# Dar permisos
sudo chmod +x /etc/cron.daily/certbot-renew
```

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Solo backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Solo frontend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Solo base de datos
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Ver Estado de Servicios

```bash
# Estado general
docker-compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats

# Espacio en disco
df -h
docker system df
```

### Comandos Útiles

```bash
# Reiniciar un servicio
docker-compose -f docker-compose.prod.yml restart backend

# Detener todos los servicios
docker-compose -f docker-compose.prod.yml down

# Actualizar código
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Limpiar imágenes antiguas
docker image prune -a
```

---

## 💾 Backup y Recuperación

### Backup de Base de Datos

```bash
# Crear backup manual
docker exec soluciona-postgres pg_dump -U soluciona soluciona_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Crear script de backup automático
sudo nano /opt/soluciona/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/soluciona"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker exec soluciona-postgres pg_dump -U soluciona soluciona_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Mantener solo últimos 7 días
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
# Dar permisos
chmod +x /opt/soluciona/scripts/backup.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
# Agregar línea:
0 2 * * * /opt/soluciona/scripts/backup.sh
```

### Restaurar Backup

```bash
# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Restaurar
gunzip -c backup_20231120_020000.sql.gz | docker exec -i soluciona-postgres psql -U soluciona soluciona_db

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 Troubleshooting

### Problema: Servicios no inician

```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs

# Verificar configuración
docker-compose -f docker-compose.prod.yml config

# Verificar puertos en uso
sudo netstat -tlnp | grep -E '3000|4000|5432|6379'
```

### Problema: Base de datos no conecta

```bash
# Verificar que postgres está corriendo
docker ps | grep postgres

# Verificar logs de postgres
docker logs soluciona-postgres

# Conectar manualmente
docker exec -it soluciona-postgres psql -U soluciona -d soluciona_db
```

### Problema: Frontend no carga

```bash
# Verificar logs
docker logs soluciona-frontend

# Verificar variables de entorno
docker exec soluciona-frontend env | grep NEXT_PUBLIC

# Rebuild del frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

### Problema: 502 Bad Gateway

```bash
# Verificar nginx
docker logs soluciona-nginx

# Verificar que backend está corriendo
curl http://localhost:4000/health

# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Problema: Certificado SSL inválido

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --force-renewal

# Copiar certificados nuevos
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem infra/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem infra/nginx/ssl/key.pem

# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📱 Verificación Final

### Checklist de Deployment

- [ ] Servidor con Docker instalado
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] Dominio apuntando al servidor
- [ ] Certificado SSL obtenido
- [ ] Nginx configurado
- [ ] Servicios corriendo (docker ps)
- [ ] Frontend accesible (https://tudominio.com)
- [ ] Backend accesible (https://api.tudominio.com)
- [ ] Base de datos funcionando
- [ ] Backup automático configurado
- [ ] Logs sin errores críticos

### URLs para Verificar

- **Frontend**: https://tudominio.com
- **Backend API**: https://api.tudominio.com
- **Health Check**: https://api.tudominio.com/health
- **Admin Panel**: https://tudominio.com/admin-dashboard

---

## 🎉 ¡Deployment Completado!

Tu aplicación Soluciona ahora está corriendo en producción con:

✅ Frontend (Next.js)  
✅ Backend (NestJS)  
✅ Base de Datos (PostgreSQL)  
✅ Cache (Redis)  
✅ Reverse Proxy (Nginx)  
✅ SSL/HTTPS (Let's Encrypt)  
✅ Backup Automático  

---

## 📞 Soporte

Si encuentras problemas, verifica:
1. Los logs de cada servicio
2. Las variables de entorno
3. La configuración de Nginx
4. Los certificados SSL

**Comandos útiles guardados en**: `/opt/soluciona/scripts/`

---

**¡Tu plataforma está lista para usuarios reales!** 🚀
