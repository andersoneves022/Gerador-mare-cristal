import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gerador de Conteúdo Visual · Cabanas Lobo do Mar" },
      {
        name: "description",
        content:
          "Crie artes para Feed, Stories e Reels das Cabanas Lobo do Mar com as fotografias da biblioteca.",
      },
      { property: "og:title", content: "Gerador de Conteúdo Visual · Cabanas Lobo do Mar" },
      {
        property: "og:description",
        content: "Editor de artes para redes sociais das Cabanas Lobo do Mar, Praia do Rosa (SC).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

// O aplicativo usa IndexedDB, Canvas e roteamento por hash: só monta no navegador.
function Index() {
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    void import("../legacy/main.js").then((m) => m.iniciarApp(el));
  }, []);
  return <div id="app" ref={raiz} />;
}
