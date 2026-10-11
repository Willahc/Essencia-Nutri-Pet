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

## 🗺️ Roadmap de Desenvolvimento

- [ ] **Fase 1: Fundação & Domínio** (Autenticação RBAC, RLS, estrutura base de usuários, tutores e pacientes).
- [ ] **Fase 2: Prontuário Longitudinal & Planos** (Os 4 atendimentos: consulta, consultoria, retorno e reavaliação; curvas de peso/ECC; versionamento de planos).
- [ ] **Fase 3: Pipeline de Exames com IA** (Upload seguro, OCR/LLM estruturado, marcação de incertezas e conferência lado a lado).
- [ ] **Fase 4: Portal do Tutor & Relatórios** (Área do tutor com dietas ativas, metas, lembretes e relatórios evolutivos).

---

## 📜 Licença

Proprietário © Essência Nutri Pet. Todos os direitos reservados.
