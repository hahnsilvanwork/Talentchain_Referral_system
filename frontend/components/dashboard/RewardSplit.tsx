"use client";
// Reward-Verteilungs-Visualizer: zeigt als animierten Balken + Legende,
// wie sich eine Total-Fee auf die Parteien aufteilt.

import { motion } from "framer-motion";
import { SPLIT_PARTS, chf } from "@/lib/scenarios";

interface RewardSplitProps {
  totalFee: number;
  caption?: string;
}

export default function RewardSplit({ totalFee, caption }: RewardSplitProps) {
  return (
    <div className="card" style={{ padding: 17 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--disp)", fontSize: 13, fontWeight: 600 }}>
          Reward-Verteilung
          {caption && (
            <span style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: "var(--t3)", background: "var(--bg-input)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 6 }}>
              {caption}
            </span>
          )}
        </div>
        <motion.div
          key={totalFee}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--em)", fontWeight: 700 }}
        >
          {chf(totalFee)}
        </motion.div>
      </div>

      {/* Animated progress bar */}
      <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", marginBottom: 16, gap: 2 }}>
        {SPLIT_PARTS.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: `${p.percent}%`,
              background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
              transformOrigin: "left",
              borderRadius: 3,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SPLIT_PARTS.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            whileHover={{ x: 4 }}
            style={{ display: "flex", alignItems: "center", gap: 9 }}
          >
            <span style={{
              width: 9,
              height: 9,
              borderRadius: 3,
              background: p.color,
              flexShrink: 0,
              boxShadow: `0 0 6px ${p.color}66`,
            }} />
            <span style={{ fontSize: 11.5, color: "var(--t2)", flex: 1 }}>{p.label}</span>
            <span style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: "var(--t3)", width: 34, textAlign: "right" }}>
              {p.percent}%
            </span>
            <span style={{ fontSize: 11.5, fontFamily: "var(--mono)", color: "var(--t1)", fontWeight: 700, width: 84, textAlign: "right" }}>
              {chf((totalFee * p.percent) / 100)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}