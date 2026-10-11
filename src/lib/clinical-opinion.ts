import { ExamParameterResult, Species } from "@/types";

/**
 * Motor Especialista de Análise Clínica Zootécnica e Nutricional
 * Interpreta os biomarcadores laboratoriais (hematologia, bioquímica e eletrólitos)
 * e sintetiza um parecer preliminar técnico human-in-the-loop.
 */
export function generateZootecnicClinicalOpinion(params: {
  patientName: string;
  species: Species;
  breed: string;
  results: ExamParameterResult[];
}): string {
  const { patientName, species, breed, results } = params;
  const isCanine = species === "CANINE";
  const speciesLabel = isCanine ? "Canino" : "Felino";

  const findParam = (nameRegex: RegExp) => results.find(r => nameRegex.test(r.parameter));

  const u = findParam(/ur[eé]ia/i);
  const cr = findParam(/creatinina/i);
  const fos = findParam(/f[oó]sforo/i);
  const alt = findParam(/alt|tgp/i);
  const fa = findParam(/fosfatase\s+alcalina|fa\b/i);
  const ggt = findParam(/ggt|gama/i);
  const hb = findParam(/hemoglobina/i);
  const ht = findParam(/hemat[oó]crito/i);
  const gli = findParam(/glicose|glicemia/i);
  const fru = findParam(/frutosamina/i);
  const ca = findParam(/c[aá]lcio/i);
  const pt = findParam(/prote[íi]na\s+total/i);

  const sections: string[] = [];

  // 1. Identificação do Paciente
  sections.push(`Parecer Técnico Zootécnico/Nutricional • Paciente: ${patientName} (${speciesLabel}, ${breed}).`);

  // 2. Avaliação Renal (Ureia, Creatinina, Fósforo)
  const isRenalAltered = Boolean((u && u.is_out_of_range) || (cr && cr.is_out_of_range) || (fos && fos.is_out_of_range));
  if (isRenalAltered) {
    const crVal = typeof cr?.value === 'number' ? cr.value : parseFloat(String(cr?.value || '0'));
    const fosVal = typeof fos?.value === 'number' ? fos.value : parseFloat(String(fos?.value || '0'));

    let renalNotes = `• Função Renal: Azotemia detectada (Ureia: ${u ? `${u.value} ${u.unit}` : 'N/A'}, Creatinina: ${cr ? `${cr.value} ${cr.unit}` : 'N/A'}).`;
    if (!isCanine && crVal >= 2.8) {
      renalNotes += ` Em felinos, creatinina >= 2.8 mg/dL requer monitoramento estrito de Estágio 3/4 conforme diretrizes IRIS (International Renal Interest Society).`;
    }
    if (fos && (fosVal > 4.6 || fos.is_out_of_range)) {
      renalNotes += ` Fósforo sérico elevado (${fos.value} ${fos.unit}), superando a meta terapêutica recomendada para proteção nefroprotetora.`;
    }
    sections.push(renalNotes);
  } else if (u || cr) {
    sections.push(`• Função Renal: Escórias nitrogenadas séricas (Ureia e Creatinina) mantêm-se dentro dos limites fisiológicos da espécie, indicando taxa de filtração glomerular preservada.`);
  }

  // 3. Avaliação Hepatobiliar (ALT, FA, GGT)
  const isHepaticAltered = Boolean((alt && alt.is_out_of_range) || (fa && fa.is_out_of_range) || (ggt && ggt.is_out_of_range));
  if (isHepaticAltered) {
    const elevated = [
      alt?.is_out_of_range ? `ALT: ${alt.value} ${alt.unit}` : null,
      fa?.is_out_of_range ? `FA: ${fa.value} ${fa.unit}` : null,
      ggt?.is_out_of_range ? `GGT: ${ggt.value} ${ggt.unit}` : null
    ].filter(Boolean).join(', ');
    sections.push(`• Perfil Hepatobiliar: Elevação enzimática detectada [${elevated}]. Sugere sobrecarga hepatocelular ou colestase discreta. Recomenda-se controle rigoroso no teor lipídico dietético.`);
  } else if (alt || fa || ggt) {
    sections.push(`• Perfil Hepático: Enzimas de integridade celular e excreção biliar (ALT, Fosfatase Alcalina, GGT) sem alterações significativas.`);
  }

  // 4. Eritrograma / Série Vermelha (Hemoglobina, Hematócrito, Proteína Total)
  if ((hb && hb.is_out_of_range) || (ht && ht.is_out_of_range)) {
    const hbVal = typeof hb?.value === 'number' ? hb.value : parseFloat(String(hb?.value || '0'));
    if (hbVal > 18.0) {
      sections.push(`• Eritrograma: Hemoglobina elevada (${hb ? `Hb: ${hb.value} ${hb.unit}` : ''}${ht ? `, Ht: ${ht.value} ${ht.unit}` : ''}), compatível com hemoconcentração decorrente de desidratação leve prévia à punção venosa ou policitemia relativa transitória. Estimular hidratação diária.`);
    } else {
      sections.push(`• Eritrograma: Série vermelha alterada (Hb: ${hb?.value || 'N/A'}, Ht: ${ht?.value || 'N/A'}). Necessita investigação etiológica e suporte com nutrientes hematopoiéticos.`);
    }
  } else if (hb || ht) {
    sections.push(`• Eritrograma: Índices eritrocitários normais, sem evidência de anemia.`);
  }

  // 5. Metabolismo / Glicose / Eletrólitos
  if (gli && gli.is_out_of_range) {
    const gliVal = typeof gli.value === 'number' ? gli.value : parseFloat(String(gli.value || '0'));
    if (gliVal < 60) {
      sections.push(`• Metabolismo Glicídico: Glicemia reduzida (${gli.value} ${gli.unit}), frequentemente decorrente de consumo in vitro de glicose em tubo seco com centrifugação tardia. ${fru ? `Frutosamina normal (${fru.value} ${fru.unit}) afasta hipoglicemia crônica.` : ''}`);
    } else {
      sections.push(`• Metabolismo Glicídico: Glicemia elevada (${gli.value} ${gli.unit}). Avaliar estresse agudo na coleta vs resistência insulínica.`);
    }
  }

  if (ca && ca.is_out_of_range) {
    sections.push(`• Equilíbrio Eletrolítico: Cálcio ionizado alterado (${ca.value} ${ca.unit}). Recomenda-se balanceamento estrito da relação Cálcio:Fósforo (Ca:P 1.2:1 a 1.4:1) na dieta.`);
  }

  // 6. Conduta Nutricional Personalizada
  if (isRenalAltered) {
    sections.push(`• Conduta Nutricional Recomendada: Instituir transição para dieta renal úmida de alta palatabilidade, restrição moderada de fósforo (<= 0.8g/1000 kcal), aporte proteico de altíssima digestibilidade (ovos, aves cozidas), suplementação de ômega-3 (EPA/DHA 100-150 mg/kg) e estímulo vigoroso à ingestão hídrica.`);
  } else if (isHepaticAltered) {
    sections.push(`• Conduta Nutricional Recomendada: Dieta com moderação lipídica, inclusão de fibras solúveis e antioxidantes funcionais (vitamina E, silimarina e ômega-3). Evitar petiscos gordurosos.`);
  } else {
    sections.push(`• Conduta Nutricional Recomendada: Manutenção de plano nutricional balanceado conforme diretrizes NRC (2006) / FEDIAF, focado no escore de condição corporal ideal e hidratação contínua.`);
  }

  return sections.join('\n\n');
}
