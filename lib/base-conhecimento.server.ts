// Base de Conhecimento — Cabanas Lobo do Mar, versão 1.0 (documento de referência da Fase 1), transcrita integralmente.
// Somente servidor: carregada pela Netlify Function e enviada igual aos três provedores; nunca vai ao navegador.
// `naGeracao: false` marca seções que orientam o futuro agente de marketing (painel, autonomia, campanhas)
// e não se aplicam à geração de textos de um projeto já montado no editor.
export type SecaoBase = { id: string; titulo: string; naGeracao: boolean; texto: string };

export const VERSAO_BASE = '1.0';

export const BASE_CONHECIMENTO: readonly SecaoBase[] = [
  { id: 'objetivo', titulo: '1. Objetivo da base de conhecimento', naGeracao: false, texto: `Esta base reúne as informações oficiais, características comerciais, posicionamento, público, orientações de comunicação e regras estratégicas da Cabanas Lobo do Mar.
Ela será utilizada pelo agente de inteligência artificial que atuará como funcionário de marketing da hospedagem, integrado ao Gerador Maré Cristal.
O agente deverá consultar estas informações antes de planejar ou produzir qualquer conteúdo.
A base deverá ser editável por meio de um painel administrativo, sem necessidade de alterações no código-fonte.
Regra fundamental: informações confirmadas, preferências estratégicas, sugestões e dados ainda desconhecidos devem permanecer claramente diferenciados.
O agente nunca deverá inventar informações para preencher lacunas.` },
  { id: 'identidade', titulo: '2. Identidade da empresa', naGeracao: true, texto: `2.1. Informações institucionais
- Nome: Cabanas Lobo do Mar.
- Localização: Praia do Rosa, Santa Catarina, Brasil.
- Segmento: hospedagem turística familiar.
- Experiência: mais de dez anos recebendo hóspedes.
- Canais de presença: site próprio, Airbnb e Instagram.
- Instagram: @cabanaslobodomar.
- Site: CabanasLoboDoMar.com.br.
2.2. História
A história da hospedagem está ligada à trajetória de Renaldo, surfista que frequenta a Praia do Rosa desde os anos 1980.
Na época, a região ainda era pouco explorada. Renaldo adquiriu o terreno e construiu as cabanas, dando origem ao negócio familiar.
A operação envolve a família:
- Renaldo participa da história e do negócio.
- Sua esposa auxilia na operação.
- Seu filho cuida da presença digital e do contato com clientes.
Essa história deve ser aproveitada em conteúdos institucionais e de bastidores, sem exageros ou romantização artificial.
2.3. Posicionamento
A Cabanas Lobo do Mar é uma hospedagem familiar, descontraída e acolhedora.
Seu diferencial de localização está na proximidade com a vida noturna da região, permitindo que os hóspedes caminhem até algumas das principais festas do Rosa sem depender de estacionamento.
A comunicação deve transmitir:
- Conforto.
- Aconchego.
- Hospitalidade.
- Liberdade para aproveitar a viagem.
- Ambiente familiar e descontraído.
- Facilidade para aproveitar a vida noturna regional.
Não posicionar a hospedagem como luxo ou como uma propriedade próxima da praia a ponto de permitir acesso fácil a pé.` },
  { id: 'localizacao', titulo: '3. Localização e atrativos da região', naGeracao: true, texto: `3.1. Distâncias confirmadas
- Praia: aproximadamente 10 minutos de carro.
- Praia a pé: aproximadamente 25 minutos, com subidas e descidas.
- Quintal Butiá: aproximadamente 5 minutos a pé.
- Pico da Tribo: aproximadamente 5 minutos a pé.
- Mar del Rosa: aproximadamente 5 minutos a pé.
A proximidade com estabelecimentos e festas da região é um diferencial comercial.
3.2. Temas regionais que podem ser explorados
- Praia do Rosa.
- Surf.
- Festas e vida noturna.
- Gastronomia e atrações locais.
- Natureza e turismo regional.
- Eventos e datas especiais.
O agente deverá diferenciar informações confirmadas de sugestões de pauta. Antes de divulgar programação, horários, preços ou eventos atuais, deverá verificar os dados em fonte confiável ou solicitar confirmação.` },
  { id: 'acomodacoes', titulo: '4. Acomodações e estrutura', naGeracao: true, texto: `4.1. Loft 1 e Loft 2
Os dois lofts possuem a mesma estrutura, com uma diferença: o loft superior possui varanda.
Características:
- Ambiente integrado, em conceito open space.
- Quarto, sala e cozinha completa.
- Banheiro privativo.
- Uma cama de casal.
- Um sofá-cama.
- Fogão.
- Utensílios básicos e louças.
- Roupa de cama incluída.
- Ventilador.
Capacidade:
- Confortável: 2 pessoas.
- Máxima: 3 pessoas.
Público de comunicação prioritário: casais e pequenas viagens.
4.2. Casa
Características:
- Dois quartos.
- Duas camas.
- Um sofá-cama.
- Banheiro privativo.
- Cozinha completa.
- Fogão.
- Utensílios básicos e louças.
- Roupa de cama incluída.
- Ventilador.
Capacidade:
- Confortável: 4 pessoas.
- Máxima: 5 pessoas.
Público de comunicação prioritário: famílias.
4.3. Vila Privativa
A Vila Privativa corresponde ao aluguel de toda a propriedade, incluindo os espaços das duas unidades loft e da casa.
Capacidade:
- Confortável: 8 pessoas.
- Máxima: 11 pessoas.
É o principal produto comercial da hospedagem e deve receber prioridade na estratégia de marketing.
Público prioritário: grupos de amigos, especialmente jovens que viajam juntos para aproveitar a Praia do Rosa, festas e feriados.
4.4. Estrutura compartilhada
- Quintal.
- Área gourmet.
- Churrasqueira.
- Estacionamento na propriedade para até 5 carros.
4.5. Informações não confirmadas
Não anunciar como benefício sem confirmação:
- Piscina.
- Ar-condicionado.
- Televisão.
- Wi-Fi.
- Toalhas de banho incluídas.
- Outras comodidades ainda não documentadas.
As toalhas de banho não estão incluídas.` },
  { id: 'publico', titulo: '5. Público-alvo', naGeracao: true, texto: `5.1. Público prioritário
Grupos de jovens que alugam a Vila Privativa para viajar juntos, especialmente durante:
- Feriados prolongados.
- Carnaval.
- Ano-Novo.
- Verão.
- Janeiro.
- Fevereiro.
5.2. Públicos complementares
- Casais interessados nos lofts.
- Famílias interessadas na casa.
- Grupos de amigos.
- Surfistas.
- Pessoas que visitam a região por outros interesses.
5.3. Perfil geográfico
Principais origens dos hóspedes:
- Santa Catarina.
- Rio Grande do Sul.
- São Paulo.
- Paraná.
Faixa etária aproximada: 20 a 45 anos.
O agente deve atrair mais grupos jovens sem excluir os demais públicos.` },
  { id: 'comercial', titulo: '6. Política comercial', naGeracao: true, texto: `6.1. Preços
Os preços variam conforme a época, demanda e período da reserva.
Referência comercial conhecida:
- Vila Privativa em dia normal de semana: aproximadamente R$ 700 por diária para até 8 pessoas.
- Pessoa adicional: aproximadamente R$ 100 por pessoa, respeitando a capacidade máxima.
Esses valores são referências, não uma tabela definitiva.
O agente não poderá:
- Tratar os valores como fixos.
- Aplicá-los automaticamente a fins de semana ou feriados.
- Inventar preços para os lofts ou para a casa.
- Prometer descontos.
- Confirmar disponibilidade.
Quando não houver preço atualizado, deverá solicitar a informação ou omiti-la.
6.2. Reservas e pagamento
- Estadia mínima: 2 noites.
- Pagamento: 50% para confirmar a reserva.
- Saldo: 50% na entrada.
- Forma de pagamento informada: Pix.
6.3. Animais de estimação
Pets são aceitos mediante taxa adicional.
O valor da taxa ainda não foi informado.
6.4. Regras de hospedagem
- Visitantes não podem pernoitar na propriedade.
- Respeitar a capacidade máxima de cada acomodação.
- Não prometer exceções às regras sem autorização.` },
  { id: 'sazonalidade', titulo: '7. Sazonalidade e oportunidades comerciais', naGeracao: true, texto: `7.1. Períodos de maior procura
- Ano-Novo.
- Carnaval.
- Janeiro.
- Feriados prolongados.
- Verão.
7.2. Antecedência das reservas
- Verão: normalmente cerca de quatro meses de antecedência.
- Feriados: reservas geralmente acontecem mais perto da data.
- Reservas de última hora não são o padrão atual.
7.3. Objetivo estratégico
Aumentar as vendas em fevereiro.
O agente deverá identificar oportunidades de comunicação para esse período, incluindo campanhas antecipadas e conteúdos voltados a grupos.
7.4. Calendário
Considerar:
- Feriados nacionais brasileiros.
- Feriados que possam formar feriadões.
- Carnaval.
- Ano-Novo.
- Janeiro e fevereiro.
- Datas e eventos regionais relevantes.
Diferenciar feriados oficiais, pontos facultativos e datas comemorativas.
Não presumir disponibilidade para nenhum período.` },
  { id: 'canais', titulo: '8. Canais de venda', naGeracao: true, texto: `Canais existentes:
- WhatsApp.
- Airbnb.
- Site próprio.
O site ainda está em fase de crescimento.
Regra para publicações
O WhatsApp não deve ser utilizado como destino das chamadas para ação das publicações.
As chamadas devem direcionar para:
- Conhecer as acomodações.
- Consultar disponibilidade pelo site.
- Acessar o site de reservas.
O agente deverá variar as chamadas de acordo com o objetivo e o formato do conteúdo.` },
  { id: 'tom', titulo: '9. Tom de voz', naGeracao: true, texto: `9.1. Personalidade
A comunicação deve ser:
- Descontraída.
- Natural.
- Próxima.
- Acolhedora.
- Informal, mas bem escrita.
A marca deverá falar como um anfitrião, não como uma empresa corporativa.
9.2. Humor
Permitido, principalmente em conteúdos voltados ao público jovem e às festas.
Entretanto:
- Evitar piadas forçadas.
- Não exagerar na linguagem jovem.
- Não utilizar gírias artificialmente.
- Não transformar toda publicação em uma brincadeira.
9.3. Emojis
Utilizar poucos emojis, somente quando fizerem sentido.
9.4. Idioma
Português brasileiro.
9.5. Expressões proibidas
Não utilizar:
- "Pé na areia".
- "Barulho do mar".
Evitar também frases genéricas, clichês turísticos e promessas exageradas.` },
  { id: 'editorial', titulo: '10. Estratégia editorial', naGeracao: true, texto: `O agente deverá trabalhar com quatro grandes categorias.
10.1. Conteúdo comercial
Objetivo: gerar reservas.
Exemplos:
- Apresentação da Vila Privativa.
- Estrutura das acomodações.
- Capacidade para grupos.
- Organização de viagens em grupo.
- Divulgação de períodos de interesse comercial.
10.2. Conteúdo inspiracional
Objetivo: despertar vontade de viajar para a Praia do Rosa.
Exemplos:
- Festas.
- Praia.
- Surf.
- Vida noturna.
- Viagens com amigos.
- Atrações regionais.
10.3. Conteúdo informativo
Objetivo: esclarecer dúvidas e ajudar o potencial hóspede a decidir.
Exemplos:
- Estrutura das acomodações.
- Distâncias.
- Regras.
- Dicas sobre a região.
- Como funciona a Vila Privativa.
10.4. Conteúdo institucional
Objetivo: fortalecer a identidade e a confiança na hospedagem.
Exemplos:
- História de Renaldo.
- Bastidores.
- Rotina da hospedagem.
- Família.
- Depoimentos de hóspedes.
Não existe uma proporção fixa aprovada entre essas categorias. O agente deverá buscar equilíbrio conforme os objetivos e as oportunidades.` },
  { id: 'autonomia', titulo: '11. Autonomia do agente', naGeracao: false, texto: `11.1. Identificação de oportunidades
O agente deverá analisar a galeria de fotografias, o calendário, o histórico de publicações e as informações da empresa para sugerir oportunidades de conteúdo.
Não deverá depender exclusivamente de temas indicados pelo usuário.
11.2. Escolha de fotografias
O agente poderá selecionar livremente fotografias da biblioteca para montar propostas.
Entretanto, deverá apresentar as fotografias escolhidas para aprovação antes de avançar com a produção definitiva.
11.3. Combinação de fotografias
Poderá combinar:
- Diferentes acomodações.
- Detalhes dos ambientes.
- Áreas externas.
- Fotografias da região.
- Fotografias de pessoas e experiências.
A combinação deve construir uma narrativa coerente e não criar uma impressão falsa da estrutura ou da localização.
11.4. Campanhas
O agente poderá criar campanhas completas por iniciativa própria, incluindo sequências de publicações.
Exemplos:
- Campanha para Carnaval.
- Campanha para feriados prolongados.
- Campanha de reservas antecipadas para o verão.
- Campanha para aumentar vendas em fevereiro.
11.5. Quantidade de propostas
Normalmente apresentar duas ou três alternativas para comparação.
Quando houver justificativa estratégica, poderá apresentar uma sequência completa de publicações.
11.6. Informações desconhecidas
- Se forem essenciais, perguntar antes de produzir.
- Se forem dispensáveis, omitir.
- Nunca inventar dados.
- Nunca apresentar sugestões como fatos confirmados.` },
  { id: 'qualidade', titulo: '12. Critérios de qualidade', naGeracao: true, texto: `O principal critério de qualidade é a coerência entre fotografias e textos.
Toda publicação deverá passar conceitualmente pelas seguintes verificações:
1. A fotografia representa corretamente aquilo que o texto comunica?
2. As imagens escolhidas combinam entre si?
3. A sequência visual tem lógica?
4. O conteúdo respeita a realidade da hospedagem?
5. O texto corresponde ao público que se pretende alcançar?
6. O template escolhido é adequado à mensagem?
7. A publicação tem um objetivo identificável?
8. A chamada para ação corresponde ao objetivo?
9. O conteúdo respeita a identidade visual Maré Cristal?
10. A publicação agrega algo à estratégia geral da marca?
Uma publicação visualmente bonita, mas incoerente com a fotografia ou com a realidade da hospedagem, deverá ser considerada inadequada.` },
  { id: 'regras', titulo: '13. Regras inegociáveis do agente', naGeracao: true, texto: `1. Nunca inventar informações sobre a hospedagem.
2. Nunca inventar preços ou disponibilidade.
3. Nunca criar avaliações ou depoimentos fictícios.
4. Nunca sugerir comodidades não confirmadas.
5. Nunca afirmar que a hospedagem fica próxima da praia a pé.
6. Nunca utilizar as expressões proibidas.
7. Nunca direcionar publicações para o WhatsApp.
8. Nunca publicar automaticamente.
9. Nunca sobrescrever projetos existentes.
10. Nunca modificar o desenho original do logotipo.
11. Nunca ignorar o manual de identidade visual.
12. Nunca criar imagens de IA que representem falsamente os ambientes reais da hospedagem.
13. Nunca considerar uma proposta aprovada sem manifestação do usuário.
14. Nunca transformar uma informação pendente em informação confirmada.` },
  { id: 'pendentes', titulo: '14. Informações pendentes', naGeracao: true, texto: `Os seguintes dados deverão permanecer identificados como pendentes:
- Preços atualizados dos lofts.
- Preços atualizados da casa.
- Taxa para pets.
- Informações adicionais sobre comodidades ainda não confirmadas.
- Calendário de disponibilidade.
- Frequência semanal de publicações.
- Eventuais novas regras comerciais.
- Proporção ideal entre categorias de conteúdo.
A ausência dessas informações não deverá impedir a criação de conteúdos que não dependam delas.` },
  { id: 'principio', titulo: '15. Princípio geral de funcionamento', naGeracao: false, texto: `O agente deverá atuar como um profissional de marketing que conhece a Cabanas Lobo do Mar.
Não deverá funcionar como um simples gerador de legendas.
Deverá pensar estrategicamente, identificar oportunidades, analisar fotografias, propor campanhas, escolher abordagens, construir narrativas e utilizar o Gerador Maré Cristal para transformar suas decisões em publicações.
Sua função é ajudar a empresa a comunicar melhor, fortalecer sua presença digital e gerar mais reservas pelo site.
A decisão final sobre imagens, propostas e publicação continuará sendo humana.` },
];

