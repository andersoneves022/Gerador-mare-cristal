# Fichas Técnicas de Implementação dos 13 Templates

Cabanas Lobo do Mar · Gerador de Conteúdo Visual · Fase 0 (preparação) ·
Rascunho para revisão · 31 de outubro de 2026

Base: Manual de Identidade Visual v0.2 (MAN) · Biblioteca de Templates
v0.2.1 (BIB) · Especificação Funcional v0.3 (ESP). Nenhuma programação
foi iniciada.

## Índice

**Parte A · Fundamentos**

1.  Como ler este documento

2.  Parâmetros comuns (RC-01 a RC-10)

3.  Pendências transversais (PT-01 a PT-19)

**Parte B · Fichas técnicas**

4.  FOT-01 · Foto + título

5.  FOT-02 · Foto + legenda

6.  INF-01 · Grade de ícones

7.  INF-02 · Linhas rótulo/valor

8.  INF-03 · Passos numerados

9.  INF-04 · Pergunta e resposta

10. INS-01 · Foto em moldura + texto

11. INS-02 · Avaliação

12. COM-01 · Aviso comercial

13. COM-02 · Encerramento com chamada

14. VID-01 · Capa de Reel

15. VID-02 · Texto sobre vídeo

16. DES-01 · Capa de destaque

## 1. Como ler este documento

### 1.1 Classificação de cada informação

| Marca | Significado | Critério |
|----|----|----|
| **RA** | Regra aprovada | Texto normativo do MAN v0.2 ou da BIB v0.2.1, ambos com decisões aprovadas. |
| **IT** | Interpretação técnica | Dedução aritmética ou leitura combinada dos documentos (exemplo: 1350 − 72 = 1278). É determinística, mas precisa de confirmação. |
| **PR** | Proposta | Sugestão ainda não aprovada. Inclui valores que existem só na ESP v0.3 (que está em aprovação) e sugestões deste documento. |
| **PEND** | PENDENTE DE DEFINIÇÃO | Medida ou regra que nenhum dos três documentos define. Nenhum número foi inventado para ela. |

Quando um valor é PEND, a ficha não fornece número. Se houver sugestão,
ela aparece separada, marcada como PR. Quando a ESP apenas repete o MAN
ou a BIB, a informação vale como RA.

### 1.2 Convenções

- **Coordenadas:** origem (0, 0) no canto superior esquerdo do canvas; x
  cresce para a direita e y para baixo; unidade é o pixel do canvas de
  referência (largura 1080). Retângulos aparecem como (x1, y1)–(x2, y2)
  e largura × altura.

- **Caixa de texto:** as posições de texto referem-se à caixa de linha
  (line box), não ao contorno dos glifos. IT.

- **Feed:** o canvas 1080 × 1350 serve a Feed e a carrossel; Stories e
  Reels compartilham 1080 × 1920.

- **Referências:** MAN §x, BIB §x e ESP §x indicam a seção de origem.
  RC-xx remete aos parâmetros comuns da seção 2. PT-xx remete às
  pendências transversais da seção 3.

- **Estrutura de cada ficha:** os 15 itens pedidos, na ordem pedida,
  mais um fechamento com as pendências específicas da ficha.

### 1.3 Limites desta análise

O documento usa somente os três arquivos recebidos. Não foram
inspecionados o arquivo do logotipo, as fontes, as fotografias reais nem
os ícones, que ainda não foram desenhados. Tudo o que depende deles está
marcado.

## 2. Parâmetros comuns

Os valores abaixo valem para todos os templates, salvo indicação
contrária na ficha.

### RC-01 · Canvas e zonas

| Formato | Canvas | Zona útil para texto e elementos | Fim do bloco de texto sobre foto | Status |
|----|----|----|----|----|
| Feed e carrossel | 1080 × 1350 | (72, 72)–(1008, 1278) · 936 × 1206 | y = 1278 | RA (MAN §6; BIB §8); caixa = IT |
| Stories e Reels | 1080 × 1920 | (72, 250)–(1008, 1580) · 936 × 1330 | y = 1580 | RA; caixa = IT |
| Destaque | 1080 × 1080 | Círculo de centro (540, 540) e raio 440 (círculo inscrito de raio 540 menos folga de 100) | — | RA (BIB §6.6); raio = IT |

- Margens laterais de 72 px; topo e base de 250 px e 340 px em Stories e
  Reels. RA (MAN §6). Os valores de topo e base são recomendação
  conservadora, a conferir em teste real no aplicativo (MAN §6).

- Faixa central 3:4 de Reels: (0, 240)–(1080, 1680). RA (BIB VID-01);
  coerente com 1080 × 1440 centrado. IT.

- Unidade u = 24 px. Espaçamentos entre blocos: 24, 48 ou 72 px. Espaço
  interno de cartões: 48 px. Raios: 24 px (cartões e painéis), 32 px
  (foto em moldura), pílula total (botões e tags). RA (MAN §6).

- A foto pode sangrar até a borda, sem cantos arredondados. RA (MAN §6).

- Área essencial para a miniatura vertical do grid do perfil: não há
  medida documentada. PEND.

### RC-02 · Camadas e anatomia

Ordem das camadas, de baixo para cima (RA, BIB §4.1): 1 fundo (foto ou
cor Espuma/Areia) · 2 escurecimento (só com foto) · 3 bloco de texto
(rótulo, título, apoio) · 4 ação (tag, pílula lima ou painel de vidro) ·
5 assinatura (logotipo).

| Estrutura | Composição | Âncoras | Status |
|----|----|----|----|
| A · Foto cheia | Foto sangrada, escurecimento Oceano na base, bloco de texto embaixo à esquerda | Texto: x = 72; base do bloco em y = 1278 (Feed) ou 1580 (Stories) | RA; coordenadas = IT |
| B · Cartão | Fundo Espuma ou Areia (um por carrossel); cabeçalho (rótulo + título), corpo intercambiável, rodapé | Cabeçalho no topo à esquerda; rodapé embaixo à esquerda | RA |
| C · Foto em moldura | Fundo Espuma ou Areia; foto com raio de 32 px no topo; texto abaixo | Ver INS-01 | RA |
| D · Capa circular | Quadrado de 1080 com figura dentro do círculo inscrito | Centro (540, 540) | RA |

- Texto alinhado à esquerda, em no máximo dois blocos por peça. RA (MAN
  §6). Exceção única: COM-02, centrado. RA (BIB §6.4).

- No máximo três níveis de texto, um painel de vidro e um destaque lima
  por peça. RA (BIB §8). Ver PT-15.

### RC-03 · Tipografia

| Nível | Fonte | Feed e carrossel | Stories e Reels | Entrelinha | Status |
|----|----|----|----|----|----|
| Título | Sora Bold | 72–96 px | 80–104 px | 1,05–1,10 | RA (MAN §4.1; BIB §8) |
| Subtítulo | Inter Medium | 36–40 px | 36–40 px | 1,3 | RA (MAN §4.1); Stories = IT |
| Apoio | Inter Regular | 30–34 px | 32–34 px (mínimo de Stories) | 1,35 | RA (MAN §4.1); Stories = IT |
| Rótulo (eyebrow) | Inter SemiBold, caixa alta, espaçamento +8% | 28 px | 32 px (ver PT-10) | PEND | RA em Feed; IT em Stories |
| Microtexto | Inter Medium | mínimo 28 px | mínimo 32 px | PEND | RA |

- Mínimo absoluto de fonte: 28 px em Feed e carrossel; 32 px em Stories
  e Reels. A fonte nunca fica abaixo disso. RA (BIB §8; MAN §12).

- Títulos em caixa normal, até 8 palavras (cerca de 48 caracteres).
  Espaçamento entre letras de −1% a −2% em títulos grandes. RA. Valor
  exato dentro da faixa: PEND (PT-05).

- Quatro arquivos de fonte: Sora Bold, Inter Regular, Inter Medium,
  Inter SemiBold, locais em WOFF2, carregados antes da renderização. PR
  (ESP §7.6).

- Mapeamento de campos para níveis (nomes dos campos da ESP §7.5):
  título → Título; apoio → Apoio; rótulo → Rótulo; demais campos →
  conforme a ficha. IT.

- Fitagem automática: o motor mede o texto, começa no máximo da faixa e
  reduz até caber, sem passar do mínimo da faixa. IT (ESP §7.5; BIB §4.3
  e §8). Passo da redução: PEND (PT-05).

- Alerta de viabilidade, estimativa e não medida: Sora Bold é larga; em
  72 px, uma linha de 650 px comporta da ordem de 15 caracteres. Um
  título de 2 linhas tende a ter cerca de 30 caracteres, abaixo da
  referência de 48. Validar com as métricas reais da fonte.

### RC-04 · Cores e contraste

| Cor | HEX | Uso nas fichas | Status |
|----|----|----|----|
| Espuma | \#F4FAF9 | Fundo de cartões, placa do logotipo, painel de vidro (translúcido), texto sobre foto | RA |
| Turquesa | \#14B8CE | Círculo numerado, tags, filetes, azulejo de ícone (15%), anel de destaque | RA |
| Oceano | \#0A4F60 | Todo texto sobre fundo claro; base do escurecimento; texto de botões e tags | RA |
| Lima neon | \#C6F000 | Fundo da pílula; tag de local sobre foto escurecida; no máximo um elemento por peça | RA |
| Sol | \#FFC94D | Estrelas, selos, tags de Datas especiais e Últimas vagas | RA |
| Areia | \#EFE5CF | Cartões e fundo alternativo | RA |
| Branco | \#FFFFFF | Alternativa a Espuma para texto sobre foto (MAN §4); não integra as seis cores | RA; HEX = IT |

Contrastes aprovados (MAN §3.2, aproximados): Oceano sobre Espuma 8,6:1;
sobre Areia 7,3:1; sobre Lima 6,9:1; sobre Sol 6,0:1; Lima sobre Oceano
6,9:1; Oceano sobre Turquesa 3,8:1 (só texto grande em negrito).
Proibidos: branco sobre Turquesa, Turquesa como texto, Lima sobre
Espuma. RA.

- Lima é cor de fundo de botão ou de destaque sobre escuro; nunca texto
  ou linha sobre fundo claro. RA.

- Texto sobre foto exige contraste de 4,5:1 garantido. RA (MAN §7.3). O
  método de verificação é PEND (PT-13).

- Cor do texto sobre foto, Espuma ou branco: PEND (PT-04).

### RC-05 · Escurecimento

| Nível | Opacidade máxima na base | Status |
|----|----|----|
| Nenhum | 0% | RA (BIB §6.1) |
| Suave | 30% | Aproximação RA (“cerca de 30%”, BIB §6.1); valor exato PR (ESP §7.4) |
| Intenso | 60% | RA (MAN §7.3; BIB §6.1) |

- Cor sempre Oceano \#0A4F60; nunca preto. RA.

- Gradiente linear vertical, com opacidade máxima em y = altura do
  canvas e 0% no topo da zona. IT.

- Zona: cerca de 45% inferiores (BIB §4.1; ESP §7.4). Feed: 607,5 px, de
  y ≈ 742,5 a 1350. Stories e Reels: 864 px, de y = 1056 a 1920. IT. O
  MAN §7.3 diz 40–45%; a ficha adota 45%, valor da BIB e da ESP.

- Os valores são a opacidade máxima na zona inferior, não a média da
  foto. PR (ESP §7.4).

- Padrões: FOT-01 suave, FOT-02 suave, COM-01 intenso, VID-01 suave,
  VID-02 conforme o elemento de texto. PR (ESP §7.4 e D-02); a ESP exige
  calibração com fotos reais antes de tornar definitivo. A adoção de
  suave como padrão não altera o MAN até aprovação formal.

- Curva do degradê, paradas e tratamento contra banding: PEND (PT-14).

- Cartões e foto pura não têm escurecimento. RA.

### RC-06 · Logotipo

- **Arquivo:** versão colorida única, PNG com fundo transparente, cerca
  de 420 px de largura (a confirmar). Sem variações, recolorização,
  contorno, sombra, brilho, giro, esticamento, recorte do emblema ou
  marca d’água. RA (MAN §5). O ajuste do espaço transparente do arquivo
  é permitido com o desenho intacto. RA. Proporção, medidas do espaço
  transparente e definição de “largura do logotipo”: PEND (PT-09).

- **Largura sobre o canvas:** mínimo 140 px. Assinatura de 180–240 px em
  Feed e carrossel e de 200–260 px em Stories e Reels. Em capas e
  aberturas, até 35–40% da largura do canvas (378–432 px). RA (MAN §5.1;
  BIB §8). Larguras acima do tamanho do arquivo implicam ampliação:
  PT-09.

- **Área de respiro:** 25% da largura do logotipo em todos os lados,
  livre de texto, bordas e elementos. RA. Valores: 140 → 35 px; 180 →
  45; 200 → 50; 240 → 60; 260 → 65; 378 → 94,5; 432 → 108. IT.

