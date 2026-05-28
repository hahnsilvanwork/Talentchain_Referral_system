import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentChain — Dezentrale Recruiting-Plattform",
  description: "Transparente, automatisierte Recruiting-Vergütung auf der Cardano Blockchain.",
};

const themeScript = `
(function () {
  try {
    var savedTheme = localStorage.getItem("theme");
    var theme = savedTheme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}