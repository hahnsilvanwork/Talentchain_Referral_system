"use client";

import { motion, AnimatePresence } from "framer-motion";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import Badge, { roleVariant } from "../ui/Badge";
import CardanoLink from "../ui/CardanoLink";

interface User {
  id: string;
  email: string;
  walletAddress: string;
  walletPkh?: string;
  role: string;
  isBlacklisted: boolean;
  nftTxHash?: string;
}

interface UsersTableProps {
  users: User[];
  search: string;
  actionLoading: string | null;
  onMakeL1: (id: string, email: string) => void;
  onRemoveL1: (id: string, email: string) => void;
  onToggleBlacklist: (id: string, isBlacklisted: boolean, email: string) => void;
  onSetInviter: (user: User) => void;
  onViewChain: (userId: string) => void;
  onRemoveFromChain: (id: string, email: string) => void;
}

export default function UsersTable({
  users, search, actionLoading,
  onMakeL1, onRemoveL1, onToggleBlacklist,
  onSetInviter, onViewChain, onRemoveFromChain,
}: UsersTableProps) {
  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty"
        >
          <div className="empty-ic"><Icon name="users" size={22} /></div>
          <div className="empty-title">Keine User gefunden</div>
          <div className="empty-text">
            {search ? "Keine Treffer für deine Suche." : "Es sind noch keine User registriert."}
          </div>
        </motion.div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Wallet On-Chain</th>
                <th>Rolle</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((u, idx) => {
                  const name = u.email.split("@")[0].replace(/[._]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const busy = actionLoading === u.id;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      layout
                    >
                      {/* User */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar email={u.email} size={28} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{name}</div>
                            <div style={{ fontSize: 9.5, color: "var(--t4)", fontFamily: "var(--mono)" }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Wallet On-Chain */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--t2)" }}>
                              {u.walletAddress.slice(0, 12)}…{u.walletAddress.slice(-4)}
                            </span>
                            <CardanoLink type="address" value={u.walletAddress} label="Wallet" variant="button" />
                          </div>

                          {u.nftTxHash && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{
                                fontSize: 9,
                                fontFamily: "var(--mono)",
                                color: "var(--em)",
                                background: "var(--em-soft)",
                                border: "1px solid rgba(34,197,94,.2)",
                                padding: "1px 6px",
                                borderRadius: 4,
                                fontWeight: 700,
                              }}>
                                NFT
                              </span>
                              <CardanoLink type="tx" value={u.nftTxHash} label="Mint TX" variant="button" />
                            </div>
                          )}

                          {u.walletPkh && (
                            <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--t4)" }} title={`PKH: ${u.walletPkh}`}>
                              pkh: {u.walletPkh.slice(0, 10)}…
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <Badge variant={roleVariant(u.role)} dot={false}>{u.role}</Badge>
                      </td>

                      <td>
                        <Badge variant={u.isBlacklisted ? "rd" : "em"}>
                          {u.isBlacklisted ? "Gesperrt" : "Aktiv"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <motion.button
                            className="row-act ra-vio"
                            onClick={() => onViewChain(u.id)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            title="Kette anzeigen"
                          >
                            <Icon name="tree" size={11} /> Kette
                          </motion.button>

                          <motion.button
                            className="row-act"
                            style={{ background: "rgba(6,182,212,.1)", color: "var(--cy)", borderColor: "rgba(6,182,212,.2)" }}
                            onClick={() => onSetInviter(u)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            title="Einlader setzen"
                          >
                            <Icon name="users" size={11} /> Einlader
                          </motion.button>

                          <motion.button
                            className="row-act"
                            style={{ background: "rgba(245,158,11,.1)", color: "var(--am)", borderColor: "rgba(245,158,11,.2)" }}
                            onClick={() => onRemoveFromChain(u.id, u.email)}
                            disabled={busy}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            title="Aus Kette entfernen"
                          >
                            {busy ? <span className="spinner" style={{ width: 9, height: 9 }} /> : <Icon name="x" size={11} />} Kette
                          </motion.button>

                          {u.role === "USER" && (
                            <motion.button
                              className="row-act ra-vio"
                              disabled={busy}
                              onClick={() => onMakeL1(u.id, u.email)}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                            >
                              {busy ? <span className="spinner" style={{ width: 9, height: 9 }} /> : null}
                              L1 machen
                            </motion.button>
                          )}
                          {u.role === "L1_AMBASSADOR" && (
                            <motion.button
                              className="row-act"
                              style={{ background: "rgba(239,68,68,.08)", color: "var(--rd)", borderColor: "rgba(239,68,68,.2)" }}
                              disabled={busy}
                              onClick={() => onRemoveL1(u.id, u.email)}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                            >
                              L1 entfernen
                            </motion.button>
                          )}

                          <motion.button
                            className={`row-act ${u.isBlacklisted ? "ra-em" : "ra-rd"}`}
                            disabled={busy}
                            onClick={() => onToggleBlacklist(u.id, u.isBlacklisted, u.email)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {u.isBlacklisted ? "Entsperren" : "Sperren"}
                          </motion.button>
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