# 🚀 Quick Start - Deployment Guide

## Para Deployment Local (Testing)

```bash
# 1. Clonar repositorio
git clone https://github.com/carocodes25/soluciona-remodelaciones.git
cd soluciona-remodelaciones

# 2. Levantar con Docker
./deploy.sh
# Selecciona opción 1 (Development)

# 3. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# API Docs: http://localhost:4000/api
```

---

## Para Deployment en Servidor (Producción)

### Paso 1: Preparar Servidor (VPS/Cloud)

```bash
# SSH al servidor
ssh usuario@tu-servidor-ip

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configurar firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Paso 2: Configurar Proyecto

```bash
# Crear directorio
mkdir -p /opt/soluciona
cd /opt/soluciona

# Clonar repositorio
git clone https://github.com/carocodes25/soluciona-remodelaciones.git .

# Copiar y configurar variables de entorno
cp .env.production.example .env.production
nano .env.production
```

**Configurar estos valores OBLIGATORIAMENTE:**
```bash
POSTGRES_PASSWORD=tu_password_seguro
REDIS_PASSWORD=tu_redis_password
JWT_SECRET=tu_jwt_secret_32_chars
JWT_REFRESH_SECRET=tu_refresh_secret_32_chars
APP_URL=https://tudominio.com
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=tu_admin_password
```

### Paso 3: Configurar Dominio (Antes de SSL)

1. Ve a tu proveedor de dominio (GoDaddy, Namecheap, etc.)
2. Crea estos DNS records:
   ```
   A    @              TU_IP_SERVIDOR
   A    www            TU_IP_SERVIDOR
   A    api            TU_IP_SERVIDOR
   ```
3. Espera 5-30 minutos para propagación DNS

### Paso 4: Obtener Certificado SSL (GRATIS)

```bash
# Instalar Certbot
sudo apt install certbot -y

# Obtener certificados
sudo certbot certonly --standalone \
  -d tudominio.com \
  -d www.tudominio.com \
  -d api.tudominio.com \
  --email tu-email@dominio.com \
  --agree-tos

# Copiar certificados al proyecto
sudo mkdir -p /opt/soluciona/infra/nginx/ssl
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem /opt/soluciona/infra/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem /opt/soluciona/infra/nginx/ssl/key.pem
sudo chmod 644 /opt/soluciona/infra/nginx/ssl/*.pem
```

### Paso 5: Actualizar Nginx con tu Dominio

```bash
# Editar configuración
nano /opt/soluciona/infra/nginx/nginx.conf

# Buscar y reemplazar "yourdomain.com" con "tudominio.com"
# (Aparece en varias líneas)
```

### Paso 6: Deploy! 🚀

```bash
# Ejecutar script de deployment
cd /opt/soluciona
./deploy.sh
# Selecciona opción 2 (Production)

# Esperar 2-3 minutos...
```

### Paso 7: Verificar

```bash
# Ver estado de servicios
docker ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
./scripts/health-check.sh
```

### Paso 8: Acceder a la Aplicación

- **Frontend**: https://tudominio.com
- **Backend API**: https://api.tudominio.com
- **Admin Panel**: https://tudominio.com/admin-dashboard

**Credenciales iniciales**: Las que configuraste en ADMIN_EMAIL y ADMIN_PASSWORD

---

## Providers de VPS/Cloud Recomendados

### Opción 1: DigitalOcean (Recomendado para principiantes)
- **Precio**: $6-12/mes
- **Specs**: 1-2 GB RAM, 1 CPU
- **URL**: https://www.digitalocean.com
- **Droplet**: Ubuntu 22.04
- ✅ Muy fácil de usar
- ✅ $200 crédito gratis por 60 días

### Opción 2: AWS Lightsail
- **Precio**: $5-10/mes
- **Specs**: 1-2 GB RAM
- **URL**: https://lightsail.aws.amazon.com
- ✅ 3 meses gratis
- ✅ Muy estable

### Opción 3: Linode/Akamai
- **Precio**: $5-12/mes
- **Specs**: 1-2 GB RAM
- **URL**: https://www.linode.com
- ✅ Muy económico
- ✅ $100 crédito gratis

### Opción 4: Hetzner (Más barato)
- **Precio**: €4-8/mes
- **Specs**: 2-4 GB RAM
- **URL**: https://www.hetzner.com
- ✅ Mejor precio/calidad
- ✅ Servidores en Europa

### Opción 5: Railway (PaaS - Más fácil)
- **Precio**: $5-20/mes
- **URL**: https://railway.app
- ✅ Deploy automático desde GitHub
- ✅ SSL automático
- ✅ No necesitas configurar nada
- ⚠️ Más caro pero MUY fácil

---

## Railway Deploy (La Forma MÁS Fácil)

Si no quieres configurar servidor, usa Railway:

1. Ve a https://railway.app
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `soluciona-remodelaciones`
4. Railway detectará automáticamente docker-compose.yml
5. Configura las variables de entorno desde el panel
6. Deploy automático en 5 minutos
7. Obtienes URL tipo: `https://tu-app.up.railway.app`

**Costo aproximado**: $10-20/mes con todo incluido (DB, Redis, SSL, dominio)

---

## Dominios Recomendados

### Registradores de Dominios
- **Namecheap**: $8-12/año (.com)
- **GoDaddy**: $10-15/año
- **Google Domains**: $12/año
- **Cloudflare**: $8-10/año (+ CDN gratis)

### Dominios Genéricos GRATIS (para testing)
Si solo quieres probar, puedes usar subdominios gratis:
- **ngrok**: Túnel temporal a localhost
- **localtunnel**: Similar a ngrok
- **Railway**: Te da subdominio gratis
- **Render**: Te da subdominio gratis

```bash
# Ejemplo con ngrok (temporal)
ngrok http 3000
# Te da URL tipo: https://abc123.ngrok.io
```

---

## Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar servicio
docker-compose -f docker-compose.prod.yml restart backend

# Actualizar código
git pull
./deploy.sh

# Backup manual
./scripts/backup.sh

# Health check
./scripts/health-check.sh

# Detener todo
docker-compose -f docker-compose.prod.yml down

# Limpiar espacio
docker system prune -a
```

---

## Troubleshooting Rápido

**Problema: Puerto 80/443 ocupado**
```bash
sudo systemctl stop apache2
sudo systemctl stop nginx
```

**Problema: SSL no funciona**
```bash
# Verificar certificados
sudo certbot certificates

# Renovar
sudo certbot renew
```

**Problema: Servicio no inicia**
```bash
# Ver logs detallados
docker logs soluciona-backend
docker logs soluciona-frontend
```

---

## 🎉 ¡Listo!

Tu aplicación Soluciona está ahora en producción con:
- ✅ HTTPS/SSL
- ✅ Base de datos PostgreSQL
- ✅ Cache Redis
- ✅ Reverse proxy Nginx
- ✅ Backup automático
- ✅ Dominio personalizado

**Tiempo estimado total**: 30-60 minutos

---

**¿Necesitas ayuda?** Revisa DEPLOYMENT.md para guía completa.
