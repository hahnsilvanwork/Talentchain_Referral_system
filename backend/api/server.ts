import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import matchRoutes from "./routes/match";
import rewardRoutes from "./routes/rewards";
import adminRoutes from "./routes/admin";
import referralRoutes from "./routes/referral";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", network: process.env.CARDANO_NETWORK });
});

app.use("/api/auth", authRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/referral", referralRoutes);

app.listen(PORT, () => {
  console.log(`TalentChain Backend läuft auf Port ${PORT}`);
});

export default app;