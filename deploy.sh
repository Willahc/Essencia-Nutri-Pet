#!/bin/bash
# ========================================================
# Script de Deploy e Atualização - Essência Nutri Pet
# Servidor: Linux VPS Hostinger
# ========================================================

echo "🐾 Atualizando repositório do Essência Nutri Pet..."
git pull origin main

echo "🐳 Construindo e iniciando containers Docker..."
docker compose build --no-cache
docker compose up -d

echo "🧹 Limpando imagens antigas não utilizadas..."
docker image prune -f

echo "✅ Deploy concluído com sucesso! Aplicação rodando na porta 3000."
