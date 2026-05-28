export const API_BASE = "http://localhost:3001";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || "Anfrage fehlgeschlagen");
  return data as T;
}

export const api = {
  // ── Auth ──
  login: (body: { email?: string; walletAddress?: string; password: string }) =>
    request<{ token: string; userId: string; role: string; email: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(body) }
    ),

  register: (body: { email: string; password: string; walletAddress: string; walletPkh: string }) =>
    request<{ token: string; userId: string; role: string; email: string }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(body) }
    ),

  getPkh: (address: string) =>
    request<{ pkh: string }>("/api/util/pkh", {
      method: "POST",
      body: JSON.stringify({ address }),
    }),

  // ── Match-Events ──
  getEvents: () => request<any[]>("/api/match/events"),

  createEvent: (body: { talentId: string; annualSalary: number; scenario: string }) =>
    request<any>("/api/match/create", { method: "POST", body: JSON.stringify(body) }),

  cancelEvent: (eventId: string) =>
    request<{ success: boolean; error?: string }>(
      `/api/match/cancel/${eventId}`,
      { method: "POST" }
    ),

  // ── Rewards ──
  distribute: (matchEventId: string) =>
    request<{ success: boolean; txHash?: string; error?: string }>(
      "/api/rewards/distribute",
      { method: "POST", body: JSON.stringify({ matchEventId }) }
    ),

  getRewardHistory: () =>
    request<{
      walletAddress: string;
      history: {
        txHash: string;
        blockTime: number;
        matchEvent: {
          id: string;
          totalFee: number;
          scenario: string;
          talent: string;
        } | null;
      }[];
    }>("/api/rewards/history"),

  // ── Admin / User ──
  getUsers: () => request<any[]>("/api/admin/users"),

  makeL1: (userId: string) =>
    request<{ success: boolean; error?: string }>(
      `/api/admin/make-l1/${userId}`,
      { method: "POST" }
    ),

  removeL1: (userId: string) =>
    request<{ success: boolean; error?: string }>(
      `/api/admin/remove-l1/${userId}`,
      { method: "POST" }
    ),

  blacklist: (userId: string) =>
    request<{ success: boolean; message?: string; error?: string }>(
      `/api/admin/blacklist/${userId}`,
      { method: "POST" }
    ),

  unblacklist: (userId: string) =>
    request<{ success: boolean; message?: string; error?: string }>(
      `/api/admin/unblacklist/${userId}`,
      { method: "POST" }
    ),

  // ── Referral ──
  getReferralChain: (userId: string) =>
    request<{ chain: any[]; length: number }>(`/api/referral/chain/${userId}`),

  getDownline: (userId: string) =>
    request<{
      userId: string;
      userLayer: number;
      downline: { layer: number; users: any[] }[];
      totalCount: number;
    }>(`/api/referral/downline/${userId}`),

  getMyPosition: () =>
    request<{
      userId: string;
      userLayer: number;
      downlineCounts: { layer: number; count: number }[];
      totalDownline: number;
      isInChain: boolean;
    }>("/api/referral/my"),

  setInviter: (inviterId: string | null, inviteeId: string) =>
    request<{ success: boolean; relation?: any; error?: string }>(
      "/api/referral/create",
      { method: "POST", body: JSON.stringify({ inviterId, inviteeId }) }
    ),

  removeFromChain: (userId: string) =>
    request<{ success: boolean; error?: string }>(
      `/api/referral/remove/${userId}`,
      { method: "DELETE" }
    ),

  getReferralRelations: () =>
    request<any[]>("/api/referral/all"),

  // Eigenen Invite-Code abrufen
  getMyCode: () =>
    request<{ inviteCode: string | null; userId: string }>(
      "/api/referral/my-code"
    ),

  // Invite-Code eines Users setzen (Admin)
  generateInviteCode: (userId: string) =>
    request<{ inviteCode: string }>(
      `/api/admin/invite-code/${userId}`,
      { method: "POST" }
    ),

  // Script-Adresse des referral_registry Validators
  getScriptAddress: () =>
    request<{ address: string; network: string; explorer: string }>(
      "/api/admin/referral-script-address"
    ),

  // Script-Info (Alias für getScriptAddress — je nach Frontend-Version)
  getScriptInfo: () =>
    request<{ scriptAddress: string; policyId: string; network: string; explorer: string }>(
      "/api/referral/script-info"
    ),
};