- **Fundo:** Espuma, Areia ou branco, uso direto. Sobre foto, apenas
  sobre placa Espuma (círculo ou retângulo arredondado, opacidade de 90%
  ou mais) ou sobre região calma e clara com contraste conferido. Evitar
  Oceano e Turquesa sólidos sem placa. RA. Dimensões e raio da placa:
  PEND (PT-07). Sugestão: padding da placa igual ao respiro de 25%. PR.

- **Posição:** um canto por série, inferior esquerdo ou superior
  esquerdo, dentro da margem, nunca nos dois. RA. Conflito com as
  âncoras: PT-01.

- **Onde aparece:** peças gráficas, último slide de carrossel, tela
  final de Reel, Stories informativos e perfil. Foto pura nunca leva
  logotipo. Nunca sobre rosto, área principal da foto ou detalhe de alto
  contraste. RA.

### RC-07 · Componentes recorrentes

| Componente | Definido (RA, salvo indicação) | Não definido (PEND) |
|----|----|----|
| Pílula lima (CTA) | Formato de pílula total; fundo Lima \#C6F000; texto Oceano em negrito; um por peça; rótulo remete ao link da bio; referência de 18 caracteres | Altura, padding horizontal, tamanho da fonte (respeitando 28/32 px); fonte, ver PT-03 |
| Tag de local em lima | Texto lima em Inter SemiBold sobre escurecimento; padrão “Praia do Rosa · SC”; referência de 28 caracteres | Tamanho da fonte; posição; sem fundo (IT) |
| Tag preenchida | Pílula preenchida em Turquesa, Sol ou Oceano; texto Oceano (Espuma sobre Oceano, IT); referência de 28 caracteres | Altura, padding, fonte, tamanho. Oceano sobre Turquesa exige texto grande em negrito (3,8:1) |
| Painel de vidro | Espuma translúcido com desfoque; raio 24; padding 48; no máximo um por peça | Opacidade, raio do desfoque, largura, altura máxima |
| Indicador n/total | Inter, 28 px, canto superior direito dentro da margem, só em carrosséis | Ver PT-08 |
| Ícones | Linha de 2 px em grade de 48 px, pontas arredondadas; Oceano sobre claro, Espuma sobre foto escurecida; azulejo Turquesa a 15%; até 4 por peça (INF-01: 8) | Desenho (não feito), tamanho de renderização, tamanho e raio do azulejo (PT-16) |
| Filete | 2 px, Turquesa ou Oceano | Comprimento |

### RC-08 · Enquadramento e resolução

- A foto pode ser reposicionada, ampliada (zoom) e ter o ponto focal
  alterado. Cada formato tem recorte independente. O ponto focal da
  biblioteca é o ponto de partida e não sobrescreve projetos já
  ajustados. RA (BIB §5.1); detalhes PR (ESP §7.3).

- Escala mínima para cobrir o destino: scale = max(larguraDestino /
  larguraOrigem, alturaDestino / alturaOrigem). Escala final = scale ×
  zoom. PR (ESP §7.3).

- Ampliação: escala final acima de 1,00 bloqueia a exportação. PR (ESP
  §7.3 e D-01). A BIB §5 exige recorte final de pelo menos 1080 px de
  largura (RA); a regra da ESP é mais rigorosa.

- Menos de 2160 px no lado maior: aviso informativo, não bloqueio. PR
  (ESP §5.8).

- Origem mínima para cobrir cada destino sem ampliação (zoom = 1): Feed
  1080 × 1350; Stories e Reels 1080 × 1920; INS-01 Feed 936 × 702;
  INS-01 Stories 936 × 1100. DES-01: diâmetro da foto × diâmetro (PEND).
  IT.

- Foto-mãe vertical: o assunto principal fica no centro, dentro da faixa
  3:4. Fotos com texto exigem pelo menos 30% de área calma na base:
  Feed, y de 945 a 1350; Stories, y de 1344 a 1920. RA (BIB §5);
  coordenadas IT. Sem área calma: INS-01, FOT-02 com legenda pequena ou
  foto pura. RA.

- Área calma inadequada: aviso. PR (ESP §11.2). Critério de detecção:
  PEND.

- Áreas protegidas (rosto, pessoa, detalhe) são opcionais, marcadas à
  mão, e geram só aviso de sobreposição. PR (ESP §5.9). Ver PT-19.

- Preferir arquivos de 2160 px ou mais no lado maior. RA (BIB §5).

### RC-09 · Texto que não cabe

1.  Os números de caracteres e palavras são referências, não limites. O
    sistema mede o espaço real ocupado. RA (BIB §4.3).

2.  Primeiro tenta a quebra de linha permitida e a fitagem dentro da
    faixa de fonte. PR (ESP §7.5). Regras de quebra: PEND (PT-18).

3.  Nunca reduz a fonte abaixo do mínimo da faixa nem do mínimo de 28/32
    px. RA.

4.  Se ainda não couber: mostra aviso e permite editar, indicando o
    campo. RA (BIB §4.3); PR (ESP §7.5).

5.  Texto obrigatório que não couber bloqueia a exportação. PR (ESP
    §11.1). Texto opcional: PT-06.

6.  O sistema nunca trunca texto sozinho. Reticências existem apenas na
    citação de INS-02, por decisão de quem edita. RA (BIB §6.3). IT.

### RC-10 · Exportação e validação

| Item | Regra | Status |
|----|----|----|
| Dimensões | 1080 × 1350, 1080 × 1920 ou 1080 × 1080, exatas; sem redimensionamento automático | RA (BIB §6); PR (ESP §9.2) |
| Formato | PNG para templates, cartões e destaques; PNG transparente só para sobreposições de VID-02; JPG (qualidade padrão 92%, faixa 90–95%) só para foto pura | PR (ESP §9.1) |
| Lote | Carrossel em ZIP com arquivos numerados; Reel em ZIP com capa, tela final, sobreposições, CSV e JSON | PR (ESP §9.1, §8.2) |
| Nome | Data, tipo e número da peça; editável antes do download | PR (ESP §9.4) |
| Motor | O mesmo para prévia e exportação; fontes carregadas antes de renderizar | PR (ESP §2.6, §13.2) |
| Fundo | Peças com foto ou cartão saem opacas, sem canal alfa útil | IT |
| Perfil de cor, compressão do PNG, metadados | Não definidos | PEND (PT-17) |

Bloqueios (ESP §11.1): texto obrigatório que não cabe; resolução efetiva
insuficiente; fotografia indisponível; sequência estruturalmente
inválida; campo obrigatório vazio; COM-01 sem confirmação comercial;
arquivo que não pôde ser renderizado. Avisos (ESP §11.2): foto com menos
de 2160 px; área inferior inadequada; sobreposição de área protegida;
quantidade de slides fora da faixa; avaliação com mais de dois anos;
avaliação longa; escurecimento sem contraste suficiente. A validação
roda de novo na exportação. PR.

## 3. Pendências transversais

Cada pendência abaixo afeta mais de um template. O tratamento provisório
é o que as fichas adotam enquanto não houver decisão.

| ID | Pendência | Tratamento provisório nas fichas | Fichas |
|----|----|----|----|
| PT-01 | **Canto do logotipo.** MAN §5.3: um canto por série (inferior ou superior esquerdo, nunca os dois). BIB §8 (regra 4): mesmo canto em toda a série e em todos os formatos. BIB §4.1: cartões têm o logotipo no rodapé, embaixo à esquerda; fotos têm o bloco de texto embaixo à esquerda, terminando em y = 1278 ou 1580. Nenhum canto único atende às duas estruturas sem colisão. | IT: fotos com logotipo no canto superior esquerdo; cartões no rodapé inferior esquerdo. Isso contraria a regra 4 em carrosséis que misturam foto e cartão. Decisão formal necessária. | FOT-01, INF-01 a INF-04, INS-02 |
| PT-02 | **Dois lima em FOT-01.** Tag de local em lima mais pílula lima, contra “um destaque lima por peça” (MAN §3.1; BIB §8). | PR: com a pílula ativa, a tag de local usa Espuma; sem pílula, usa lima. | FOT-01 |
| PT-03 | **Fonte da pílula.** MAN §8.1 pede texto em negrito; MAN §16.1 aprova Sora Bold para “chamadas”; Inter só tem Regular, Medium e SemiBold. | IT: Sora Bold. | FOT-01, INF-03, COM-01, COM-02 |
| PT-04 | **Cor do texto sobre foto:** Espuma ou branco (MAN §4). | PR: Espuma \#F4FAF9. | A, COM-01 |
| PT-05 | **Valores dentro de faixas:** tamanho, entrelinha, espaçamento entre letras e passo da fitagem. | IT: começa no máximo da faixa e reduz até caber. PR: passo de 2 px; entrelinha de título 1,10; espaçamento −1,5%. | Todos |
| PT-06 | **Texto opcional que não couber.** ESP §11.1 bloqueia só “texto obrigatório”; ESP §7.5 diz “aviso ou bloqueio”. | IT: obrigatório bloqueia; opcional gera aviso com o campo indicado. | Todos |
| PT-07 | **Dimensões de componentes** sem medida: pílula lima, tags, painel de vidro, placa do logotipo, azulejo de ícone, círculo numerado, estrelas. | Nenhum valor adotado; sairão do protótipo de design da Fase 0. | Quase todos |
| PT-08 | **Indicador n/total.** A BIB só o cita em FOT-02; o MAN §11 o aplica a carrosséis. Faltam: slides que o recebem, peso, cor, legibilidade sobre foto (o topo não tem escurecimento) e colisão com a moldura de INS-01. | IT: Inter Medium 28 px, alinhado à direita em x = 1008, topo em y = 72, em todos os slides de carrossel. Cor e legibilidade PEND. | FOT-01 (capa), FOT-02, INF, INS, COM-02 |
| PT-09 | **Logotipo.** PNG de cerca de 420 px a confirmar; proporção, área transparente e a definição de “largura” desconhecidas; larguras de até 432 px (40%) ultrapassam o arquivo. | Nenhuma altura de logotipo é assumida; limite sem ampliação PEND até a verificação da Fase 0 (MAN §17.1). | Todos com logotipo |
| PT-10 | **Tamanhos entre documentos.** INF-04 (pergunta) e INS-01 (título): 64–72 px na BIB, abaixo de 72–96 do MAN §4.1. FOT-01 discreta: 72 px, abaixo de 80–104 em Stories. Rótulo de 28 px abaixo do mínimo de 32 px em Stories. | IT: o valor específico do template prevalece; rótulo em Stories 32 px. Confirmar. | FOT-01, INF-04, INS-01 |
| PT-11 | **Fundo Areia × cartão Areia.** INF-02 e INF-04 usam cartão Areia, mas o fundo do carrossel pode ser Areia. | PR: com fundo Areia, o cartão passa a Espuma (MAN §8.1). | INF-02, INF-04 |
| PT-12 | **Largura do bloco de texto:** “70% da largura (cerca de 650 px)”. 70% de 936 é 655; 70% de 1080 é 756. | IT: 650 px. | FOT-01, VID-01 |
| PT-13 | **Contraste sobre foto.** Método, região medida, limiar e consequência (aviso ou bloqueio “conforme o tipo de composição”, ESP §11.6) não definidos. Texto lima só vale sobre escurecimento. | Sem cálculo definido; a ficha indica onde a verificação ocorre. | A, COM-01 |
| PT-14 | **Curva do degradê**, paradas e tratamento de banding (ESP R-07). | PEND; calibrar com fotos reais. | A, COM-01 |
| PT-15 | **Três níveis de texto** (BIB §8) contra o número de campos de COM-01, INF-03 e INS-02. | IT: campos agrupados em até três estilos, descritos na ficha. | COM-01, INF-03, INS-02 |
| PT-16 | **Ícones e estrelas.** Os 12 ícones não foram desenhados (MAN §17.4); estrelas Sol são preenchidas e os ícones são de linha; escala do traço em DES-01. | Dependem da Fase 0. | INF-01, INF-04, FOT-02, DES-01, INS-02 |
| PT-17 | **Perfil de cor, compressão e metadados** da exportação. | PR: sRGB, 1×, sem redimensionar. | Todos |
| PT-18 | **Quebra de linha** (hifenização, viúvas, órfãs), número máximo de linhas e altura máxima de cada bloco. | Máximos de linhas só onde a BIB os cita. | Todos |
| PT-19 | **Autorização de imagem e rostos.** MAN §7.7 exige autorização; ESP §11.1 e §16.3 retiram o controle do aplicativo. “Texto e logotipo nunca cobrem rostos” fica por revisão humana e áreas protegidas opcionais. | O aplicativo só avisa. | A, C, D |

## 4. FOT-01 · Foto + título

### 4.1 Identificação e finalidade

