"use client";
// Aktivitäts-Feed: kompakte Liste der letzten Ereignisse.

import { motion } from "framer-motion";
import Icon from "../ui/Icon";
import { chf } from "@/lib/scenarios";

interface FeedEvent {
  status: string;
  totalFee: number;
  createdAt: string;
  talent: { email: string };
}

interface ActivityFeedProps {
  events: FeedEvent[];
}

const KIND = {
  distributed: { soft: "var(--em-soft)", fg: "var(--em)", icon: "check" as const, borderColor: "rgba(34,197,94,0.18)" },
  created:     { soft: "rgba(139,92,246,.14)", fg: "var(--vio)", icon: "plus" as const, borderColor: "rgba(139,92,246,0.18)" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "vor < 1 Std";
  if (h < 24) return `vor ${h} Std`;
  return `vor ${Math.floor(h / 24)} Tg`;
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  const recent = [...events]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="card" style={{ padding: 17, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--disp)", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
        <span style={{ color: "var(--vio)" }}><Icon name="clock" size={15} /></span>
        Aktivität
        {recent.length > 0 && (
          <span style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--t3)", marginLeft: "auto" }}>
            {recent.length} Einträge
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="empty" style={{ padding: "1.5rem 0" }}>
          <div className="empty-ic"><Icon name="clock" size={18} /></div>
          <div className="empty-text">Noch keine Aktivität</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {recent.map((ev, i) => {
            const isDist = ev.status === "DISTRIBUTED";
            const k = isDist ? KIND.distributed : KIND.created;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ x: 3 }}
                style={{
                  display: "flex",
                  gap: 10,
                  paddingBottom: i === recent.length - 1 ? 0 : 13,
                  marginBottom: i === recent.length - 1 ? 0 : 13,
                  borderBottom: i === recent.length - 1 ? "none" : "1px solid var(--line)",
                  cursor: "default",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: k.soft,
                    color: k.fg,
                    border: `1px solid ${k.borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={k.icon} size={13} strokeWidth={2.5} />
                </motion.div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, lineHeight: 1.45, color: "var(--t2)" }}>
                    <b style={{ color: "var(--t1)", fontWeight: 600 }}>
                      {isDist ? "Rewards verteilt" : "Match-Event erstellt"}
                    </b>{" "}
                    <span style={{ color: "var(--t3)" }}>
                      {isDist ? "an " : "— "}
                      {isDist ? ev.talent.email : chf(ev.totalFee)}
                    </span>
                  </div>
                  <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--t4)", marginTop: 3 }}>
                    {timeAgo(ev.createdAt)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}