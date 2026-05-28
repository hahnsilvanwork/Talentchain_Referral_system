"use client";
// Dashboard-Sidebar: Brand, User-Karte, Navigation, Netzwerk-Status.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  badge?: number;
}

interface SidebarProps {
  email: string;
  role: string;
  activeId: string;
  onNavigate: (id: string) => void;
  pendingCount: number;
}

export default function Sidebar({ email, role, activeId, onNavigate, pendingCount }: SidebarProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.replace("/login");
  }

  const platformItems: NavItem[] = [
    { id: "overview", label: "Übersicht", icon: "grid" },
    { id: "events", label: "Match-Events", icon: "cube", badge: pendingCount || undefined },
    { id: "rewards", label: "Rewards & Payouts", icon: "coin" },
    ...(role === "ADMIN"
      ? ([{ id: "users", label: "User Verwaltung", icon: "users" }] as NavItem[])
      : []),
  ];

  const analyticsItems: NavItem[] = [
    { id: "stats", label: "Statistiken", icon: "chart" },
    { id: "referral", label: "Referral-Baum", icon: "tree" },
  ];

  const renderItem = (item: NavItem, index: number) => {
    const isActive = activeId === item.id;
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => onNavigate(item.id)}
        className="nav-item"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.12))"
            : undefined,
          color: isActive ? "#fff" : undefined,
          borderLeft: isActive ? "2px solid transparent" : "2px solid transparent",
          cursor: "pointer",
        }}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Active indicator bar */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="nav-active-bar"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              style={{
                position: "absolute",
                left: -10,
                top: "50%",
                translateY: "-50%",
                width: 3,
                height: 20,
                background: "linear-gradient(var(--ind), var(--pur))",
                borderRadius: "0 3px 3px 0",
              }}
            />
          )}
        </AnimatePresence>

        <span style={{ color: isActive ? "var(--vio)" : undefined, transition: "color 0.15s" }}>
          <Icon name={item.icon} size={17} />
        </span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge != null && item.badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="nav-badge"
          >
            {item.badge}
          </motion.span>
        )}
      </motion.div>
    );
  };

  return (
    <aside style={{
      width: 236,
      flexShrink: 0,
      background: "var(--bg-elev)",
      borderRight: "1px solid var(--line)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
    }}>

      {/* Brand */}
      <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
        <motion.div
          whileHover={{ backgroundColor: "var(--bg-hover)" }}
          style={{
            padding: "18px 18px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid var(--line)",
            transition: "background 0.15s",
          }}
        >
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "var(--grad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
              fontFamily: "var(--disp)",
              color: "#fff",
              boxShadow: "0 2px 14px rgba(124,58,237,.5), 0 0 0 1px rgba(168,85,247,.2)",
              flexShrink: 0,
            }}
          >
            T
          </motion.div>
          <div>
            <div style={{ fontFamily: "var(--disp)", fontWeight: 700, fontSize: 15, letterSpacing: "-.02em" }}>
              TalentChain
            </div>
            <div style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--mono)", marginTop: 1 }}>
              v1.0 · Preprod
            </div>
          </div>
        </motion.div>
      </Link>

      {/* User card */}
      {email && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            margin: "12px 12px 8px",
            padding: 11,
            background: "var(--bg-card)",
            border: "1px solid var(--line)",
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Avatar email={email} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {email}
            </div>
            {role && (
              <span style={{
                fontSize: 8.5,
                fontFamily: "var(--mono)",
                marginTop: 3,
                display: "inline-block",
                padding: "1px 6px",
                borderRadius: 4,
                fontWeight: 700,
                letterSpacing: ".05em",
                color: role === "ADMIN" ? "var(--rd)" : "var(--vio)",
                background: role === "ADMIN" ? "var(--rd-soft)" : "rgba(168,85,247,.12)",
                border: `1px solid ${role === "ADMIN" ? "rgba(239,68,68,.2)" : "rgba(168,85,247,.2)"}`,
              }}>
                {role}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Nav groups */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        <div style={{ padding: "6px 10px" }}>
          <div className="nav-label">PLATTFORM</div>
          {platformItems.map((item, i) => renderItem(item, i))}
        </div>
        <div style={{ padding: "6px 10px" }}>
          <div className="nav-label">ANALYSE</div>
          {analyticsItems.map((item, i) => renderItem(item, platformItems.length + i))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 12px 14px", borderTop: "1px solid var(--line)" }}>
        {/* Network status */}
        <motion.div
          animate={{ borderColor: ["rgba(34,197,94,.2)", "rgba(34,197,94,.4)", "rgba(34,197,94,.2)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 11px",
            background: "var(--em-soft)",
            border: "1px solid rgba(34,197,94,.2)",
            borderRadius: 9,
            marginBottom: 8,
          }}
        >
          <span className="dot-live" />
          <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--em)", fontWeight: 700 }}>
            CARDANO NETWORK OK
          </span>
        </motion.div>

        {/* Logout */}
        <motion.div
          className="nav-item"
          style={{ color: "var(--t3)", cursor: "pointer" }}
          onClick={handleLogout}
          whileHover={{ x: 3, color: "var(--rd)" }}
          whileTap={{ scale: 0.97 }}
        >
          <Icon name="logout" size={17} />
          <span>Logout</span>
        </motion.div>
      </div>

      <style>{`
        .nav-label {
          font-size: 9px;
          font-family: var(--mono);
          color: var(--t4);
          letter-spacing: .14em;
          padding: 8px 8px 5px;
          font-weight: 700;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          color: var(--t2);
          font-size: 12.5px;
          font-weight: 500;
          transition: background 0.13s, color 0.13s;
          margin-bottom: 1px;
          position: relative;
        }
        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--t1);
        }
        .nav-badge {
          margin-left: auto;
          font-size: 9px;
          font-family: var(--mono);
          background: var(--vio);
          color: #fff;
          padding: 1px 6px;
          border-radius: 20px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(139,92,246,0.4);
        }
      `}</style>
    </aside>
  );
}