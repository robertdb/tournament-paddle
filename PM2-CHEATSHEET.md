# 🚀 PM2 - Comandos Esenciales para el Servidor

Comandos que realmente vas a usar para gestionar `paddle-api` y `paddle-frontend`.

---

## 🌍 Deploy por ambiente

```bash
# Deploy a DEV (default)
./deploy.sh dev
./deploy.sh dev main

# Deploy a PROD
./deploy.sh prod
./deploy.sh prod main

# Deploy a DEV desde otra branch
./deploy.sh dev develop
```

---

## 📊 Ver estado

```bash
# Ver todos los procesos
pm2 list

# Ver logs en tiempo real
pm2 logs

# Ver logs de un proceso específico
pm2 logs paddle-api
pm2 logs paddle-frontend

# Monitoreo de CPU y memoria
pm2 monit
```

---

## 🔄 Reiniciar procesos

```bash
# Reiniciar un proceso
pm2 restart paddle-api
pm2 restart paddle-frontend

# Reiniciar todos
pm2 restart all
```

---

## ⏸️ Detener procesos

```bash
# Detener un proceso
pm2 stop paddle-api
pm2 stop paddle-frontend

# Detener todos
pm2 stop all
```

---

## 💾 Guardar configuración

```bash
# Guardar procesos actuales (IMPORTANTE: ejecutar después de cambios)
pm2 save
```

---

## 🔁 Auto-inicio al reiniciar servidor

```bash
# 1. Guardar configuración actual
pm2 save

# 2. Generar script de startup
pm2 startup

# 3. Ejecutar el comando que PM2 te muestre (ejemplo):
# sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.20.1/bin /home/ubuntu/.nvm/versions/node/v20.20.1/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## 🆘 Troubleshooting

```bash
# Ver logs de errores
pm2 logs --err

# Ver últimas 50 líneas de logs
pm2 logs --lines 50

# Limpiar logs
pm2 flush

# Si algo está roto, reiniciar todo
pm2 restart all
```

---

## 🎯 Comandos para tu proyecto

### Iniciar procesos (primera vez)

```bash
# Backend
cd /var/www/html/tournament-paddle-dev/backend
PORT=3001 pm2 start server.js --name paddle-api

# Frontend
cd /var/www/html/tournament-paddle-dev/frontend
pm2 start npm --name paddle-frontend -- start

# Guardar
pm2 save
```

### Actualizar después de deploy

```bash
# Reiniciar ambos
pm2 restart all

# O individual
pm2 restart paddle-api
pm2 restart paddle-frontend
```

---

## ✅ Checklist después de deploy

```bash
pm2 list          # ¿Ambos están "online"?
pm2 logs          # ¿No hay errores?
pm2 save          # Guardar configuración
```

---

**Eso es todo.** Con estos comandos gestionás el 99% de lo que necesitás en el servidor.
