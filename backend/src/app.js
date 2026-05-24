import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";
import logger from "morgan"

const app = express();


app.use(logger('dev'))
app.use(cors({
  origin: [
    "https://aiasistent1.netlify.app",
    "https://aichatasistant.onrender.com",
    process.env.CLIENT_URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok"
  });
});

app.use("/api/chat", chatRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
export default app;
