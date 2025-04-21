const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const path = require("path");

const app = express();
const port = 3000;

// VAPID keys (generate once and keep them safe)
const publicVapidKey =
  "BGHwKtyoiyFqnh5yppXiwkdUplJsAMGYoB4ewH7zm-X_6eD5kCwf_08Ty6_ZtJ1gOHmhgDXBaJr94OV5B1gAJHk";
const privateVapidKey = "is7R3Kdv7LVQGnHEqrr4zkieBx5NyxgGk0z2GMGJInY";

// Configure web-push
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  publicVapidKey,
  privateVapidKey
);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve your PWA

// Store subscriptions in memory (in production use a database)
const subscriptions = [];

// 👉 Receive subscription from client
app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  // Avoid duplicate subscriptions
  const alreadySubscribed = subscriptions.find(
    (sub) => JSON.stringify(sub) === JSON.stringify(subscription)
  );
  if (!alreadySubscribed) {
    subscriptions.push(subscription);
    console.log("Subscription added:", subscription);
  }

  res.status(201).json({ message: "Subscribed successfully" });
});

// 👉 Send a push notification (e.g., via curl or Postman)
app.post("/notify", async (req, res) => {
  const payload = JSON.stringify({
    title: "📬 Nachricht!",
    body: "Dies ist eine serverseitige Push-Nachricht.",
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => {
        console.error("Push error:", err);
      })
    )
  );

  res.json({ message: "Push sent", results });
});

// Start server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
