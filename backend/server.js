const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;

// VAPID keys
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

// Configure web-push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  publicVapidKey,
  privateVapidKey
);

// Allow requests only from your frontend origin
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN;

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["POST", "GET"],
    credentials: false,
  })
);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Store subscriptions in memory
let subscriptions = [];

// Receive subscription from client
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

// Unsubscribe from push notifications
app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  const index = subscriptions.findIndex((sub) => sub.endpoint === endpoint);

  if (index !== -1) {
    subscriptions.splice(index, 1);
    res.status(200).json({ message: "Unsubscribed successfully" });
  } else {
    res.status(404).json({ message: "Subscription not found" });
  }
});

// Display all subscriptions
app.get("/subscriptions", (req, res) => {
  res.json(subscriptions);
});

// Send a push notification
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
