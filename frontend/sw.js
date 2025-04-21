self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.", event);

  const data = event.data.json();

  console.log("[Service Worker] Push data received:", data);

  const options = {
    body: data.body,
    icon: "icon.png",
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Push Notification",
      options
    )
  );
});
