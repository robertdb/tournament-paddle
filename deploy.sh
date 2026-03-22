#!/bin/bash

# Deploy script para servidor remoto vía SSH
# Este script se ejecuta DESDE TU MÁQUINA LOCAL
# Uso: ./deploy.sh [dev|prod] [branch]

set -e

# Determinar ambiente
ENV=${1:-dev}
BRANCH=${2:-main}

# Configuración por ambiente (mismo servidor, diferentes carpetas)
case $ENV in
  prod)
    SSH_HOST="rf_ovh"
    REMOTE_DIR="/var/www/html/tournament-paddle"
    BACKEND_NAME="paddle-api-prod"
    FRONTEND_NAME="paddle-frontend-prod"
    BACKEND_PORT="4001"
    FRONTEND_PORT="4000"
    DOMAIN="paddle-pdl.ramfactoryarg.com"
    ;;
  dev)
    SSH_HOST="rf_ovh"
    REMOTE_DIR="/var/www/html/tournament-paddle-dev"
    BACKEND_NAME="paddle-api"
    FRONTEND_NAME="paddle-frontend"
    BACKEND_PORT="3001"
    FRONTEND_PORT="3000"
    DOMAIN="paddle-pdl-dev.ramfactoryarg.com"
    ;;
  *)
    echo "❌ Error: Ambiente inválido '$ENV'"
    echo "Uso: ./deploy.sh [dev|prod] [branch]"
    echo "Ejemplos:"
    echo "  ./deploy.sh dev"
    echo "  ./deploy.sh prod"
    echo "  ./deploy.sh dev develop"
    echo "  ./deploy.sh prod main"
    exit 1
    ;;
esac

BACKUP_DIR="/var/www/html/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Iniciando deploy remoto..."
echo "🏷️  Ambiente: $ENV"
echo "📌 Branch: $BRANCH"
echo "🖥️  Servidor: $SSH_HOST"
echo "📂 Directorio: $REMOTE_DIR"
echo ""

# Verificar que la config SSH existe
if ! ssh -G $SSH_HOST &>/dev/null; then
    echo "❌ Error: Config SSH '$SSH_HOST' no encontrada"
    echo "Verificá tu ~/.ssh/config"
    exit 1
fi

echo "🔗 Conectando al servidor..."

# Ejecutar comandos en el servidor remoto
ssh $SSH_HOST << ENDSSH
set -e

# Cargar nvm para tener npm disponible
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

echo "📂 Navegando al directorio del proyecto..."
cd $REMOTE_DIR

# 1. Crear backup del estado actual
echo "💾 Creando backup..."
mkdir -p $BACKUP_DIR
CURRENT_COMMIT=\$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
tar -czf "$BACKUP_DIR/backup_${TIMESTAMP}_\${CURRENT_COMMIT}.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    backend frontend 2>/dev/null || true
echo "✅ Backup creado: backup_${TIMESTAMP}_\${CURRENT_COMMIT}.tar.gz"
echo ""

# 2. Guardar cambios locales si existen
echo "🔍 Verificando cambios locales..."
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "⚠️  Hay cambios locales, guardando stash..."
    git stash save "Auto-stash before deploy $TIMESTAMP"
fi

# 3. Pull del código más reciente
echo "📥 Actualizando código desde Git..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH
NEW_COMMIT=\$(git rev-parse --short HEAD)
echo "✅ Código actualizado a: \$NEW_COMMIT"
echo ""

# 4. Actualizar backend
echo "🔧 Actualizando BACKEND..."
cd backend

echo "📦 Instalando dependencias backend..."
npm install

echo "🗄️  Corriendo migraciones..."
npx sequelize-cli db:migrate

# Reiniciar backend con PM2
echo "🔄 Reiniciando backend..."
if pm2 describe $BACKEND_NAME > /dev/null 2>&1; then
    pm2 restart $BACKEND_NAME --update-env
else
    echo "⚠️  Proceso $BACKEND_NAME no existe, creándolo..."
    PORT=$BACKEND_PORT pm2 start server.js --name $BACKEND_NAME
fi

echo "✅ Backend actualizado"
echo ""

# 5. Actualizar frontend
echo "🎨 Actualizando FRONTEND..."
cd ../frontend

echo "📦 Instalando dependencias frontend..."
npm install

# Build del frontend
echo "🏗️  Building frontend..."
npm run build

# Reiniciar frontend con PM2
echo "🔄 Reiniciando frontend..."
if pm2 describe $FRONTEND_NAME > /dev/null 2>&1; then
    pm2 restart $FRONTEND_NAME --update-env
else
    echo "⚠️  Proceso $FRONTEND_NAME no existe, creándolo..."
    PORT=$FRONTEND_PORT pm2 start npm --name $FRONTEND_NAME -- start
fi

echo "✅ Frontend actualizado"
echo ""

# 6. Guardar configuración PM2
echo "💾 Guardando configuración PM2..."
pm2 save

# 7. Verificar estado
echo ""
echo "📊 Estado de los procesos:"
pm2 list

echo ""
echo "🎉 ¡Deploy completado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 Commit: \$NEW_COMMIT"
echo "📌 Branch: $BRANCH"
echo "📌 Backup: $BACKUP_DIR/backup_${TIMESTAMP}_\${CURRENT_COMMIT}.tar.gz"
echo ""
echo "🌐 Servicios:"
echo "   - https://$DOMAIN"
echo ""
echo "📝 Ver logs:"
echo "   ssh $SSH_HOST 'pm2 logs $BACKEND_NAME'"
echo "   ssh $SSH_HOST 'pm2 logs $FRONTEND_NAME'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ENDSSH

echo ""
echo "✅ Deploy remoto completado desde tu máquina local"
echo "🌐 Verificá: https://$DOMAIN"
