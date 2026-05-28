"use client";

import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import Icon from "@/components/ui/Icon";
import ThemeToggle from "@/components/ui/ThemeToggle";

const FEATURES = [
  {
    icon: "shield" as const,
    title: "On-chain Settlement",
    desc: "Alle Transaktionen laufen direkt über die Cardano Blockchain — unveränderlich, transparent und sofort nachvollziehbar.",
    accent: { bg: "rgba(99,102,241,.14)", fg: "var(--ind)", glow: "rgba(99,102,241,0.1)" },
  },
  {
    icon: "coin" as const,
    title: "Multi-Party Splits",
    desc: "Jede Recruiting-Fee wird automatisch auf Talent, Institution, Referrer und Plattform aufgeteilt.",
    accent: { bg: "var(--em-soft)", fg: "var(--em)", glow: "rgba(34,197,94,0.08)" },
  },
  {
    icon: "users" as const,
    title: "Role-Based Access",
    desc: "Differenzierte Berechtigungen für Admin, L1 Ambassador und User — sauber getrennt und sicher.",
    accent: { bg: "rgba(168,85,247,.14)", fg: "var(--pur)", glow: "rgba(168,85,247,0.1)" },
  },
];

const STATS = [
  { n: "4", l: "Szenarien" },
  { n: "ADA", l: "Native Token" },
  { n: "100%", l: "On-chain" },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div className="grid-bg" style={{ opacity: 0.6 }} />

      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          top: -180,
          left: -160,
          filter: "blur(80px)",
          background: "radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%)",
          animation: "drift 16s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          bottom: -140,
          right: -120,
          filter: "blur(80px)",
          background: "radial-gradient(circle, rgba(168,85,247,.14) 0%, transparent 70%)",
          animation: "drift 12s ease-in-out infinite",
          animationDelay: "-6s",
        }} />
        <div style={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          top: "45%",
          left: "52%",
          transform: "translate(-50%,-50%)",
          filter: "blur(80px)",
          background: "radial-gradient(circle, rgba(6,182,212,.08) 0%, transparent 70%)",
          animation: "drift 10s ease-in-out infinite",
          animationDelay: "-3s",
        }} />
      </div>

      {/* Nav */}
      <nav
        className="fade-up"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 40px",
          borderBottom: "1px solid var(--line)",
          background: "color-mix(in srgb, var(--bg-elev) 80%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
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
            boxShadow: "0 2px 14px rgba(124,58,237,.5), 0 0 0 1px rgba(168,85,247,.2)",
          }}>
            T
          </div>
          <span style={{
            fontFamily: "var(--disp)",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "-.02em",
            color: "var(--t1)",
          }}>
            TalentChain
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{
            fontSize: 10.5,
            fontFamily: "var(--mono)",
            color: "var(--t3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span className="dot-live" /> CARDANO PREPROD
          </span>

          <ThemeToggle />

          <Link href="/login" className="btn btn-gho btn-sm">Login</Link>
          <Link href="/dashboard" className="btn btn-pri btn-sm">Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5rem 2rem 4rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Live badge */}
        <div
          className="fade-up animate-border"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--em-soft)",
            border: "1px solid rgba(34,197,94,.22)",
            borderRadius: 100,
            padding: "6px 16px",
            fontSize: 10.5,
            fontFamily: "var(--mono)",
            color: "var(--em)",
            letterSpacing: ".1em",
            marginBottom: 28,
          }}
        >
          <span className="dot-live" /> CARDANO PREPROD TESTNET · LIVE
        </div>

        <p
          className="fade-up d1"
          style={{
            fontSize: 11,
            fontFamily: "var(--mono)",
            color: "var(--vio)",
            letterSpacing: ".22em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Decentralised Recruiting Protocol
        </p>

        <h1
          className="fade-up d2"
          style={{
            fontFamily: "var(--disp)",
            fontSize: "clamp(3rem,7vw,5.5rem)",
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-.045em",
            marginBottom: 24,
          }}
        >
          <span style={{ display: "block", color: "var(--t1)" }}>Talent trifft</span>
          <span className="text-grad" style={{ display: "block" }}>Blockchain.</span>
        </h1>

        <p
          className="fade-up d2"
          style={{
            fontSize: 15,
            color: "var(--t2)",
            lineHeight: 1.75,
            maxWidth: 500,
            margin: "0 auto 38px",
          }}
        >
          Transparente, automatisierte Recruiting-Vergütung auf der Cardano Blockchain.
          Keine Mittelsmänner. Keine Delays. Nur on-chain.
        </p>

        <div className="fade-up d3" style={{ marginBottom: 32 }}>
          <WalletConnect />
        </div>

        <div
          className="fade-up d3"
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginBottom: 56,
            flexWrap: "wrap",
          }}
        >
          <Link href="/login" className="btn btn-pri btn-lg">
            <Icon name="spark" size={15} /> Jetzt starten
          </Link>
          <Link href="/dashboard" className="btn btn-gho btn-lg">
            Dashboard ansehen <Icon name="arrowRight" size={15} />
          </Link>
        </div>

        {/* Stats bar */}
        <div
          className="fade-up d4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 1,
            background: "var(--line)",
            borderRadius: 14,
            overflow: "hidden",
            maxWidth: 480,
            width: "100%",
            border: "1px solid var(--line)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.l}
              className={`fade-up d${i + 2}`}
              style={{
                background: "var(--bg-card)",
                padding: "20px 12px",
                textAlign: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
            >
              <p className="text-grad" style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--disp)", letterSpacing: "-.03em" }}>
                {s.n}
              </p>
              <p style={{
                fontSize: 9.5,
                color: "var(--t3)",
                letterSpacing: ".14em",
                marginTop: 4,
                textTransform: "uppercase",
                fontFamily: "var(--mono)",
              }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 1,
          background: "var(--line)",
          borderTop: "1px solid var(--line)",
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`fade-up d${i + 1}`}
            style={{
              background: "color-mix(in srgb, var(--bg-card) 94%, transparent)",
              padding: "36px 38px",
              minHeight: 200,
              position: "relative",
              overflow: "hidden",
              cursor: "default",
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget.style.background = `color-mix(in srgb, var(--bg-hover) 96%, ${f.accent.glow})`);
            }}
            onMouseLeave={(e) => {
              (e.currentTarget.style.background = "color-mix(in srgb, var(--bg-card) 94%, transparent)");
            }}
          >
            {/* Feature glow */}
            <div style={{
              position: "absolute",
              top: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${f.accent.glow} 0%, transparent 70%)`,
              pointerEvents: "none",
              opacity: 0.6,
            }} />

            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: f.accent.bg,
              color: f.accent.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
              position: "relative",
              boxShadow: `0 0 0 1px ${f.accent.bg}`,
            }}>
              <Icon name={f.icon} size={18} />
            </div>

            <h3 style={{
              fontFamily: "var(--disp)",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-.02em",
              marginBottom: 10,
              color: "var(--t1)",
            }}>
              {f.title}
            </h3>

            <p style={{
              color: "var(--t2)",
              lineHeight: 1.72,
              fontSize: 12.5,
              maxWidth: 330,
            }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}