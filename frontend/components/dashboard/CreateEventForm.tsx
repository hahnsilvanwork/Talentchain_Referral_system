"use client";
// Match-Event-Formular mit Live-Vorschau der berechneten Fee.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../ui/Icon";
import { SCENARIOS, chf } from "@/lib/scenarios";

interface UserOption {
  id: string;
  email: string;
}

interface CreateEventFormProps {
  users: UserOption[];
  loading: boolean;
  onSubmit: (talentId: string, salary: number, scenario: string) => void;
}

export default function CreateEventForm({ users, loading, onSubmit }: CreateEventFormProps) {
  const [talentId, setTalentId] = useState("");
  const [salary, setSalary] = useState("");
  const [scenario, setScenario] = useState(SCENARIOS[0].id);

  const scen = SCENARIOS.find((s) => s.id === scenario)!;
  const salaryNum = parseFloat(salary) || 0;
  const previewFee = (salaryNum * scen.feePercent) / 100;
  const canSubmit = !!talentId && salaryNum > 0 && !loading;

  return (
    <div className="card" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
      {/* Gradient top line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, var(--vio), var(--ind), transparent)",
      }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13, marginBottom: 14 }}>
        <div>
          <label className="field-label">Talent</label>
          <select className="field field-select" value={talentId} onChange={(e) => setTalentId(e.target.value)}>
            <option value="">User wählen…</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Jahresgehalt (CHF)</label>
          <input
            className="field"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="90000"
          />
        </div>
        <div>
          <label className="field-label">Szenario</label>
          <select className="field field-select" value={scenario} onChange={(e) => setScenario(e.target.value)}>
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>{s.label} ({s.feePercent}%)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Fee Preview */}
      <motion.div
        animate={{
          borderColor: salaryNum > 0 ? "rgba(34,197,94,0.3)" : "var(--line)",
          background: salaryNum > 0 ? "rgba(34,197,94,0.04)" : "var(--bg-input)",
        }}
        transition={{ duration: 0.25 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: "11px 14px",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <motion.div
            animate={{ scale: salaryNum > 0 ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--em-soft)",
              color: "var(--em)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="coin" size={14} />
          </motion.div>
          <span style={{ fontSize: 11.5, color: "var(--t3)" }}>
            Berechnete Total-Fee
            <span style={{ fontFamily: "var(--mono)", color: "var(--t4)", marginLeft: 4 }}>
              ({scen.feePercent}%)
            </span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.span
            key={`${salaryNum}-${scenario}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 16,
              fontWeight: 700,
              color: salaryNum > 0 ? "var(--em)" : "var(--t4)",
            }}
          >
            {salaryNum > 0 ? chf(previewFee) : "—"}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <motion.button
        className="btn btn-pri"
        disabled={!canSubmit}
        onClick={() => onSubmit(talentId, salaryNum, scenario)}
        whileHover={canSubmit ? { scale: 1.02, y: -1 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
      >
        {loading ? <span className="spinner" /> : <Icon name="cube" size={13} />}
        {loading ? "Erstelle…" : "Match-Event erstellen"}
      </motion.button>
    </div>
  );
}