- ID FOT-01 · Foto + título · Estrutura A (foto cheia). RA (BIB §1).

- Finalidade: foto com título discreto e foto com chamada comercial. RA
  (BIB §3).

- É a abertura obrigatória de todo carrossel, exceto a sequência S6. RA
  (BIB §7). Sequências S1 a S5, como capa. RA (BIB §12).

- Versões: **discreta** (só título de 72 px, no máximo 2 linhas, sem
  logotipo, foto quase limpa) e **com chamada** (acrescenta a pílula
  lima abaixo do título). RA (BIB §6.1).

- Foto pura é a opção prioritária e não usa template. O FOT-01 entra só
  quando há informação a acrescentar. RA (BIB §5).

### 4.2 Formatos e dimensões

| Uso               | Canvas      | Status |
|-------------------|-------------|--------|
| Feed              | 1080 × 1350 | RA     |
| Capa de carrossel | 1080 × 1350 | RA     |
| Stories           | 1080 × 1920 | RA     |

Não compatível com Reels nem Destaque (ESP §6.4). A versão vertical para
Reels é o VID-01.

### 4.3 Estrutura visual

Camadas (RC-02): 1 foto sangrada · 2 escurecimento Oceano · 3 bloco de
texto embaixo à esquerda · 4 pílula lima (só na versão com chamada) · 5
logotipo em placa Espuma (opcional). RA.

- Ordem vertical do bloco, de cima para baixo: tag de local, título,
  apoio, pílula. A pílula abaixo do título é RA. A posição exata da tag
  e do apoio é PEND. PR: tag acima do título; apoio entre o título e a
  pílula.

- O bloco é ancorado na base: o último elemento termina em y = 1278
  (Feed) ou y = 1580 (Stories). IT.

### 4.4 Fundo e fotografia

- A foto cobre todo o canvas, (0, 0)–(1080, 1350) ou (0, 0)–(1080,
  1920), sem cantos arredondados. RA.

- Preenchimento por cobertura, com zoom, posição e ponto focal editáveis
  e independentes por formato (RC-08). Origem mínima sem ampliação: 1080
  × 1350 (Feed e capa) e 1080 × 1920 (Stories). IT.

- Foto de preferência vertical, com pelo menos 30% de área calma na
  base: Feed y de 945 a 1350; Stories y de 1344 a 1920. RA; coordenadas
  IT.

- Sem área calma: usar FOT-02 (legenda pequena), INS-01 ou foto pura.
  RA.

- Mesma foto-mãe, mesma edição e mesma base de ponto focal em Feed,
  Story e capa de Reel. RA.

- Proibidas imagens geradas por IA para representar acomodações e
  ambientes reais. RA.

### 4.5 Posições dos elementos

| Elemento | Feed e capa | Stories | Status |
|----|----|----|----|
| Bloco de texto | x1 = 72; largura máxima 650 (x2 = 722); base em y = 1278 | x1 = 72; largura máxima 650; base em y = 1580 | RA (largura, base); topo = base − altura medida, IT |
| Título | Alinhado à esquerda em x = 72 | Idem | RA |
| Pílula | x = 72; base coincide com a base do bloco | Idem | IT |
| Tag de local | x = 72; posição vertical | Idem | PEND (PR: acima do título) |
| Apoio | x = 72; posição vertical | Idem | PEND |
| Logotipo (PT-01) | Placa com canto externo em (72, 72) | Placa com canto externo em (72, 250) | IT |
| Indicador n/total (só capa de carrossel) | Alinhado à direita em x = 1008; topo em y = 72 | Não se aplica | IT (PT-08) |
| Distância entre elementos | 24, 48 ou 72 px; valor por par | Idem | RA; escolha PEND |

Altura máxima do bloco: PEND. PR: não ultrapassar o início do degradê, o
que dá 535,5 px no Feed (de y = 742,5 a 1278) e 524 px em Stories (de y
= 1056 a 1580).

### 4.6 Margens e espaçamentos

- Feed: 72 px em todos os lados. Stories: laterais 72, topo 250,
  base 340. RA.

- Todo texto e o logotipo ficam dentro da zona útil (RC-01); nada colado
  na borda. RA.

- Espaçamentos permitidos entre blocos: 24, 48 e 72 px. Valor por par de
  elementos: PEND.

- Respiro do logotipo: 25% da largura (RC-06). RA.

### 4.7 Fontes e tamanhos

| Elemento | Fonte | Feed e capa | Stories | Entrelinha | Status |
|----|----|----|----|----|----|
| Título | Sora Bold, caixa normal, esquerda, espaçamento −1% a −2% | 72–96 px | 80–104 px | 1,05–1,10 | RA |
| Título (versão discreta) | Sora Bold | 72 px | 72 px (abaixo de 80–104; PT-10) | 1,05–1,10 | RA; conflito PT-10 |
| Apoio | Inter Regular | 30–34 px | 32–34 px | 1,35 | IT |
| Tag de local | Inter SemiBold | PEND (mínimo 28) | PEND (mínimo 32) | PEND | Fonte RA; tamanho PEND |
| Pílula | Sora Bold (PT-03) | PEND (mínimo 28) | PEND (mínimo 32) | — | IT |
| Indicador n/total | Inter Medium | 28 px | — | — | IT |

### 4.8 Cores

- Título e apoio: Espuma (PR) ou branco (PT-04).

- Tag de local: lima \#C6F000, só sobre escurecimento. Com escurecimento
  Nenhum, a tag não pode ser lima. IT (MAN §4). Com Suave, o contraste é
  PEND (PT-13). Com a pílula ativa, a tag usa Espuma (PR, PT-02).

- Pílula: fundo lima \#C6F000; texto Oceano \#0A4F60 (6,9:1). RA.

- Escurecimento: Oceano \#0A4F60. RA.

- Placa do logotipo: Espuma \#F4FAF9, opacidade de 90% ou mais. RA.

- Um único destaque lima por peça. RA.

### 4.9 Dimensões e limites dos textos

| Campo | Referência (BIB §4.3) | Limite estrutural | Status |
|----|----|----|----|
| Título | Até 8 palavras (cerca de 48 caracteres) | Discreta: no máximo 2 linhas. Com chamada: número de linhas PEND. Largura 650 px | RA; linhas PEND |
| Apoio | 90 caracteres | Número de linhas PEND | RA; PEND |
| Tag de local | 28 caracteres | 1 linha; padrão “Praia do Rosa · SC” | RA |
| Chamada | 18 caracteres | 1 linha | RA |
| Altura do bloco | — | PEND (PR acima) | PEND |

As referências não são limites absolutos (RC-09). Ver alerta de
viabilidade do título em RC-03.

### 4.10 Elementos obrigatórios e opcionais

- **Obrigatórios:** foto e título. Título vazio bloqueia a exportação.
  RA (BIB §6.1); PR (ESP §11.3).

- **Opcionais:** tag de local (com valor padrão), apoio, chamada,
  logotipo, nível de escurecimento. RA (BIB §6.1).

- Versão discreta: somente o título, sem logotipo. Tag e apoio nessa
  versão: PEND (IT: desligados).

- Texto padrão da chamada em FOT-01: PEND (a BIB só traz o exemplo “Ver
  cotação”).

- Logotipo ligado ou desligado por padrão na versão com chamada: PEND.

### 4.11 Regras de enquadramento

- Aplicam-se RC-08 e as regras da seção 4.4.

- Texto nunca sobre rostos; o aplicativo só avisa por área protegida
  opcional (PT-19). RA (BIB §8).

- Horizonte nivelado; assunto principal no centro, dentro da faixa 3:4.
  RA (MAN §7.4; BIB §5).

- Prévia obrigatória em Feed, Stories e Reels antes de exportar. RA (BIB
  §5.1).

### 4.12 Regras de escurecimento

- Níveis, cor e zona conforme RC-05. Padrão: suave (PR). Zona: Feed de y
  ≈ 742,5 a 1350; Stories de y = 1056 a 1920.

- Nenhum: só quando a foto já tem área calma e boa legibilidade. RA.

- O texto só entra com contraste de 4,5:1 garantido. RA. Método de
  medição: PEND (PT-13).

- Insuficiente: aviso. PR (ESP §11.2).

### 4.13 Regras do logotipo

- Opcional; ausente na versão discreta; nunca em foto pura. RA.

- Sempre sobre placa Espuma com opacidade de 90% ou mais. RA.

- Largura de 180 a 240 px (Feed e capa) e de 200 a 260 px (Stories). RA.
  Em capas o MAN §5.1 admite 35–40% da largura; o padrão para o FOT-01 é
  PEND.

- Canto: superior esquerdo (IT, PT-01). Dimensões da placa: PEND
  (PT-07).

- Nunca sobre rosto, área principal da foto ou detalhe de alto
  contraste. RA.

### 4.14 Comportamento quando o texto não couber

- Segue RC-09. O título é obrigatório: se não couber nem no mínimo da
  faixa (72 px em Feed, 80 px em Stories), bloqueia a exportação e
  indica o campo.

- Versão discreta com mais de 2 linhas: não cabe, bloqueia. IT.

- Apoio, tag e chamada (opcionais): aviso, com o campo indicado (PT-06).

- Bloco que se estenda acima da zona escurecida: aviso de contraste. PR.

- Nunca truncar nem reduzir abaixo do mínimo.

### 4.15 Regras de exportação

- PNG 1080 × 1350 ou 1080 × 1920, opaco (RC-10).

- Capa de carrossel: arquivo número 01 do ZIP. PR.

- Bloqueios: título vazio; foto indisponível; ampliação acima de 1,00;
  título que não cabe.

- Avisos: foto com menos de 2160 px; área inferior inadequada;
  contraste; sobreposição de área protegida.

### 4.16 Pendências da ficha

Posição vertical da tag e do apoio · número de linhas do título com
chamada · texto padrão da chamada · logotipo padrão na versão com
chamada · tag e apoio na versão discreta · altura máxima do bloco.
Transversais: PT-01, 02, 03, 04, 05, 07, 08, 09, 10, 12, 13, 14.

## 5. FOT-02 · Foto + legenda

### 5.1 Identificação e finalidade

- ID FOT-02 · Foto + legenda · Estrutura A (foto cheia). RA (BIB §1).

- Finalidade: apresentação de ambientes e de acomodações, uma foto por
  slide. RA (BIB §3, §6.1).

- Sequências: S1 (3 a 4 slides) e S2 (3 a 5 slides). RA. Não é capa; a
  capa é FOT-01.

### 5.2 Formatos e dimensões

Slide de carrossel 1080 × 1350 e Stories 1080 × 1920. RA. Não compatível
com Feed avulso, Reels nem Destaque (ESP §6.4).

### 5.3 Estrutura visual

- Camadas: foto sangrada; escurecimento Oceano; legenda embaixo à
  esquerda; indicador n/total em carrosséis. RA (BIB §6.1).

- Dois estilos de legenda: **simples** (Inter SemiBold sobre o
  escurecimento, sem pílula) e **pílula de vidro** (não obrigatória). RA
  (BIB §6.1, §10).

- Detalhe opcional e ícone opcional (só dentro da pílula). RA.

- Sem logotipo: o campo não existe na matriz (BIB §12). IT.

### 5.4 Fundo e fotografia

- Foto cobrindo todo o canvas, sem cantos arredondados. RA.

- Uma foto por slide, de qualquer ambiente, com o assunto fora da área
  da legenda. RA (BIB §6.1).

- Origem mínima sem ampliação: 1080 × 1350 (carrossel) e 1080 × 1920
  (Stories). IT.

- Foto sem 30% de área calma na base é o caso de uso previsto para
  legenda pequena. RA (BIB §5). Tamanho de “legenda pequena”: PEND.

### 5.5 Posições dos elementos

| Elemento | Carrossel (1080 × 1350) | Stories (1080 × 1920) | Status |
|----|----|----|----|
| Legenda | x = 72; base em y = 1278 | x = 72; base em y = 1580 | RA (âncora); coordenadas IT |
| Largura máxima da legenda | PEND | PEND | PEND |
| Detalhe | Posição relativa à legenda | Idem | PEND |
| Pílula de vidro | Contida na zona útil; base em y = 1278 | Base em y = 1580 | IT; dimensões PEND |
| Ícone na pílula | Posição e tamanho | Idem | PEND |
| Indicador n/total | Direita em x = 1008; topo em y = 72 | Não se aplica | RA (canto); coordenadas IT |

### 5.6 Margens e espaçamentos

Margens de RC-01. Espaçamentos permitidos de 24, 48 e 72 px; valores por
par PEND. Raio da pílula de vidro: PEND (o MAN fixa 24 px para painel de
vidro e pílula total para tags; a BIB chama o elemento de “pílula de
vidro”).