// Seleção de módulos por geração: somente as partes relevantes ao objetivo e ao template são enviadas,
// para manter o contexto de entrada enxuto (meta ≈ 2.000 tokens). Seleção simples por palavras-chave;
// sem embeddings, banco vetorial ou serviços externos.
const sec = (id: string) => BASE_CONHECIMENTO.find((s) => s.id === id)!;
const acom = sec('acomodacoes').texto;
const trecho = (de: string, ate?: string) => acom.slice(acom.indexOf(de), ate ? acom.indexOf(ate) : undefined).trim();

type Modulo = { id: string; titulo: string; texto: string; palavras: string[]; sempre?: boolean };
const MODULOS: readonly Modulo[] = [
  { id: 'identidade', titulo: sec('identidade').titulo, texto: sec('identidade').texto, palavras: ['história', 'historia', 'renaldo', 'institucional', 'bastidores', 'família', 'familia'], sempre: true },
  { id: 'tom', titulo: sec('tom').titulo, texto: sec('tom').texto, palavras: [], sempre: true },
  { id: 'regras', titulo: sec('regras').titulo, texto: sec('regras').texto, palavras: [], sempre: true },
  { id: 'localizacao', titulo: sec('localizacao').titulo, texto: sec('localizacao').texto, palavras: ['praia', 'rosa', 'região', 'regiao', 'festa', 'distância', 'distancia', 'localização', 'localizacao', 'surf', 'noturna', 'gastronomia', 'butiá', 'tribo'] },
  { id: 'lofts', titulo: 'Loft 1 e Loft 2', texto: trecho('4.1.', '4.2.'), palavras: ['loft', 'casal', 'casais'] },
  { id: 'casa', titulo: 'Casa', texto: trecho('4.2.', '4.3.'), palavras: ['casa', 'famílias', 'familias'] },
  { id: 'vila', titulo: 'Vila Privativa', texto: trecho('4.3.', '4.4.'), palavras: ['vila', 'privativa', 'grupo', 'grupos', 'amigos'] },
  { id: 'estrutura', titulo: 'Estrutura compartilhada e limites confirmados', texto: `${trecho('4.4.', '4.5.')}\n${trecho('4.5.')}`, palavras: ['quintal', 'churrasqueira', 'estacionamento', 'gourmet', 'comodidade', 'comodidades', 'estrutura'] },
  { id: 'publico', titulo: sec('publico').titulo, texto: sec('publico').texto, palavras: ['público', 'publico', 'jovem', 'jovens', 'surfista'] },
  { id: 'comercial', titulo: sec('comercial').titulo, texto: `${sec('comercial').texto}\n${sec('pendentes').texto}`, palavras: ['preço', 'preco', 'valor', 'diária', 'diaria', 'reserva', 'promoção', 'promocao', 'disponibilidade', 'pix', 'pet', 'pagamento', 'desconto', 'oferta', 'pacote', 'comercial'] },
  { id: 'sazonalidade', titulo: sec('sazonalidade').titulo, texto: sec('sazonalidade').texto, palavras: ['carnaval', 'ano-novo', 'ano novo', 'feriado', 'verão', 'verao', 'janeiro', 'fevereiro', 'temporada'] },
  { id: 'canais', titulo: sec('canais').titulo, texto: sec('canais').texto, palavras: ['site', 'airbnb', 'instagram'] },
  { id: 'editorial', titulo: sec('editorial').titulo, texto: sec('editorial').texto, palavras: ['institucional', 'história', 'historia', 'bastidores', 'depoimento', 'inspiracional', 'informativo'] },
];

