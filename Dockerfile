# ==============================================================
# Essência Nutri Pet - Production Multi-Stage Dockerfile
# Next.js 15 Standalone + Prisma + Python PDF Parser
# ==============================================================

# 1. Base Image com Node.js 20, Python 3 e pypdf para laudos
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 py3-pip openssl
RUN ln -sf /usr/bin/python3 /usr/bin/python
RUN pip install --no-cache-dir --break-system-packages pypdf

# 2. Dependências de Desenvolvimento e Produção
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 3. Builder da Aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# 4. Runner de Produção Otimizado (Standalone)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Usuário de sistema sem privilégios de root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos estáticos, standalone server e scripts necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cria diretórios de dados com permissões corretas
RUN mkdir -p /app/prisma && chown -R nextjs:nodejs /app/prisma
RUN mkdir -p /app/public/exams && chown -R nextjs:nodejs /app/public/exams

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