### 5.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Legenda | Inter SemiBold | PEND (mínimo 28 em carrossel; 32 em Stories) | Fonte RA; tamanho PEND |
| Detalhe | Inter, peso PEND | PEND (mínimo 28 / 32) | PEND |
| Indicador n/total | Inter Medium | 28 px | RA (28 px); peso IT |

### 5.8 Cores

- Estilo simples: texto Espuma (PR) ou branco (PT-04) sobre o
  escurecimento Oceano. IT.

- Pílula de vidro: fundo Espuma translúcido com desfoque (opacidade
  PEND); texto e ícone Oceano. IT.

- Nenhum elemento lima. RA (a BIB não prevê lima em FOT-02).

### 5.9 Dimensões e limites dos textos

| Campo            | Referência                         | Status        |
|------------------|------------------------------------|---------------|
| Legenda          | 32 caracteres                      | RA (BIB §6.1) |
| Detalhe          | 60 caracteres                      | RA            |
| Ícone            | 1, do conjunto de 12, só na pílula | RA            |
| Número de linhas | PEND                               | PEND          |

### 5.10 Elementos obrigatórios e opcionais

- Obrigatórios: foto e legenda. Legenda obrigatória é IT: sem ela a peça
  seria foto pura. A ESP §11.3 não lista FOT-02.

- Opcionais: detalhe, ícone (só na pílula), estilo da legenda, nível de
  escurecimento. RA.

- Estilo padrão (simples ou pílula): PEND.

### 5.11 Regras de enquadramento

RC-08 integral. Assunto fora da área da legenda. Texto nunca sobre
rostos (PT-19). Recorte independente por formato. RA.

### 5.12 Regras de escurecimento

- Nenhum, suave ou intenso, sempre Oceano. Padrão suave. A extensão dos
  níveis do FOT-01 ao FOT-02 é proposta, a confirmar. RA (BIB §6.1,
  §12); valores PR (ESP §7.4).

- Zona e curva conforme RC-05. Se a pílula de vidro dispensa o
  escurecimento: PEND.

### 5.13 Regras do logotipo

Não previsto no template. IT. Se for habilitado no futuro, vale RC-06.

### 5.14 Comportamento quando o texto não couber

- RC-09. Legenda obrigatória que não couber no mínimo de fonte bloqueia.
  Detalhe opcional gera aviso (PT-06).

- A pílula de vidro nunca invade as margens. IT.

### 5.15 Regras de exportação

PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10). Em carrossel, numerado na
ordem do ZIP. O indicador n/total é gerado pela posição do slide e deve
acompanhar reordenações. IT.

### 5.16 Pendências da ficha

Largura máxima da legenda · tamanhos de legenda e detalhe · peso do
detalhe · raio e opacidade da pílula de vidro · estilo padrão · posição
do ícone · tamanho de “legenda pequena”. Transversais: PT-04, 05, 06,
07, 08, 13, 14, 16, 18, 19.

## 6. INF-01 · Grade de ícones

### 6.1 Identificação e finalidade

- ID INF-01 · Grade de ícones · Estrutura B (cartão). RA.

- Finalidade: estrutura e comodidades. RA (BIB §3). Sequências S1 e S3.
  RA.

- Exemplo do site: cozinha completa, banheiro privativo, área comum com
  churrasqueira, estacionamento gratuito, cisterna própria de água,
  Wi-Fi, ventiladores e redes (8 dos 12 ícones). RA (BIB §6.2).

### 6.2 Formatos e dimensões

Feed e carrossel 1080 × 1350; Stories 1080 × 1920. RA.

### 6.3 Estrutura visual

Cabeçalho (rótulo e título) no topo à esquerda; corpo com grade de 2
colunas por até 4 linhas; rodapé com logotipo. Cada item tem um azulejo
de ícone (Turquesa a 15%) e um rótulo em Inter SemiBold. RA.

### 6.4 Fundo e fotografia

Sem fotografia. RA (BIB §5). Fundo sólido Espuma \#F4FAF9 ou Areia
\#EFE5CF, um só por carrossel. RA.

### 6.5 Posições dos elementos

| Elemento | Feed e carrossel | Stories | Status |
|----|----|----|----|
| Cabeçalho | x = 72; topo em y = 72 | x = 72; topo em y = 250 | RA (âncora); coordenadas IT |
| Grade | x de 72 a 1008 (936 px) | Idem | IT |
| Coluna 1 | x = 72 | x = 72 | IT |
| Coluna 2 | x = 72 + larguraColuna + espaço entre colunas | Idem | IT |
| Largura de coluna | (936 − espaço) / 2: com 24 px, 456 (coluna 2 em x = 552); com 48 px, 444 (coluna 2 em x = 564) | Idem | IT; espaço entre colunas PEND |
| Posição vertical da grade | Centrada no espaço livre entre cabeçalho e rodapé | Idem | IT (BIB: “corpo no centro”) |
| Altura e espaçamento das linhas | PEND | PEND | PEND |
| Item | Posição do azulejo em relação ao rótulo | Idem | PEND |
| Logotipo | Base em y = 1278; x = 72 | Base em y = 1580; x = 72 | RA (rodapé); coordenadas IT (PT-01) |

Itens ímpares ocupam a coluna 1 na última linha; leitura da esquerda
para a direita e de cima para baixo. IT.

### 6.6 Margens e espaçamentos

Margens de RC-01. Espaçamento entre blocos de 24, 48 ou 72 px; valores
por par PEND. Raio do azulejo de ícone: PEND.

### 6.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Título | Sora Bold | 72–96 (Feed) / 80–104 (Stories); entrelinha 1,05–1,10 | RA |
| Rótulo do cabeçalho | Inter SemiBold, caixa alta, +8% | 28 (Feed) / 32 (Stories, PT-10) | RA; Stories IT |
| Rótulo do item | Inter SemiBold | PEND (mínimo 28 / 32) | Fonte RA; tamanho PEND |

### 6.8 Cores

Título e textos: Oceano \#0A4F60. Traço do ícone: Oceano. Azulejo:
Turquesa \#14B8CE a 15% de opacidade. Fundo: Espuma ou Areia. Sem lima e
sem Sol. RA.

### 6.9 Dimensões e limites dos textos

| Campo | Referência | Limite estrutural | Status |
|----|----|----|----|
| Título | Até 8 palavras (48 caracteres) | Linhas PEND | RA; PEND |
| Rótulo do cabeçalho | 28 caracteres | 1 linha | RA; IT |
| Item | 28 caracteres | De 2 a 8 itens; grade de 2 colunas por até 4 linhas | RA |
| Ícones | — | Até 8 (exceção aprovada exclusiva deste template) | RA |

### 6.10 Elementos obrigatórios e opcionais

- Obrigatórios: título; de 2 a 8 itens, cada um com ícone do conjunto e
  texto. IT. Menos de 2 ou mais de 8 itens bloqueia. IT.

- Opcionais: rótulo do cabeçalho, logotipo, fundo Espuma ou Areia. RA
  (BIB §12). Logotipo ligado por padrão: PEND.

### 6.11 Regras de enquadramento

Não se aplicam (sem foto).

### 6.12 Regras de escurecimento

Não se aplicam.

### 6.13 Regras do logotipo

No rodapé, embaixo à esquerda (PT-01), direto sobre Espuma ou Areia.
Largura de 180 a 240 px (Feed) e de 200 a 260 px (Stories); respiro de
25%. RA (RC-06). Altura e limite sem ampliação: PT-09.

### 6.14 Comportamento quando o texto não couber

- RC-09. Título e itens são obrigatórios: se não couberem, bloqueia.

- Rótulo de item que não caiba em uma linha da célula: quebra em mais
  linhas ou bloqueio. PEND (PT-18).

- Grade que ultrapasse a altura livre entre cabeçalho e rodapé:
  bloqueia. IT.

### 6.15 Regras de exportação

PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10). Bloqueio por ícone
indisponível: os 12 ícones ainda não existem (PT-16).

### 6.16 Pendências da ficha

Espaço entre colunas · altura e espaçamento de linhas · layout interno
do item · raio e tamanho do azulejo · tamanho do rótulo de item · quebra
de linha de itens · logotipo padrão. Transversais: PT-01, 05, 07, 09,
10, 16, 18.

## 7. INF-02 · Linhas rótulo/valor

### 7.1 Identificação e finalidade

- ID INF-02 · Linhas rótulo/valor · Estrutura B (cartão). RA.

- Finalidade: localização e distâncias; regras da hospedagem; ficha da
  acomodação. RA (BIB §3). Sequências S1 (ficha), S3 e S4. RA.

- Exemplos: rótulo “No mesmo quarteirão” com valor “Quintal Butiá · Pico
  da Tribo · Mar del Rosa”; rótulo “Check-in” com valor “\[horário\]”;
  rótulo “Capacidade” com valor “\[número\] hóspedes”. Textos entre
  colchetes são preenchidos pela casa. RA (BIB §6.2).

### 7.2 Formatos e dimensões

Feed e carrossel 1080 × 1350; Stories 1080 × 1920. RA.

### 7.3 Estrutura visual

Cabeçalho com título; corpo com cartão Areia de raio 24 px contendo de 3
a 6 linhas separadas por filete Turquesa de 2 px; nota de rodapé
opcional; rodapé com logotipo. Rótulo em Inter SemiBold e valor em Inter
Regular. RA (BIB §6.2).

O campo “rótulo do cabeçalho” não aparece nos campos do INF-02 (BIB §6.2
e §12), embora a estrutura B preveja rótulo e título. IT: o cabeçalho
tem só o título. Confirmar.

### 7.4 Fundo e fotografia

Sem fotografia. Fundo Espuma \#F4FAF9 ou Areia \#EFE5CF, um por
carrossel. Cartão Areia \#EFE5CF: com fundo Areia o cartão se confunde
com o fundo (PT-11). PR: cartão Espuma nesse caso.

### 7.5 Posições dos elementos

| Elemento | Feed e carrossel | Stories | Status |
|----|----|----|----|
| Título | x = 72; topo em y = 72 | x = 72; topo em y = 250 | RA (âncora); IT |
| Cartão | x de 72 a 1008 (936 px de largura) | Idem | IT (largura não escrita) |
| Área interna do cartão | Padding de 48 px: texto entre x = 120 e x = 960 (840 px) | Idem | RA (48 px); coordenadas IT |
| Posição vertical do cartão | Centrado entre título e rodapé; altura = 48 + linhas + 48, medida pelo conteúdo | Idem | IT; altura máxima PEND |
| Filetes | 2 px Turquesa entre linhas, n − 1 filetes | Idem | RA (2 px); n − 1 = IT; comprimento PEND |
| Disposição de rótulo e valor | Lado a lado ou empilhados; largura da coluna do rótulo | Idem | PEND |
| Nota de rodapé | Posição relativa ao cartão | Idem | PEND |
| Logotipo | Base em y = 1278; x = 72 | Base em y = 1580; x = 72 | RA (rodapé); IT (PT-01) |

### 7.6 Margens e espaçamentos

Margens de RC-01; padding interno do cartão 48 px; raio 24 px. RA.
Espaçamento entre blocos de 24, 48 ou 72 px; valores por par e altura de
cada linha: PEND.

### 7.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Título | Sora Bold | 72–96 (Feed) / 80–104 (Stories) | RA |
| Rótulo da linha | Inter SemiBold | PEND (mínimo 28 / 32) | Fonte RA; tamanho PEND |
| Valor | Inter Regular | PEND (mínimo 28 / 32) | Fonte RA; tamanho PEND |
| Nota de rodapé | Inter, peso PEND | PEND (mínimo 28 / 32) | PEND |

### 7.8 Cores

Título, rótulos e valores: Oceano \#0A4F60. Cartão: Areia \#EFE5CF (ou
Espuma sobre fundo Areia, PR). Filete: Turquesa \#14B8CE. Fundo: Espuma
ou Areia. Sem lima. RA.

### 7.9 Dimensões e limites dos textos

| Campo            | Referência    | Limite estrutural | Status   |
|------------------|---------------|-------------------|----------|
| Título           | 48 caracteres | Linhas PEND       | RA; PEND |
| Rótulo           | 24 caracteres | 1 linha (IT)      | RA       |
| Valor            | 40 caracteres | Linhas PEND       | RA       |
| Linhas do cartão | —             | De 3 a 6          | RA       |
| Nota de rodapé   | PEND          | PEND              | PEND     |

### 7.10 Elementos obrigatórios e opcionais

- Obrigatórios: título e de 3 a 6 linhas com rótulo e valor. IT. Menos
  de 3 ou mais de 6 linhas bloqueia. IT.

- Opcionais: nota de rodapé, logotipo, fundo Espuma ou Areia. RA (BIB
  §12).

### 7.11 Regras de enquadramento

Não se aplicam.

### 7.12 Regras de escurecimento

Não se aplicam.

### 7.13 Regras do logotipo

