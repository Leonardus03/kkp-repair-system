import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import partRoutes from "./routes/partRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import qcRoutes from "./routes/qcRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sectionHeadRoutes from "./routes/sectionHeadRoutes.js";
import leaderRoutes from "./routes/leaderRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/repair", repairRoutes);
app.use("/api/qc", qcRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/section-head", sectionHeadRoutes);
app.use("/api/leader", leaderRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`[Server] Berjalan di http://localhost:${PORT}`),
  );
}

export default app;
