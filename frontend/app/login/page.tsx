"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { api } from "@/lib/api";

const BENEFITS = [
  { icon: "shield" as const, text: "Cardano Wallet Integration (Eternl, Nami, Lace)" },
  { icon: "coin" as const,   text: "Role-based Access Control — Admin, L1, User" },
  { icon: "spark" as const,  text: "Automatische PKH-Ableitung aus der Wallet-Adresse" },
  { icon: "check" as const,  text: "JWT-gesicherte API-Kommunikation" },
];

const formVariants = {
  initial: { opacity: 0, x: 16, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit:    { opacity: 0, x: -16, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" as const } },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isRegister, setIsRegister] = useState(false);
  const [emailOrWallet, setEmailOrWallet] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    // ── Auth-Guard: schon eingeloggt → direkt zum Dashboard ──────
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      router.replace("/dashboard");
      return;
    }

    // URL-Parameter ?ref=TC-XXXXXX → Code vorausfüllen
    const ref = searchParams?.get("ref");
    if (ref) {
      setInviteCode(ref.toUpperCase());
      setIsRegister(true);
    }
  }, [router, searchParams]);

  async function detectWallet() {
    setError(null);
    try {
      const cardano = (window as any).cardano;
      if (!cardano?.eternl) {
        setError("Eternl Wallet nicht gefunden");
        return;
      }
      const walletApi = await cardano.eternl.enable();
      const addresses = await walletApi.getUsedAddresses();
      setWalletAddress(addresses[0] || (await walletApi.getChangeAddress()));
    } catch {
      setError("Wallet-Verbindung fehlgeschlagen");
    }
  }

  function persist(data: { token: string; userId: string; role: string; email: string }) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!walletAddress) {
          setError("Bitte Wallet-Adresse eingeben oder Auto-detect nutzen");
          setLoading(false);
          return;
        }
        const { pkh } = await api.getPkh(walletAddress);
        const data = await api.register({
          email: emailOrWallet,
          password,
          walletAddress,
          walletPkh: pkh,
          inviteCode: inviteCode.trim() || undefined,
        });
        persist(data);
        router.push("/dashboard");
      } else {
        const isWallet = emailOrWallet.startsWith("addr_");
        const data = await api.login(
          isWallet
            ? { walletAddress: emailOrWallet, password }
            : { email: emailOrWallet, password }
        );
        persist(data);
        router.push("/dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Verbindungsfehler");
    }

    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", background: "var(--bg)", color: "var(--t1)", overflow: "hidden" }}>

      {/* ── Left brand panel ─────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem 5rem", position: "relative", overflow: "hidden" }}>

        {/* Grid background */}
        <div className="grid-bg" />

        {/* Ambient orbs */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            top: -180,
            left: -180,
            filter: "blur(80px)",
            background: "radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            bottom: -120,
            right: -80,
            filter: "blur(80px)",
            background: "radial-gradient(circle, rgba(168,85,247,.14) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Giant watermark */}
        <div style={{
          position: "absolute",
          fontFamily: "var(--disp)",
          fontSize: 260,
          fontWeight: 700,
          color: "rgba(99,102,241,.03)",
          lineHeight: 1,
          bottom: -40,
          left: -20,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "-.06em",
        }}>
          TC
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo + theme toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3.5rem" }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "var(--grad)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "var(--disp)",
                  color: "#fff",
                  boxShadow: "0 2px 14px rgba(124,58,237,.5)",
                }}
              >
                T
              </motion.div>
              <span style={{ fontFamily: "var(--disp)", fontWeight: 700, fontSize: 15, letterSpacing: "-.02em", color: "var(--t1)" }}>
                TalentChain
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: "var(--vio)", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 18, display: "flex", alignItems: "center", gap: 7 }}
          >
            <span className="dot-live" /> Protocol v1.0
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "var(--disp)", fontSize: "clamp(2.6rem,4.5vw,3.75rem)", fontWeight: 700, lineHeight: 0.96, letterSpacing: "-.045em", marginBottom: 18 }}
          >
            <span className="text-grad">Welcome</span><br />
            <span style={{ color: "var(--t1)" }}>back.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.75, maxWidth: 380, marginBottom: "2.5rem" }}
          >
            Dezentrale Recruiting-Plattform auf Cardano. Verbinde deine Wallet und starte sofort.
          </motion.p>

          {/* Benefits list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--t2)" }}
              >
                <motion.span
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "var(--em-soft)",
                    border: "1px solid rgba(34,197,94,.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--em)",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={b.icon} size={13} strokeWidth={2.5} />
                </motion.span>
                {b.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 400,
          background: "var(--bg-elev)",
          borderLeft: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2.5rem 2.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow top-right */}
        <div style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 24, position: "relative", zIndex: 1 }}
        >
          <h3 style={{ fontFamily: "var(--disp)", fontSize: 20, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>
            {isRegister ? "Account erstellen" : "Einloggen"}
          </h3>
          <p style={{ fontSize: 12, color: "var(--t3)" }}>
            {isRegister ? "Registriere dich mit E-Mail und Wallet" : "Mit deinem Account oder deiner Wallet-Adresse"}
          </p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            display: "flex",
            background: "var(--bg-input)",
            borderRadius: 10,
            border: "1px solid var(--line)",
            padding: 3,
            marginBottom: 22,
            position: "relative",
            zIndex: 1,
          }}
        >
          {[{ label: "Login", reg: false }, { label: "Registrieren", reg: true }].map((t) => {
            const active = isRegister === t.reg;
            return (
              <button
                key={t.label}
                onClick={() => { setIsRegister(t.reg); setError(null); }}
                style={{
                  flex: 1,
                  padding: "8px",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "var(--disp)",
                  borderRadius: 7,
                  transition: "all .18s ease",
                  background: active ? "var(--grad)" : "transparent",
                  color: active ? "#fff" : "var(--t3)",
                  boxShadow: active ? "0 2px 10px rgba(99,102,241,0.3)" : "none",
                  position: "relative",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </motion.div>

        {/* Form fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? "register" : "login"}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1 }}
          >
            {/* Email */}
            <div>
              <label className="field-label">{isRegister ? "Email" : "Email oder Wallet-Adresse"}</label>
              <motion.input
                className="field"
                value={emailOrWallet}
                onChange={(e) => setEmailOrWallet(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder={isRegister ? "email@beispiel.ch" : "email@beispiel.ch oder addr_test1…"}
                animate={{
                  borderColor: focusedField === "email" ? "var(--vio)" : "var(--line)",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Passwort</label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
              />
            </div>

            {/* Register-only fields */}
            {isRegister && (
              <>
                <div>
                  <label className="field-label">Cardano Wallet-Adresse</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="field"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="addr_test1…"
                      style={{ fontFamily: "var(--mono)", fontSize: 11 }}
                    />
                    <motion.button
                      type="button"
                      className="btn btn-gho"
                      onClick={detectWallet}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ flexShrink: 0, fontSize: 10.5 }}
                    >
                      <Icon name="wallet" size={13} /> Auto
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label className="field-label">
                    Einladungscode
                    <span style={{ marginLeft: 6, fontSize: 8.5, color: "var(--t4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input
                    className="field"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="TC-XXXXXX"
                    style={{ fontFamily: "var(--mono)", letterSpacing: ".1em" }}
                    maxLength={9}
                  />
                  <p style={{ fontSize: 10.5, color: "var(--t4)", marginTop: 6, lineHeight: 1.5 }}>
                    {inviteCode
                      ? "Code wird bei der Registrierung geprüft und ist danach nicht mehr änderbar."
                      : "Ohne Code wirst du nicht in den Referral-Pool aufgenommen."}
                  </p>
                </div>
              </>
            )}

            {/* Error message */}
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
                    background: "var(--rd-soft)",
                    border: "1px solid rgba(239,68,68,.22)",
                    borderRadius: 9,
                    padding: "9px 12px",
                    fontSize: 11.5,
                    color: "var(--rd)",
                    overflow: "hidden",
                  }}
                >
                  <Icon name="x" size={13} strokeWidth={2.5} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              className="btn btn-pri"
              onClick={handleSubmit}
              disabled={loading || !emailOrWallet || !password}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: "100%", padding: "12px", marginTop: 4, fontSize: 13 }}
            >
              {loading ? <span className="spinner" /> : <Icon name="arrowRight" size={14} />}
              {loading ? "Bitte warten…" : isRegister ? "Account erstellen" : "Einloggen"}
            </motion.button>

            <Link href="/" style={{ textDecoration: "none", textAlign: "center", fontSize: 11.5, color: "var(--t3)", marginTop: 4, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t2)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
            >
              ← Zurück zur Startseite
            </Link>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <span className="spinner" style={{ width: 24, height: 24, borderColor: "var(--vio)", borderRightColor: "transparent" }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}