'use client';

const TK = 'clube_user_token';
const UD = 'clube_user_data';

export interface LoggedUser { email: string; nome: string; preview?: boolean; }

const isB = () => typeof window !== 'undefined';

export function setSession(token: string, user: LoggedUser) {
  if (!isB()) return;
  localStorage.setItem(TK, token);
  localStorage.setItem(UD, JSON.stringify(user));
}
export function getToken(): string | null { return isB() ? localStorage.getItem(TK) : null; }
export function getUser(): LoggedUser | null {
  if (!isB()) return null;
  try { const r = localStorage.getItem(UD); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function clearSession() { if (!isB()) return; localStorage.removeItem(TK); localStorage.removeItem(UD); }
export function isLoggedIn(): boolean { return !!getToken(); }
