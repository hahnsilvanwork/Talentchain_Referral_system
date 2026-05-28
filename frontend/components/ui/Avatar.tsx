"use client";
// Generierter Avatar — leitet Initialen + Farbverlauf deterministisch
// aus der E-Mail-Adresse ab, damit jeder User konsistent aussieht.

import { motion } from "framer-motion";

interface AvatarProps {
  email: string;
  size?: number;
}

const GRADIENTS: [string, string][] = [
  ["#6366f1", "#a855f7"],
  ["#8b5cf6", "#c084fc"],
  ["#22c55e", "#06b6d4"],
  ["#f43f5e", "#a855f7"],
  ["#06b6d4", "#6366f1"],
  ["#f59e0b", "#ef4444"],
];

export default function Avatar({ email, size = 30 }: AvatarProps) {
  const name = email.split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();
  const [c1, c2] = GRADIENTS[email.charCodeAt(0) % GRADIENTS.length];

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        fontFamily: "var(--disp)",
        color: "#fff",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${c1}55`,
      }}
    >
      {initials}
    </motion.div>
  );
}