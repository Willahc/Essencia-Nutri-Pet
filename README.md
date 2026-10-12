# Essência Nutri Pet 🐾✨

> Plataforma inteligente de acompanhamento nutricional longitudinal para cães e gatos com IA supervisionada (*Human-in-the-Loop*).

---

## 🎯 Visão Geral

O **Essência Nutri Pet** é uma plataforma B2B2C desenvolvida para solucionar a fragmentação de dados e a sobrecarga operacional de **médicos-veterinários, zootecnistas e nutrólogos de pequenos animais**, enquanto promove o engajamento contínuo dos **tutores** no tratamento de cães e gatos.

Diferente de sistemas de gestão genéricos (ERPs) ou simples calculadoras de ração caseira, o Essência Nutri Pet atua no **acompanhamento contínuo da saúde e evolução nutricional**, unificando:
- Ficha clínica longitudinal (*append-only*, histórico nunca sobrescrito).
- Monitoramento de peso, Escore de Condição Corporal (ECC 1–9) e metas calóricas/NEM.
- Módulo assistido de exames laboratoriais via OCR & IA multimodal com marcação estrita de incertezas (`is_uncertain`).
- Planos alimentares versionados (alimentação natural ou coadjuvante).
- Portal do tutor com orientações claras, metas visíveis e canal de adesão.

---

## 🔬 Pilares Clínicos & Zootécnicos

1. **Supervisão Humana Obrigatória (*Human-in-the-Loop*):**
   - A IA atua estritamente como ferramenta de apoio operacional (extração de tabelas de laudos, sumarização de tendências e rascunhos de pareceres).
   - Intervalos de referência não equivalem a diagnóstico. Nenhuma conduta ou alteração dietética é publicada sem a validação explícita do profissional responsável.
2. **Histórico Longitudinal Imutável:**
   - Correções e reavaliações geram novas versões auditáveis. Preserva-se o histórico real da evolução do paciente.
3. **Extração Rastreável de Exames:**
   - Cada parâmetro extraído (hemograma, função renal, hepática, eletrólitos, urinálise) preserva o documento original, página de origem e nível de confiança.
4. **Alinhamento com Tutores:**
   - Reduz a dispersão de informações em mensagens e PDFs estáticos, entregando orientações claras para garantir a adesão à dieta.

---

## 🛠️ Arquitetura Técnica

```
Navegador (Profissional / Tutor)
       │
       ▼
Frontend Web & PWA (Next.js 15 + TypeScript + Tailwind CSS + Shadcn UI)
       │
       ├── API Routes / Server Actions (Validação Zod + RBAC)
       │
       ├── PostgreSQL (Prisma / Drizzle ORM + Row Level Security - RLS)
       │
       ├── Object Storage Privado (S3 / Cloudflare R2 - Presigned URLs)
       │
       └── Worker / Pipeline Assíncrono (OCR + LLM Multimodal com JSON Schema Estrito)
```

### Stack Tecnológica
- **Frontend / Client:** Next.js (React 19 / TypeScript), Tailwind CSS, Shadcn UI / Radix UI, Lucide Icons.
- **Backend / API:** Next.js Server Actions & API Routes modulares com validação estrita via Zod.
- **Banco de Dados:** PostgreSQL com políticas de Row Level Security (RLS) e migrações versionadas.
- **Armazenamento de Laudos:** Object Storage compatível com S3 (acesso exclusivo por URLs pré-assinadas de 15 min).
- **Inteligência Artificial:** LLMs Multimodais (Gemini 1.5/2.0 Flash/Pro, Claude Sonnet) com Function Calling e JSON Schema determinístico.
- **Segurança & LGPD:** Criptografia TLS 1.3 em trânsito e AES-256 em repouso; trilha de auditoria append-only.

---

## 🚀 Status da Versão 1.0 (Produção Ativa)