Rodapé, embaixo à esquerda (PT-01); direto sobre Espuma ou Areia;
180–240 px (Feed) e 200–260 px (Stories); respiro de 25%. RA (RC-06).
Logotipo padrão ligado ou desligado: PEND.

### 7.14 Comportamento quando o texto não couber

RC-09. Título e linhas são obrigatórios e bloqueiam. Se as 6 linhas não
couberem na altura livre entre título e rodapé, bloqueia; não se reduz a
fonte abaixo de 28 px (Feed) ou 32 px (Stories). Nota opcional: aviso
(PT-06). Quebra de linha em valores longos: PEND (PT-18).

### 7.15 Regras de exportação

PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10). Textos que ainda contêm
colchetes de preenchimento: tratamento PEND.

### 7.16 Pendências da ficha

Rótulo do cabeçalho · largura do cartão · disposição de rótulo e valor ·
altura das linhas · comprimento do filete · nota de rodapé · tamanhos de
fonte. Transversais: PT-01, 05, 07, 09, 11, 18.

## 8. INF-03 · Passos numerados

### 8.1 Identificação e finalidade

- ID INF-03 · Passos numerados · Estrutura B (cartão). RA.

- Finalidade: informações sobre reservas. RA (BIB §3). Sequências S3 e
  S7 (opcional). RA.

- Exemplo do site: 1 Escolha a acomodação · 2 Informe datas e hóspedes ·
  3 Veja a cotação · 4 Confirme pelo WhatsApp. Chamada “Ver cotação”. RA
  (BIB §6.2).

### 8.2 Formatos e dimensões

Feed e carrossel 1080 × 1350; Stories 1080 × 1920. RA.

### 8.3 Estrutura visual

Cabeçalho com título; corpo de 3 a 4 passos, cada um com número em Sora
Bold dentro de círculo Turquesa, título do passo e apoio opcional;
pílula lima de chamada fecha a peça; rodapé com logotipo. RA (BIB §6.2,
§12).

### 8.4 Fundo e fotografia

Sem fotografia. Fundo Espuma ou Areia, um por carrossel. RA.

### 8.5 Posições dos elementos

| Elemento | Feed e carrossel | Stories | Status |
|----|----|----|----|
| Título | x = 72; topo em y = 72 | x = 72; topo em y = 250 | RA; IT |
| Passos | Empilhados na vertical, em ordem numérica | Idem | IT (a BIB não descreve a disposição) |
| Círculo numerado | À esquerda do texto do passo; número centrado no círculo | Idem | IT; diâmetro PEND |
| Texto do passo | À direita do círculo: título e, abaixo, apoio | Idem | IT; recuo PEND |
| Espaço entre passos | 24, 48 ou 72 px | Idem | RA (valores); escolha PEND |
| Pílula | Abaixo do último passo, alinhada à esquerda em x = 72 | Idem | IT |
| Logotipo | Base em y = 1278; x = 72 | Base em y = 1580; x = 72 | RA (rodapé); IT (PT-01) |
| Relação entre a pílula e o logotipo no rodapé | Ordem e distância | Idem | PEND |

### 8.6 Margens e espaçamentos

Margens de RC-01. Espaçamentos de 24, 48 ou 72 px; valores por par:
PEND. Dimensões da pílula: PT-07.

### 8.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Título | Sora Bold | 72–96 (Feed) / 80–104 (Stories) | RA |
| Número | Sora Bold | PEND; precisa ser grande, porque Oceano sobre Turquesa tem 3,8:1 | Fonte RA; tamanho PEND |
| Título do passo | Inter, peso PEND (IT: SemiBold) | PEND (mínimo 28 / 32) | PEND |
| Apoio do passo | Inter Regular (IT) | PEND (mínimo 28 / 32) | PEND |
| Pílula | Sora Bold (PT-03) | PEND (mínimo 28 / 32) | IT |

### 8.8 Cores

Título e textos: Oceano. Círculo: Turquesa \#14B8CE com número Oceano
(3,8:1, só texto grande em negrito). Pílula: lima com texto Oceano.
Fundo: Espuma ou Areia. Um único lima: a pílula. RA.

### 8.9 Dimensões e limites dos textos

| Campo           | Referência    | Limite estrutural | Status   |
|-----------------|---------------|-------------------|----------|
| Título          | 48 caracteres | Linhas PEND       | RA; PEND |
| Título do passo | 32 caracteres | Linhas PEND       | RA; PEND |
| Apoio do passo  | 60 caracteres | Linhas PEND       | RA; PEND |
| Passos          | —             | De 3 a 4          | RA       |
| Chamada         | 18 caracteres | 1 linha           | RA       |

PT-15: os três estilos de texto são título, título do passo e apoio; o
número e a chamada são componentes. IT.

### 8.10 Elementos obrigatórios e opcionais

- Obrigatórios: título; de 3 a 4 passos, cada um com título; chamada (a
  pílula “fecha a peça”). IT. Texto padrão da chamada: PEND (exemplo
  “Ver cotação”).

- Opcionais: apoio de cada passo; logotipo; fundo.

- Menos de 3 ou mais de 4 passos bloqueia. IT.

### 8.11 Regras de enquadramento

Não se aplicam.

### 8.12 Regras de escurecimento

Não se aplicam.

### 8.13 Regras do logotipo

Rodapé, embaixo à esquerda (PT-01); direto sobre Espuma ou Areia;
180–240 px (Feed) e 200–260 px (Stories); respiro de 25%. RA (RC-06).
Padrão ligado ou desligado: PEND.

### 8.14 Comportamento quando o texto não couber

RC-09. Título, títulos dos passos e chamada são obrigatórios e bloqueiam
se não couberem. Apoio opcional: aviso (PT-06). Se 4 passos mais pílula
mais logotipo excederem a altura útil, bloqueia. IT.

### 8.15 Regras de exportação

PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10). Em S7, vem depois do
COM-01 e antes do COM-02. RA (BIB §7).

### 8.16 Pendências da ficha

Disposição dos passos · diâmetro do círculo e tamanho do número ·
tamanhos de fonte · peso do título do passo · relação pílula e logotipo
no rodapé · texto padrão da chamada. Transversais: PT-01, 03, 05, 07,
09, 15, 18.

## 9. INF-04 · Pergunta e resposta

### 9.1 Identificação e finalidade

- ID INF-04 · Pergunta e resposta · Estrutura B (cartão). RA.

- Finalidade: perguntas frequentes; uma pergunta por slide ou por Story.
  RA (BIB §3, §6.2). Sequência S3. RA.

- Exemplos: “Tem estacionamento?” com a resposta “Sim, o estacionamento
  é gratuito.”; “Como confirmo a reserva?” com “Pelo WhatsApp, depois de
  montar a cotação no site.” RA.

### 9.2 Formatos e dimensões

Feed e carrossel 1080 × 1350; Stories 1080 × 1920. RA.

### 9.3 Estrutura visual

Rótulo fixo “Pergunta frequente”; pergunta em Sora Bold; resposta em
Inter dentro de cartão Areia; ícone opcional; logotipo no rodapé. RA
(BIB §6.2).

A BIB escreve que o corpo reúne rótulo, pergunta e resposta “dentro de
cartão Areia”, mas só a resposta aparece gramaticalmente no cartão. IT:
rótulo e pergunta no cabeçalho, resposta no cartão. Confirmar.

### 9.4 Fundo e fotografia

Sem fotografia. Fundo Espuma ou Areia; cartão Areia (PT-11, PR: cartão
Espuma sobre fundo Areia). RA.

### 9.5 Posições dos elementos

| Elemento | Feed e carrossel | Stories | Status |
|----|----|----|----|
| Rótulo fixo | x = 72; topo em y = 72 | x = 72; topo em y = 250 | RA; IT |
| Pergunta | Abaixo do rótulo, x = 72 | Idem | IT |
| Cartão da resposta | x de 72 a 1008; padding de 48 px; texto entre x = 120 e x = 960 | Idem | IT; altura medida pelo conteúdo |
| Ícone (opcional) | Posição e tamanho | Idem | PEND |
| Logotipo | Base em y = 1278; x = 72 | Base em y = 1580; x = 72 | RA (rodapé); IT (PT-01) |

### 9.6 Margens e espaçamentos

Margens de RC-01; padding do cartão 48 px; raio 24 px. RA. Espaçamentos
de 24, 48 ou 72 px; valores por par: PEND.

### 9.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Rótulo fixo | Inter SemiBold, caixa alta, +8% | 28 (Feed) / 32 (Stories, PT-10) | IT (nível Rótulo) |
| Pergunta | Sora Bold | 64–72 px (abaixo da faixa 72–96 do MAN; PT-10) | RA (BIB); PT-10 |
| Resposta | Inter, 36 px; peso IT Medium (nível Subtítulo), entrelinha 1,3 | 36 px fixo | Tamanho RA; peso PEND |

### 9.8 Cores

Rótulo, pergunta e resposta: Oceano \#0A4F60. Cartão: Areia (ou Espuma
sobre fundo Areia, PR). Ícone: Oceano, com azulejo Turquesa a 15% (IT).
Sem lima. RA.

### 9.9 Dimensões e limites dos textos

| Campo                       | Referência               | Status |
|-----------------------------|--------------------------|--------|
| Pergunta                    | 70 caracteres            | RA     |
| Resposta                    | 220 caracteres           | RA     |
| Rótulo “Pergunta frequente” | Texto fixo, não editável | RA     |
| Linhas máximas              | PEND                     | PEND   |

### 9.10 Elementos obrigatórios e opcionais

- Obrigatórios: pergunta e resposta. IT.

- Opcionais: ícone (do conjunto de 12), logotipo, fundo.

- Fixo: o rótulo “Pergunta frequente”. RA (BIB §12).

### 9.11 Regras de enquadramento

Não se aplicam.

### 9.12 Regras de escurecimento

Não se aplicam.

### 9.13 Regras do logotipo

Rodapé, embaixo à esquerda (PT-01); 180–240 px (Feed) e 200–260 px
(Stories); respiro de 25%. RA (RC-06). Padrão ligado ou desligado: PEND.

### 9.14 Comportamento quando o texto não couber

RC-09. Pergunta e resposta são obrigatórias: se não couberem nem no
mínimo de fonte, bloqueia. A resposta tem tamanho fixo de 36 px, então o
cartão cresce em altura até o limite livre; acima disso, bloqueia. IT. O
texto não pode ser reduzido abaixo de 36 px. IT. A pergunta pode descer
até 64 px dentro da faixa.

### 9.15 Regras de exportação

PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10).

### 9.16 Pendências da ficha

O que está dentro do cartão · peso da resposta · posição e tamanho do
ícone · linhas máximas · faixa 64–72 contra 72–96. Transversais: PT-01,
05, 09, 10, 11, 16, 18.

## 10. INS-01 · Foto em moldura + texto

### 10.1 Identificação e finalidade

- ID INS-01 · Foto em moldura + texto · Estrutura C (foto em moldura).
  RA.

- Finalidade: história das cabanas; quem somos; Praia do Rosa;
  experiências e atrações próximas (uma atração por slide). RA (BIB
  §6.3). Sequências S4 (2 a 3 slides) e S5 (3 a 5 slides). RA.

- Em “Quem somos” e “História” a foto dos anfitriões exige autorização
  expressa (MAN §7.7); o aplicativo não controla (PT-19).

### 10.2 Formatos e dimensões

Feed e carrossel 1080 × 1350; Stories 1080 × 1920. RA.

### 10.3 Estrutura visual

Fundo Espuma ou Areia; foto em moldura no topo; abaixo, rótulo
(opcional), título e texto; tag Turquesa de local opcional. RA (BIB
§6.3).

### 10.4 Fundo e fotografia

- Fundo sólido Espuma ou Areia, um por carrossel. RA.

- Moldura com raio de 32 px. A BIB §2 escreve “cantos de 32 px no topo”;
  IT: raio nos quatro cantos, como no MAN §6 (“foto em moldura”).

- Foto horizontal, quadrada ou vertical, recortada pela moldura. Feed:
  936 × 702. Stories: 936 × 1100. RA (BIB §5).

- Origem mínima sem ampliação: 936 × 702 (Feed) e 936 × 1100 (Stories).
  IT.

- A foto não sangra; aplica-se RC-08 ao retângulo da moldura.

### 10.5 Posições dos elementos

| Elemento | Feed e carrossel | Stories | Status |
|----|----|----|----|
| Moldura | (72, 72)–(1008, 774); 936 × 702 | (72, 250)–(1008, 1350); 936 × 1100 | RA (tamanhos; início y = 250 em Stories); Feed y = 72 IT |
| Espaço livre abaixo da moldura | 504 px (de y = 774 a y = 1278) | 230 px (de y = 1350 a y = 1580) | IT |
| Bloco de texto | x = 72; largura PEND (IT: até 936); fim em y = 1278 | Fim do texto em y = 1580 | RA (fim em Stories); Feed IT |
| Ordem do bloco | Rótulo, título, texto | Idem | RA (BIB §4.1) |
| Tag Turquesa de local | Posição (sobre a foto ou no bloco de texto) | Idem | PEND |
| Indicador n/total | Alinhado à direita em x = 1008, topo em y = 72, sobre a moldura | Não se aplica | PT-08; colide com a foto |
| Logotipo | Não previsto nos campos | Idem | PEND |

