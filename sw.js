self.addEventListener("install", (event) => {
  console.log("Service Worker installiert.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker aktiviert.");
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.text() : "Push ohne Inhalt";
  event.waitUntil(
    self.registration.showNotification("Push-Nachricht", {
      body: data,
      icon: "/icon.png",
    })
  );
});
