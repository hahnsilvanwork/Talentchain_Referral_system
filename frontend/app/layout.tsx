import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentChain",
  description: "Web3 Referral System auf Cardano",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}