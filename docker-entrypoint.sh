#!/bin/sh
set -e

# Se /app/prisma/dev.db não existir (ex: primeiro boot com volume montado no Render/Docker)
if [ ! -f /app/prisma/dev.db ]; then
  if [ -f /app/prisma/dev.db.template ]; then
    echo "🌱 Inicializando banco de dados SQLite a partir do template de build..."
    cp /app/prisma/dev.db.template /app/prisma/dev.db
    chmod 664 /app/prisma/dev.db 2>/dev/null || true
  fi
fi

exec "$@"
