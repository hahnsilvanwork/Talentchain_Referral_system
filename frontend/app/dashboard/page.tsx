"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import KpiCard from "@/components/ui/KpiCard";
import RewardSplit from "@/components/dashboard/RewardSplit";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import EventsTable from "@/components/dashboard/EventsTable";
import UsersTable from "@/components/dashboard/UsersTable";
import CreateEventForm from "@/components/dashboard/CreateEventForm";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { AdminReferralTree, UserReferralView } from "./_referral";
import { DistributeModal, CancelModal, SetInviterModal } from "./_modals";
import { RewardHistory } from "./_rewards";

interface MatchEvent {
  id: string; annualSalary: number; scenario: string; totalFee: number;
  referrerPool: number; status: string; createdAt: string; txHash?: string;
  talent: { email: string; walletAddress: string };
}
interface User {
  id: string; email: string; walletAddress: string; role: string; isBlacklisted: boolean;
}

const SECTION_META: Record<string, { title: string; sub: string }> = {
  overview: { title: "Übersicht",         sub: "Dein Cardano Recruiting-Hub" },
  events:   { title: "Match-Events",      sub: "Alle Recruiting-Vorgänge" },
  users:    { title: "User Verwaltung",   sub: "Rollen & Zugriff verwalten" },
  rewards:  { title: "Rewards & Payouts", sub: "On-chain Verteilungen" },
  stats:    { title: "Statistiken",       sub: "Kennzahlen im Detail" },
  referral: { title: "Referral-Baum",     sub: "Ambassador-Netzwerk" },
};

