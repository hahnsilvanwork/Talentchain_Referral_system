import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import { mintIdentityNft, hasIdentityNft } from "../../chain/mint-nft";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, walletAddress, walletPkh } = req.body;

    if (!email || !password || !walletAddress || !walletPkh) {
      res.status(400).json({ error: "Alle Felder erforderlich" });
      return;
    }

    // Prüfen ob User bereits existiert
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { walletAddress }] },
    });

    if (existing) {
      res.status(400).json({ error: "Account existiert bereits" });
      return;
    }

    // On-chain: NFT bereits vorhanden?
    const nftExists = await hasIdentityNft(walletAddress);
    if (nftExists) {
      res.status(400).json({ error: "Wallet hat bereits einen Identity NFT" });
      return;
    }

    // User in DB erstellen
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, walletAddress, walletPkh, role: "USER" },
    });

    // Identity NFT minting
    let nftTxHash: string | null = null;
    try {
      console.log(`Minting Identity NFT fuer ${email}...`);
      nftTxHash = await mintIdentityNft(walletAddress, walletPkh);
      console.log(`NFT Mint TX: ${nftTxHash}`);
    } catch (mintError) {
      console.error("NFT Minting fehlgeschlagen:", mintError);
      // User bleibt in DB aber ohne NFT — Admin kann manuell minen
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user.id,
      role: user.role,
      email: user.email,
      nftTxHash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Fehler" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, walletAddress, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(walletAddress ? [{ walletAddress }] : []),
        ],
      },
    });

    if (!user) {
      res.status(401).json({ error: "Ungültige Anmeldedaten" });
      return;
    }

    if (user.isBlacklisted) {
      res.status(403).json({ error: "Account gesperrt" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Ungültige Anmeldedaten" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({ token, userId: user.id, role: user.role, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Server Fehler" });
  }
});

export default router;