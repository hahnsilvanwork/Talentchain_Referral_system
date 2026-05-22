"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  Gift,
  GitBranchPlus,
  Home,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  MoreVertical,
  Plus,
  Settings,
  ShieldCheck,
  Unlock,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

interface MatchEvent {
  id: string;
  annualSalary: number;
  scenario: string;
  totalFee: number;
  referrerPool: number;
  institutionAmount: number;
  talentAmount: number;
  platformAmount: number;
  status: string;
  createdAt: string;
  talent: { email: string; walletAddress: string };
}

interface User {
  id: string;
  email: string;
  walletAddress: string;
  walletPkh: string;
  role: string;
  isBlacklisted: boolean;
  createdAt: string;
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-[14%] top-[-16%] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[10%] top-[2%] h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute right-[-8%] top-[10%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[12%] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-3xl" />
    </div>
  );
}

function SidebarItem({
  label,
  active = false,
  icon,
}: {
  label: string;
  active?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button className={`tc-nav-item ${active ? "active" : ""}`}>
      <span className="tc-nav-icon">{icon}</span>
      <span className="text-[15px] font-semibold">{label}</span>
    </button>
  );
}

function Sparkline({
  color = "#22d3ee",
  area = "rgba(34, 211, 238, 0.08)",
  points,
}: {
  color?: string;
  area?: string;
  points: string;
}) {
  return (
    <svg viewBox="0 0 240 40" className="tc-stat-chart w-full">
      <path
        d={`M0,40 ${points} L240,40 Z`}
        fill={area}
      />
      <path
        d={points}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  colorClass,
  cardClass,
  chart,
  animationClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint: string;
  colorClass: string;
  cardClass: string;
  chart: React.ReactNode;
  animationClass?: string;
}) {
  return (
    <div
      className={`tc-panel tc-panel-outline tc-soft-hover tc-stat-card rounded-[24px] ${cardClass} ${animationClass || ""}`}
    >
      <div className="tc-stat-top">
        <div className={`tc-stat-icon ${colorClass}`}>{icon}</div>
        <div className="min-w-0">
          <p className="tc-stat-label">{label}</p>
          <p className="tc-stat-value">{value}</p>
          <p className="tc-stat-hint">{hint}</p>
        </div>
      </div>
      {chart}
    </div>
  );
}

function SectionTitle({
  icon,
  kicker,
  title,
  text,
}: {
  icon?: React.ReactNode;
  kicker: string;
  title: string;
  text?: string;
}) {
  return (
    <div>
      <div className="tc-section-kicker">
        {icon}
        <span>{kicker}</span>
      </div>
      <h2 className="tc-section-title">{title}</h2>
      {text ? <p className="tc-section-text">{text}</p> : null}
    </div>
  );
}

function UserAvatar({ email }: { email: string }) {
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();
  return <div className="tc-avatar">{initials}</div>;
}

