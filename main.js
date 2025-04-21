const publicVapidKey =
  "BGHwKtyoiyFqnh5yppXiwkdUplJsAMGYoB4ewH7zm-X_6eD5kCwf_08Ty6_ZtJ1gOHmhgDXBaJr94OV5B1gAJHk";

async function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function initPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Push messaging is not supported");
    return;
  }

  const registration = await navigator.serviceWorker.register("sw.js");
  console.log("Service Worker registered:", registration);

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.error("Notification permission not granted");
    return;
  }

  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: await urlBase64ToUint8Array(publicVapidKey),
    }));

  console.log("Push Subscription:", JSON.stringify(subscription));

  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

document.getElementById("subscribeButton").addEventListener("click", () => {
  initPush().catch((err) => console.error(err));
});
