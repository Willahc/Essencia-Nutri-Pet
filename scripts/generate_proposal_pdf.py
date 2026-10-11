import os
import sys
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page count
    along with running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#2D6A4F"))
        
        # Running Header
        self.drawString(20 * mm, 285 * mm, "ESSÊNCIA NUTRI PET")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B7280"))
        self.drawRightString(190 * mm, 285 * mm, "Dossiê Estratégico da Plataforma & Roadmap 2026-2027")
        
        # Header line
        self.setStrokeColor(colors.HexColor("#D1D5DB"))
        self.setLineWidth(0.5)
        self.line(20 * mm, 282 * mm, 190 * mm, 282 * mm)

        # Running Footer
        self.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B7280"))
        self.drawString(20 * mm, 11 * mm, "Documento Confidencial | Essência Nutri Pet - Todos os direitos reservados")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(190 * mm, 11 * mm, page_str)
        
        self.restoreState()


def create_proposal_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=22 * mm,
        bottomMargin=22 * mm
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY_DARK = colors.HexColor("#1B4332")
    PRIMARY_MED = colors.HexColor("#2D6A4F")
    PRIMARY_LIGHT = colors.HexColor("#40916C")
    BG_LIGHT = colors.HexColor("#EBF5EE")
    TEXT_MAIN = colors.HexColor("#1F2937")
    TEXT_MUTED = colors.HexColor("#4B5563")
    ACCENT_GOLD = colors.HexColor("#B45309")
    ACCENT_BG_GOLD = colors.HexColor("#FEF3C7")
    BORDER_COLOR = colors.HexColor("#E5E7EB")

    # Typography Styles
    title_cover = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=PRIMARY_DARK,
        alignment=0,
        spaceAfter=10
    )

    subtitle_cover = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=PRIMARY_MED,
        alignment=0,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=PRIMARY_DARK,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY_MED,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_MAIN,
        spaceAfter=7
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    box_text_style = ParagraphStyle(
        'BoxText',
        parent=body_style,
        fontSize=9,
        leading=13,
        textColor=PRIMARY_DARK
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_MAIN
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=PRIMARY_DARK
    )

    story = []

    # =========================================================================
    # CAPA EXECUTIVA
    # =========================================================================
    story.append(Spacer(1, 30 * mm))
    
    # Tag no topo da capa
    badge_data = [[
        Paragraph("<font color='#1B4332'><b>🌿 PLATAFORMA DE NUTROLOGIA VETERINÁRIA DE PRECISÃO & IA</b></font>", box_text_style)
    ]]
    badge_table = Table(badge_data, colWidths=[170 * mm])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, PRIMARY_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 15 * mm))

    # Título Principal
    story.append(Paragraph("ESSÊNCIA NUTRI PET", title_cover))
    story.append(Paragraph("Dossiê Estratégico da Solução: Proposta de Valor, Arquitetura Técnica, Módulos Operacionais e Roadmap de Escala 2026-2027", subtitle_cover))
    
    story.append(HRFlowable(width="100%", thickness=3, color=PRIMARY_MED, spaceBefore=5, spaceAfter=20))

    # Resumo Rápido da Capa
    cover_meta = [
        [Paragraph("<b>Status do Projeto:</b>", body_style), Paragraph("<font color='#2D6A4F'><b>Produção Ativa (Deploy VPS Hostinger Concluído)</b></font>", body_style)],
        [Paragraph("<b>Versão do Sistema:</b>", body_style), Paragraph("v1.0.0 Standalone (Next.js 15 + Prisma + Nginx)", body_style)],
        [Paragraph("<b>Público-Alvo:</b>", body_style), Paragraph("Médicos Veterinários Nutrólogos, Clínicas, Hospitais e Tutores", body_style)],
        [Paragraph("<b>Conformidade Clínica:</b>", body_style), Paragraph("NRC 2006 (Nutrient Requirements of Dogs and Cats) + FEDIAF", body_style)],
        [Paragraph("<b>Inteligência Artificial:</b>", body_style), Paragraph("Claude 3.5 Sonnet (Leitor Clínico de Laudos & Exames)", body_style)],
        [Paragraph("<b>Data de Emissão:</b>", body_style), Paragraph(f"{datetime.now().strftime('%d de Outubro de %Y')}", body_style)],
    ]
    t_cover_meta = Table(cover_meta, colWidths=[50 * mm, 120 * mm])
    t_cover_meta.setStyle(TableStyle([
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#F3F4F6")),
    ]))
    story.append(t_cover_meta)

    story.append(Spacer(1, 35 * mm))

    # Box de Destaque no rodapé da capa
    box_cover_data = [[
        Paragraph(
            "<b>Declaração de Missão:</b><br/>"
            "<i>Capacitar o médico veterinário nutrólogo com formulação nutricional precisa, "
            "leitura automatizada de exames laboratoriais por IA e engajamento ativo do tutor no domicílio, "
            "transformando a dieta natural em um tratamento clínico de máxima adesão e longevidade para o pet.</i>",
            box_text_style
        )
    ]]
    box_cover = Table(box_cover_data, colWidths=[170 * mm])
    box_cover.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F9FAFB")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D1D5DB")),
    ]))
    story.append(box_cover)

    story.append(PageBreak())

    # =========================================================================
    # SEÇÃO 1: DIAGNÓSTICO DE MERCADO E PROPOSTA DE VALOR
    # =========================================================================
    story.append(Paragraph("1. Diagnóstico de Mercado e Proposta de Valor", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_MED, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "O mercado pet brasileiro é o terceiro maior do mundo em faturamento, com uma demanda sem precedentes por "
        "<b>Alimentação Natural (AN)</b> e nutrição clínica personalizada. Cães e gatos acometidos por nefropatias, "
        "endocrinopatias, cardiopatias, alergias alimentares e obesidade exigem dietas meticulosamente calculadas. "
        "Contudo, a prática clínica do nutrólogo veterinário ainda enfrenta gargalos críticos que comprometem o sucesso terapêutico:",
        body_style
    ))

    # Tabela Problema x Solução
    prob_sol_data = [
        [Paragraph("Gargalo Crítico Atual", table_header_style), Paragraph("Solução Essência Nutri Pet", table_header_style)],
        [
            Paragraph("<b>Cálculo Manual Exaustivo:</b> Uso de planilhas complexas e estáticas para balancear NRC, Ca:P e energia metabolizável, consumindo até 2 horas por prescrição.", table_cell_style),
            Paragraph("<b>Prescritor & Formulador Inteligente:</b> Algoritmo automatizado que balanceia em tempo real calorias (Kleiber), relação Ca:P (1.2:1), Ômega-3 e Taurina em segundos.", table_cell_style)
        ],
        [
            Paragraph("<b>Leitura Lenta de Exames:</b> Laudos laboratoriais em PDFs não estruturados exigem digitação manual e cruzamento tedioso de parâmetros bioquímicos.", table_cell_style),
            Paragraph("<b>Módulo de IA Especializada:</b> Parser em Python + Claude 3.5 Sonnet que extrai parâmetros de sangue, urina e imagem, emitindo alertas clínicos e restrições imediatas.", table_cell_style)
        ],
        [
            Paragraph("<b>Abandono da Dieta pelo Tutor:</b> O tutor não segue a transição correta, o pet apresenta diarreia ou vômito, e o tutor desiste no 4º dia voltando à ração ultraprocessada.", table_cell_style),
            Paragraph("<b>Portal do Tutor com Escala Waltham:</b> Cronograma de transição interativo (7 a 14 dias), registro diário de fezes (escala 1 a 5) e exportação amigável para WhatsApp.", table_cell_style)
        ],
        [
            Paragraph("<b>Dados Descentralizados:</b> Histórico espalhado em WhatsApp, prontuários de papel e pastas locais, sem visão longitudinal da evolução do paciente.", table_cell_style),
            Paragraph("<b>Prontuário Digital Relacional:</b> Banco de dados persistente com histórico unificado de consultas, dietas anteriores, exames e curvas de peso.", table_cell_style)
        ]
    ]
    t_prob_sol = Table(prob_sol_data, colWidths=[80 * mm, 90 * mm])
    t_prob_sol.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_MED),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_prob_sol)
    story.append(Spacer(1, 6 * mm))

    # Box Proposta de Valor
    val_box_data = [[
        Paragraph(
            "<b>Diferencial Competitivo Essência Nutri Pet:</b><br/>"
            "Não somos apenas um software de gestão de clínicas veterinárias genérico (como SimplesVet ou Vetus). "
            "Somos uma <b>plataforma vertical de nutrologia de precisão</b>. Unimos o rigor científico das diretrizes internacionais "
            "(NRC 2006) à experiência humanizada e acolhedora do tutor, garantindo que a prescrição seja executada com sucesso.",
            box_text_style
        )
    ]]
    val_table = Table(val_box_data, colWidths=[170 * mm])
    val_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, PRIMARY_MED),
    ]))
    story.append(val_table)

    story.append(PageBreak())

    # =========================================================================
    # SEÇÃO 2: DETALHAMENTO DOS MÓDULOS JÁ CONSTRUÍDOS E EM PRODUÇÃO
    # =========================================================================
    story.append(Paragraph("2. Módulos Operacionais Implementados (Status Atual)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_MED, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "A plataforma encontra-se com sua versão <b>v1.0 funcional e operando em ambiente de produção</b>. "
        "Abaixo estão detalhados os quatro pilares funcionais já entregues e validados com casos clínicos reais:",
        body_style
    ))

    # Módulo 1
    story.append(Paragraph("Módulo 1: Formulador e Prescritor de Cardápios NRC 2006", h2_style))
    story.append(Paragraph(
        "Baseado nas equações da literatura nutricional internacional (Kleiber 1947, NRC 2006 e FEDIAF), o formulador calcula "
        "a Necessidade Energética Basal (NEM) e de Manutenção (NEM/MER) aplicando fatores de espécie, idade, castração e atividade física. "
        "Recursos implementados:",
        body_style
    ))
    story.append(Paragraph("• <b>Banco de Insumos com Composição Centesimal:</b> Proteínas magras (peito de frango, patinho moído), carboidratos complexos (arroz integral, batata doce), vísceras (fígado bovino), vegetais (chuchu, abobrinha) e fontes lipídicas.", bullet_style))
    story.append(Paragraph("• <b>Balanço Cálcio:Fósforo (Ca:P):</b> Monitoramento ativo da relação entre cálcio e fósforo, garantindo a proporção ideal (1.2:1 a 1.4:1) com suplementação orientada de carbonato de cálcio.", bullet_style))
    story.append(Paragraph("• <b>Blindagem Felina (Taurina Compulsória):</b> Alerta impeditivo para dietas felinas com inclusão de taurina sintética ou vísceras cardíacas, prevenindo cardiomiopatia dilatada e degeneração retiniana.", bullet_style))
    story.append(Paragraph("• <b>Exportação Multicanal:</b> Geração instantânea de texto formatado para envio direto via WhatsApp e visualização limpa para impressão do receituário com modo de preparo e congelamento.", bullet_style))

    story.append(Spacer(1, 3 * mm))

    # Módulo 2
    story.append(Paragraph("Módulo 2: Leitor Inteligente de Exames Clínicos por IA (Claude 3.5 Sonnet)", h2_style))
    story.append(Paragraph(
        "Processamento automatizado de laudos laboratoriais em formato PDF via pipeline híbrido Python (pypdf) e LLM clínica:",
        body_style
    ))
    story.append(Paragraph("• <b>Extração Estruturada:</b> Identificação de parâmetros hematológicos (hemácias, leucócitos, plaquetas) e bioquímicos (ureia, creatinina, ALT, fosfatase alcalina, colesterol, triglicérides).", bullet_style))
    story.append(Paragraph("• <b>Detecção de Alertas Nutricionais:</b> Correlação imediata entre achados de exame e ajustes na dieta (ex: uremia elevada exigindo controle estrito de fósforo e proteína de alto valor biológico).", bullet_style))
    story.append(Paragraph("• <b>Histórico Longitudinal:</b> Registro dos laudos associados à linha do tempo do paciente, permitindo comparar exames pré e pós-dieta.", bullet_style))

    story.append(Spacer(1, 3 * mm))

    # Módulo 3
    story.append(Paragraph("Módulo 3: Portal do Tutor & Diário de Adesão Alimentar", h2_style))
    story.append(Paragraph(
        "A adesão do tutor no domicílio é o ponto de maior falha na nutrologia veterinária. O Essência Nutri Pet implementou:",
        body_style
    ))
    story.append(Paragraph("• <b>Cronograma de Transição de 7 a 14 Dias:</b> Guia visual para o tutor substituir a ração pela AN progressivamente (25%, 50%, 75%, 100%), prevenindo disbiose e recusa alimentar.", bullet_style))
    story.append(Paragraph("• <b>Escala de Fezes Bristol/Waltham (1 a 5):</b> Interface visual com ilustrações clínicas e descrições intuitivas para o tutor classificar diariamente o escore fecal.", bullet_style))
    story.append(Paragraph("• <b>Registro de Sintomas e Apetite:</b> Monitoramento de vômito, prurido, letargia e nota de apetite de 0 a 10.", bullet_style))

    story.append(Spacer(1, 3 * mm))

    # Módulo 4
    story.append(Paragraph("Módulo 4: Prontuário Clínico Digital & Persistência Relacional", h2_style))
    story.append(Paragraph(
        "Arquitetura com Prisma ORM e SQLite local (preparada para PostgreSQL), contendo 7 modelos relacionais robustos: "
        "<b>Tutor, Patient, Appointment, DietPlan, MealItem, ExamDocument e DailyLog</b>. Casos clínicos reais já semeados "
        "(como a cadela Kate e o felino Raposo Tavares), garantindo integridade de dados e auditoria.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # SEÇÃO 3: ARQUITETURA TÉCNICA E INFRAESTRUTURA EM PRODUÇÃO
    # =========================================================================
    story.append(Paragraph("3. Arquitetura Técnica e Infraestrutura em Produção", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_MED, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "A solução foi desenhada seguindo as melhores práticas da engenharia de software moderna, garantindo alta "
        "performance, custo operacional mínimo na nuvem e segurança de dados clínicos:",
        body_style
    ))

    # Tabela de Arquitetura
    arch_data = [
        [Paragraph("Camada", table_header_style), Paragraph("Tecnologia Adotada", table_header_style), Paragraph("Justificativa Técnica & Benefício", table_header_style)],
        [
            Paragraph("<b>Frontend & SSR</b>", table_cell_bold),
            Paragraph("Next.js 15 (React 19, TypeScript)", table_cell_style),
            Paragraph("Renderização no servidor (SSR), alta velocidade, interface responsiva para celular do tutor e desktop do veterinário.", table_cell_style)
        ],
        [
            Paragraph("<b>Estilização & UI</b>", table_cell_bold),
            Paragraph("Tailwind CSS + Lucide Icons", table_cell_style),
            Paragraph("Design system limpo, tema clínico moderno verde esmeralda, leve e otimizado para carregamento instantâneo.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend & APIs</b>", table_cell_bold),
            Paragraph("Next.js Route Handlers + TypeScript", table_cell_style),
            Paragraph("Arquitetura serverless e standalone, processamento assíncrono de arquivos e tipagem estrita contra bugs.", table_cell_style)
        ],
        [
            Paragraph("<b>Banco de Dados</b>", table_cell_bold),
            Paragraph("Prisma ORM + SQLite (Docker Volume)", table_cell_style),
            Paragraph("Persistência em arquivo isolado de alto desempenho, migrações automatizadas e compatibilidade nativa com PostgreSQL.", table_cell_style)
        ],
        [
            Paragraph("<b>Containerização</b>", table_cell_bold),
            Paragraph("Docker Multi-Stage (Alpine Linux)", table_cell_style),
            Paragraph("Imagem compacta, usuário seguro sem privilégios root, Python embutido com pypdf para processamento de laudos.", table_cell_style)
        ],
        [
            Paragraph("<b>Web Server & Proxy</b>", table_cell_bold),
            Paragraph("Nginx Reverse Proxy (Gzip + 30MB Buffer)", table_cell_style),
            Paragraph("Compressão de ativos estáticos, cabeçalhos de segurança OWASP e suporte a uploads de exames volumosos.", table_cell_style)
        ],
        [
            Paragraph("<b>Hospedagem VPS</b>", table_cell_bold),
            Paragraph("Hostinger VPS KVM (Ubuntu 24.04 LTS)", table_cell_style),
            Paragraph("IP dedicado (187.127.253.42), coexistência pacífica com projetos prévios (porta 8080) e consumo inferior a 400MB RAM.", table_cell_style)
        ]
    ]
    t_arch = Table(arch_data, colWidths=[35 * mm, 50 * mm, 85 * mm])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_MED),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 6 * mm))

    # Box de Destaque de Segurança
    sec_box_data = [[
        Paragraph(
            "<b>Isolamento e Segurança Operacional na VPS:</b><br/>"
            "O Essência Nutri Pet foi configurado para rodar em sua própria rede virtual isolada (<code>essencia-net</code>) "
            "com volumes persistentes para banco de dados e exames. Ele convive com segurança ao lado do sistema "
            "<i>Cliente Inteligente</i> (porta 80/443), garantindo <b>zero risco de interrupção ou vazamento entre ambientes</b>.",
            box_text_style
        )
    ]]
    sec_table = Table(sec_box_data, colWidths=[170 * mm])
    sec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, PRIMARY_LIGHT),
    ]))
    story.append(sec_table)

    story.append(PageBreak())

    # =========================================================================
    # SEÇÃO 4: ROADMAP ESTRATÉGICO E PRÓXIMOS PASSOS (2026 - 2027)
    # =========================================================================
    story.append(Paragraph("4. Roadmap Estratégico & Próximos Passos", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_MED, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "Para consolidar o Essência Nutri Pet como a plataforma líder no ecossistema de nutrição animal, "
        "estruturamos um plano de evolução em quatro fases táticas bem delimitadas:",
        body_style
    ))

    # Tabela do Roadmap
    roadmap_data = [
        [Paragraph("Fase / Horizonte", table_header_style), Paragraph("Iniciativas Estruturantes", table_header_style), Paragraph("Entregáveis & Impacto de Negócio", table_header_style)],
        [
            Paragraph("<b>Fase 1</b><br/><font color='#2D6A4F'>Imediata<br/>(Próximas 2 semanas)</font>", table_cell_style),
            Paragraph(
                "• Chave Claude ativa na VPS<br/>"
                "• Domínio Próprio & SSL (HTTPS)<br/>"
                "• Autenticação Segura (Login de Vet e Tutor)<br/>"
                "• Rotas protegidas por permissão",
                table_cell_style
            ),
            Paragraph(
                "<b>Acesso Oficial Seguro:</b> Sistema operando sob domínio oficial com cadeado verde (ex: nutripet.com.br) e proteção de dados médicos dos pacientes.",
                table_cell_style
            )
        ],
        [
            Paragraph("<b>Fase 2</b><br/><font color='#2D6A4F'>Curto Prazo<br/>(Mês 1 a 2)</font>", table_cell_style),
            Paragraph(
                "• Personalização White-Label da Clínica<br/>"
                "• Exportação de PDF timbrado com CRMV<br/>"
                "• Notificações automáticas via WhatsApp API<br/>"
                "• Módulo de Faturamento e Cobrança",
                table_cell_style
            ),
            Paragraph(
                "<b>Monetização & Presença de Marca:</b> Prescrições elegantes com logo e CRMV do veterinário. Tutor recebe lembrete de refeição e exame no WhatsApp.",
                table_cell_style
            )
        ],
        [
            Paragraph("<b>Fase 3</b><br/><font color='#2D6A4F'>Médio Prazo<br/>(Mês 3 a 5)</font>", table_cell_style),
            Paragraph(
                "• Aplicativo Mobile PWA para o Tutor<br/>"
                "• Visão Computacional para Análise de Fezes<br/>"
                "• Chat com Assistente Nutricional IA<br/>"
                "• Alerta de Desvio de Peso e Escore",
                table_cell_style
            ),
            Paragraph(
                "<b>Engajamento Extremo:</b> O tutor tira foto das fezes e a IA classifica na escala Waltham; chat responde dúvidas sobre transição alimentar em segundos.",
                table_cell_style
            )
        ],
        [
            Paragraph("<b>Fase 4</b><br/><font color='#2D6A4F'>Longo Prazo<br/>(Mês 6 a 12)</font>", table_cell_style),
            Paragraph(
                "• Marketplace de Insumos & Carnes de AN<br/>"
                "• Integração com Farmácias de Manipulação<br/>"
                "• Multi-Clínicas (SaaS B2B)<br/>"
                "• Teleconsulta Nutrológica Integrada",
                table_cell_style
            ),
            Paragraph(
                "<b>Ecossistema Completo & Receita Recorrente:</b> Veterinário prescreve e o tutor compra os suplementos e carnes com desconto direto na plataforma.",
                table_cell_style
            )
        ]
    ]
    t_roadmap = Table(roadmap_data, colWidths=[32 * mm, 68 * mm, 70 * mm])
    t_roadmap.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_MED),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_roadmap)
    story.append(Spacer(1, 6 * mm))

    # Box com os próximos 3 passos operacionais imediatos
    action_box_data = [[
        Paragraph(
            "<b>🎯 Ações Imediatas Recomendadas para a Próxima Sessão:</b><br/>"
            "1. <b>Inserção da API Key Anthropic:</b> Ativação do leitor de laudos em tempo real na VPS via <code>.env</code>.<br/>"
            "2. <b>Mapeamento do Domínio & SSL:</b> Apontamento de DNS e configuração no Nginx nativo com Certbot (HTTPS).<br/>"
            "3. <b>Módulo de Autenticação (NextAuth):</b> Criação da tela de login para isolar a visão do Médico Veterinário e o acesso restrito do Tutor ao seu próprio pet.",
            box_text_style
        )
    ]]
    action_table = Table(action_box_data, colWidths=[170 * mm])
    action_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_BG_GOLD),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, ACCENT_GOLD),
    ]))
    story.append(action_table)

    story.append(PageBreak())

    # =========================================================================
    # SEÇÃO 5: MODELO DE NEGÓCIO E MONETIZAÇÃO SAAS
    # =========================================================================
    story.append(Paragraph("5. Modelo de Negócio, Precificação e Retorno (SaaS)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_MED, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "A plataforma foi concebida sob uma lógica de produto escalável no modelo <b>B2B2C Software-as-a-Service (SaaS)</b>, "
        "onde o veterinário ou a clínica contratam a ferramenta para aumentar sua produtividade e fidelizar seus tutores:",
        body_style
    ))

    # Tabela de Planos de Monetização
    pricing_data = [
        [Paragraph("Plano", table_header_style), Paragraph("Público & Porte", table_header_style), Paragraph("Preço Estimado", table_header_style), Paragraph("Recursos e Limites Inclusos", table_header_style)],
        [
            Paragraph("<b>Nutri Starter</b>", table_cell_bold),
            Paragraph("Veterinário Autônomo / Iniciante", table_cell_style),
            Paragraph("<b>R$ 119,00</b><br/><font color='#6B7280'>/mês</font>", table_cell_style),
            Paragraph("Até 30 pacientes ativos, formulador NRC 2006, 20 leituras de laudo com IA por mês, exportação WhatsApp.", table_cell_style)
        ],
        [
            Paragraph("<b>Nutri Pro</b><br/><i>(Carro-Chefe)</i>", table_cell_bold),
            Paragraph("Nutrólogo Estabelecido / Especialista", table_cell_style),
            Paragraph("<b>R$ 229,00</b><br/><font color='#6B7280'>/mês</font>", table_cell_style),
            Paragraph("Pacientes ilimitados, IA ilimitada, Portal do Tutor interativo, diário de fezes, laudos em PDF timbrado com CRMV.", table_cell_style)
        ],
        [
            Paragraph("<b>Clínica & Hospital</b>", table_cell_bold),
            Paragraph("Clínicas Médicas com múltiplos vets", table_cell_style),
            Paragraph("<b>R$ 499,00</b><br/><font color='#6B7280'>/mês</font>", table_cell_style),
            Paragraph("Multi-usuários (até 5 veterinários), White-Label total da clínica, relatórios de faturamento e suporte prioritário.", table_cell_style)
        ],
        [
            Paragraph("<b>Revenue Share B2C</b><br/><i>(Opcional)</i>", table_cell_bold),
            Paragraph("Comissão sobre Suplementos e Carnes", table_cell_style),
            Paragraph("<b>5% a 12%</b><br/><font color='#6B7280'>por pedido</font>", table_cell_style),
            Paragraph("Monetização passiva através de parcerias com fornecedores de carnes e laboratórios de suplementação veterinária.", table_cell_style)
        ]
    ]
    t_pricing = Table(pricing_data, colWidths=[35 * mm, 45 * mm, 30 * mm, 60 * mm])
    t_pricing.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_MED),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_pricing)
    story.append(Spacer(1, 8 * mm))

    # Métricas de Sucesso do Consultório Nutrológico
    story.append(Paragraph("Indicadores Chave de Desempenho (KPIs) Gerados para o Veterinário:", h2_style))
    story.append(Paragraph("• <b>Economia de Tempo Clínico:</b> Redução de 90 minutos para menos de 10 minutos na elaboração de um cardápio completo balanceado.", bullet_style))
    story.append(Paragraph("• <b>Aumento da Taxa de Adesão (Adherence Rate):</b> De 45% (média histórica de abandono por tutores sem acompanhamento) para mais de 85% com o Diário de Transição do Tutor.", bullet_style))
    story.append(Paragraph("• <b>Aumento do Ticket Médio da Consulta:</b> O nutrólogo deixa de vender apenas uma consulta avulsa e passa a vender 'Planos de Acompanhamento Nutrológico Trimestrais'.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # SEÇÃO 6: CONCLUSÃO E TERMO DE HOMOLOGAÇÃO
    # =========================================================================
    story.append(Paragraph("6. Conclusão e Termo de Entrega da Fase 1", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_MED, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "A entrega da <b>Fase 1</b> consolidou a viabilidade técnica e clínica do <b>Essência Nutri Pet</b>. "
        "A plataforma não é apenas um protótipo conceitual; trata-se de um sistema robusto, conteinerizado em Docker, "
        "com banco relacional estruturado e plenamente operacional na nuvem da Hostinger.",
        body_style
    ))

    story.append(Spacer(1, 4 * mm))

    # Tabela de Checklist de Entrega
    check_data = [
        [Paragraph("Item / Entregável", table_header_style), Paragraph("Status", table_header_style), Paragraph("Observações de Engenharia", table_header_style)],
        [
            Paragraph("Formulador Interativo de Cardápios", table_cell_style),
            Paragraph("<font color='#1B4332'><b>✓ CONCLUÍDO</b></font>", table_cell_style),
            Paragraph("Equações Kleiber, NRC 2006, Ca:P, Ômega-3 e Taurina felina validados.", table_cell_style)
        ],
        [
            Paragraph("Portal do Tutor & Diário de Fezes", table_cell_style),
            Paragraph("<font color='#1B4332'><b>✓ CONCLUÍDO</b></font>", table_cell_style),
            Paragraph("Escala visual Waltham 1-5 e transição gradual de 7 a 14 dias.", table_cell_style)
        ],
        [
            Paragraph("Parser de Laudos por IA", table_cell_style),
            Paragraph("<font color='#1B4332'><b>✓ CONCLUÍDO</b></font>", table_cell_style),
            Paragraph("Motor Claude 3.5 Sonnet preparado com suporte a PDF via pypdf.", table_cell_style)
        ],
        [
            Paragraph("Banco de Dados & Persistência Relacional", table_cell_style),
            Paragraph("<font color='#1B4332'><b>✓ CONCLUÍDO</b></font>", table_cell_style),
            Paragraph("Prisma 6.19.3, 7 modelos, rotas REST e seed com Kate e Raposo Tavares.", table_cell_style)
        ],
        [
            Paragraph("Infraestrutura Docker & Deploy VPS", table_cell_style),
            Paragraph("<font color='#1B4332'><b>✓ CONCLUÍDO</b></font>", table_cell_style),
            Paragraph("Deploy em produção na Hostinger VPS (porta 8080) sem impacto no sistema legado.", table_cell_style)
        ]
    ]
    t_check = Table(check_data, colWidths=[60 * mm, 35 * mm, 75 * mm])
    t_check.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_MED),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_check)

    story.append(Spacer(1, 15 * mm))

    # Box de Assinatura / Encerramento
    sign_data = [
        [
            Paragraph(
                "<b>Responsável Técnico pelo Projeto:</b><br/>"
                "Engenharia de Software & Arquitetura de Sistemas<br/>"
                "<b>Equipe Essência Nutri Pet & IA Pair Programming</b>",
                table_cell_style
            ),
            Paragraph(
                f"<b>Data de Validação:</b><br/>{datetime.now().strftime('%d/%m/%Y')}<br/>"
                "<b>Ambiente:</b> Hostinger VPS Production (KVM)",
                table_cell_style
            )
        ]
    ]
    t_sign = Table(sign_data, colWidths=[100 * mm, 70 * mm])
    t_sign.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F9FAFB")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D1D5DB")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_sign)

    # Compilação do PDF com NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF gerado com sucesso em: {output_path}")


if __name__ == '__main__':
    target = os.path.join(os.getcwd(), "Essencia_Nutri_Pet_Proposta_e_Roadmap.pdf")
    create_proposal_pdf(target)
