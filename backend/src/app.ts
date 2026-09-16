import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Example route
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

export default app;
