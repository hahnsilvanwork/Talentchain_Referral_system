"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import Badge, { statusVariant } from "../ui/Badge";
import { scenarioLabel, chf } from "@/lib/scenarios";

interface MatchEvent {
  id: string;
  annualSalary: number;
  scenario: string;
  totalFee: number;
  status: string;
  createdAt: string;
  txHash?: string;
  talent: { email: string; walletAddress: string };
}

interface EventsTableProps {
  events: MatchEvent[];
  loading: boolean;
  isAdmin: boolean;
  search: string;
  onDistribute: (id: string) => void;
  onCancel?: (id: string) => void;
}

type Filter = "all" | "PENDING" | "DISTRIBUTED" | "CANCELLED";

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div className="skeleton skeleton-text" style={{ width: i === 0 ? 140 : i === 6 ? 80 : 70, height: i === 0 ? 14 : 12 }} />
        </td>
      ))}
    </tr>
  );
}

export default function EventsTable({
  events, loading, isAdmin, search, onDistribute, onCancel,
}: EventsTableProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = events
    .filter((e) => filter === "all" || e.status === filter)
    .filter((e) => e.talent.email.toLowerCase().includes(search.toLowerCase()));

  const pills: { id: Filter; label: string }[] = [
    { id: "all",         label: "Alle" },
    { id: "PENDING",     label: "Ausstehend" },
    { id: "DISTRIBUTED", label: "Verteilt" },
    { id: "CANCELLED",   label: "Storniert" },
  ];

  function statusBadgeVariant(status: string) {
    if (status === "CANCELLED") return "rd" as const;
    return statusVariant(status);
  }

  function openTx(txHash: string) {
    window.open(
      `https://preprod.cardanoscan.io/transaction/${txHash}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid var(--line)",
        background: "var(--bg-input)",
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {pills.map((p, i) => (
            <motion.span
              key={p.id}
              className={`fpill ${filter === p.id ? "on" : ""}`}
              onClick={() => setFilter(p.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {p.label}
            </motion.span>
          ))}
        </div>
        <span style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: "var(--t4)" }}>
          {loading ? "…" : `${filtered.length} Einträge`}
        </span>
      </div>

      {loading ? (
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Talent</th>
                <th>Jahresgehalt</th>
                <th>Szenario</th>
                <th>Total Fee</th>
                <th>Status</th>
                <th>Datum</th>
                <th style={{ textAlign: "right" }}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty"
        >
          <div className="empty-ic"><Icon name="inbox" size={22} /></div>
          <div className="empty-title">Keine Events gefunden</div>
          <div className="empty-text">
            {search ? "Keine Treffer für deine Suche." : "Es wurden noch keine Match-Events erstellt."}
          </div>
        </motion.div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Talent</th>
                <th>Jahresgehalt</th>
                <th>Szenario</th>
                <th>Total Fee</th>
                <th>Status</th>
                <th>Datum</th>
                <th style={{ textAlign: "right" }}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((ev, idx) => {
                  const name = ev.talent.email.split("@")[0]
                    .replace(/[._]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <motion.tr
                      key={ev.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ backgroundColor: "rgba(139,92,246,0.04)" }}
                      layout
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar email={ev.talent.email} size={28} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{name}</div>
                            <div style={{ fontSize: 9.5, color: "var(--t4)", fontFamily: "var(--mono)" }}>
                              {ev.talent.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t2)" }}>
                        {chf(ev.annualSalary)}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 9.5,
                          fontFamily: "var(--mono)",
                          color: "var(--t2)",
                          background: "var(--bg-input)",
                          border: "1px solid var(--line)",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}>
                          {scenarioLabel(ev.scenario)}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--em)", fontWeight: 700 }}>
                        {chf(ev.totalFee)}
                      </td>
                      <td>
                        <Badge variant={statusBadgeVariant(ev.status)}>
                          {ev.status}
                        </Badge>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t4)" }}>
                        {new Date(ev.createdAt).toLocaleDateString("de-CH")}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>

                          {/* TX Link */}
                          {ev.txHash && (
                            <motion.button
                              className="row-act"
                              style={{ background: "rgba(99,102,241,.1)", color: "var(--ind)", borderColor: "rgba(99,102,241,.2)" }}
                              onClick={() => openTx(ev.txHash!)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Transaktion auf Cardanoscan ansehen"
                            >
                              <Icon name="arrowRight" size={11} /> TX
                            </motion.button>
                          )}

                          {/* PENDING actions */}
                          {ev.status === "PENDING" && isAdmin && (
                            <>
                              <motion.button
                                className="row-act ra-dist"
                                onClick={() => onDistribute(ev.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Verteilen →
                              </motion.button>
                              {onCancel && (
                                <motion.button
                                  className="row-act ra-rd"
                                  onClick={() => onCancel(ev.id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  title="Event stornieren"
                                >
                                  <Icon name="x" size={11} strokeWidth={2.5} />
                                </motion.button>
                              )}
                            </>
                          )}

                          {/* Distributed */}
                          {ev.status === "DISTRIBUTED" && (
                            <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--em)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Icon name="check" size={11} strokeWidth={3} /> Verteilt
                            </span>
                          )}

                          {/* Cancelled */}
                          {ev.status === "CANCELLED" && (
                            <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--rd)", fontWeight: 700 }}>
                              Storniert
                            </span>
                          )}

                          {!["PENDING", "DISTRIBUTED", "CANCELLED"].includes(ev.status) && !ev.txHash && (
                            <span style={{ fontSize: 10, color: "var(--t4)", fontFamily: "var(--mono)" }}>—</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}