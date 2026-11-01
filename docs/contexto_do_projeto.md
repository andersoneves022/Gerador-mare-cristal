# CONTEXTO DO PROJETO — Gerador de Conteúdo Visual · Cabanas Lobo do Mar

Versão atual: **0.0.4** (editor). Base: ZIP 0.0.3. App estático em JavaScript puro (módulos ES, sem build), Canvas 2D, IndexedDB nativo. CSP: `style-src 'self'` (sem estilos inline; usar classes/CSSOM).

## Documentos de referência (aprovados)
Manual de Identidade Visual v0.2 · Biblioteca de Templates v0.2.1 · Fichas Técnicas (13 templates) · Especificação Funcional (decisões D-01 a D-07).

## Etapas
| Etapa | Estado |
|---|---|
| 1 Estrutura inicial | Concluída |
| 2 IndexedDB | Concluída |
| 3 Biblioteca de fotografias | Concluída; testes automáticos da etapa seguem incompletos (não há suíte da Etapa 3) |
| 4 Motor de composição + editor | Implementada na 0.0.4 (ver pendências) |
| 5 Exportação | Implementada: PNG/JPEG, carrossel, lote, ZIP (ver abaixo) |
| 6 Templates da Biblioteca | Concluída: INF-01, INF-02, INF-03, INF-04, INS-02, COM-01, COM-02 (A/B/C) e DES-01; listas editáveis (ver abaixo) |
| 7+ | VID-01 nova capa, VID-02, sequências, Reels em vídeo, IA (fora do escopo atual) |

## Arquitetura da Etapa 4
- `js/render/tokens.js`: cores, formatos (Feed 1080×1350, Stories e Reels 1080×1920), zonas, escurecimento, medidas provisórias dos componentes (PT-07).
- `js/render/texto.js`: medição, quebra e fitagem (passo 2 px; nunca abaixo do mínimo; nunca trunca).
- `js/render/enquadramento.js`: cobertura, zoom, janela. Coordenadas relativas ao original. **D-01 (revisada):** o zoom do usuário nunca amplia além de 1,00 (zoom máximo = 1/escala de cobertura); foto menor que o espaço não é bloqueada: recebe aviso conforme o nível de ampliação (ver "Ajuste D-01").
- `js/render/componentes.js`: título, apoio, linha, rótulo, tag de local, legenda, pílula lima, tag de tipo.
- `js/render/estruturas.js`: estrutura A (foto cheia, com painel de vidro opcional) e B (cartão, com corpos `grade-icones` e `encerramento`).
- `js/render/motor.js`: `compor(dados, recursos)` gera a cena (comandos + avisos + bloqueios); `desenhar(ctx, cena, recursos)` pinta. Mesmo caminho para prévia e exportação.
- `js/render/templates/*.js`: **fichas em dados** (12 templates: FOT-01, FOT-02, INS-01, INS-02, INF-01 a INF-04, COM-01, COM-02, VID-01, DES-01) + `index.js` (registro, na ordem da Biblioteca). Novo template = nova ficha + registro; sem novo editor.
- `js/render/icones.js`: 12 ícones de linha **provisórios** (pendentes de aprovação).
- `js/render/imagens.js`: foto de trabalho (≤ 2048 px) e logotipo; máx. 2 fotos decodificadas.
- `js/projetos/projetos.js`: criar, salvar, listar. Registro em `projetos` (sem mudar o esquema do banco): `templateId, formato, campos, fotoId, fotoIds, enquadramentos{feed|stories|reels:{zoom,cx,cy}}, estado, situacao, nome`. Sem imagens dentro do projeto.
- `js/ui/views/editor.js`, `criar.js`, `projetos.js`; `css/editor.css`. Rotas: `#/criar` (modelos), `#/criar/<id>` (editor), `#/projetos`.

## Decisões de implementação (valores provisórios para pendências das fichas)
Título: início no máximo da faixa. Logotipo: arquivo aparado 388 × 436, sem ampliação (COM-02 usa 388 px). Pílula: 88 px de altura, Sora Bold 36. Tag: Inter SemiBold 32. Painel de vidro: Espuma 78%, desfoque 24 px. FOT-01: padrão discreta, logotipo desligado na versão com chamada, chamada padrão "Ver cotação". COM-01: título 72–80 (Feed) / 80–88 (Stories). Tudo em `tokens.js` e nas fichas.

