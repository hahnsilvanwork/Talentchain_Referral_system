"use client";

import { useState, useEffect } from "react";

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

export default function Dashboard() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [distributeLoading, setDistributeLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Match-Event Formular State
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
        setEvents(Array.isArray(data) ? data : [data]);
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

      setCreateSuccess(`Match-Event erstellt!`);
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
        alert(`${email} ist jetzt L1 Ambassador!`);
        window.location.reload();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch {
      alert("Verbindungsfehler");
    }
    setActionLoading(null);
  }

  async function toggleBlacklist(userId: string, isBlacklisted: boolean, email: string) {
    setActionLoading(userId);
    try {
      const endpoint = isBlacklisted ? "unblacklist" : "blacklist";
      const res = await fetch(
        `http://localhost:3001/api/admin/${endpoint}/${userId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch {
      alert("Verbindungsfehler");
    }
    setActionLoading(null);
  }

  function getRoleBadge(role: string) {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-900 text-red-300",
      L1_AMBASSADOR: "bg-purple-900 text-purple-300",
      USER: "bg-slate-700 text-slate-300",
    };
    return colors[role] || "bg-slate-700 text-slate-300";
  }

  return (
    <main className="min-h-screen p-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">
              TalentChain Dashboard
            </h1>
            {userEmail && (
              <p className="text-slate-400 text-sm mt-1">
                Eingeloggt als: {userEmail}
                {userRole === "ADMIN" && (
                  <span className="ml-2 bg-red-900 text-red-300 px-2 py-0.5 rounded text-xs">
                    ADMIN
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <a href="/login" className="text-slate-400 hover:text-white text-sm">
              Logout
            </a>
            <a href="/" className="text-slate-400 hover:text-white text-sm">
              Zurueck
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Match-Events</p>
            <p className="text-3xl font-bold text-white">{events.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Total Fees (CHF)</p>
            <p className="text-3xl font-bold text-green-400">
              {events.reduce((sum, e) => sum + e.totalFee, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Referrer Pool (CHF)</p>
            <p className="text-3xl font-bold text-blue-400">
              {events.reduce((sum, e) => sum + e.referrerPool, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Admin: User Verwaltung */}
        {userRole === "ADMIN" && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">User Verwaltung</h2>
              <button
                onClick={() => setShowUsers(!showUsers)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {showUsers ? "Schliessen" : "Anzeigen"}
              </button>
            </div>

            {showUsers && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 pr-4">Email</th>
                      <th className="text-left py-2 pr-4">Wallet</th>
                      <th className="text-left py-2 pr-4">Rolle</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-700 hover:bg-slate-700 transition-colors"
                      >
                        <td className="py-3 pr-4 text-white">{user.email}</td>
                        <td className="py-3 pr-4 text-slate-400 text-xs font-mono">
                          {user.walletAddress.slice(0, 20)}...
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded text-xs ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {user.isBlacklisted ? (
                            <span className="text-red-400 text-xs">Gesperrt</span>
                          ) : (
                            <span className="text-green-400 text-xs">Aktiv</span>
                          )}
                        </td>
                        <td className="py-3 flex gap-2">
                          {user.role === "USER" && (
                            <button
                              onClick={() => makeL1(user.id, user.email)}
                              disabled={actionLoading === user.id}
                              className="bg-purple-700 hover:bg-purple-600 disabled:bg-slate-600 text-white text-xs px-2 py-1 rounded"
                            >
                              L1 machen
                            </button>
                          )}
                          <button
                            onClick={() => toggleBlacklist(user.id, user.isBlacklisted, user.email)}
                            disabled={actionLoading === user.id}
                            className={`text-white text-xs px-2 py-1 rounded disabled:bg-slate-600 ${
                              user.isBlacklisted
                                ? "bg-green-700 hover:bg-green-600"
                                : "bg-red-700 hover:bg-red-600"
                            }`}
                          >
                            {user.isBlacklisted ? "Entsperren" : "Sperren"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Admin: Match-Event erstellen */}
        {userRole === "ADMIN" && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Match-Event erstellen</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {showCreateForm ? "Schliessen" : "Neu erstellen"}
              </button>
            </div>

            {showCreateForm && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Talent</label>
                  <select
                    value={talentId}
                    onChange={(e) => setTalentId(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none"
                  >
                    <option value="">User waehlen...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">
                    Jahresgehalt (CHF)
                  </label>
                  <input
                    type="number"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none"
                    placeholder="90000"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Szenario</label>
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none"
                  >
                    <option value="CH_LEHRE_WITH_TRAINING">CH Lehre mit Ausbildung (8%)</option>
                    <option value="CH_LEHRE_WITHOUT_TRAINING">CH Lehre ohne Ausbildung (15%)</option>
                    <option value="USA_STUDY">USA Studium (10%)</option>
                    <option value="CUSTOM">Benutzerdefiniert (10%)</option>
                  </select>
                </div>

                {createError && (
                  <p className="col-span-3 text-red-400 text-sm">{createError}</p>
                )}
                {createSuccess && (
                  <p className="col-span-3 text-green-400 text-sm">{createSuccess}</p>
                )}

                <div className="col-span-3">
                  <button
                    onClick={createMatchEvent}
                    disabled={createLoading || !talentId || !annualSalary}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    {createLoading ? "Erstelle..." : "Match-Event erstellen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match-Events Tabelle */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Match-Events</h2>
          {loading ? (
            <p className="text-slate-400">Lade...</p>
          ) : events.length === 0 ? (
            <p className="text-slate-400">Keine Events vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2 pr-4">Talent</th>
                    <th className="text-left py-2 pr-4">Gehalt</th>
                    <th className="text-left py-2 pr-4">Szenario</th>
                    <th className="text-left py-2 pr-4">Total Fee</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Datum</th>
                    <th className="text-left py-2">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                      <td className="py-3 pr-4 text-white">{event.talent.email}</td>
                      <td className="py-3 pr-4 text-slate-300">
                        CHF {event.annualSalary.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        {event.scenario.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 pr-4 text-green-400 font-mono">
                        CHF {event.totalFee.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            event.status === "DISTRIBUTED"
                              ? "bg-green-900 text-green-300"
                              : "bg-yellow-900 text-yellow-300"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 text-xs">
                        {new Date(event.createdAt).toLocaleDateString("de-CH")}
                      </td>
                      <td className="py-3">
                        {event.status === "PENDING" && userRole === "ADMIN" && (
                          <button
                            onClick={() => setSelectedEvent(event.id)}
                            className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                          >
                            Verteilen
                          </button>
                        )}
                        {event.status === "DISTRIBUTED" && (
                          <span className="text-green-400 text-xs">Verteilt</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Rewards verteilen</h3>
            <p className="text-slate-400 text-sm mb-6">
              Rewards werden automatisch via Backend auf die Cardano Blockchain gesendet.
            </p>
            <button
              onClick={() => distributeRewards(selectedEvent)}
              disabled={distributeLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {distributeLoading ? "Sende Transaktion..." : "Rewards jetzt verteilen"}
            </button>
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-4 text-slate-400 hover:text-white"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </main>
  );
}