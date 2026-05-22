import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GitBranchPlus,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

export default function Home() {
  return (
    <main className="tc-home">
      <div className="tc-home-bg" />

      <div className="tc-home-container">
        <nav className="tc-home-nav tc-panel">
          <Link href="/" className="tc-home-brand">
            <div className="tc-home-logo">
              <GitBranchPlus size={22} />
            </div>

            <div>
              <p className="tc-home-brand-title">TalentChain</p>
              <p className="tc-home-brand-subtitle">Web3 Referral Platform</p>
            </div>
          </Link>

          <div className="tc-home-nav-actions">
            <Link href="/login" className="tc-home-btn tc-home-btn-secondary">
              Login
            </Link>

            <Link href="/dashboard" className="tc-home-btn tc-home-btn-primary">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </div>
        </nav>

        <section className="tc-home-hero">
          <div>
            <div className="tc-home-kicker">
              <Sparkles size={15} />
              Cardano Web3 Referral System
            </div>

            <h1 className="tc-home-title">
              Faire Referral Rewards für{" "}
              <span>Talente, Firmen und Schulen.</span>
            </h1>

            <p className="tc-home-text">
              TalentChain verbindet Recruiting, Blockchain Transparenz und
              automatische Reward Verteilung in einer modernen Web3 Plattform.
            </p>

            <div className="tc-home-cta-row">
              <Link href="/login" className="tc-home-btn tc-home-btn-primary">
                Jetzt starten
                <ArrowRight size={17} />
              </Link>

              <Link href="/dashboard" className="tc-home-btn tc-home-btn-secondary">
                Dashboard öffnen
              </Link>
            </div>

            <div className="tc-home-stats">
              <div className="tc-home-stat">
                <p className="tc-home-stat-value">L1</p>
                <p className="tc-home-stat-label">Ambassador Layer</p>
              </div>

              <div className="tc-home-stat">
                <p className="tc-home-stat-value">ADA</p>
                <p className="tc-home-stat-label">Cardano Rewards</p>
              </div>

              <div className="tc-home-stat">
                <p className="tc-home-stat-value">100%</p>
                <p className="tc-home-stat-label">Nachvollziehbar</p>
              </div>
            </div>
          </div>

          <aside className="tc-home-card">
            <div className="tc-home-card-header">
              <p className="tc-home-card-kicker">Plattform</p>

              <h2 className="tc-home-card-title">Web3 Recruiting Flow</h2>

              <p className="tc-home-card-text">
                Vom Referral bis zur Reward Auszahlung bleibt jeder Schritt klar
                strukturiert, sichtbar und überprüfbar.
              </p>
            </div>

            <div className="tc-home-flow">
              <div className="tc-home-flow-item">
                <div className="tc-home-flow-icon cyan">
                  <Wallet size={21} />
                </div>

                <div>
                  <p className="tc-home-flow-title">Wallet verbinden</p>
                  <p className="tc-home-flow-text">
                    Eternl, Nami oder Lace als Einstieg.
                  </p>
                </div>
              </div>

              <div className="tc-home-flow-item">
                <div className="tc-home-flow-icon violet">
                  <GitBranchPlus size={21} />
                </div>

                <div>
                  <p className="tc-home-flow-title">Referral Chain</p>
                  <p className="tc-home-flow-text">
                    Mehrstufige Empfehlungslogik mit klaren Rollen.
                  </p>
                </div>
              </div>

              <div className="tc-home-flow-item">
                <div className="tc-home-flow-icon green">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <p className="tc-home-flow-title">Rewards verteilen</p>
                  <p className="tc-home-flow-text">
                    Automatisierte Auszahlung pro Match Event.
                  </p>
                </div>
              </div>

              <div className="tc-home-flow-item">
                <div className="tc-home-flow-icon blue">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="tc-home-flow-title">Admin Control</p>
                  <p className="tc-home-flow-text">
                    Rollen, Sperrungen und Match Events verwalten.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="tc-home-bottom-grid">
          <div className="tc-home-feature">
            <div className="tc-home-feature-icon cyan">
              <Wallet size={20} />
            </div>
            <h3 className="tc-home-feature-title">Wallet First</h3>
            <p className="tc-home-feature-text">
              Die Plattform ist auf Cardano Wallets und nachvollziehbare
              Transaktionen ausgelegt.
            </p>
          </div>

          <div className="tc-home-feature">
            <div className="tc-home-feature-icon violet">
              <GitBranchPlus size={20} />
            </div>
            <h3 className="tc-home-feature-title">Referral Network</h3>
            <p className="tc-home-feature-text">
              Empfehlungen werden strukturiert abgebildet und können sauber
              ausgewertet werden.
            </p>
          </div>

          <div className="tc-home-feature">
            <div className="tc-home-feature-icon green">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="tc-home-feature-title">Reward Logic</h3>
            <p className="tc-home-feature-text">
              Rewards werden pro Match Event berechnet, geprüft und verteilt.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}