## Pendências conhecidas
1. **Fontes:** o ZIP não traz os WOFF2. Sem as 4 fontes em `fonts/` o editor bloqueia a renderização. Os testes desta entrega usaram Inter no lugar do Sora; **medidas de texto com o Sora real não foram verificadas**.
2. Exportação: carrossel é montado na tela Exportar (ordem = ordem de seleção); o projeto não guarda a lista de slides. O indicador n/total do FOT-02 continua sendo preenchido à mão em cada peça. Estado "Exportado" não é gravado (a exportação não altera o projeto).
3. Ícones provisórios; INF-01 depende da aprovação do conjunto.
4. Sem desfazer/refazer, duplicar, arquivar/excluir projeto, busca e filtros na lista, estado Pronto/Exportado/Publicado.
5. Sem detecção de área calma, contraste (PT-13), áreas protegidas, indicador n/total.
6. Painel de vidro usa `ctx.filter` (validado só em Chromium); conferir em Edge.
7. Template pendente: VID-02 (e a nova capa do VID-01). Não fazem parte da Etapa 6.
8. Testes da Etapa 3 seguem incompletos.

## Etapa 5 · Exportação
- `src/legacy/exportar/exportador.js`: `renderizarProjeto(p, 'png'|'jpeg')` usa `compor()` + `desenhar()` num canvas fora da tela nas dimensões exatas (Feed 1080×1350, Stories/Reels 1080×1920), sobre uma cópia do projeto normalizada como no editor (projetos 0.0.4 recebem os campos de `legado`). Espera as 4 fontes; peça com pendência não é exportada e o motivo aparece. JPEG com qualidade 0,95. Erros de memória/espaço viram mensagem clara.
- `exportar()`: processa uma peça por vez (uma imagem por vez em memória). Modos: **peças avulsas** (`<projeto>/<projeto>-<formato>.png`) e **carrossel** (`carrossel-<nome>/01-…`, `02-…` na ordem escolhida). Nomes sem acentos; repetidos ganham `-2`, `-3`.
- `src/legacy/exportar/zip.js`: ZIP STORE próprio, montado com Blobs (cada imagem lida só para o CRC e liberada); nada é gravado no IndexedDB.
- Tela `#/exportar` (e `#/exportar/<id>` a partir do botão Exportar do editor): seleção, modo, PNG/JPEG, ZIP ou arquivos separados, resumo com quantidade e nomes, progresso, conclusão/erros e botão de download.
- Correção: a troca de fotografia no editor grava na hora (antes esperava 500 ms), para a proteção contra exclusão valer imediatamente.

## Etapa 6 · Templates da Biblioteca e listas editáveis
- Registro (`render/templates/index.js`): INF-02, INF-03, INF-04, INS-02 e DES-01 entraram na lista de modelos; "Próximos modelos" mostra só o VID-02.
- Editor (`ui/views/editor.js`): `controleLista()` genérico, com adicionar, editar, remover e reordenar (↑/↓), respeitando `min`/`max` da ficha. Usado por:
  - campos `tipo: 'itens'` (ícone + texto, INF-01);
  - campos `tipo: 'lista'` com `subcampos` declarados na ficha (linhas rótulo/valor do INF-02, passos do INF-03).
  Cada lista grava no campo da própria ficha (`def.id`); antes a lista de itens lia e gravava sempre `campos.itens`, o que só funcionava no INF-01.
- As validações das fichas continuam valendo (quantidade fora da faixa, linhas/passos vazios, campos obrigatórios); os botões apenas evitam sair da faixa.
- DES-01: formato `destaque` 1080 × 1080, modos foto e ícone; exportação PNG/JPEG/ZIP nas dimensões exatas.
- Versões "Clássica" de FOT-01, INF-01, COM-01 e COM-02 preservadas; projetos sem `composicao` abrem nelas.

### Falhas antigas da Etapa 4.1 (investigadas e corrigidas)
- **FOT-02 C Stories:** a composição é foto sangrada em 1080 × 1920. A foto de teste (2400 × 1800) só preenche com ampliação de 107%; na época a D-01 bloqueava (desde o Ajuste D-01, gera só o aviso de ampliação leve). A validação não foi alterada: o teste agora confirma esse bloqueio e repete a verificação com uma foto de altura suficiente (3000 × 4000), que passa sem bloqueios.
- **FOT-01 B Feed e FOT-02 A Feed:** os testes esperavam um módulo Turquesa no encaixe entre a foto e o bloco de cor, ausente do layout. O usuário confirmou que o layout aprovado é **sem** o módulo; os layouts ficaram intactos e os testes passaram a verificar a geometria aprovada (foto até y = 800 / 1010 e bloco Areia / faixa Oceano a partir dali, sem módulo).

