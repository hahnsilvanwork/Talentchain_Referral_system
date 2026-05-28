"use client";
// Toast-System mit Framer Motion slide-in Animationen.
// Verwendung:
//   const { toast, ToastViewport } = useToast();
//   toast.success("Titel", "Untertitel");
//   ...dann <ToastViewport /> einmal im JSX rendern.

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  sub?: string;
}

const STYLES: Record<ToastKind, {
  soft: string;
  fg: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  borderColor: string;
  progressColor: string;
}> = {
  success: {
    soft: "var(--em-soft)",
    fg: "var(--em)",
    icon: "check",
    borderColor: "rgba(34,197,94,0.2)",
    progressColor: "var(--em)",
  },
  error: {
    soft: "var(--rd-soft)",
    fg: "var(--rd)",
    icon: "x",
    borderColor: "rgba(239,68,68,0.2)",
    progressColor: "var(--rd)",
  },
  info: {
    soft: "rgba(139,92,246,.14)",
    fg: "var(--vio)",
    icon: "bell",
    borderColor: "rgba(139,92,246,0.22)",
    progressColor: "var(--vio)",
  },
};

const DURATION = 4200;

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  const s = STYLES[item.kind];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="toast"
      style={{ borderLeft: `3px solid ${s.fg}`, cursor: "pointer" }}
      onClick={() => onRemove(item.id)}
      whileHover={{ scale: 1.02, x: -2 }}
    >
      <motion.div
        className="toast-ic"
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
        style={{ background: s.soft, color: s.fg }}
      >
        <Icon name={s.icon} size={15} strokeWidth={2.5} />
      </motion.div>
      <div className="toast-msg" style={{ flex: 1, minWidth: 0 }}>
        <b>{item.title}</b>
        {item.sub && <span className="toast-sub">{item.sub}</span>}
      </div>

      {/* Progress bar */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 0,
          left: 3,
          right: 0,
          height: 2,
          background: s.progressColor,
          borderRadius: "0 0 var(--r-lg) var(--r-lg)",
          opacity: 0.35,
          originX: 0,
        }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: DURATION / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, title: string, sub?: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, title, sub }]);
    setTimeout(() => removeItem(id), DURATION);
  }, [removeItem]);

  const toast = {
    success: (title: string, sub?: string) => push("success", title, sub),
    error:   (title: string, sub?: string) => push("error",   title, sub),
    info:    (title: string, sub?: string) => push("info",    title, sub),
  };

  const ToastViewport = () => (
    <div className="toast-wrap">
      <AnimatePresence mode="sync">
        {items.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={removeItem} />
        ))}
      </AnimatePresence>
    </div>
  );

  return { toast, ToastViewport };
}