A plataforma encontra-se **operacional e implantada em ambiente de produção na Hostinger VPS**:
- **Acesso Web:** `http://187.127.253.42:8080`
- **Infraestrutura:** Next.js 15 Standalone + Nginx Reverse Proxy + Docker Compose + Prisma ORM (SQLite).
- **Isolamento de Servidor:** Coexistência pacífica com sistemas legados da VPS sem conflitos de portas.
- **Dossiê Estratégico & Proposta:** [`Essencia_Nutri_Pet_Proposta_e_Roadmap.pdf`](Essencia_Nutri_Pet_Proposta_e_Roadmap.pdf) (7 páginas diagramadas).

---

## 🔬 Módulos Implementados & Validados

1. **Formulador & Prescritor de Cardápios NRC 2006:**
   - Equações de Kleiber para Necessidade Energética Basal e de Manutenção (NEM).
   - Balanceamento rígido da relação Cálcio:Fósforo (Ca:P 1.2:1 a 1.4:1).
   - Blindagem e alerta obrigatório de Taurina para felinos.
   - Cálculo de ácidos graxos essenciais Ômega-3 (EPA e DHA).
   - Exportação em 1 clique para WhatsApp e impressão em receituário limpo.

2. **Leitor Inteligente de Laudos por IA (Claude 3.5 Sonnet):**
   - Pipeline Python (`pypdf`) e LLM multimodal para extração de parâmetros laboratoriais.
   - Detecção automática de alterações bioquímicas (ureia, creatinina, enzimas hepáticas) e cruzamento com restrições alimentares.

3. **Portal do Tutor & Diário de Adesão Alimentar:**
   - Cronograma de transição alimentar gradual de 7 a 14 dias (25%, 50%, 75%, 100%).
   - Escala visual de fezes Waltham/Bristol (Escores 1 a 5).
   - Registro de sintomas (vômito, prurido) e notas diárias de apetite.

4. **Prontuário Longitudinal & Persistência Relacional:**
   - Prisma ORM 6.19.3 com 7 modelos de dados relacionais.
   - Banco de dados populado com pacientes clínicos reais (Kate e Raposo Tavares).

---

## 🛠️ Como Executar Localmente

```bash
# Instalar dependências
npm install

# Inicializar banco de dados SQLite
npx prisma db push
npx tsx prisma/seed.ts

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:3000`

---

## 🐳 Como Executar em Produção (VPS Hostinger)

Consulte o guia completo em [`HOSTINGER_DEPLOY_GUIDE.md`](HOSTINGER_DEPLOY_GUIDE.md) ou execute:

```bash
# Clone e entrada no repositório
git clone https://github.com/Willahc/Essencia-Nutri-Pet.git
cd Essencia-Nutri-Pet

# Execução do script automatizado
chmod +x deploy.sh
sudo ./deploy.sh
```

## ☁️ Como Fazer Deploy no Render (1-Clique via GitHub)

Você pode implantar a aplicação gratuitamente no **Render** com HTTPS automático e banco de dados SQLite pré-populado com os 49 pets e 56 exames:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Willahc/Essencia-Nutri-Pet)

### Passo a Passo no Render Dashboard:
1. Acesse [dashboard.render.com](https://dashboard.render.com) e faça login com sua conta do GitHub.
2. Clique em **New +** > **Blueprint** (ou clique no botão acima).
3. Conecte o repositório `Willahc/Essencia-Nutri-Pet`.
4. O Render detectará automaticamente o arquivo [`render.yaml`](render.yaml) com o ambiente Docker, portas e inicialização configurados.
5. (Opcional) Caso deseje habilitar a extração automática de exames por IA, adicione a variável `ANTHROPIC_API_KEY` com sua chave da Anthropic.
6. Clique em **Apply** / **Create Web Service**.
7. Após o build (~2 min), sua URL pública estará pronta (ex: `https://essencia-nutri-pet.onrender.com`).

---

## 📜 Licença

Proprietário © Essência Nutri Pet. Todos os direitos reservados.

