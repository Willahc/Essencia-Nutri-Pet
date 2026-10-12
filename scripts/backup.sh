#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

echo "💾 Criando snapshot do banco de dados SQLite na VPS..."
if docker ps --format '{{.Names}}' | grep -q "essencia-nutripet-app"; then
  docker cp essencia-nutripet-app:/app/prisma/dev.db "$BACKUP_DIR/dev_${TIMESTAMP}.db"
  echo "✅ Banco de dados exportado do container ativo para: $BACKUP_DIR/dev_${TIMESTAMP}.db"
elif [ -f "$DIR/prisma/dev.db" ]; then
  cp "$DIR/prisma/dev.db" "$BACKUP_DIR/dev_${TIMESTAMP}.db"
  echo "✅ Banco de dados copiado de prisma/dev.db para: $BACKUP_DIR/dev_${TIMESTAMP}.db"
else
  echo "⚠️ Nenhum banco SQLite ativo encontrado para backup."
fi

# Manter apenas os últimos 10 backups para economizar espaço
ls -1t "$BACKUP_DIR"/dev_*.db 2>/dev/null | tail -n +11 | xargs -r rm -f --

echo "✨ Snapshot salvo em: $BACKUP_DIR"
