import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// PWA/service worker desativado por enquanto: estava servindo telas antigas
// em cache (inclusive o HTML) e mascarando mudanças de verdade durante o
// desenvolvimento. Isso aqui garante que qualquer service worker/cache já
// instalado em algum navegador seja removido automaticamente na próxima
// visita, sem precisar o usuário limpar nada manualmente.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  if (window.caches) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
