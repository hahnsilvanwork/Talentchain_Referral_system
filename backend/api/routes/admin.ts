import { Router, Request, Response } from "express";
import prisma from "../../prisma/client";
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

const router = Router();

// GET /api/admin/users
router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        walletAddress: true,
        walletPkh: true,
        role: true,
        isBlacklisted: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server Fehler" });
  }
});

// PUT /api/admin/user/:id
router.put("/user/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const { walletPkh, role, isBlacklisted } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(walletPkh && { walletPkh }),
        ...(role && { role }),
        ...(isBlacklisted !== undefined && { isBlacklisted }),
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Server Fehler" });
  }
});

// POST /api/admin/pkh
router.post("/pkh", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    const addr = CSL.Address.from_bech32(address);
    const baseAddr = CSL.BaseAddress.from_address(addr);
    const pkh = baseAddr?.payment_cred().to_keyhash()?.to_hex();
    if (!pkh) {
      res.status(400).json({ error: "PKH nicht gefunden" });
      return;
    }
    res.json({ pkh });
  } catch {
    res.status(400).json({ error: "Ungueltige Adresse" });
  }
});

// POST /api/admin/make-l1/:id — User zu L1 Ambassador machen
router.post("/make-l1/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: "User nicht gefunden" });
      return;
    }

    // Rolle auf L1_AMBASSADOR setzen
    await prisma.user.update({
      where: { id },
      data: { role: "L1_AMBASSADOR" },
    });

    // Referral-Beziehung erstellen (kein Inviter = Root)
    const existing = await prisma.referralRelation.findFirst({
      where: { inviteeId: id },
    });

    if (!existing) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 2);
      await prisma.referralRelation.create({
        data: { inviterId: null, inviteeId: id, expiresAt },
      });
    }

    res.json({
      success: true,
      message: `${user.email} ist jetzt L1 Ambassador`,
      userId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Fehler" });
  }
});

// POST /api/admin/blacklist/:id — User sperren
router.post("/blacklist/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const user = await prisma.user.update({
      where: { id },
      data: { isBlacklisted: true },
    });

    res.json({ success: true, message: `${user.email} gesperrt` });
  } catch (error) {
    res.status(500).json({ error: "Server Fehler" });
  }
});

// POST /api/admin/unblacklist/:id — User entsperren
router.post("/unblacklist/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const user = await prisma.user.update({
      where: { id },
      data: { isBlacklisted: false },
    });

    res.json({ success: true, message: `${user.email} entsperrt` });
  } catch (error) {
    res.status(500).json({ error: "Server Fehler" });
  }
});

export default router;