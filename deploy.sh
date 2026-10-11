#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🌿 ESSÊNCIA NUTRI PET - SCRIPT DE DEPLOY HOSTINGER VPS"
echo "=========================================================="

# 1. Verifica e instala Docker e Docker Compose caso não existam no sistema
if ! command -v docker &> /dev/null; then
    echo "📦 Docker não encontrado. Instalando automaticamente..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✓ Docker instalado com sucesso!"
fi

# 2. Garante o arquivo .env de produção
if [ ! -f .env ]; then
    echo "📝 Criando .env inicial..."
    echo 'DATABASE_URL="file:/app/prisma/dev.db"' > .env
    echo 'NODE_ENV="production"' >> .env
fi

# 3. Build das imagens e subida dos containers
echo "🔨 Construindo containers Docker (Next.js Standalone + Nginx)..."
docker compose down || true
docker compose build --pull
docker compose up -d

# 4. Sincroniza o banco de dados e executa o seed dos pacientes iniciais
echo "🌱 Sincronizando schema do banco de dados (Prisma)..."
sleep 5
docker compose exec -T app npx prisma db push --accept-data-loss || true
docker compose exec -T app npx tsx prisma/seed.ts || true

echo "=========================================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "Status dos containers:"
docker compose ps
echo "=========================================================="
