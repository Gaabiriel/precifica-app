// O PWA/cache offline foi desativado por enquanto (estava servindo telas
// antigas em cache durante o desenvolvimento). Este arquivo existe só para
// se auto-remover em qualquer navegador que ainda tenha a versão antiga
// instalada, e forçar essas abas a recarregar com a versão atual.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
      self.registration.unregister(),
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      }),
    ])
  );
});

self.addEventListener("fetch", () => {}); // não intercepta nada
