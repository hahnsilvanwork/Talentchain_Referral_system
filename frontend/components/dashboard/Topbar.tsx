"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../ui/Icon";
import ThemeToggle from "../ui/ThemeToggle";

interface TopbarProps {
  title: string;
  subtitle: string;
  search: string;
  onSearch: (v: string) => void;
  onPrimary: () => void;
  primaryLabel: string;
  showPrimary: boolean;
}

export default function Topbar({
  title,
  subtitle,
  search,
  onSearch,
  onPrimary,
  primaryLabel,
  showPrimary,
}: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--line)",
        flexShrink: 0,
        background: "color-mix(in srgb, var(--bg-elev) 88%, transparent)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Title section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{
            fontFamily: "var(--disp)",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "-.025em",
            color: "var(--t1)",
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 11,
            color: "var(--t3)",
            marginTop: 2,
            fontFamily: "var(--mono)",
          }}>
            {subtitle}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right controls */}
      <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
        {/* Search */}
        <motion.div
          animate={{
            width: searchFocused ? 240 : 210,
            borderColor: searchFocused ? "var(--vio)" : "var(--line)",
            boxShadow: searchFocused ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "var(--bg-input)",
            border: "1px solid var(--line)",
            borderRadius: 9,
            padding: "7px 11px",
            color: searchFocused ? "var(--vio)" : "var(--t3)",
            transition: "color 0.15s",
          }}
        >
          <Icon name="search" size={14} strokeWidth={2.5} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Events, User suchen…"
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--t1)",
              fontSize: 12,
              fontFamily: "var(--body)",
              width: "100%",
            }}
          />
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--t3)",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name="x" size={11} />
            </motion.button>
          )}
        </motion.div>

        <ThemeToggle />

        <motion.div
          className="icon-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon name="bell" size={15} />
        </motion.div>

        {showPrimary && (
          <motion.button
            className="btn btn-pri"
            onClick={onPrimary}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon name="plus" size={13} strokeWidth={2.5} />
            {primaryLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}