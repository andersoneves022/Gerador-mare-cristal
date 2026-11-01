# Gerador de Conteúdo Visual · Cabanas Lobo do Mar

Versão 0.0.4 + Etapas 5, 6 e 7 (editor de artes com 13 templates, incluindo VID-01 e VID-02, exportação PNG/JPEG/ZIP; projetos salvos no IndexedDB). Aplicativo estático: HTML, CSS e módulos ES, sem build e sem dependências.

## Publicar
Arraste esta pasta (ou o ZIP) para https://app.netlify.com/drop. O arquivo `_headers` aplica a política de segurança.

## Fontes definitivas
Copie para `fonts/` os quatro arquivos WOFF2 com os nomes indicados em `fonts/LEIA-ME.txt`.

## Organização dos módulos
- `js/config.js`: constantes fixas (áreas, fontes, versão).
- `js/core/`: utilitários sem interface (DOM, fontes).
- `js/ui/`: shell, roteamento e uma view por área em `js/ui/views/`.
- `js/storage/`: toda a persistência (IndexedDB nativo).
  - `esquema.js` definição atual das stores e índices; `migracoes.js` criação física por versão (congeladas).
  - `banco.js` conexão, migrações, eventos e transações; `repositorio.js` única porta de leitura e gravação.
  - `erros.js`, `uuid.js`, `persistencia.js` (persistência e espaço), `estado.js` (estado para a interface), `index.js` (instância do app).
- `js/import/`, `js/biblioteca/`: importação e biblioteca de fotografias.
- `js/render/`: motor de composição (Canvas 2D) e fichas dos templates em `render/templates/`. Prévia e exportação usam o mesmo `compor()` + `desenhar()`.
- `js/projetos/`: persistência dos projetos. `js/ui/views/editor.js`: editor.
- Previsto: `js/export/`. A interface nunca acessa o IndexedDB diretamente: usa `repo`.

## Testar localmente
Na pasta do aplicativo: `python3 -m http.server 8000` e abra http://localhost:8000 no Chrome ou Edge (o IndexedDB exige localhost ou HTTPS; não abra o arquivo com duplo clique).
Testes automáticos (Python + Playwright + Pillow; as 4 fontes precisam estar em `public/fonts/`), com o servidor em execução:
`APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_etapa4.py` (e `teste_etapa5.py`, `teste_etapa6.py`).

## Regras de armazenamento (para permitir backup e restauração completos)
1. Toda a persistência passa por uma única camada, `js/storage/`.
2. Identificadores são UUIDs gerados no cliente, nunca sequenciais. Isso permite mesclar bibliotecas sem colisão.
3. Registros se referenciam apenas por id. Nunca se guardam URLs de blob nem objetos de runtime.
4. Originais, derivados (miniatura e cópia de trabalho, regeneráveis), metadados, projetos e configurações ficam em stores separados.
5. Todo registro leva `schemaVersion`; mudanças de esquema entram por migração versionada.
6. Nada de estado em localStorage; tudo o que precisa sobreviver está no IndexedDB e portanto entra no backup.
7. Coordenadas de enquadramento e de áreas protegidas são relativas à fotografia original.
