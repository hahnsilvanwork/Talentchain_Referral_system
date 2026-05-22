import { Router, Request, Response } from "express";
import prisma from "../../prisma/client";
import { calculateFees, calculateRewards } from "../../chain/referral-traversal";
import { sendRewards, chfToLovelace } from "../../chain/send-rewards";

const router = Router();

router.post("/distribute", async (req: Request, res: Response) => {
  try {
    const { matchEventId } = req.body;

    const matchEvent = await prisma.matchEvent.findUnique({
      where: { id: matchEventId },
      include: { talent: true },
    });

    if (!matchEvent) {
      res.status(404).json({ error: "Match-Event nicht gefunden" });
      return;
    }

    if (matchEvent.status === "DISTRIBUTED") {
      res.status(400).json({ error: "Rewards bereits verteilt" });
      return;
    }

    // Echte Referral-Kette aus DB laden
    const allRelations = await prisma.referralRelation.findMany({
      include: {
        invitee: { select: { id: true, walletAddress: true, walletPkh: true } },
        inviter: { select: { id: true, walletAddress: true, walletPkh: true } },
      },
    });

    // Kette traversieren
    const chain: { walletPkh: string; inviterPkh: string | null; layer: number; walletAddress: string }[] = [];
    let currentId: string | null = matchEvent.talentId;

    for (let i = 0; i < 5; i++) {
      if (!currentId) break;
      const found = allRelations.find((r) => r.inviteeId === currentId);
      if (!found) break;
      chain.push({
        walletPkh: found.invitee.walletPkh,
        walletAddress: found.invitee.walletAddress,
        inviterPkh: found.inviter?.walletPkh ?? null,
        layer: i,
      });
      currentId = found.inviterId ?? null;
    }

    if (chain.length === 0) {
      res.status(400).json({ error: "Keine Referral-Kette gefunden für dieses Talent" });
      return;
    }

    // Rewards berechnen
    const rewards = calculateRewards(matchEvent.referrerPool, chain);

    // Payments mit echten Wallet-Adressen
    const payments = rewards.map((r, index) => ({
      address: chain[index]?.walletAddress || "",
      lovelace: Number(chfToLovelace(r.amount)),
      ada: r.amount,
    })).filter((p) => p.address !== "");

    // Echte Transaktion senden
    const txHash = await sendRewards(payments, matchEventId);

    await prisma.matchEvent.update({
      where: { id: matchEventId },
      data: { status: "DISTRIBUTED", txHash },
    });

    res.json({
      success: true,
      txHash,
      payments,
      chain: chain.map((c) => ({ layer: c.layer, walletAddress: c.walletAddress })),
      message: `Rewards verteilt! TX: ${txHash}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Fehler" });
  }
});

export default router;