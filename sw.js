self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  const data = event.data
    ? event.data.json()
    : { title: "No payload", body: "Empty message" };

  const options = {
    body: data.body || "Default body",
    icon: "icon.png",
    badge: "icon.png",
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Push Notification",
      options
    )
  );
});
