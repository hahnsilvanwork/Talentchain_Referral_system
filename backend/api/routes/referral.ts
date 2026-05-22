import { Router, Request, Response } from "express";
import prisma from "../../prisma/client";

const router = Router();

// POST /api/referral/create — Referral-Beziehung erstellen
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { inviterId, inviteeId } = req.body;

    const existing = await prisma.referralRelation.findFirst({
      where: { inviteeId },
    });

    if (existing) {
      res.status(400).json({ error: "User bereits in Referral-Kette" });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    const relation = await prisma.referralRelation.create({
      data: {
        inviterId: inviterId || null,
        inviteeId,
        expiresAt,
      },
      include: {
        inviter: { select: { email: true, walletAddress: true, walletPkh: true } },
        invitee: { select: { email: true, walletAddress: true, walletPkh: true } },
      },
    });

    res.json({ success: true, relation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Fehler" });
  }
});

// GET /api/referral/chain/:userId — Kette eines Users abrufen
router.get("/chain/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params["userId"] as string;

    const allRelations = await prisma.referralRelation.findMany({
      include: {
        invitee: { select: { id: true, email: true, walletAddress: true, walletPkh: true } },
        inviter: { select: { id: true, email: true, walletAddress: true, walletPkh: true } },
      },
    });

    const chain: { layer: number; user: any; inviter: any }[] = [];
    let currentId: string | null = userId;

    for (let i = 0; i < 5; i++) {
      if (!currentId) break;
      const found = allRelations.find((r) => r.inviteeId === currentId);
      if (!found) break;
      chain.push({ layer: i, user: found.invitee, inviter: found.inviter });
      currentId = found.inviterId ?? null;
    }

    res.json({ chain, length: chain.length });
  } catch (error) {
    res.status(500).json({ error: "Server Fehler" });
  }
});

export default router;