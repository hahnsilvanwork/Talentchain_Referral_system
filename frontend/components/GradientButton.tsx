import { ButtonHTMLAttributes, ReactNode } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  className?: string;
}

export default function GradientButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: GradientButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 hover:from-cyan-300 hover:via-blue-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/20",
    secondary:
      "bg-white/8 hover:bg-white/12 text-slate-100 border border-white/10",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white shadow-lg shadow-red-500/20",
    success:
      "bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/20",
  };

  return (
    <button
      {...props}
      className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}