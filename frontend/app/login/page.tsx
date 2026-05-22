"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrWallet, setEmailOrWallet] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function detectWallet() {
    try {
      const cardano = (window as any).cardano;
      if (!cardano?.eternl) {
        setError("Eternl Wallet nicht gefunden");
        return;
      }
      const walletApi = await cardano.eternl.enable();
      const addresses = await walletApi.getUsedAddresses();
      const address = addresses[0] || (await walletApi.getChangeAddress());
      setWalletAddress(address);
    } catch {
      setError("Wallet-Verbindung fehlgeschlagen");
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!walletAddress) {
          setError("Bitte Wallet-Adresse eingeben oder Auto-detect nutzen");
          setLoading(false);
          return;
        }

        // PKH via Backend holen
        const pkhRes = await fetch("http://localhost:3001/api/admin/pkh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: walletAddress }),
        });
        const pkhData = await pkhRes.json();

        if (!pkhRes.ok) {
          setError("Ungültige Wallet-Adresse");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:3001/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailOrWallet,
            password,
            walletAddress,
            walletPkh: pkhData.pkh,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registrierung fehlgeschlagen");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        router.push("/dashboard");
      } else {
        const isWalletAddress = emailOrWallet.startsWith("addr_");

        const res = await fetch("http://localhost:3001/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(isWalletAddress
              ? { walletAddress: emailOrWallet }
              : { email: emailOrWallet }),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Login fehlgeschlagen");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Verbindungsfehler");
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-slate-900">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-blue-400 text-center mb-2">
          TalentChain
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Dezentrale Recruiting-Plattform
        </p>

        <div className="bg-slate-800 rounded-xl p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-l-lg transition-colors ${
                !isRegister ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-r-lg transition-colors ${
                isRegister ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
              }`}
            >
              Registrieren
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">
                {isRegister ? "Email" : "Email oder Wallet-Adresse"}
              </label>
              <input
                type="text"
                value={emailOrWallet}
                onChange={(e) => setEmailOrWallet(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isRegister ? "email@beispiel.ch" : "email@beispiel.ch oder addr_test1..."}
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {isRegister && (
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Cardano Wallet-Adresse
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="addr_test1..."
                  />
                  <button
                    onClick={detectWallet}
                    className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-3 rounded-lg text-xs whitespace-nowrap"
                  >
                    Auto-detect
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Manuell eingeben oder Eternl automatisch erkennen lassen
                </p>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? "..." : isRegister ? "Registrieren" : "Login"}
            </button>
          </div>
        </div>

        <p className="text-center mt-4">
          <a href="/" className="text-slate-400 hover:text-white text-sm">
            Zurueck zur Startseite
          </a>
        </p>
      </div>
    </main>
  );
}