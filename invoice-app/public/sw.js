/* FacturaExterior no usa Service Worker.
 * Este archivo evita el 404 de probes del navegador (/sw.js) y, si alguna
 * vez se registrara por error, se desinstala al activarse.
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() =>
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if ('navigate' in client) {
            client.navigate(client.url);
          }
        }
      }),
    ),
  );
});
