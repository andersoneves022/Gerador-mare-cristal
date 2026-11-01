<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- The app is the original vanilla-JS ES-module app kept in `src/legacy/` and mounted client-side from `src/routes/index.tsx`; keep extending it there (DOM via `h()`, no innerHTML) rather than rewriting in React — why: preserves the tested render engine and its storage rules.
- Navigation inside the app is hash-based (`#/area/sub`) handled by `src/legacy/ui/router.js`; do not add TanStack routes for app areas — why: saved links and tests rely on hashes.
- All persistence goes through `src/legacy/storage/` (IndexedDB, local to the browser); no server database — why: single-device tool with planned backup/restore of the full local store.
- Fonts live in `public/fonts/` with the exact file names in `src/legacy/config.js`; logo in `public/assets/` — why: loaded by absolute URL from FontFace and the canvas engine.
- App styles live in `src/legacy/css/` and are imported at the top of `src/styles.css` — why: brand tokens are defined there.
- Browser tests: `APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_etapa4.py` — why: the original suite imports modules by URL.
- Export (`src/legacy/exportar/`) renders through the same `compor()`/`desenhar()` as the editor preview on a copy of the project and never writes to IndexedDB — why: exported files must match the preview and leave projects untouched.
- Export tests: `APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_etapa5.py`; Etapa 6 (templates, list controls): same env with `testes/teste_etapa6.py`.
- Editable lists in the editor go through `controleLista()` and always read/write the field named by the ficha (`def.id`) — why: lists must work in every template, not only INF-01.
- Original project docs are in `docs/` (Portuguese); brand manual, template library and technical sheets (binding references) are in `docs/referencia/`.
- Shared copywriting validation stays in the legacy JavaScript contract with an adjacent TypeScript declaration; server helpers consume that contract without changing compiler strictness — why: the editor and server must enforce identical rules while preserving the original app.
