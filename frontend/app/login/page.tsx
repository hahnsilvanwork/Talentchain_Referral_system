"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Wallet,
} from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [emailOrWallet, setEmailOrWallet] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function detectWallet() {
    try {
      const cardano = (window as any).cardano;

      if (!cardano?.eternl) {
        setError("Eternl Wallet nicht gefunden");
        return;
      }

      const walletApi = await cardano.eternl.enable();
      const addresses = await walletApi.getUsedAddresses();
      const address = addresses[0] || (await walletApi.getChangeAddress());

      setWalletAddress(address);
    } catch {
      setError("Wallet Verbindung fehlgeschlagen");
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!walletAddress) {
          setError("Bitte Wallet Adresse eingeben oder Auto Detect nutzen");
          setLoading(false);
          return;
        }

        const pkhRes = await fetch("http://localhost:3001/api/admin/pkh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: walletAddress }),
        });

        const pkhData = await pkhRes.json();

        if (!pkhRes.ok) {
          setError("Ungültige Wallet Adresse");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:3001/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailOrWallet,
            password,
            walletAddress,
            walletPkh: pkhData.pkh,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registrierung fehlgeschlagen");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);

        router.push("/dashboard");
      } else {
        const isWalletAddress = emailOrWallet.startsWith("addr_");

        const res = await fetch("http://localhost:3001/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(isWalletAddress
              ? { walletAddress: emailOrWallet }
              : { email: emailOrWallet }),
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Login fehlgeschlagen");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);

        router.push("/dashboard");
      }
    } catch (err) {
      setError("Verbindungsfehler");
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <main className="tc-login-page">
      <div className="tc-login-bg" />

      <section className="tc-login-container">
        <div className="tc-login-left">
          <Link href="/" className="tc-login-brand">
            <div className="tc-login-logo">
              <Sparkles size={23} />
            </div>

            <div>
              <p className="tc-login-brand-title">TalentChain</p>
              <p className="tc-login-brand-subtitle">Web3 Referral Network</p>
            </div>
          </Link>

          <div className="tc-login-kicker">
            <ShieldCheck size={15} />
            Sicherer Dashboard Zugang
          </div>

          <h1 className="tc-login-title">
            Zugang zum <span>Referral Netzwerk.</span>
          </h1>

          <p className="tc-login-text">
            Melde dich mit E Mail oder Wallet Adresse an und verwalte deine
            TalentChain Aktivitäten, Match Events und Rewards.
          </p>

          <div className="tc-login-info-grid">
            <div className="tc-login-info-card">
              <div className="tc-login-info-icon cyan">
                <Wallet size={21} />
              </div>
              <div>
                <p className="tc-login-info-title">Cardano Wallet Ready</p>
                <p className="tc-login-info-text">
                  Registrierung mit Wallet Adresse und PKH Validierung für eine
                  saubere Web3 Identität.
                </p>
              </div>
            </div>

            <div className="tc-login-info-card">
              <div className="tc-login-info-icon violet">
                <UserRoundCheck size={21} />
              </div>
              <div>
                <p className="tc-login-info-title">Role Based Dashboard</p>
                <p className="tc-login-info-text">
                  Admins erhalten Zugriff auf User Verwaltung, Match Events,
                  Rollen und Reward Prozesse.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="tc-login-card">
          <div className="tc-login-card-header">
            <div className="tc-login-card-logo">
              <Sparkles size={27} />
            </div>

            <h2 className="tc-login-card-title">TalentChain</h2>

            <p className="tc-login-card-subtitle">
              {isRegister
                ? "Erstelle deinen Web3 Account"
                : "In dein Dashboard einloggen"}
            </p>
          </div>

          <div className="tc-login-tabs">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`tc-login-tab ${!isRegister ? "active" : ""}`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`tc-login-tab ${isRegister ? "active" : ""}`}
            >
              Registrieren
            </button>
          </div>

          <div className="tc-login-form">
            <div className="tc-login-field">
              <label>{isRegister ? "E Mail" : "E Mail oder Wallet Adresse"}</label>

              <div className="tc-login-input-wrap">
                <Mail className="tc-login-input-icon" size={18} />
                <input
                  type="text"
                  value={emailOrWallet}
                  onChange={(e) => setEmailOrWallet(e.target.value)}
                  className="tc-login-input"
                  placeholder={
                    isRegister
                      ? "email@beispiel.ch"
                      : "email@beispiel.ch oder addr_test1..."
                  }
                />
              </div>
            </div>

            <div className="tc-login-field">
              <label>Passwort</label>

              <div className="tc-login-input-wrap">
                <Lock className="tc-login-input-icon" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="tc-login-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegister && (
              <div className="tc-login-field">
                <label>Cardano Wallet Adresse</label>

                <div className="tc-login-wallet-row">
                  <div className="tc-login-input-wrap">
                    <Wallet className="tc-login-input-icon" size={18} />
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="tc-login-input"
                      placeholder="addr_test1..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={detectWallet}
                    className="tc-login-detect-btn"
                  >
                    Auto Detect
                  </button>
                </div>

                <p className="tc-login-help">
                  Manuell eingeben oder Eternl automatisch erkennen lassen.
                </p>
              </div>
            )}

            {error && <p className="tc-login-error">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="tc-login-submit"
            >
              {loading
                ? "Bitte warten..."
                : isRegister
                  ? "Account erstellen"
                  : "Einloggen"}
            </button>
          </div>

          <div className="tc-login-security">
            <div className="tc-login-security-item">
              <span className="tc-login-security-dot" />
              Login Daten werden lokal als Token gespeichert.
            </div>

            <div className="tc-login-security-item">
              <span className="tc-login-security-dot" />
              Wallet Adressen bleiben sichtbar nachvollziehbar.
            </div>
          </div>

          <div className="tc-login-back">
            <Link href="/">
              <ArrowLeft size={16} />
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}