const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const path = require("path");
const cors = require("cors");

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

// Allow requests only from your frontend origin
app.use(
  cors({
    origin: "https://omaroberholzer.com",
    methods: ["POST", "GET"],
    credentials: false,
  })
);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve your PWA

// Store subscriptions in memory (in production use a database)
let subscriptions = [];

// 👉 Receive subscription from client
app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  // Avoid duplicate subscriptions
  const alreadySubscribed = subscriptions.find(
    (sub) => JSON.stringify(sub) === JSON.stringify(subscription)
  );
  if (!alreadySubscribed) {
    subscriptions.push(subscription);
  }

  res.status(201).json({ message: "Subscribed successfully" });
});

// 👉 Unsubscribe from push notifications
app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  const index = subscriptions.findIndex((sub) => sub.endpoint === endpoint);

  if (index !== -1) {
    // Remove the subscription
    subscriptions.splice(index, 1);
    console.log("Unsubscribed:", endpoint);
    res.status(200).json({ message: "Unsubscribed successfully" });
  } else {
    console.log("Subscription not found:", endpoint);
    res.status(404).json({ message: "Subscription not found" });
  }
});

// 👉 Display all subscriptions (for the dashboard)
app.get("/subscriptions", (req, res) => {
  res.json(subscriptions);
});

// 👉 Send a push notification
app.post("/notify", async (req, res) => {
  const payload = JSON.stringify({
    title: "📬 Nachricht!",
    body: req.body.message || "Dies ist eine serverseitige Push-Nachricht.",
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

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