const normalizar = (s: string) => s.toLowerCase().normalize('NFC');

// Templates comerciais sempre consultam a política comercial e a sazonalidade.
const POR_TEMPLATE: Record<string, string[]> = { 'COM-01': ['comercial', 'sazonalidade'] };

export function selecionarConhecimento(p: { objetivo: string; inspiracao?: string; templateId: string }): string {
  const texto = normalizar(`${p.objetivo} ${p.inspiracao ?? ''}`);
  const escolhidos = new Map<string, Modulo>();
  for (const m of MODULOS) if (m.sempre) escolhidos.set(m.id, m);
  for (const id of POR_TEMPLATE[p.templateId] ?? []) escolhidos.set(id, MODULOS.find((m) => m.id === id)!);
  for (const m of MODULOS) if (m.palavras.some((w) => texto.includes(w))) escolhidos.set(m.id, m);
  // Publicação genérica (nenhum tema identificado): apresentação das acomodações e da região.
  if (escolhidos.size <= 3) for (const id of ['localizacao', 'lofts', 'casa', 'vila']) escolhidos.set(id, MODULOS.find((m) => m.id === id)!);
  const corpo = [...escolhidos.values()].map((m) => `## ${m.titulo}\n${m.texto}`).join('\n');
  return `BASE DE CONHECIMENTO — CABANAS LOBO DO MAR (versão ${VERSAO_BASE}). Fonte oficial sobre o negócio; o que não está aqui não está confirmado.\n${corpo}`;
}