Alerta de viabilidade em Stories (aritmética): restam 230 px para
respiros, rótulo, título e texto. Um título de 1 linha a 64 px (67 a 70
px com entrelinha 1,05 a 1,10) mais 3 linhas de texto a 32 px (3 × 43,2
= 129,6 px) já somam de 197 a 200 px, restando cerca de 30 px. O texto
de referência de 40 palavras, o rótulo e os respiros não cabem juntos.
Decisão necessária (L-01).

### 10.6 Margens e espaçamentos

Margens de RC-01; moldura sobre Espuma ou Areia com raio de 32 px. RA.
Espaçamento entre moldura e texto, e entre rótulo, título e texto: 24,
48 ou 72 px, valores PEND.

### 10.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Rótulo | Inter SemiBold, caixa alta, +8% | 28 (Feed) / 32 (Stories, PT-10) | RA; Stories IT |
| Título | Sora Bold | 64–72 px (abaixo da faixa do MAN; PT-10) | RA (BIB); PT-10 |
| Texto | Inter Regular (IT, nível Apoio), entrelinha 1,35 | 32 px | Tamanho RA; peso IT |
| Tag de local | Inter SemiBold | PEND (mínimo 28 / 32) | PEND |

### 10.8 Cores

Título, rótulo e texto: Oceano \#0A4F60. Tag: pílula Turquesa \#14B8CE
com texto Oceano (3,8:1; só texto grande em negrito; PT-07). Fundo:
Espuma ou Areia. Sem lima. RA.

### 10.9 Dimensões e limites dos textos

| Campo  | Referência                 | Status                 |
|--------|----------------------------|------------------------|
| Título | 48 caracteres; linhas PEND | RA; PEND               |
| Texto  | 40 palavras                | RA; ver alerta em 10.5 |
| Rótulo | 28 caracteres              | RA                     |
| Tag    | 28 caracteres              | RA                     |

### 10.10 Elementos obrigatórios e opcionais

- Obrigatórios: foto e título. IT. O texto também é obrigatório? PEND: a
  ESP não lista INS-01 em §11.3.

- Opcionais: rótulo, tag Turquesa de local, fundo. Texto: PEND.

### 10.11 Regras de enquadramento

RC-08 aplicada à moldura. Foto não cobre rosto com texto (o texto fica
abaixo da moldura). Autorização de pessoas: MAN §7.7 (PT-19).

### 10.12 Regras de escurecimento

Não se aplicam: a foto fica em moldura, sem texto sobre ela. RA.

### 10.13 Regras do logotipo

Não previsto nos campos (BIB §12). IT. Se habilitado: RC-06; posição
PT-01.

### 10.14 Comportamento quando o texto não couber

RC-09. Título obrigatório bloqueia se não couber. Em Stories, com 230 px
livres, o espaço do texto é muito curto: se o bloco não couber nos 230
px, mostra aviso e bloqueia o campo obrigatório. A opção de reduzir a
moldura para ganhar espaço não está documentada e exige decisão (L-01).
Nunca reduzir abaixo de 32 px (texto).

### 10.15 Regras de exportação

PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10). Em carrossel, é numerado
na ordem do ZIP.

### 10.16 Pendências da ficha

L-01 espaço do texto em Stories · posição da tag · se o texto é
obrigatório · logotipo · largura do bloco · faixa 64–72. Transversais:
PT-08, 10, 18, 19.

## 11. INS-02 · Avaliação

### 11.1 Identificação e finalidade

- ID INS-02 · Avaliação · Estrutura B (cartão). RA.

- Finalidade: avaliações de hóspedes. RA (BIB §3). Sequência S6, que
  pode abrir direto com INS-02 e também pode ser publicação avulsa. RA
  (BIB §7).

- Regra aprovada: usar as avaliações existentes do site (2016 a 2020),
  sempre com nome, ano e origem visíveis, sem sugerir que são recentes.
  RA (BIB §6.3, §10).

- Exemplo do site: “Ótimo lugar para se hospedar, muito tranquilo e
  aconchegante!” · Débora · 2020 · selo “98% de recomendação”. RA.

### 11.2 Formatos e dimensões

Feed e carrossel 1080 × 1350; Stories 1080 × 1920. RA.

### 11.3 Estrutura visual

Fundo Areia; cinco estrelas Sol no topo; citação em Inter Medium; nome,
ano e origem em Inter SemiBold; logotipo no rodapé; selo de reputação
opcional em Sol. Sem aspas decorativas. RA (BIB §6.3).

### 11.4 Fundo e fotografia

- Sem fotografia. Fundo Areia \#EFE5CF, fixo. RA (BIB §12).

- A BIB §4.2 lista “fundo Espuma ou Areia” como editável nos cartões,
  mas a matriz fixa Areia para INS-02. IT: Areia fixo.

- Consequência: como cada carrossel usa um só fundo de cartão, o COM-02
  de uma S6 em carrossel deve ficar em Areia. IT.

### 11.5 Posições dos elementos

| Elemento | Feed e carrossel | Stories | Status |
|----|----|----|----|
| Estrelas | Linha no topo, x = 72, topo em y = 72 | x = 72, topo em y = 250 | RA (“no topo”); coordenadas IT; tamanho PEND |
| Citação | Abaixo das estrelas, x = 72, largura até 936 | Idem | IT |
| Nome, ano e origem | Abaixo da citação, x = 72 | Idem | IT |
| Selo de reputação | Posição | Idem | PEND |
| Logotipo | Base em y = 1278; x = 72 | Base em y = 1580; x = 72 | RA (rodapé); IT (PT-01) |
| Posição vertical da citação e distâncias | 24, 48 ou 72 px; valor por par | Idem | PEND |

Cinco estrelas são sempre desenhadas (RA); como mostrar uma nota
inferior a 5 no campo “nota em estrelas”: PEND.

### 11.6 Margens e espaçamentos

Margens de RC-01. Espaçamentos de 24, 48 ou 72 px; valores por par:
PEND. Todo texto dentro da zona útil.

### 11.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Citação | Inter Medium | 44–52 px; entrelinha PEND (IT: 1,3, como o nível Subtítulo) | RA (fonte e faixa); entrelinha PEND |
| Nome, ano e origem | Inter SemiBold | PEND (mínimo 28 / 32) | Fonte RA; tamanho PEND |
| Selo | Inter, peso PEND | PEND (mínimo 28 / 32) | PEND |

### 11.8 Cores

Fundo Areia; texto Oceano \#0A4F60 (7,3:1 sobre Areia); estrelas Sol
\#FFC94D; selo Sol com texto Oceano (6,0:1). Sem lima. RA. O contraste
de Sol sobre Areia não consta do MAN §3.2: PEND.

### 11.9 Dimensões e limites dos textos

| Campo | Referência | Status |
|----|----|----|
| Citação | 160 caracteres. Acima disso, aviso de “avaliação longa” | RA (BIB §4.3); aviso PR (ESP §11.2) |
| Citação | Transcrita como publicada; só se corta com “…”, por decisão de quem edita | RA |
| Nome, ano, origem | Sempre visíveis | RA |
| Selo | Informa origem e número de avaliações | RA |
| Linhas máximas | PEND | PEND |

### 11.10 Elementos obrigatórios e opcionais

- Obrigatórios: nome, ano e origem. PR (ESP §11.3). Citação: IT. Nota em
  estrelas: IT, valor padrão PEND.

- Opcionais: selo de reputação; logotipo (a BIB o descreve na
  composição, mas a matriz não o lista como campo; ligado por padrão:
  PEND).

### 11.11 Regras de enquadramento

Não se aplicam.

### 11.12 Regras de escurecimento

Não se aplicam.

### 11.13 Regras do logotipo

Rodapé, embaixo à esquerda (PT-01); direto sobre Areia; 180–240 px
(Feed) e 200–260 px (Stories); respiro de 25%. RA (RC-06).

### 11.14 Comportamento quando o texto não couber

- RC-09. A citação nunca é cortada pelo sistema. Se não couber no mínimo
  da faixa (44 px), bloqueia e o editor pode cortar com “…” por conta
  própria. RA (BIB §6.3); bloqueio PR.

- Citação acima de 160 caracteres, mesmo cabendo: aviso de avaliação
  longa. PR.

- Nome, ano e origem são obrigatórios; se não couberem, bloqueia.

### 11.15 Regras de exportação

- PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10). Avulso: peça única.

- Aviso quando a avaliação tem mais de dois anos em relação ao ano
  corrente. PR (ESP §11.5). Todas as avaliações de 2016 a 2020 disparam
  o aviso em 2026. IT. O aviso não bloqueia.

- Ano, nome e origem permanecem visíveis; nenhum texto sugere recência.
  RA.

### 11.16 Pendências da ficha

Nota padrão e nota inferior a 5 · tamanho das estrelas · posição do selo
· logotipo padrão · contraste de Sol sobre Areia · tamanhos de fonte.
Transversais: PT-01, 05, 07, 09, 15, 16, 18.

## 12. COM-01 · Aviso comercial

### 12.1 Identificação e finalidade

- ID COM-01 · Aviso comercial · Estrutura A com painel de vidro. RA.

- Finalidade: disponibilidade, reservas abertas, feriados e datas
  especiais, últimas vagas. RA (BIB §3). Sequência S7. RA.

- Só vai ao ar com datas, valores e condições confirmados no momento da
  publicação. RA (BIB §6.4).

### 12.2 Formatos e dimensões

Feed 1080 × 1350 e Stories 1080 × 1920. RA. Não é compatível com
carrossel nem Reels (ESP §6.4).

### 12.3 Estrutura visual

Foto sangrada com escurecimento Oceano; um painel de vidro na base, com
raio de 24 px e padding de 48 px, contendo tag de tipo, título, período
e pílula lima. Acomodação e condição são opcionais. Sem campo de preço.
RA (BIB §6.4, §9).

O COM-01 não tem campo de logotipo (BIB §12). IT: sem logotipo.

### 12.4 Fundo e fotografia

- Foto cobrindo todo o canvas. Origem mínima sem ampliação: 1080 × 1350
  (Feed) e 1080 × 1920 (Stories). IT.

- RC-08 integral; foto real da acomodação, sem imagens geradas por IA.
  RA.

### 12.5 Posições dos elementos

| Elemento | Feed | Stories | Status |
|----|----|----|----|
| Painel de vidro | x de 72 a 1008; borda inferior em y = 1278 | x de 72 a 1008; borda inferior em y ≤ 1580 | RA (base, “acima de y = 1580”); largura e Feed IT |
| Área interna do painel | Padding de 48: x de 120 a 960 (840 px) | Idem | RA (48 px); coordenadas IT |
| Altura do painel | 48 + conteúdo + 48; máximo PEND | Idem | IT; máximo PEND |
| Ordem interna | Tag, título, período, pílula (acomodação e condição: posição PEND) | Idem | RA (ordem listada); IT |
| Distâncias internas | 24, 48 ou 72 px; valor por par | Idem | PEND |

Dimensões do painel e da pílula: PT-07.

### 12.6 Margens e espaçamentos

Margens de RC-01; raio do painel 24 px; padding 48 px. RA. Espaçamentos
internos: PEND.

### 12.7 Fontes e tamanhos

PT-15: IT: nível 1 = tag; nível 2 = título; nível 3 = período,
acomodação e condição, no mesmo estilo.

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Tag de tipo | Inter SemiBold (IT) | PEND (mínimo 28 / 32) | PEND |
| Título | Sora Bold | PEND (faixa 72–96 / 80–104 se aplicável ao painel) | Fonte RA; faixa PEND |
| Período | Inter, peso PEND | PEND (mínimo 28 / 32) | PEND |
| Acomodação e condição | Inter, peso PEND | PEND (mínimo 28 / 32) | PEND |
| Pílula | Sora Bold (PT-03) | PEND (mínimo 28 / 32) | IT |

### 12.8 Cores

- Painel: Espuma \#F4FAF9 translúcido com desfoque (opacidade e raio do
  desfoque PEND). Texto Oceano \#0A4F60. IT.

- Tag, definida pelo tipo: Disponibilidade e Reservas abertas em
  Turquesa \#14B8CE; Datas especiais e Últimas vagas em Sol \#FFC94D;
  texto Oceano. RA (BIB §6.4). Oceano sobre Turquesa (3,8:1) exige texto
  grande em negrito; SemiBold conta como negrito? PEND.

- Pílula: lima \#C6F000, a única lima da peça. RA.

