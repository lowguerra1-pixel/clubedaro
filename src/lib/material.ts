'use client';

import { getToken } from './userStorage';

export interface Mat {
  id: string; titulo: string; descricao: string | null; categoria: string | null;
  tipo: string | null; arquivo: string | null; link_externo: string | null;
  tema: string | null; rotulo: string | null; liberar_em: string;
}

const CAT_COLOR: Record<string, { solid: string; tint: string; on: string }> = {
  'Baralhos': { solid: '#F5806C', tint: '#FDEEEB', on: '#fff' },
  'Fichas': { solid: '#17A39A', tint: '#E8F6F4', on: '#fff' },
  'Áudios & Aulas': { solid: '#F7B733', tint: '#FEF6E6', on: '#4A3200' },
  'Protocolos': { solid: '#6C3FB0', tint: '#F0E8FB', on: '#fff' },
};
export function catColor(c: string | null) { return CAT_COLOR[c || ''] || { solid: '#6C3FB0', tint: '#F0E8FB', on: '#fff' }; }

export async function fetchMateriais(): Promise<Mat[]> {
  const res = await fetch('/api/materiais', { headers: { 'x-user-token': getToken() ?? '' } });
  if (!res.ok) return [];
  const d = await res.json();
  return d.materiais ?? [];
}

export async function abrirMaterial(m: Mat, download = false) {
  if (m.link_externo && !m.arquivo) { window.open(m.link_externo, '_blank', 'noopener,noreferrer'); return; }
  if (!m.arquivo) return;
  const res = await fetch(`/api/files?path=${encodeURIComponent(m.arquivo)}${download ? '&download=1' : ''}`, { headers: { 'x-user-token': getToken() ?? '' } });
  const d = await res.json();
  if (d.url) window.location.href = d.url;
}
