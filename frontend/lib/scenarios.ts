// Szenario-Definitionen + Fee-/Split-Berechnung an einer Stelle.
// Falls das Backend andere Prozentsätze nutzt, hier anpassen.

export interface Scenario {
  id: string;
  label: string;
  feePercent: number;       // % vom Jahresgehalt
}

export const SCENARIOS: Scenario[] = [
  { id: "CH_LEHRE_WITH_TRAINING",    label: "CH Lehre · mit Ausbildung", feePercent: 8 },
  { id: "CH_LEHRE_WITHOUT_TRAINING", label: "CH Lehre · ohne Ausbildung", feePercent: 15 },
  { id: "USA_STUDY",                 label: "USA · Studium",              feePercent: 10 },
  { id: "CUSTOM",                    label: "Benutzerdefiniert",          feePercent: 10 },
];

export function scenarioLabel(id: string): string {
  return SCENARIOS.find((s) => s.id === id)?.label ?? id.replace(/_/g, " ");
}

// Reward-Split: wie sich die Total-Fee aufteilt (Anzeige-Logik).
export interface SplitPart {
  key: string;
  label: string;
  percent: number;
  color: string;
}

export const SPLIT_PARTS: SplitPart[] = [
  { key: "talent",      label: "Talent",        percent: 40, color: "#6366f1" },
  { key: "referrer",    label: "Referrer Pool", percent: 30, color: "#a855f7" },
  { key: "institution", label: "Institution",   percent: 20, color: "#22c55e" },
  { key: "platform",    label: "Plattform",     percent: 10, color: "#06b6d4" },
];

/** CHF-Betrag formatieren (Schweizer Notation). */
export function chf(n: number): string {
  return "CHF " + Math.round(n).toLocaleString("de-CH");
}