- Escurecimento: Oceano. RA.

### 12.9 Dimensões e limites dos textos

| Campo      | Referência                                | Status |
|------------|-------------------------------------------|--------|
| Título     | 40 caracteres                             | RA     |
| Período    | 32 caracteres                             | RA     |
| Condição   | 50 caracteres                             | RA     |
| Chamada    | 18 caracteres; padrão “Ver cotação”       | RA     |
| Tag        | Nome do tipo, de lista fechada            | RA     |
| Acomodação | Referência e forma (texto livre ou lista) | PEND   |

### 12.10 Elementos obrigatórios e opcionais

- Obrigatórios: foto, tipo, título, período e confirmação comercial. PR
  (ESP §11.3). Chamada: IT (faz parte da composição; padrão “Ver
  cotação”; poder removê-la: PEND).

- Opcionais: acomodação, condição. RA.

- Fixos: um só painel de vidro; cor da tag definida pelo tipo; sem campo
  de preço. RA.

- Confirmação comercial: registro de que datas, valores e condições
  foram conferidos; fica vinculada à exportação; alterar os dados
  comerciais a invalida. PR (ESP §11.4). Sem confirmação, bloqueia. PR
  (ESP §11.1).

### 12.11 Regras de enquadramento

RC-08. O painel ocupa a base: o assunto da foto deve ficar acima dele. O
painel não cobre rostos. Aviso de área inferior inadequada. PR.

### 12.12 Regras de escurecimento

Nível padrão intenso (60%), editável para nenhum ou suave. PR (ESP
§7.4). Zona: Feed de y ≈ 742,5 a 1350; Stories de y = 1056 a 1920.
Contraste do texto dentro do painel de vidro: PEND (PT-13).

### 12.13 Regras do logotipo

Não previsto. IT. Se habilitado, vale RC-06 e a posição de PT-01.

### 12.14 Comportamento quando o texto não couber

RC-09. Título e período são obrigatórios: se o painel não comportar o
conteúdo dentro da altura máxima, bloqueia. Condição e acomodação: aviso
(PT-06). O painel cresce para cima, a partir da base fixa. IT. Nunca
reduzir abaixo de 28 px (Feed) ou 32 px (Stories).

### 12.15 Regras de exportação

PNG opaco 1080 × 1350 ou 1080 × 1920 (RC-10). Bloqueio sem confirmação
comercial; a confirmação fica registrada junto da exportação. O painel
de vidro precisa ser validado visualmente em Chrome e Edge. PR (ESP
§7.8).

### 12.16 Pendências da ficha

Altura máxima e opacidade do painel · tamanhos de fonte · faixa do
título no painel · forma do campo acomodação · se a chamada pode ser
removida · SemiBold como negrito na tag Turquesa. Transversais: PT-02,
03, 04, 07, 13, 14, 15, 18, 19.

## 13. COM-02 · Encerramento com chamada

### 13.1 Identificação e finalidade

- ID COM-02 · Encerramento com chamada · Estrutura B (cartão). RA.

- Finalidade: fecho de toda sequência e “Reservas diretas” em uso
  pontual. RA (BIB §3). Último slide de S1 a S5, S6 (só em carrossel),
  S7 e S8. RA.

- “Reservas diretas” aparece só pontualmente, com a mensagem “Reserve
  direto com quem cuida da casa.”, sem selo nem elemento fixo. RA (BIB
  §6.4; MAN §8.1).

### 13.2 Formatos e dimensões

| Uso                        | Canvas      | Status                          |
|----------------------------|-------------|---------------------------------|
| Último slide de carrossel  | 1080 × 1350 | RA                              |
| Stories                    | 1080 × 1920 | RA                              |
| Tela final de Reel (1,5 s) | 1080 × 1920 | RA (BIB); duração PR (ESP §8.4) |

### 13.3 Estrutura visual

Fundo Espuma (ou Areia); logotipo centrado; mensagem curta abaixo;
pílula lima; linha “link na bio”. É o único template com texto centrado.
RA (BIB §6.4).

Conflito de fontes: o MAN §13 descreve a tela final do Reel como
logotipo e a linha “Reservas · link na bio” em Inter SemiBold e Oceano,
sem pílula; a BIB inclui a pílula lima. IT: vale a BIB (v0.2.1, define o
template). Confirmar (L-01).

### 13.4 Fundo e fotografia

Sem fotografia. Fundo Espuma \#F4FAF9 ou Areia \#EFE5CF. Em carrossel, o
mesmo fundo do restante da série; numa S6, Areia. IT.

### 13.5 Posições dos elementos

| Elemento | Feed (último slide) | Stories e tela final | Status |
|----|----|----|----|
| Eixo de centralização | x = 540 | x = 540 | RA (centrado); coordenada IT |
| Logotipo | Centrado em x = 540; largura até 40% (432 px) | Idem | RA (largura); posição vertical PEND |
| Mensagem | Centrada, abaixo do logotipo | Idem | RA; largura máxima PEND (IT: até 936) |
| Pílula | Centrada, abaixo da mensagem | Idem | IT |
| Linha de apoio | Centrada, abaixo da pílula | Idem | IT |
| Posição vertical do conjunto | PEND (se centrado na zona útil, o centro cai em y = 675) | PEND (centro em y = 915) | IT condicional |
| Indicador n/total (último slide de carrossel) | Direita em x = 1008; topo em y = 72 | Não se aplica | PT-08 |

Alerta: 40% de 1080 são 432 px, acima dos cerca de 420 px do arquivo do
logotipo (PT-09).

### 13.6 Margens e espaçamentos

Margens de RC-01 (Stories e Reels: topo 250 e base 340). Espaçamentos de
24, 48 ou 72 px; valores por par: PEND.

### 13.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Mensagem | Sora Bold (IT, nível Título) | PEND | PEND |
| Chamada | Sora Bold (PT-03) | PEND (mínimo 28 / 32) | IT |
| Linha de apoio | Inter SemiBold | PEND (mínimo 28 / 32) | Fonte RA (MAN §13); tamanho PEND |

### 13.8 Cores

Fundo Espuma ou Areia; texto Oceano \#0A4F60; pílula lima \#C6F000 com
texto Oceano; logotipo direto sobre o fundo claro. Um único lima. RA.

### 13.9 Dimensões e limites dos textos

| Campo          | Referência                            | Status   |
|----------------|---------------------------------------|----------|
| Mensagem       | Até 8 palavras                        | RA       |
| Chamada        | 18 caracteres; padrão “Reservar”      | RA       |
| Linha de apoio | Padrão “link na bio”; caracteres PEND | RA; PEND |
| Linhas         | PEND                                  | PEND     |

### 13.10 Elementos obrigatórios e opcionais

- Fixo e obrigatório: logotipo centrado de até 40% da largura. RA (BIB
  §12); IT (sem campo de desligar).

- Opcional: mensagem. Editáveis com padrão: chamada e linha de apoio. RA
  (BIB §6.4).

- Chamada vazia: PEND.

### 13.11 Regras de enquadramento

Não se aplicam.

### 13.12 Regras de escurecimento

Não se aplicam.

### 13.13 Regras do logotipo

Centrado, com largura de até 40% (432 px). Respiro de 25%: até 108 px de
cada lado. Direto sobre Espuma ou Areia. Sem tamanho mínimo diferente de
140 px. RA (RC-06). Em Reel não há logotipo na abertura, só na tela
final. RA (MAN §13).

### 13.14 Comportamento quando o texto não couber

RC-09. Mensagem opcional: aviso (PT-06). Chamada: bloqueia se não
couber. O conjunto não pode invadir as zonas livres de Stories e Reels
(topo 250, base 340). Quebra de linha de texto centralizado, equilíbrio
entre linhas: PEND (PT-18).

### 13.15 Regras de exportação

- PNG opaco 1080 × 1350 (último slide) ou 1080 × 1920 (Stories e tela
  final). RC-10.

- Tela final do Reel: PNG dentro do ZIP do Reel; a última entrada dos
  arquivos de tempo é reservada a ela, com duração de 1,5 s. PR (ESP
  §8.2, §8.6).

- Em S6 avulsa, o COM-02 não é usado. RA (BIB §7).

### 13.16 Pendências da ficha

L-01 pílula na tela final do Reel · posição vertical do conjunto ·
tamanho da mensagem · caracteres da linha de apoio · ampliação do
logotipo acima de 420 px. Transversais: PT-03, 05, 07, 08, 09, 18.

## 14. VID-01 · Capa de Reel

### 14.1 Identificação e finalidade

- ID VID-01 · Capa de Reel · Estrutura A (foto cheia, vertical). RA.

- É o FOT-01 em versão vertical, sem logotipo e sem chamada. RA (BIB
  §6.5).

- Finalidade: capas de Reels. Sequência S8. RA.

### 14.2 Formatos e dimensões

1080 × 1920, apenas Reels. RA. Foto pura em Reel não é oferecida no MVP.
PR (ESP D-03).

### 14.3 Estrutura visual

Quadro de fundo (foto ou frame), escurecimento Oceano, título e tag de
local opcional. Sem apoio, chamada ou logotipo. RA (BIB §6.5, §12).

### 14.4 Fundo e fotografia

- Quadro sangrado em todo o canvas. Pode ser uma foto ou um frame
  extraído externamente e importado como imagem, com o mesmo tratamento.
  RA (BIB §6.5); PR (ESP §8.3).

- Origem mínima sem ampliação: 1080 × 1920. IT.

- Faixa central 3:4: (0, 240)–(1080, 1680); o essencial fica dentro dela
  para sobreviver ao recorte do grid. RA.

### 14.5 Posições dos elementos

| Elemento | Posição | Status |
|----|----|----|
| Título | Dentro da faixa y de 240 a 1680 e acima de y = 1580; alinhado à esquerda em x = 72 | RA |
| Bloco de texto | Base em y = 1580; topo não menor que y = 250 (a zona útil de Stories é mais restritiva que a faixa 3:4) | IT |
| Largura do bloco | Até 650 px (herdada do FOT-01) | IT (PT-12) |
| Tag de local | x = 72; posição vertical dentro da faixa | PEND |

Conflito: o MAN §13 pede o título “no centro vertical” da capa, e a BIB
ancora o bloco embaixo à esquerda, acima de y = 1580. IT: vale a BIB
(v0.2.1). Confirmar (L-01).

### 14.6 Margens e espaçamentos

Laterais 72 px; topo 250 px; base 340 px. RA. Espaçamentos de 24, 48 ou
72 px; valores por par: PEND.

### 14.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Título | Sora Bold, caixa normal, esquerda | 80–104 px; entrelinha 1,05–1,10 | RA (BIB §8) |
| Tag de local | Inter SemiBold | PEND (mínimo 32) | Fonte RA; tamanho PEND |

### 14.8 Cores

Título em Espuma (PR) ou branco (PT-04). Tag em lima \#C6F000 só sobre
escurecimento (com nível Nenhum, a tag não pode ser lima; IT). Não há
pílula, então a tag é o único lima da peça. Escurecimento Oceano
\#0A4F60. RA.

### 14.9 Dimensões e limites dos textos

Título até 8 palavras (cerca de 48 caracteres), largura de 650 px,
linhas PEND. Tag de 28 caracteres, padrão “Praia do Rosa · SC”. RA.

### 14.10 Elementos obrigatórios e opcionais

Obrigatórios: quadro e título. PR (ESP §11.3). Opcionais: tag de local e
nível de escurecimento. RA.

### 14.11 Regras de enquadramento

RC-08. Assunto principal no centro, dentro da faixa 3:4. Texto fora de
rostos (PT-19). Prévia do recorte em Feed, Stories e Reels. RA.

### 14.12 Regras de escurecimento

Nível padrão suave (PR). Zona de y = 1056 a 1920: o bloco, com base em y
= 1580, fica sobre ela. IT. Contraste de 4,5:1 garantido antes do texto.
RA (PT-13).

### 14.13 Regras do logotipo

Sem logotipo. RA (BIB §6.5, §12).

### 14.14 Comportamento quando o texto não couber

RC-09. Título obrigatório: se o bloco não couber entre y = 250 e y =
1580, ou sair da faixa 3:4, bloqueia. A fonte não desce de 80 px. Tag
opcional: aviso.

### 14.15 Regras de exportação

PNG opaco 1080 × 1920, incluído no ZIP do Reel como capa. PR (ESP §8.2,
§9.1).

### 14.16 Pendências da ficha

L-01 centro vertical (MAN) contra âncora inferior (BIB) · posição da tag
· linhas do título · tamanho da tag. Transversais: PT-04, 05, 12, 13,
14, 18, 19.

## 15. VID-02 · Texto sobre vídeo

### 15.1 Identificação e finalidade

- ID VID-02 · Texto sobre vídeo · Estrutura A (foto cheia, vídeo). RA.

