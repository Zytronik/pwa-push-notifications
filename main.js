if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then((reg) => {
    console.log("Service Worker registered.", reg);
  });
}

document.getElementById("notifyBtn").addEventListener("click", async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("Danke, dass Sie Push aktiviert haben!");
  }
});
