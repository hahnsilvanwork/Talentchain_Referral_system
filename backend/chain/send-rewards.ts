import { buildAndSubmitTx } from "./cardano-tx";
import dotenv from "dotenv";

dotenv.config();

export interface RewardPayment {
  address: string;
  lovelace: number;
  ada?: number;
}

/**
 * Konvertiert CHF zu Lovelace.
 *
 * FIX: Einheitliche Konvertierung für alle chain-Dateien.
 * Testnet: 1 CHF = 0.01 ADA, mindestens 1.5 ADA (Cardano Minimum UTxO).
 *
 * Dieselbe Logik wie in registration-bonus.ts — beide Dateien
 * müssen hier übereinstimmen damit Rewards konsistent sind.
 *
 * Für Produktion: echten ADA/CHF Kurs aus Oracle einbauen.
 */
export function chfToLovelace(chf: number): number {
  const CHF_TO_ADA = 0.01; // Testnet-Konvention: 1 CHF = 0.01 tADA
  const lovelace = Math.floor(chf * CHF_TO_ADA * 1_000_000);
  return Math.max(lovelace, 1_500_000); // min 1.5 ADA (Cardano minUTxO)
}

export async function sendRewards(
  payments: RewardPayment[],
  matchEventId: string
): Promise<string> {
  console.log(`Match Event: ${matchEventId}`);
  console.log("Payments:");
  payments.forEach((p) => {
    console.log(`  ${p.address}: ${p.lovelace} lovelace (${p.lovelace / 1_000_000} ADA)`);
  });

  const txHash = await buildAndSubmitTx(
    payments.map((p) => ({
      address: p.address,
      lovelace: p.lovelace,
    }))
  );

  return txHash;
}