## Testes
Com o servidor de desenvolvimento em execução (`APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/`):
- `python3 testes/teste_etapa4.py` — 108 de 108 (motor, editor, composições 4.1, projetos 0.0.4, proteção da biblioteca; agora 13 templates).
- `python3 testes/teste_etapa5.py` — 129 de 129 (todas as **74** combinações em PNG, incluindo VID-02 Reels e Stories; antes 127 / 72 combinações template × composição × formato em PNG; JPEG; prévia = arquivo pixel a pixel; carrossel; lote; ZIP PNG e JPEG dos novos templates com o quadrado 1080 × 1080; projeto 0.0.4; preservação).
- `python3 testes/teste_etapa6.py` — 53 de 53 (lista de templates, listas editáveis, associação das listas ao template, INF-02/03/04, INS-02, DES-01, clássicas, projetos antigos, preservação).
- `python3 testes/teste_etapa7.py` — 85 de 85 (VID-01 e VID-02: registro, formatos, escurecimento, validações, D-01, reabertura, prévia = arquivo, PNG transparente do VID-02 sem fotografia, CSV/JSON de tempos, ZIP, preservação).

As 72 combinações: 27 da Etapa 5 (FOT-01 8, FOT-02 6, INS-01 6, INF-01 2, COM-01 2, COM-02 2, VID-01 1) + 18 da Etapa 6 parcial (A/B/C em INF-01, COM-01 e COM-02, mantendo as clássicas) + 27 da Etapa 6 final (INF-02, INF-03, INF-04 e INS-02 com 3 × 2 cada; DES-01 com 3 no quadrado). As 45 vistas antes eram as 27 + 18; o teste ainda esperava 27.

## Etapa 7 · VID-01 e VID-02 (concluída)
- Criar mostra os 13 templates; "Próximos modelos" vazio. VID-01 (capa de Reel, guias 3:4 e 4:5 só na prévia) e VID-02 (entradas com título, legenda, tag e tempos; PNG transparente 1080 × 1920 por entrada + CSV e JSON de tempos; foto só como referência).
- Nenhuma mudança no aplicativo para concluir a etapa: as falhas eram dos testes.
  - Os testes importam os módulos por URL (`APP_MODULOS`). No servidor atual o app roda como pacote único, então essa é outra instância dos módulos, sem fontes carregadas: `compor()` devolvia só o fundo com o bloqueio de fontes. Os testes 5, 6 e 7 agora carregam as 4 fontes nessa instância antes de começar (sem atrasos artificiais).
  - Leituras do projeto gravado logo após digitar agora esperam o status "Salvo" do editor (o salvamento tem 500 ms de espera).
  - Critério errado corrigido: o zoom máximo de um quadro 2400 × 4000 em 1080 × 1920 é limitado pela altura (4000 / 1920 ≈ 2,08), não pela largura.
  - Teste 4 atualizado de 12 para 13 templates.

