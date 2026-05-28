import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import matchRoutes from "./routes/match";
import rewardRoutes from "./routes/rewards";
import adminRoutes from "./routes/admin";
import referralRoutes from "./routes/referral";
import { authMiddleware, adminMiddleware } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", network: process.env.CARDANO_NETWORK });
});

// Public routes — kein Token nötig
app.use("/api/auth", authRoutes);

// PKH-Ableitung: public, wird beim Registrieren gebraucht (noch kein Token)
app.post("/api/util/pkh", async (req: any, res: any) => {
  try {
    const { address } = req.body;
    if (!address) { res.status(400).json({ error: "Adresse fehlt" }); return; }
    const CSL = await import("@emurgo/cardano-serialization-lib-nodejs");
    const addr = CSL.Address.from_bech32(address);
    let pkh: string | undefined;
    const base = CSL.BaseAddress.from_address(addr);
    if (base) pkh = base.payment_cred().to_keyhash()?.to_hex();
    if (!pkh) {
      const ent = CSL.EnterpriseAddress.from_address(addr);
      if (ent) pkh = ent.payment_cred().to_keyhash()?.to_hex();
    }
    if (!pkh) { res.status(400).json({ error: "PKH nicht ableitbar" }); return; }
    res.json({ pkh });
  } catch (e: any) {
    res.status(400).json({ error: "Ungültige Adresse: " + e.message });
  }
});

// User routes — Token nötig
app.use("/api/match", authMiddleware, matchRoutes);
app.use("/api/rewards", authMiddleware, rewardRoutes);
app.use("/api/referral", authMiddleware, referralRoutes);

// Admin routes — Token + ADMIN Rolle nötig
app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);

app.listen(PORT, () => {
  console.log(`TalentChain Backend läuft auf Port ${PORT}`);
});

export default app;