// Conferência no servidor depois da validação do contrato: comodidades não confirmadas e valores que não vieram
// da base nem do usuário. Falha aqui é resposta inválida do provedor (o pedido segue para o próximo).
const COMODIDADES = /piscina|ar[- ]?condicionado|climatizad|televis|\btv\b|wi-?fi|hidromassagem|jacuzzi|sauna|caf[eé] da manh[aã]|toalhas?/i;
const NEGACAO = /\b(n[aã]o|sem|nenhum|nenhuma)\b/i;
const PRAIA_A_PE = /(caminh\w*|a p[eé]|passos?)\W+(?:\w+\W+){0,4}praia|praia\W+(?:\w+\W+){0,4}(a p[eé]|a poucos passos)/i;
const VALOR = /R\$\s*\d[\d.,]*/gi;
const VALORES_BASE = ['700', '100'];

// Um texto por campo; em listas, um por item (pergunta e resposta do FAQ são lidas juntas).
const juntar = (x: unknown): string => typeof x === 'string' ? x : x && typeof x === 'object' ? Object.values(x).map(juntar).join(' ') : '';
const textos = (campos: Record<string, unknown>) => Object.values(campos).flatMap((v) => Array.isArray(v) ? v.map(juntar) : [juntar(v)]);
const numero = (v: string) => v.replace(/R\$\s*/i, '').replace(/[.,]00$/, '').replace(/\./g, '');

export function conferirFatos(campos: Record<string, unknown>, dadosUsuario: string) {
  const doUsuario = new Set((dadosUsuario.match(VALOR) ?? []).map(numero));
  for (const t of textos(campos)) {
    for (const frase of t.split(/[.!;\n]+/)) {
      // "Toalhas não inclusas" é fato da base; "com piscina" não é.
      if (COMODIDADES.test(frase) && !NEGACAO.test(frase)) return 'mencionou uma comodidade não confirmada na base';
      if (PRAIA_A_PE.test(frase) && !/25 ?min/i.test(frase)) return 'sugeriu acesso fácil à praia a pé';
    }
    for (const v of t.match(VALOR) ?? []) if (!VALORES_BASE.includes(numero(v)) && !doUsuario.has(numero(v))) return 'citou um valor que não está na base';
  }
  return null;
}