## Copywriting com IA · Base de conhecimento
- Geração de textos no painel "Gerar textos com IA" do editor, pela Netlify Function `/api/copywriting` (mesma lógica na rota de prévia). Provedores: **OpenRouter** (principal, modelo `nvidia/nemotron-3.5-super-vl:free`) → **Cloudflare Workers AI** (único fallback, modelo `@cf/meta/llama-3.1-8b-instruct`, cota gratuita de 10.000 neurônios/dia na conta; sem cobrança automática). Uma tentativa por provedor; Gemini e Groq foram removidos.
- **Nenhuma fotografia é enviada à IA**: o painel não seleciona nem converte imagens, e o contrato rejeita pedidos com `fotos`. A geração usa objetivo (obrigatório), inspiração (opcional), observação sobre as imagens (opcional, digitada pelo usuário, até 500 caracteres), campos reais do template e a base de conhecimento. Funciona sem fotografia selecionada.
- `src/lib/base-conhecimento.server.ts`: **Base de Conhecimento — Cabanas Lobo do Mar v1.0**, transcrita integralmente em 15 seções. Seções 1, 11 e 15 ficam fora da geração. `selecionarConhecimento()` escolhe por palavras-chave (objetivo + inspiração) e por template somente os módulos relevantes (identidade, tom e regras vão sempre; COM-01 sempre leva comercial e sazonalidade) — meta ≈ 2.000 tokens de entrada. Editar a base = editar este arquivo (não há painel administrativo).
- `src/lib/copywriting-config.server.ts`: `INSTRUCOES` = regras fixas e compactas do gerador (tom, proibições, limites), sem repetir a base. A instrução de sistema (instruções + módulos selecionados) é **idêntica** nos dois provedores.
- Variáveis de ambiente (Netlify → Site configuration → Environment variables): `OPENROUTER_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`; `ALLOWED_ORIGINS` opcional. Nenhuma chave vai ao navegador (verificado em teste).
- Somente servidor: nenhum módulo de `src/legacy/` importa a base (verificado em teste).
- Conferência de fatos no servidor (`conferirFatos`), depois da validação do contrato: rejeita comodidade não confirmada (piscina, ar-condicionado, TV, Wi-Fi, toalhas etc., salvo em frase negativa), acesso fácil à praia a pé e valores em R$ que não estejam na base (700/100) nem nos dados do usuário. Rejeição = resposta inválida do provedor, e o pedido segue para o fallback.
- Emojis: a base permite poucos; nos campos da arte continuam proibidos, porque as fontes da marca não os desenham.
- INS-02 continua bloqueado para a IA (somente avaliações reais cadastradas).
- Testes (Vitest, sem navegador): `npx vitest run src/lib` (base carregada, seleção de módulos, mesmo contexto nos dois provedores, conferência de fatos, fallback OpenRouter → Cloudflare, nenhuma imagem no pedido, campos preenchidos). `testes/teste_ia.py` (Playwright) cobre o fluxo do editor sem fotografias, com o serviço simulado. A conexão real com OpenRouter e Cloudflare ainda não foi testada com credenciais válidas nesta etapa.

## Registro de versões
- 0.0.5 + Copywriting (2026-11-01): IA somente OpenRouter → Cloudflare Workers AI; fim do envio de fotografias e do consentimento de imagens; base de conhecimento modular selecionada por geração; Gemini e Groq removidos.
- 0.0.4 + Etapa 7 (2026-10-31): VID-01 e VID-02 concluídos e testados; 13 templates; 74 combinações de exportação; correções nos testes. Versão exibida no app mantida em `0.0.4 (editor)`.

## Ajuste D-01 · Flexibilização da regra de resolução fotográfica
Motivo: fotografias de 896 × 1193 px eram bloqueadas (ampliação acima de 100%) mesmo com prévia satisfatória.
- Nova regra (`render/enquadramento.js`: `nivelAmpliacao`, `MENSAGENS_AMPLIACAO`, `avisarAmpliacao`), aplicada em todos os templates fotográficos pelos dois pontos comuns (`estruturas.js` para estruturas A/B e `composicao.js` para composições com espaços de foto), sem exceções por template:
  - até 100%: sem aviso;
  - acima de 100% até 125%: aviso "Esta fotografia será ampliada para preencher o espaço. A qualidade poderá apresentar uma pequena redução.";
  - acima de 125% até 150%: aviso "Esta fotografia precisará de ampliação significativa. Verifique a nitidez do resultado.";
  - acima de 150%: aviso "A ampliação será elevada e poderá comprometer a nitidez. Confirme visualmente antes de exportar." e confirmação por peça antes da exportação.
- O cálculo não mudou: dimensões do ORIGINAL (`foto.largura/altura` gravadas na importação, não a cópia de trabalho), área real do espaço da foto (não o canvas inteiro quando a foto ocupa só parte), formato e enquadramento/zoom do usuário. O controle de zoom continua sem ampliar além do necessário para cobrir.
- Exportação (`exportar/exportador.js`): a cena traz `ampliacoesElevadas`; `exportar()` só gera peças com ampliação acima de 150% que estejam em `ampliacaoConfirmada`. A tela Exportar (`ui/views/exportar.js`) lista essas peças com uma caixa de confirmação por peça antes de gerar. Peças não confirmadas não saem; as demais seguem normalmente.
- Editor: a linha "Resolução usada" mostra o nível (ampliação leve / significativa / elevada) em vez de "bloqueada". Prévia e arquivo seguem o mesmo `compor()`/`desenhar()`; nenhum filtro ou nitidez artificial.
- Nada mudou em templates, fontes, cores, logotipo, enquadramentos gravados, IndexedDB ou IA.
- Testes: `testes/teste_ampliacao.py` (40 verificações: 896 × 1193 em FOT-01, FOT-02 e VID-01; os três níveis; INS-01; confirmação na função e na tela Exportar; prévia = arquivo; projeto antigo). As verificações de D-01 das Etapas 4 e 7 passaram a esperar aviso em vez de bloqueio.