// Skeleton placeholder component
function SkeletonKpiCard() {
  return (
    <div className="card" style={{ padding: "15px 16px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 9 }} />
        <div className="skeleton skeleton-text" style={{ width: 60 }} />
      </div>
      <div className="skeleton skeleton-text" style={{ width: 70, marginBottom: 8 }} />
      <div className="skeleton skeleton-title" style={{ width: 100 }} />
      <div className="skeleton" style={{ height: 32, marginTop: 10, borderRadius: 4 }} />
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" as const } },
};

export default function Dashboard() {
  const router = useRouter();
  const { toast, ToastViewport } = useToast();

  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [section, setSection] = useState("overview");
  const [search, setSearch] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [cancelEvent, setCancelEvent] = useState<string | null>(null);
  const [distributeLoading, setDistributeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [referralChain, setReferralChain] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [showSetInviter, setShowSetInviter] = useState<User | null>(null);
  const [inviterAddress, setInviterAddress] = useState("");
  const [setInviterLoading, setSetInviterLoading] = useState(false);

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    // ── Auth-Guard ──────────────────────────────────────────────
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (!token || !email) {
      router.replace("/login");
      return;
    }

    setUserEmail(email);
    setUserRole(role || "");

    api.getEvents()
      .then((d) => setEvents(Array.isArray(d) ? d : [d]))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (role === "ADMIN") {
      api.getUsers().then((d) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    }
  }, [router]);

  const stats = useMemo(() => ({
    totalFees: events.reduce((s, e) => s + e.totalFee, 0),
    referrerPool: events.reduce((s, e) => s + e.referrerPool, 0),
    pending: events.filter((e) => e.status === "PENDING").length,
  }), [events]);

  const feeSpark = useMemo(() => {
    const fees = events.slice(-7).map((e) => e.totalFee);
    if (!fees.length) return [30, 45, 35, 60, 50, 75, 100];
    const max = Math.max(...fees, 1);
    return fees.map((f) => Math.max(10, Math.round((f / max) * 100)));
  }, [events]);

  const latestPending = events.find((e) => e.status === "PENDING") ?? events[0];

  async function handleCreate(talentId: string, salary: number, scenario: string) {
    setCreateLoading(true);
    try {
      await api.createEvent({ talentId, annualSalary: salary, scenario });
      toast.success("Match-Event erstellt");
      setEvents(Array.isArray(await api.getEvents()) ? await api.getEvents() : []);
      setShowCreate(false);
    } catch (e: any) { toast.error("Fehler", e.message); }
    setCreateLoading(false);
  }

  async function handleDistribute(id: string) {
    setDistributeLoading(true);
    try {
      const res = await api.distribute(id);
      if (res.success) {
        toast.success("Rewards verteilt", res.txHash ? `TX ${res.txHash.slice(0, 14)}…` : "");
        setEvents(await api.getEvents());
        setSelectedEvent(null);
      } else toast.error("Fehler", res.error);
    } catch (e: any) { toast.error("Verbindungsfehler", e.message); }
    setDistributeLoading(false);
  }

  async function handleCancel(id: string) {
    setCancelLoading(true);
    try {
      const res = await api.cancelEvent(id);
      if (res.success) {
        toast.success("Event storniert");
        setEvents(await api.getEvents());
        setCancelEvent(null);
      } else toast.error("Fehler", res.error);
    } catch (e: any) { toast.error("Verbindungsfehler", e.message); }
    setCancelLoading(false);
  }

  async function handleMakeL1(userId: string, email: string) {
    setActionLoading(userId);
    try {
      const res = await api.makeL1(userId);
      if (res.success) { toast.success("L1 gesetzt", email); setUsers(await api.getUsers()); }
      else toast.error("Fehler", res.error);
    } catch (e: any) { toast.error("Fehler", e.message); }
    setActionLoading(null);
  }

  async function handleRemoveL1(userId: string, email: string) {
    setActionLoading(userId);
    try {
      const res = await api.removeL1(userId);
      if (res.success) { toast.success("L1 entfernt", email); setUsers(await api.getUsers()); }
      else toast.error("Fehler", res.error);
    } catch (e: any) { toast.error("Fehler", e.message); }
    setActionLoading(null);
  }

  async function handleToggleBlacklist(userId: string, isBlacklisted: boolean, email: string) {
    setActionLoading(userId);
    try {
      const res = isBlacklisted ? await api.unblacklist(userId) : await api.blacklist(userId);
      if (res.success) { toast.success(isBlacklisted ? "Entsperrt" : "Gesperrt", email); setUsers(await api.getUsers()); }
      else toast.error("Fehler", res.error);
    } catch (e: any) { toast.error("Fehler", e.message); }
    setActionLoading(null);
  }

  async function handleRemoveFromChain(userId: string, email: string) {
    setActionLoading(userId);
    try {
      const res = await api.removeFromChain(userId);
      if (res.success) {
        toast.success("Aus Kette entfernt", email);
        setUsers(await api.getUsers());
        if (selectedUserId === userId) { setReferralChain([]); setSelectedUserId(null); }
      } else toast.error("Fehler", res.error);
    } catch (e: any) { toast.error("Fehler", e.message); }
    setActionLoading(null);
  }

  async function handleLoadReferralChain(userId: string) {
    setReferralLoading(true);
    setSelectedUserId(userId);
    try {
      const res = await api.getReferralChain(userId);
      setReferralChain(res.chain || []);
    } catch { setReferralChain([]); }
    setReferralLoading(false);
  }

  async function handleSetInviter() {
    if (!showSetInviter) return;
    setSetInviterLoading(true);
    try {
      let inviterId: string | null = null;
      if (inviterAddress.trim()) {
        const inv = users.find((u) => u.walletAddress === inviterAddress.trim());
        if (!inv) { toast.error("Inviter nicht gefunden"); setSetInviterLoading(false); return; }
        inviterId = inv.id;
      }
      const res = await api.setInviter(inviterId, showSetInviter.id);
      if (res.success) { toast.success("Beziehung erstellt", showSetInviter.email); setShowSetInviter(null); setInviterAddress(""); }
      else toast.error("Fehler", res.error);
    } catch (e: any) { toast.error("Fehler", e.message); }
    setSetInviterLoading(false);
  }

  // Noch nicht eingeloggt — zeige nichts während redirect läuft
  if (!userEmail) return null;

  const meta = SECTION_META[section] ?? SECTION_META.overview;
  const showEvents = ["overview", "events"].includes(section);
  const showUsers = isAdmin && ["overview", "users"].includes(section);
  const showKpis = ["overview", "stats"].includes(section);

  const SecHeader = ({ icon, title, count }: { icon: React.ComponentProps<typeof Icon>["name"]; title: string; count: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sec-header"
    >
      <span style={{ color: "var(--vio)" }}><Icon name={icon} size={17} /></span>
      {title}
      <span className="sec-count">{count}</span>
    </motion.div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar email={userEmail} role={userRole} activeId={section} onNavigate={setSection} pendingCount={stats.pending} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          title={meta.title}
          subtitle={`${meta.sub} · ${loading ? "lädt…" : `${events.length} Events`}`}
          search={search} onSearch={setSearch}
          onPrimary={() => { setSection("overview"); setShowCreate(true); }}
          primaryLabel="Match-Event" showPrimary={isAdmin}
        />

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >

              {/* KPI Cards */}
              {showKpis && (
                loading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13, marginBottom: 22 }}>
                    {[...Array(4)].map((_, i) => <SkeletonKpiCard key={i} />)}
                  </div>
                ) : (
                  <motion.div
                    style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13, marginBottom: 22 }}
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                  >
                    <KpiCard icon="cube" label="Match-Events" value={String(events.length)} accent="indigo" trend={{ text: `${stats.pending} offen`, up: false }} spark={feeSpark} />
                    <KpiCard icon="coin" label="Total Fees" value={Math.round(stats.totalFees).toLocaleString("de-CH")} unit="CHF" accent="emerald" trend={{ text: "live", up: true }} spark={feeSpark} />
                    <KpiCard icon="users" label="Referrer Pool" value={Math.round(stats.referrerPool).toLocaleString("de-CH")} unit="CHF" accent="purple" trend={{ text: `${users.length} User`, up: true }} spark={feeSpark} />
                    <KpiCard icon="clock" label="Ausstehend" value={String(stats.pending)} accent="amber" spark={feeSpark} />
                  </motion.div>
                )
              )}

              {/* Overview split row */}
              {section === "overview" && latestPending && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 22 }}
                >
                  <RewardSplit totalFee={latestPending.totalFee} caption="Aktuelles Event" />
                  <ActivityFeed events={events} />
                </motion.div>
              )}

              {/* Create form */}
              {isAdmin && showCreate && ["overview", "events"].includes(section) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ marginBottom: 22, overflow: "hidden" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                    <div className="sec-header" style={{ marginBottom: 0 }}>
                      <span style={{ color: "var(--vio)" }}><Icon name="plus" size={17} /></span>
                      Neues Match-Event
                    </div>
                    <motion.button
                      className="btn btn-gho btn-sm"
                      onClick={() => setShowCreate(false)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Icon name="x" size={12} /> Schliessen
                    </motion.button>
                  </div>
                  <CreateEventForm users={users} loading={createLoading} onSubmit={handleCreate} />
                </motion.div>
              )}

              {/* Events table */}
              {showEvents && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  style={{ marginBottom: 22 }}
                >
                  <SecHeader icon="cube" title="Match-Events" count={`${events.length} TOTAL`} />
                  <EventsTable
                    events={events} loading={loading} isAdmin={isAdmin} search={search}
                    onDistribute={(id) => setSelectedEvent(id)}
                    onCancel={isAdmin ? (id) => setCancelEvent(id) : undefined}
                  />
                </motion.div>
              )}

              {/* Rewards */}
              {section === "rewards" && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <SecHeader icon="coin" title="Rewards & Payouts" count="History" />
                  <RewardHistory />
                </motion.div>
              )}

              {/* Users table */}
              {showUsers && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  style={{ marginBottom: 22 }}
                >
                  <SecHeader icon="users" title="User Verwaltung" count={`${users.length} USER`} />
                  <UsersTable
                    users={users} search={search} actionLoading={actionLoading}
                    onMakeL1={handleMakeL1} onRemoveL1={handleRemoveL1}
                    onToggleBlacklist={handleToggleBlacklist}
                    onSetInviter={(user) => { setShowSetInviter(user); setInviterAddress(""); }}
                    onViewChain={(userId) => { handleLoadReferralChain(userId); setSection("referral"); }}
                    onRemoveFromChain={handleRemoveFromChain}
                  />
                </motion.div>
              )}

              {/* Referral */}
              {section === "referral" && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <SecHeader icon="tree" title="Referral-Baum" count={`${users.length} USER`} />
                  {isAdmin ? (
                    <AdminReferralTree
                      users={users}
                      selectedUserId={selectedUserId}
                      setSelectedUserId={(id) => { setSelectedUserId(id); if (!id) setReferralChain([]); }}
                      referralChain={referralChain}
                      referralLoading={referralLoading}
                      onLoadChain={handleLoadReferralChain}
                    />
                  ) : (
                    <UserReferralView />
                  )}
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DistributeModal
        open={!!selectedEvent} onClose={() => setSelectedEvent(null)}
        eventId={selectedEvent} events={events}
        loading={distributeLoading} onConfirm={handleDistribute}
      />
      <CancelModal
        open={!!cancelEvent} onClose={() => setCancelEvent(null)}
        eventId={cancelEvent} loading={cancelLoading} onConfirm={handleCancel}
      />
      <SetInviterModal
        open={!!showSetInviter} onClose={() => setShowSetInviter(null)}
        user={showSetInviter} users={users}
        inviterAddress={inviterAddress} setInviterAddress={setInviterAddress}
        loading={setInviterLoading} onConfirm={handleSetInviter}
      />

      <ToastViewport />
    </div>
  );
}