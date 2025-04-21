// Register service worker early when the page loads
if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("sw.js")
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
}

// Function to convert the base64 public key into a uint8 array
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

// Function to initialize push notifications
async function initPush() {
  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.error("Notification permission not granted");
    return;
  }

  const publicVapidKey =
    "BGHwKtyoiyFqnh5yppXiwkdUplJsAMGYoB4ewH7zm-X_6eD5kCwf_08Ty6_ZtJ1gOHmhgDXBaJr94OV5B1gAJHk";

  // Get existing subscription or create a new one
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: await urlBase64ToUint8Array(publicVapidKey),
    }));

  console.log("Push Subscription:", JSON.stringify(subscription));

  await fetch("https://pwa-push-notifications-rosy.vercel.app/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Add event listener for button click to subscribe
document.getElementById("subscribeButton").addEventListener("click", () => {
  initPush().catch((err) => console.error(err));
});

// Add event listener for testing push notification
document.getElementById("sendPush").addEventListener("click", () => {
  const message = document.getElementById("pushMessage").value;
  if (!message) {
    alert("Message is required to send a push notification");
    return;
  }
  fetch("https://pwa-push-notifications-rosy.vercel.app/notify", {
    method: "POST",
    body: JSON.stringify({ message: message }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => console.log("Push sent:", data))
    .catch((err) => console.error("Push send error:", err));
});

window.onload = () => {};
