// Service worker do Clube da Dra. Rô — notificações push
self.addEventListener('push', function (event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { title: 'Clube da Dra. Rô', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Clube da Dra. Rô';
  const options = {
    body: data.body || '',
    badge: '/favicon.ico',
    data: { url: data.url || '/home' },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/home';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
