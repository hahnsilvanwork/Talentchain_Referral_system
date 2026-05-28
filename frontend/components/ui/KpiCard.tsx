"use client";
// KPI-Karte mit Icon, Trend-Pille, Counter-Animation und animierter Sparkline.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Icon from "./Icon";

interface KpiCardProps {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value: string;
  unit?: string;
  trend?: { text: string; up: boolean };
  accent: "indigo" | "emerald" | "purple" | "amber";
  spark: number[];
}

const ACCENTS = {
  indigo:  { soft: "rgba(99,102,241,.14)",  fg: "#818cf8", bar: "99,102,241",  grad: "linear-gradient(180deg,#8b5cf6,#6366f1)", glow: "rgba(99,102,241,0.25)" },
  emerald: { soft: "rgba(34,197,94,.12)",   fg: "#22c55e", bar: "34,197,94",   grad: "linear-gradient(180deg,#22c55e,#16a34a)", glow: "rgba(34,197,94,0.2)" },
  purple:  { soft: "rgba(168,85,247,.14)",  fg: "#a855f7", bar: "168,85,247",  grad: "linear-gradient(180deg,#a855f7,#8b5cf6)", glow: "rgba(168,85,247,0.22)" },
  amber:   { soft: "rgba(245,158,11,.12)",  fg: "#f59e0b", bar: "245,158,11",  grad: "linear-gradient(180deg,#f59e0b,#d97706)", glow: "rgba(245,158,11,0.2)" },
};

function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (isNaN(target)) { setCount(target); return; }
    const start = performance.now();
    const from = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

export default function KpiCard({ icon, label, value, unit, trend, accent, spark }: KpiCardProps) {
  const a = ACCENTS[accent];
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ""));
  const isNumeric = !isNaN(numericValue) && value.match(/^[\d,. ]+$/);
  const animatedCount = useCountUp(isNumeric ? numericValue : 0, 1200);

  const displayValue = isNumeric
    ? animatedCount.toLocaleString("de-CH")
    : value;

  return (
    <motion.div
      className="card card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${a.glow}` }}
      style={{ padding: "15px 16px", overflow: "hidden", position: "relative" }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 11, position: "relative" }}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: a.soft,
            color: a.fg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 0 1px rgba(${a.bar},0.15)`,
          }}
        >
          <Icon name={icon} size={15} />
        </motion.div>

        {trend && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 10,
              fontFamily: "var(--mono)",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 20,
              background: trend.up ? "var(--em-soft)" : "var(--am-soft)",
              color: trend.up ? "var(--em)" : "var(--am)",
              border: `1px solid ${trend.up ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
            }}
          >
            {trend.up ? "↑ " : ""}{trend.text}
          </motion.span>
        )}
      </div>

      <p style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em", position: "relative" }}>
        {label}
      </p>

      <motion.p
        className="counter"
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ fontFamily: "var(--disp)", fontSize: 24, fontWeight: 700, letterSpacing: "-.03em", position: "relative" }}
      >
        {displayValue}
        {unit && <span style={{ fontSize: 13, color: "var(--t3)", fontWeight: 500, marginLeft: 3 }}>{unit}</span>}
      </motion.p>

      {/* Animated sparkline */}
      <div style={{ marginTop: 10, height: 32, display: "flex", alignItems: "flex-end", gap: 2.5, position: "relative" }}>
        {spark.map((h, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: 1,
              borderRadius: "2px 2px 0 0",
              minHeight: 3,
              height: `${h}%`,
              background: i === spark.length - 1
                ? a.grad
                : `rgba(${a.bar},${0.25 + (h / 100) * 0.35})`,
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}