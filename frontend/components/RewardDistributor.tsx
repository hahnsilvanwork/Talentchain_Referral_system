"use client";

import { useState } from "react";

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

      // Change Adresse holen
      const changeAddress = await walletApi.getChangeAddress();

      // UTxOs holen
      const utxos = await walletApi.getUtxos();
      if (!utxos || utxos.length === 0) {
        setError("Keine UTxOs in Wallet gefunden");
        setLoading(false);
        return;
      }

      // Transaktion via Backend bauen
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
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Rewards verteilen</h3>
      <div className="mb-4">
        {payments.map((p, i) => (
          <div
            key={i}
            className="flex justify-between text-sm py-2 border-b border-slate-700"
          >
            <span className="text-slate-400 font-mono">
              {p.address.slice(0, 16)}...
            </span>
            <span className="text-green-400">{p.ada} ADA</span>
          </div>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        onClick={distributeRewards}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? "Verteile..." : "Rewards jetzt verteilen"}
      </button>
    </div>
  );
}