function formatCHF(value: number) {
  return `CHF ${value.toLocaleString("de-CH")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("de-CH");
}

function formatScenario(value: string) {
  return value.replace(/_/g, " ");
}

export default function DashboardPage() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  const [showUsers, setShowUsers] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [distributeLoading, setDistributeLoading] = useState(false);

  const [talentId, setTalentId] = useState("");
  const [annualSalary, setAnnualSalary] = useState("");
  const [scenario, setScenario] = useState("CH_LEHRE_WITH_TRAINING");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("email") || "";
    const role = localStorage.getItem("role") || "";
    const token = localStorage.getItem("token") || "";

    setUserEmail(email);
    setUserRole(role);

    fetch("http://localhost:3001/api/match/events", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (role === "ADMIN") {
      fetch("http://localhost:3001/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, []);

  const totalFees = useMemo(
    () => events.reduce((sum, event) => sum + event.totalFee, 0),
    [events]
  );

  const referrerPool = useMemo(
    () => events.reduce((sum, event) => sum + event.referrerPool, 0),
    [events]
  );

  const distributedEvents = useMemo(
    () => events.filter((event) => event.status === "DISTRIBUTED").length,
    [events]
  );

  async function createMatchEvent() {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch("http://localhost:3001/api/match/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          talentId,
          annualSalary: parseFloat(annualSalary),
          scenario,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Fehler beim Erstellen");
        setCreateLoading(false);
        return;
      }

      setCreateSuccess("Match Event erstellt");
      setTalentId("");
      setAnnualSalary("");
      window.location.reload();
    } catch {
      setCreateError("Verbindungsfehler");
    }

    setCreateLoading(false);
  }

  async function distributeRewards(matchEventId: string) {
    setDistributeLoading(true);

    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch("http://localhost:3001/api/rewards/distribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchEventId }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Rewards verteilt! TX: ${data.txHash}`);
        setSelectedEvent(null);
        window.location.reload();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch {
      alert("Verbindungsfehler");
    }

    setDistributeLoading(false);
  }

  async function makeL1(userId: string, email: string) {
    setActionLoading(userId);

    try {
      const res = await fetch(
        `http://localhost:3001/api/admin/make-l1/${userId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.success) {
        alert(`${email} ist jetzt L1 Ambassador`);
        window.location.reload();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch {
      alert("Verbindungsfehler");
    }

    setActionLoading(null);
  }

  async function toggleBlacklist(
    userId: string,
    isBlacklisted: boolean,
    email: string
  ) {
    setActionLoading(userId);

    try {
      const endpoint = isBlacklisted ? "unblacklist" : "blacklist";

      const res = await fetch(
        `http://localhost:3001/api/admin/${endpoint}/${userId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message || `${email} aktualisiert`);
        window.location.reload();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch {
      alert("Verbindungsfehler");
    }

    setActionLoading(null);
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  }

  function roleBadge(role: string) {
    if (role === "ADMIN") return "tc-badge tc-badge-red";
    if (role === "L1_AMBASSADOR") return "tc-badge tc-badge-purple";
    return "tc-badge tc-badge-blue";
  }

  return (
    <main className="tc-shell">
      <BackgroundGlow />

      <div className="tc-layout">
        <aside className="tc-sidebar tc-panel tc-panel-outline tc-fade-up">
          <div className="tc-logo-wrap">
            <div className="tc-logo-icon">
              <Link2 size={22} />
            </div>
            <div className="min-w-0">
              <div className="tc-logo-title">TalentChain</div>
              <div className="tc-logo-subtitle">Web3 Referral Platform</div>
            </div>
          </div>

          <nav className="tc-nav">
            <SidebarItem label="Dashboard" active icon={<LayoutDashboard size={15} />} />
            <SidebarItem label="Match Events" icon={<CalendarDays size={15} />} />
            <SidebarItem label="Users" icon={<Users size={15} />} />
            <SidebarItem label="Rewards" icon={<Gift size={15} />} />
            <SidebarItem label="Referral Tree" icon={<GitBranchPlus size={15} />} />
            <SidebarItem label="Analytics" icon={<BarChart3 size={15} />} />
            <SidebarItem label="Einstellungen" icon={<Settings size={15} />} />
          </nav>

          <div className="mt-auto space-y-4">
            <div className="tc-user-card">
              <div className="flex items-center gap-3">
                <div className="tc-logo-icon !h-11 !w-11 !rounded-full !text-sm">
                  <span className="font-black">
                    {(userEmail || "admin")
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-black text-white">
                    {userRole === "ADMIN" ? "Admin" : userRole || "User"}
                  </p>
                  <p className="truncate text-sm text-slate-400">
                    {userEmail || "admin@talentchain.ch"}
                  </p>
                </div>
              </div>

              {userRole && <div className="mt-3"><span className="tc-user-pill">{userRole}</span></div>}
            </div>

            <Link href="/login" className="tc-btn tc-btn-secondary w-full">
              <LogOut size={16} />
              Logout
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="tc-page-head tc-fade-up">
            <div>
              <h1 className="tc-page-title">Dashboard Übersicht</h1>
              <p className="tc-page-subtitle">
                Willkommen zurück{userRole === "ADMIN" ? ", Admin" : ""}. Hier ist dein aktueller TalentChain Überblick.
              </p>
            </div>

            <div className="tc-head-actions">
              <Link href="/" className="tc-btn tc-btn-secondary">
                <Home size={16} />
                Startseite
              </Link>
              <Link href="/login" className="tc-btn tc-btn-secondary">
                <LogOut size={16} />
                Logout
              </Link>
            </div>
          </header>

          <section className="tc-stats-grid">
            <StatCard
              icon={<CalendarDays size={20} />}
              label="Match Events"
              value={events.length}
              hint="Total erstellt"
              colorClass="bg-gradient-to-br from-teal-400/70 to-cyan-500/60"
              cardClass="tc-fade-up"
              chart={
                <Sparkline
                  color="#1ef2db"
                  area="rgba(30, 242, 219, 0.05)"
                  points="M10,30 C28,31 26,20 42,23 C60,25 58,10 78,15 C96,20 96,30 114,27 C136,23 144,28 158,22 C174,15 180,6 198,10 C214,14 222,4 230,7"
                />
              }
            />

            <StatCard
              icon={<Wallet size={20} />}
              label="Total Fees"
              value={formatCHF(totalFees)}
              hint="Gesamte Transfer Fees"
              colorClass="bg-gradient-to-br from-blue-400/70 to-indigo-500/60"
              cardClass="tc-fade-up-1"
              chart={
                <Sparkline
                  color="#3b82f6"
                  area="rgba(59, 130, 246, 0.05)"
                  points="M10,28 C24,29 30,21 46,24 C62,27 64,12 86,16 C100,18 108,28 122,26 C136,23 144,16 156,20 C174,24 180,8 198,11 C212,14 222,9 230,12"
                />
              }
            />

            <StatCard
              icon={<Users size={20} />}
              label="Referrer Pool"
              value={formatCHF(referrerPool)}
              hint="Für Referral Chain"
              colorClass="bg-gradient-to-br from-violet-400/70 to-fuchsia-500/60"
              cardClass="tc-fade-up-2"
              chart={
                <Sparkline
                  color="#c45cff"
                  area="rgba(196, 92, 255, 0.05)"
                  points="M10,27 C28,26 28,18 46,22 C64,26 66,10 84,14 C102,18 110,25 126,21 C144,17 152,24 170,17 C188,10 198,17 212,11 C220,7 226,8 230,9"
                />
              }
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Distributed"
              value={distributedEvents}
              hint="Bereits verteilt"
              colorClass="bg-gradient-to-br from-emerald-400/70 to-teal-500/60"
              cardClass="tc-fade-up-3"
              chart={
                <Sparkline
                  color="#47f58b"
                  area="rgba(71, 245, 139, 0.05)"
                  points="M10,25 C22,24 30,30 46,28 C64,26 62,11 82,16 C100,20 104,29 118,28 C132,27 138,16 154,18 C170,21 178,26 190,19 C206,10 216,14 230,8"
                />
              }
            />
          </section>

          <div className="tc-content">
            {userRole === "ADMIN" && (
              <section className="tc-section tc-panel tc-panel-outline tc-soft-hover tc-fade-up">
                <div className="tc-section-header">
                  <SectionTitle
                    icon={<UserCog size={15} />}
                    kicker="User Verwaltung"
                    title="User Verwaltung"
                    text="Verwalte Benutzer, Rollen und Sperrungen an einem Ort."
                  />

                  <div className="tc-toolbar">
                    <button type="button" className="tc-btn tc-btn-secondary">
                      Exportieren
                    </button>
                    <button type="button" className="tc-btn tc-btn-primary">
                      <Plus size={16} />
                      Neuer User
                    </button>
                    <button
                      type="button"
                      className="tc-icon-ghost"
                      onClick={() => setShowUsers(!showUsers)}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {showUsers ? (
                  <div className="tc-table-wrap">
                    <table className="tc-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Wallet</th>
                          <th>Rolle</th>
                          <th>Status</th>
                          <th>Aktionen</th>
                          <th style={{ width: "44px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="tc-row-user">
                                <UserAvatar email={user.email} />
                                <div>
                                  <div className="tc-row-title">{user.email}</div>
                                  <div className="tc-row-sub">
                                    Seit {formatDate(user.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="tc-row-mono">
                                <span>
                                  {user.walletAddress
                                    ? `${user.walletAddress.slice(0, 22)}...`
                                    : "-"}
                                </span>
                                {user.walletAddress ? (
                                  <button
                                    type="button"
                                    className="tc-copy-btn"
                                    onClick={() => copyText(user.walletAddress)}
                                  >
                                    <Copy size={13} />
                                  </button>
                                ) : null}
                              </div>
                            </td>

                            <td>
                              <span className={roleBadge(user.role)}>{user.role}</span>
                            </td>

                            <td>
                              {user.isBlacklisted ? (
                                <span className="tc-badge tc-badge-red">
                                  <span className="tc-dot tc-dot-red" />
                                  Gesperrt
                                </span>
                              ) : (
                                <span className="tc-badge tc-badge-green">
                                  <span className="tc-dot tc-dot-green" />
                                  Aktiv
                                </span>
                              )}
                            </td>

                            <td>
                              <div className="tc-actions">
                                {user.role === "USER" && (
                                  <button
                                    type="button"
                                    onClick={() => makeL1(user.id, user.email)}
                                    disabled={actionLoading === user.id}
                                    className="tc-small-btn tc-small-btn-purple"
                                  >
                                    <ShieldCheck size={13} />
                                    L1 machen
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleBlacklist(user.id, user.isBlacklisted, user.email)
                                  }
                                  disabled={actionLoading === user.id}
                                  className={
                                    user.isBlacklisted
                                      ? "tc-small-btn tc-small-btn-green"
                                      : "tc-small-btn tc-small-btn-red"
                                  }
                                >
                                  {user.isBlacklisted ? (
                                    <>
                                      <Unlock size={13} />
                                      Entsperren
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={13} />
                                      Sperren
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>

                            <td>
                              <button type="button" className="tc-icon-ghost">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="tc-empty">Benutzerbereich ist eingeklappt.</p>
                )}
              </section>
            )}

            <section className="tc-dual-grid">
              {userRole === "ADMIN" && (
                <div className="tc-mini-panel tc-panel tc-panel-outline tc-soft-hover tc-fade-up-1">
                  <div className="tc-section-header !mb-0">
                    <SectionTitle
                      icon={<Users size={15} />}
                      kicker="Match"
                      title="Match Event erstellen"
                      text="Erstelle ein neues Match Event und starte den Prozess"
                    />
                    <button
                      type="button"
                      className="tc-btn tc-btn-primary"
                      onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                      <Plus size={16} />
                      Neu erstellen
                    </button>
                  </div>

                  {showCreateForm && (
                    <div className="tc-form-grid">
                      <div>
                        <label className="tc-label">Talent</label>
                        <select
                          value={talentId}
                          onChange={(e) => setTalentId(e.target.value)}
                          className="tc-input"
                        >
                          <option value="">User wählen...</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="tc-label">Jahresgehalt CHF</label>
                        <input
                          type="number"
                          value={annualSalary}
                          onChange={(e) => setAnnualSalary(e.target.value)}
                          className="tc-input"
                          placeholder="90000"
                        />
                      </div>

                      <div>
                        <label className="tc-label">Szenario</label>
                        <select
                          value={scenario}
                          onChange={(e) => setScenario(e.target.value)}
                          className="tc-input"
                        >
                          <option value="CH_LEHRE_WITH_TRAINING">
                            CH Lehre mit Ausbildung 8%
                          </option>
                          <option value="CH_LEHRE_WITHOUT_TRAINING">
                            CH Lehre ohne Ausbildung 15%
                          </option>
                          <option value="USA_STUDY">USA Studium 10%</option>
                          <option value="CUSTOM">Benutzerdefiniert 10%</option>
                        </select>
                      </div>

                      {createError && (
                        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          {createError}
                        </p>
                      )}

                      {createSuccess && (
                        <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                          {createSuccess}
                        </p>
                      )}

                      <button
                        type="button"
                        className="tc-btn tc-btn-primary"
                        onClick={createMatchEvent}
                        disabled={createLoading || !talentId || !annualSalary}
                      >
                        {createLoading ? "Erstelle..." : "Match Event erstellen"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="tc-mini-panel tc-panel tc-panel-outline tc-soft-hover tc-fade-up-2">
                <SectionTitle
                  icon={<CalendarDays size={15} />}
                  kicker="Events"
                  title="Match Events"
                  text="Übersicht aller Match Events und deren Status"
                />
              </div>
            </section>

            <section className="tc-section tc-panel tc-panel-outline tc-soft-hover tc-fade-up-3">
              {loading ? (
                <p className="tc-empty">Lade Daten...</p>
              ) : events.length === 0 ? (
                <p className="tc-empty">Keine Events vorhanden.</p>
              ) : (
                <div className="tc-table-wrap">
                  <table className="tc-table">
                    <thead>
                      <tr>
                        <th>Talent</th>
                        <th>Gehalt</th>
                        <th>Szenario</th>
                        <th>Total Fee</th>
                        <th>Status</th>
                        <th>Datum</th>
                        <th>Aktion</th>
                        <th style={{ width: "44px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id}>
                          <td>
                            <div className="tc-row-user">
                              <UserAvatar email={event.talent.email} />
                              <div>
                                <div className="tc-row-title">{event.talent.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>{formatCHF(event.annualSalary)}</td>

                          <td className="text-slate-300">
                            {formatScenario(event.scenario)}
                          </td>

                          <td className="font-mono text-[14px] font-black text-emerald-300">
                            {formatCHF(event.totalFee)}
                          </td>

                          <td>
                            {event.status === "DISTRIBUTED" ? (
                              <span className="tc-badge tc-badge-green">DISTRIBUTED</span>
                            ) : (
                              <span className="tc-badge tc-badge-yellow">PENDING</span>
                            )}
                          </td>

                          <td>{formatDate(event.createdAt)}</td>

                          <td>
                            {event.status === "PENDING" && userRole === "ADMIN" ? (
                              <button
                                type="button"
                                onClick={() => setSelectedEvent(event.id)}
                                className="tc-small-btn tc-small-btn-green"
                              >
                                <CheckCircle2 size={13} />
                                Verteilen
                              </button>
                            ) : (
                              <span className="tc-badge tc-badge-green">
                                <CheckCircle2 size={13} />
                                Verteilt
                              </span>
                            )}
                          </td>

                          <td>
                            <button type="button" className="tc-icon-ghost">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>

      {selectedEvent && (
        <div className="tc-modal-backdrop">
          <div className="tc-modal tc-panel tc-panel-outline">
            <SectionTitle
              icon={<CircleDollarSign size={15} />}
              kicker="Blockchain Transaction"
              title="Rewards verteilen"
              text="Rewards werden automatisch via Backend auf die Cardano Blockchain gesendet."
            />

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                className="tc-btn tc-btn-success"
                onClick={() => distributeRewards(selectedEvent)}
                disabled={distributeLoading}
              >
                {distributeLoading ? "Sende Transaktion..." : "Rewards jetzt verteilen"}
              </button>

              <button
                type="button"
                className="tc-btn tc-btn-secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}