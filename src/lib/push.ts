'use client';

import { getUser } from './userStorage';

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlB64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

export function notifState(): NotificationPermission | 'indisponivel' {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID) return 'indisponivel';
  return Notification.permission;
}

export async function ativarNotificacoes(): Promise<'ok' | 'negado' | 'erro' | 'indisponivel'> {
  if (notifState() === 'indisponivel') return 'indisponivel';
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return 'negado';
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToArrayBuffer(VAPID),
    });
    const j = sub.toJSON();
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: j.endpoint, keys: j.keys, email: getUser()?.email }),
    });
    return 'ok';
  } catch {
    return 'erro';
  }
}
