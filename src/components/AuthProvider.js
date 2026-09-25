"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ACCOUNTS } from "@/lib/accounts";

const AuthContext = createContext(null);
const KEY = "sponsorsync.user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Session lives in sessionStorage, NOT localStorage: a brand-new visit
  // (new tab, or reopening the link) always starts logged OUT on the landing
  // page, so first-time viewers get the marketing home. Within the same tab a
  // reload keeps the session, so a live demo isn't interrupted.
  useEffect(() => {
    try {
      // Clear any legacy persisted login so old sessions never auto-resume.
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const fresh = ACCOUNTS.find((a) => a.id === saved.id);
        if (fresh) {
          const safe = { ...fresh };
          delete safe.password;
          setUser(safe);
        } else {
          setUser(saved);
        }
      }
    } catch {
      /* private mode / blocked storage — stay logged out */
    }
    setReady(true);
  }, []);

  function login(account) {
    // Never persist the password.
    const safe = { ...account };
    delete safe.password;
    setUser(safe);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(safe));
    } catch {
      /* ignore */
    }
  }

  function logout() {
    setUser(null);
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, ready: false, login: () => {}, logout: () => {} };
  return ctx;
}
