"use client";
// Wallet-Verbindung für die Startseite. Erkennt Eternl / Nami / Lace.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./ui/Icon";

interface WalletInfo {
  name: string;
  address: string;
}

export default function WalletConnect() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    setLoading(true);
    setError(null);
    try {
      const cardano = (window as any).cardano;
      if (!cardano) {
        setError("Keine Cardano Wallet gefunden. Bitte Eternl installieren.");
        setLoading(false);
        return;
      }
      let walletApi = null;
      let walletName = "";
      if (cardano.eternl)      { walletApi = await cardano.eternl.enable(); walletName = "Eternl"; }
      else if (cardano.nami)   { walletApi = await cardano.nami.enable();   walletName = "Nami"; }
      else if (cardano.lace)   { walletApi = await cardano.lace.enable();   walletName = "Lace"; }
      else {
        setError("Keine unterstützte Wallet gefunden (Eternl, Nami, Lace).");
        setLoading(false);
        return;
      }
      const addresses = await walletApi.getUsedAddresses();
      const address = addresses[0] || (await walletApi.getChangeAddress());
      setWallet({ name: walletName, address: address.slice(0, 18) + "…" + address.slice(-6) });
    } catch {
      setError("Wallet-Verbindung fehlgeschlagen.");
    }
    setLoading(false);
  }

  if (wallet) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 11,
          background: "var(--em-soft)",
          border: "1px solid rgba(34,197,94,.28)",
          borderRadius: 13,
          padding: "11px 18px",
          boxShadow: "0 4px 20px rgba(34,197,94,0.12)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 20 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
            background: "rgba(34,197,94,.18)",
            color: "var(--em)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check" size={16} strokeWidth={2.5} />
        </motion.div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--em)", fontFamily: "var(--disp)" }}>
            {wallet.name} verbunden
          </div>
          <div style={{ fontSize: 10.5, color: "var(--t3)", fontFamily: "var(--mono)" }}>
            {wallet.address}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11 }}>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--rd)",
              fontSize: 11.5,
              background: "var(--rd-soft)",
              border: "1px solid rgba(239,68,68,.22)",
              borderRadius: 9,
              padding: "8px 13px",
            }}
          >
            <Icon name="x" size={13} strokeWidth={2.5} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={connectWallet}
        disabled={loading}
        className="btn btn-pri btn-lg"
        whileHover={{ scale: 1.04, y: -2, boxShadow: "0 8px 28px rgba(99,102,241,0.5)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {loading ? <span className="spinner" /> : <Icon name="wallet" size={16} />}
        {loading ? "Verbinde…" : "Wallet verbinden"}
      </motion.button>
    </div>
  );
}