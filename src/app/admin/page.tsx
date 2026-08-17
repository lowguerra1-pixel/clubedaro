'use client';

import { useState, useEffect, useCallback } from 'react';

interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  tipo: string | null;
  arquivo: string | null;
  link_externo: string | null;
  tema: string | null;
  rotulo: string | null;
  liberar_em: string;
  gratis: boolean;
  publicado: boolean;
}

const CATEGORIAS = ['Baralhos', 'Fichas', 'Áudios & Aulas', 'Protocolos'];
const TIPOS = ['pdf', 'audio', 'video', 'link'];
const PW_KEY = 'clube_admin_pw';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #ECE7F1', borderRadius: 16, padding: 20, boxShadow: '0 6px 20px rgba(108,63,176,.06)' };
const LABEL: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#6C3FB0', textTransform: 'uppercase', letterSpacing: '.4px', margin: '0 0 6px' };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '1.5px solid #ECE7F1', fontSize: 14, background: '#FBFAFE', color: '#251A38' };

function emptyForm() {
  return { titulo: '', descricao: '', categoria: CATEGORIAS[0], tipo: 'pdf', link_externo: '', tema: '', rotulo: '', liberar_em: '', gratis: true, publicado: true };
}

export default function AdminClube() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [list, setList] = useState<Material[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const headers = useCallback((json = true) => {
    const h: Record<string, string> = { 'x-admin-password': pw };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }, [pw]);

  const load = useCallback(async (p: string) => {
    const res = await fetch('/api/admin/materiais', { headers: { 'x-admin-password': p } });
    if (res.status === 401) { setErr('Senha incorreta.'); setAuthed(false); localStorage.removeItem(PW_KEY); return; }
    const data = await res.json();
    setList(data.materiais ?? []);
    setAuthed(true);
    setErr('');
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(PW_KEY);
    if (saved) { setPw(saved); load(saved); }
  }, [load]);

  const entrar = async () => {
    const p = pwInput.trim();
    if (!p) return;
    setPw(p);
    localStorage.setItem(PW_KEY, p);
    await load(p);
  };

  const salvar = async () => {
    setErr(''); setMsg('');
    if (!form.titulo.trim()) { setErr('Preencha o título.'); return; }
    setBusy(true);
    try {
      let arquivo: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-password': pw }, body: fd });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error || 'Falha no upload');
        arquivo = upData.path;
      }
      const body = {
        titulo: form.titulo.trim(),
        descricao: form.descricao || null,
        categoria: form.categoria,
        tipo: form.tipo,
        arquivo,
        link_externo: form.link_externo || null,
        tema: form.tema || null,
        rotulo: form.rotulo || null,
        liberar_em: form.liberar_em ? new Date(form.liberar_em).toISOString() : new Date().toISOString(),
        gratis: form.gratis,
        publicado: form.publicado,
      };
      const res = await fetch('/api/admin/materiais', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setMsg('Material salvo! ✓');
      setForm(emptyForm());
      setFile(null);
      await load(pw);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir este material?')) return;
    await fetch(`/api/admin/materiais/${id}`, { method: 'DELETE', headers: { 'x-admin-password': pw } });
    await load(pw);
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const agendado = (iso: string) => new Date(iso).getTime() > Date.now();

  // ─── Tela de login ────────────────────────────────────────────────
  if (!authed) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ ...CARD, width: '100%', maxWidth: 360 }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: '#4A2A80' }}>Admin · Clube da Dra. Rô</div>
          <p style={{ fontSize: 13.5, color: '#7C7090', margin: '6px 0 16px' }}>Digite a senha de administrador.</p>
          <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && entrar()} placeholder="Senha" style={INPUT} />
          {err && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 10 }}>{err}</p>}
          <button onClick={entrar} style={{ marginTop: 14, width: '100%', border: 'none', background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 14, cursor: 'pointer' }}>Entrar</button>
        </div>
      </main>
    );
  }

  // ─── Painel ───────────────────────────────────────────────────────
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '28px 18px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
        <h1 className="serif" style={{ fontSize: 27, fontWeight: 700, color: '#4A2A80', margin: 0 }}>Clube da Dra. Rô · Admin</h1>
        <button onClick={() => { localStorage.removeItem(PW_KEY); setAuthed(false); }} style={{ border: 'none', background: 'none', color: '#7C7090', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sair</button>
      </div>

      {/* Formulário */}
      <div style={{ ...CARD, marginBottom: 26 }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Adicionar material</div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={LABEL}>Título</label>
            <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: Baralho Cartas do Inconsciente" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={2} placeholder="Breve descrição do material" style={{ ...INPUT, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>Categoria</label>
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={INPUT}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Tipo</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={INPUT}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>Tema do mês</label>
              <input value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} placeholder="Ex.: Arteterapia Junguiana" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Rótulo</label>
              <input value={form.rotulo} onChange={e => setForm({ ...form, rotulo: e.target.value })} placeholder='Ex.: "Semana 1"' style={INPUT} />
            </div>
          </div>
          <div>
            <label style={LABEL}>Arquivo (upload)</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 14 }} />
            <div style={{ fontSize: 12, color: '#9B95AC', marginTop: 4 }}>Ou deixe em branco e use um link externo abaixo.</div>
          </div>
          <div>
            <label style={LABEL}>Link externo (opcional)</label>
            <input value={form.link_externo} onChange={e => setForm({ ...form, link_externo: e.target.value })} placeholder="https://…" style={INPUT} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 14, alignItems: 'end' }}>
            <div>
              <label style={LABEL}>Liberar em (agendamento)</label>
              <input type="datetime-local" value={form.liberar_em} onChange={e => setForm({ ...form, liberar_em: e.target.value })} style={INPUT} />
              <div style={{ fontSize: 12, color: '#9B95AC', marginTop: 4 }}>Vazio = liberar agora. Data futura = agendado.</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, paddingBottom: 8 }}>
              <input type="checkbox" checked={form.gratis} onChange={e => setForm({ ...form, gratis: e.target.checked })} /> grátis
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, paddingBottom: 8 }}>
              <input type="checkbox" checked={form.publicado} onChange={e => setForm({ ...form, publicado: e.target.checked })} /> publicado
            </label>
          </div>
          {err && <p style={{ color: '#C0392B', fontSize: 13, margin: 0 }}>{err}</p>}
          {msg && <p style={{ color: '#1F7A50', fontSize: 13, margin: 0 }}>{msg}</p>}
          <button onClick={salvar} disabled={busy} style={{ border: 'none', background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 14, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Salvando…' : 'Salvar material'}
          </button>
        </div>
      </div>

      {/* Lista / calendário */}
      <div className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Materiais ({list.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.length === 0 && <div style={{ ...CARD, color: '#7C7090', fontSize: 14 }}>Nenhum material ainda.</div>}
        {list.map(m => (
          <div key={m.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{m.titulo}</span>
                {m.categoria && <span style={{ fontSize: 11, fontWeight: 700, color: '#6C3FB0', background: '#F0E8FB', padding: '2px 8px', borderRadius: 20 }}>{m.categoria}</span>}
                {agendado(m.liberar_em)
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: '#8A6716', background: '#FEF6E6', padding: '2px 8px', borderRadius: 20 }}>Agendado</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: '#1F7A50', background: '#E4F5EC', padding: '2px 8px', borderRadius: 20 }}>No ar</span>}
                {!m.publicado && <span style={{ fontSize: 11, fontWeight: 700, color: '#7C7090', background: '#F1EDF6', padding: '2px 8px', borderRadius: 20 }}>rascunho</span>}
              </div>
              <div style={{ fontSize: 12.5, color: '#7C7090', marginTop: 3 }}>
                {m.tema ? `${m.tema} · ` : ''}{m.rotulo ? `${m.rotulo} · ` : ''}libera {fmt(m.liberar_em)}
                {m.arquivo ? ' · arquivo' : m.link_externo ? ' · link' : ''}
              </div>
            </div>
            <button onClick={() => excluir(m.id)} style={{ border: '1.5px solid #F3C7C1', background: '#FFF6F4', color: '#C0392B', fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 12, cursor: 'pointer', flex: 'none' }}>Excluir</button>
          </div>
        ))}
      </div>
    </main>
  );
}
