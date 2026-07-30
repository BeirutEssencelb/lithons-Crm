import { writeFileSync } from "fs";

const source = `self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "LITHOS CRM",
    body: "You have an update",
    url: "/leads",
  };

  try {
    if (event.data) {
      const data = event.data.json();
      payload = {
        title: data.title || payload.title,
        body: data.body || payload.body,
        url: data.url || payload.url,
      };
    }
  } catch (e) {
    try {
      const text = event.data && event.data.text();
      if (text) payload.body = text;
    } catch (_) {}
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: payload.url },
      tag: "lithos-crm-" + payload.url,
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/leads";
  const absolute = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      function (clients) {
        for (var i = 0; i < clients.length; i++) {
          var client = clients[i];
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) return client.navigate(absolute);
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(absolute);
        }
      }
    )
  );
});
`;

writeFileSync("public/sw.js", source);
console.log("wrote public/sw.js");
