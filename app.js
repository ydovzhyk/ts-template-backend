const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const googleRouter = require("./routes/api/google");

const { GOOGLE_CLIENT_SECRET } = process.env;

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));

const allowedOrigins = ["http://localhost:3000", "https://ydovzhyk.github.io"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));
// app.use(cors());

app.use(express.json());
app.use("/static", express.static("public")); // For access a file

app.use("/auth", authRouter);

app.use(
  "/google",
  session({
    secret: `${GOOGLE_CLIENT_SECRET}`,
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/google", googleRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  if (err.message.includes("Cast to ObjectId failed for value")) {
    return res.status(400).json({
      message: "id is invalid",
    });
  }
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).json({
      message: "Server error",
    });
  } else {
    return;
  }
});

module.exports = app;