- Finalidade: apresentação de acomodações; experiências e localização,
  na sequência S8 (planos com VID-02). RA (BIB §3, §7). O que muda entre
  os dois Reels é o roteiro, não o template. RA.

- O MVP não renderiza vídeo: produz sobreposições em PNG transparente e
  arquivos de tempo para montagem em aplicativo externo. PR (ESP §8.1,
  §8.2).

### 15.2 Formatos e dimensões

| Uso | Dimensão | Status |
|----|----|----|
| Reels | 1080 × 1920 | RA |
| Stories com vídeo | 1080 × 1920, com as zonas de Stories | RA (BIB §12; ESP §6.4); fluxo de exportação PEND |
| Sobreposição exportada | PNG transparente de 1080 × 1920 por elemento | PR (ESP §8.5) |

### 15.3 Estrutura visual

Três elementos opcionais sobre o vídeo, nas mesmas âncoras dos demais
templates: título em Sora Bold embaixo à esquerda, acima de y = 1580;
legenda em pílula Oceano a 60% de opacidade com Inter SemiBold; tag de
local em lima. Sem logotipo. RA (BIB §6.5; MAN §13).

### 15.4 Fundo e fotografia

- O vídeo ou a imagem de fundo é externo ao gerador. A sobreposição
  contém só elementos gráficos, sem a foto. PR (ESP §8.5).

- O editor mostra uma prévia sobre a fotografia de referência. PR (ESP
  §8.5).

- Escurecimento “conforme o elemento de texto” (PR, ESP §7.4). Se o
  degradê entra no PNG de cada sobreposição: PEND (L-01).

### 15.5 Posições dos elementos

| Elemento | Posição | Status |
|----|----|----|
| Zona útil | (72, 250)–(1008, 1580) | RA (MAN §6); IT |
| Título | x = 72; base em y ≤ 1580; no máximo 2 linhas | RA |
| Largura do título | PEND (a BIB não repete os 650 px) | PEND |
| Legenda (pílula) | Posição e largura | PEND |
| Tag de local | Posição | PEND |
| Relação entre título, legenda e tag quando coexistem | Ordem e distâncias | PEND |

### 15.6 Margens e espaçamentos

Laterais 72 px; topo 250 px; base 340 px. RA. Espaçamentos de 24, 48 ou
72 px; valores por par: PEND.

### 15.7 Fontes e tamanhos

| Elemento | Fonte | Tamanho | Status |
|----|----|----|----|
| Título | Sora Bold | 80–104 px; entrelinha 1,05–1,10 | RA |
| Legenda | Inter SemiBold | PEND (mínimo 32) | Fonte RA; tamanho PEND |
| Tag de local | Inter SemiBold | PEND (mínimo 32) | Fonte RA; tamanho PEND |

### 15.8 Cores

Título em Espuma (PR) ou branco (PT-04). Legenda: pílula Oceano \#0A4F60
a 60% de opacidade; texto Espuma (IT). Tag em lima \#C6F000. A
legibilidade sobre vídeo em movimento não é garantida pelo gerador;
revisão humana. Contraste sobre a pílula a 60%: PEND (PT-13).

### 15.9 Dimensões e limites dos textos

| Campo | Limite | Status |
|----|----|----|
| Título | No máximo 2 linhas | RA |
| Legenda | 60 caracteres; no máximo 2 linhas por vez | RA |
| Tag | 28 caracteres | RA (BIB §4.3) |
| Tempo de cada texto na tela | De 1,5 a 3 s | RA (BIB); PR (ESP §8.4) |
| Duração total do Reel | De 7 a 30 s | RA (MAN §13) |
| Tela final | 1,5 s; nenhum texto passa do seu início | RA (MAN §13); PR (ESP §8.4) |
| Precisão dos tempos | PEND | PEND |

### 15.10 Elementos obrigatórios e opcionais

- Os três elementos são opcionais. RA. Pelo menos um elemento por
  entrada e tempos de entrada e saída: IT.

- Se uma entrada reúne vários elementos em um único PNG ou cada elemento
  gera o seu PNG: PEND. A ESP §8.5 diz “cada elemento”; o CSV tem uma
  coluna “texto” por entrada.

- Fixos: âncoras, fontes e cores. RA.

### 15.11 Regras de enquadramento

O texto nunca cobre rostos (RA); a verificação é humana, na prévia sobre
a foto de referência, com áreas protegidas opcionais (PT-19). Sem
logotipo.

### 15.12 Regras de escurecimento

Nível por elemento de texto: PEND. PR: título com escurecimento suave.
Zona de y = 1056 a 1920. Curva: PT-14.

### 15.13 Regras do logotipo

Sem logotipo. RA.

### 15.14 Comportamento quando o texto não couber

RC-09. Título com mais de 2 linhas, ou legenda com mais de 2 linhas, não
cabe: bloqueia a exportação da entrada. IT. Nunca reduzir abaixo de 32
px. A legenda não invade as zonas livres. Tempos fora de 1,5–3 s, texto
que invada a tela final ou sobreposição indevida: bloqueio ou aviso
conforme a regra de tempo (ESP §8.4). Definição de “sobreposição
indevida”: PEND.

### 15.15 Regras de exportação

- PNG transparente de 1080 × 1920 por elemento, sem fotografia. PR (ESP
  §8.5).

- CSV e JSON com número da entrada, nome do PNG, texto, início, término
  e duração; a última entrada é a tela final. PR (ESP §8.6).

- ZIP do Reel com capa, tela final, sobreposições e tempos. PR (ESP
  §9.1).

- Conferir halos e diferenças de transparência no aplicativo de vídeo
  externo. PR (ESP §8.5; R-17).

- Exportação em Stories com vídeo: PEND.

### 15.16 Pendências da ficha

L-01 escurecimento dentro do PNG · largura do título · posição de
legenda e tag · tamanhos de legenda e tag · unidade e precisão dos
tempos · entrada com vários elementos · exportação para Stories com
vídeo. Transversais: PT-04, 05, 07, 13, 14, 18, 19.

## 16. DES-01 · Capa de destaque

### 16.1 Identificação e finalidade

- ID DES-01 · Capa de destaque · Estrutura D (capa circular). RA.

- Finalidade: capas dos destaques do perfil. Fora das sequências. RA
  (BIB §12).

- Conjunto aprovado de seis capas. RA (BIB §6.6, §10):

| Destaque     | Modo  | Conteúdo      |
|--------------|-------|---------------|
| Acomodações  | Foto  | Foto circular |
| Tour virtual | Foto  | Foto circular |
| Praia        | Foto  | Foto circular |
| Avaliações   | Ícone | Estrela       |
| Como chegar  | Ícone | Localização   |
| Reservar     | Ícone | WhatsApp      |

### 16.2 Formatos e dimensões

1080 × 1080, exportado em PNG. RA (BIB §6.6); PR (ESP §9.1). O Instagram
recorta em círculo. RA.

### 16.3 Estrutura visual

Modo foto: foto circular com anel Turquesa. Modo ícone: ícone de linha
em Oceano sobre Espuma, com anel Turquesa. Sem logotipo. RA.

### 16.4 Fundo e fotografia

- Modo ícone: fundo Espuma \#F4FAF9. RA.

- Modo foto: a foto ocupa o círculo, com zoom, posição e ponto focal
  editáveis. RA (BIB §12).

- Fundo do quadrado fora do círculo: invisível após o recorte do
  Instagram. IT: Espuma, saída opaca. Confirmar.

- Origem mínima sem ampliação: diâmetro da foto × diâmetro da foto
  (diâmetro PEND, ver 16.5). IT.

### 16.5 Posições dos elementos

| Elemento | Posição | Status |
|----|----|----|
| Centro | (540, 540) | IT |
| Círculo inscrito | Raio 540 | RA |
| Círculo de segurança | Raio 440 (diâmetro 880; quadrado envolvente (100, 100)–(980, 980)) | RA (folga de 100 px); valores IT |
| Anel Turquesa | 24 px de espessura; posição em relação ao raio 440 | RA (24 px); posição PEND |
| Foto | Círculo concêntrico; diâmetro | PEND (IT: o anel inteiro cabe dentro do raio 440) |
| Ícone | Centrado em (540, 540); de 380 a 440 px | RA |
| Rótulo interno | Se é desenhado na arte; posição | PEND |

Caixa do ícone: com 380 px vai de (350, 350) a (730, 730); com 440 px,
de (320, 320) a (760, 760). Meia diagonal máxima 311 px, dentro do raio
de 440. IT.

### 16.6 Margens e espaçamentos

Não usa as margens de Feed nem de Stories: toda a composição respeita o
círculo de segurança de raio 440. RA (BIB §8). Espaçamento interno entre
ícone e anel: PEND.

### 16.7 Fontes e tamanhos

- Ícone: traço de 2 px em grade de 48 px. Se o desenho for ampliado
  proporcionalmente de 380 a 440 px, o traço vai de 15,8 a 18,3 px. IT.
  Traço proporcional ou fixo: PEND (PT-16).

- Rótulo interno: fonte e tamanho PEND (só se for desenhado). Os nomes
  de destaque têm no máximo 15 caracteres de referência. RA.

### 16.8 Cores

Anel Turquesa \#14B8CE; ícone Oceano \#0A4F60; fundo Espuma \#F4FAF9.
Sem lima e sem Sol. RA. O anel Turquesa sobre Espuma (2,2:1) é forma,
não texto, e é permitido. RA (MAN §3.2).

### 16.9 Dimensões e limites dos textos

Rótulo interno de referência de 15 caracteres, porque o Instagram corta
nomes longos. RA. Os seis nomes aprovados cabem: Acomodações (11), Tour
virtual (12), Praia (5), Avaliações (10), Como chegar (11), Reservar
(8). IT.

### 16.10 Elementos obrigatórios e opcionais

- Obrigatórios: modo; foto (modo foto) ou ícone (modo ícone). IT. Rótulo
  interno: PEND.

- Fixos: anel Turquesa de 24 px, círculo de segurança, ícone em Oceano
  de 380 a 440 px. RA (BIB §12).

- Ícones permitidos: apenas os do conjunto de 12 (estrela, localização e
  WhatsApp estão entre eles). RA.

### 16.11 Regras de enquadramento

RC-08 com destino circular. A foto precisa cobrir o círculo, e o ponto
focal fica dentro do círculo de segurança. IT. Fotos de pessoas só com
autorização (PT-19). Prévia com máscara circular. IT.

### 16.12 Regras de escurecimento

Não se aplicam.

### 16.13 Regras do logotipo

Não usa logotipo. RA (BIB §8).

### 16.14 Comportamento quando o texto não couber

Só há texto se o rótulo interno for desenhado (PEND). Nesse caso: acima
de 15 caracteres, aviso de nome possivelmente cortado pelo Instagram
(PT-06); nenhum texto sai do círculo de segurança; sem fonte abaixo de
28 px.

### 16.15 Regras de exportação

PNG 1080 × 1080 opaco (RC-10). Seis capas na Fase 4. PR (ESP §18).
Dependência: ícones de estrela, localização e WhatsApp ainda não
desenhados (PT-16).

### 16.16 Pendências da ficha

Significado do rótulo interno · posição do anel e diâmetro da foto ·
fundo fora do círculo · traço do ícone ampliado · folga entre ícone e
anel. Transversais: PT-16, 17, 19.

## 17. Decisões necessárias antes do desenvolvimento

Ordem sugerida, das que mais bloqueiam o layout para as que só refinam:

1.  **PT-01** · canto do logotipo por série. Afeta FOT-01 e todos os
    cartões.

2.  **PT-07** · dimensões da pílula, tags, painel de vidro, placa do
    logotipo, azulejo, círculo numerado e estrelas. Saem do protótipo de
    design.

3.  **PT-09** · verificação do logotipo (resolução, proporção, área
    transparente) e limite de ampliação.

4.  **PT-16** · desenho dos 12 ícones e das estrelas.

5.  **PT-10** e **PT-12** · tamanhos de fonte em conflito e largura do
    bloco de texto.

6.  **PT-13** e **PT-14** · método de contraste sobre foto e curva do
    degradê; calibração com fotos reais.

7.  **PT-08** · indicador n/total.

8.  **PT-02**, **PT-03**, **PT-04** · lima duplo em FOT-01, fonte da
    pílula, cor do texto sobre foto.

9.  Decisões locais: INS-01 em Stories (230 px de texto), VID-01 (centro
    vertical ou âncora inferior), COM-02 (pílula na tela final do Reel),
    VID-02 (escurecimento no PNG), DES-01 (rótulo interno).

10. Aprovação das propostas da ESP v0.3 usadas aqui como PR: níveis de
    escurecimento de 30% e 60%, padrões por template, bloqueio acima de
    1,00 de ampliação, formatos de exportação.

Nenhuma programação foi iniciada. Esta etapa fecha a lista de
coordenadas e dimensões da Fase 0 somente depois dessas decisões.
