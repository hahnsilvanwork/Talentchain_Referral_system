"use client";

// Status-Chip. Variante bestimmt Farbe; `dot` schaltet den Punkt links ab.

import { motion } from "framer-motion";

type BadgeVariant = "em" | "am" | "rd" | "vio" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  /** Wenn true, reagiert der Badge auf Hover mit leichter Skalierung */
  interactive?: boolean;
}

export default function Badge({
  children,
  variant = "gray",
  dot = true,
  interactive = false,
}: BadgeProps) {
  return (
    <motion.span
      className={`chip chip-${variant}${dot ? "" : " chip-no-dot"}`}
      whileHover={interactive ? { scale: 1.06 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.span>
  );
}

/** Mappt eine Event-Status-Zeichenkette auf die passende Badge-Variante. */
export function statusVariant(status: string): BadgeVariant {
  if (status === "DISTRIBUTED") return "em";
  if (status === "PENDING") return "am";
  return "gray";
}

/** Mappt eine User-Rolle auf die passende Badge-Variante. */
export function roleVariant(role: string): BadgeVariant {
  if (role === "ADMIN") return "rd";
  if (role === "L1_AMBASSADOR") return "vio";
  return "gray";
}
