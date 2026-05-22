"use client";

import { useState } from "react";
import GradientButton from "./GradientButton";
import GlassCard from "./GlassCard";

interface Payment {
  address: string;
  lovelace: number;
  ada: number;
}

interface RewardDistributorProps {
  matchEventId: string;
  payments: Payment[];
  onSuccess: (txHash: string) => void;
}

export default function RewardDistributor({
  matchEventId,
  payments,
  onSuccess,
}: RewardDistributorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function distributeRewards() {
    setLoading(true);
    setError(null);

    try {
      const cardano = (window as any).cardano;
      if (!cardano?.eternl) {
        setError("Eternl Wallet nicht gefunden");
        setLoading(false);
        return;
      }

      const walletApi = await cardano.eternl.enable();
      const utxos = await walletApi.getUtxos();

      if (!utxos || utxos.length === 0) {
        setError("Keine UTxOs in Wallet gefunden");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:3001/api/rewards/distribute",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchEventId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Fehler beim Verteilen");
        setLoading(false);
        return;
      }

      onSuccess(result.txHash);
    } catch (err) {
      console.error(err);
      setError("Transaktion fehlgeschlagen");
    }

    setLoading(false);
  }

  return (
    <GlassCard className="p-6">
      <h3 className="mb-4 text-xl font-black text-white">Rewards verteilen</h3>

      <div className="mb-5 space-y-3">
        {payments.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          >
            <span className="font-mono text-slate-400">
              {p.address.slice(0, 16)}...
            </span>
            <span className="font-bold text-emerald-300">{p.ada} ADA</span>
          </div>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      <GradientButton
        onClick={distributeRewards}
        disabled={loading}
        variant="success"
        className="w-full"
      >
        {loading ? "Verteile..." : "Rewards jetzt verteilen"}
      </GradientButton>
    </GlassCard>
  );
}