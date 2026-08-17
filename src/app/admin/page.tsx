'use client';

import { useState, useEffect, useCallback } from 'react';

interface Material {
  id: string; titulo: string; descricao: string | null; categoria: string | null;
  tipo: string | null; arquivo: string | null; link_externo: string | null;
  tema: string | null; rotulo: string | null; liberar_em: string; gratis: boolean; publicado: boolean;
}
interface Membro {
  id: string; email: string; nome: string | null; status: string; plano: string | null; iniciou_em: string; criado_em: string;
}

const CATEGORIAS = ['Baralhos', 'Fichas', 'Áudios & Aulas', 'Protocolos'];
const TIPOS = ['pdf', 'audio', 'video', 'link'];
const PW_KEY = 'clube_admin_pw';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #ECE7F1', borderRadius: 16, padding: 20, boxShadow: '0 6px 20px rgba(108,63,176,.06)' };
const LABEL: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#6C3FB0', textTransform: 'uppercase', letterSpacing: '.4px', margin: '0 0 6px' };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '1.5px solid #ECE7F1', fontSize: 14, background: '#FBFAFE', color: '#251A38' };

const IconMat = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3.4 8.4 4.2L12 11.8 3.6 7.6z"></path><path d="m3.6 12 8.4 4.2 8.4-4.2"></path><path d="m3.6 16.4 8.4 4.2 8.4-4.2"></path></svg>);
const IconMemb = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7.6" r="3.4"></circle><path d="M2.8 20.4v-1.3a4.6 4.6 0 0 1 4.6-4.6h3.2a4.6 4.6 0 0 1 4.6 4.6v1.3"></path><path d="M17 4.4a3.6 3.6 0 0 1 0 6.8"></path></svg>);
const IconOut = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.6 4.6h3.8a1.5 1.5 0 0 1 1.5 1.5v11.8a1.5 1.5 0 0 1-1.5 1.5h-3.8"></path><path d="m9.6 8.6-3.4 3.4 3.4 3.4"></path><path d="M6.4 12h9.2"></path></svg>);

function emptyForm() {
  return { titulo: '', descricao: '', categoria: CATEGORIAS[0], tipo: 'pdf', link_externo: '', tema: '', rotulo: '', liberar_em: '', gratis: true, publicado: true };
}

export default function AdminClube() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [tab, setTab] = useState<'materiais' | 'assinantes'>('materiais');

  const [list, setList] = useState<Material[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [membros, setMembros] = useState<Membro[]>([]);

  const loadMateriais = useCallback(async (p: string) => {
    const res = await fetch('/api/admin/materiais', { headers: { 'x-admin-password': p } });
    if (res.status === 401) { setLoginErr('Senha incorreta.'); setAuthed(false); localStorage.removeItem(PW_KEY); return false; }
    const data = await res.json();
    setList(data.materiais ?? []);
    return true;
  }, []);

  const loadMembros = useCallback(async (p: string) => {
    const res = await fetch('/api/admin/membros', { headers: { 'x-admin-password': p } });
    if (res.ok) { const d = await res.json(); setMembros(d.membros ?? []); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(PW_KEY);
    if (saved) {
      setPw(saved);
      loadMateriais(saved).then(ok => { if (ok) { setAuthed(true); loadMembros(saved); } });
    }
  }, [loadMateriais, loadMembros]);

  const entrar = async () => {
    const p = pwInput.trim();
    if (!p) return;
    setPw(p);
    const ok = await loadMateriais(p);
    if (ok) { localStorage.setItem(PW_KEY, p); setAuthed(true); setLoginErr(''); loadMembros(p); }
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
        titulo: form.titulo.trim(), descricao: form.descricao || null, categoria: form.categoria,
        tipo: form.tipo, arquivo, link_externo: form.link_externo || null, tema: form.tema || null,
        rotulo: form.rotulo || null,
        liberar_em: form.liberar_em ? new Date(form.liberar_em).toISOString() : new Date().toISOString(),
        gratis: form.gratis, publicado: form.publicado,
      };
      const res = await fetch('/api/admin/materiais', { method: 'POST', headers: { 'x-admin-password': pw, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setMsg('Material salvo! ✓');
      setForm(emptyForm()); setFile(null);
      await loadMateriais(pw);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro');
    } finally { setBusy(false); }
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir este material?')) return;
    await fetch(`/api/admin/materiais/${id}`, { method: 'DELETE', headers: { 'x-admin-password': pw } });
    await loadMateriais(pw);
  };

  const sair = () => { localStorage.removeItem(PW_KEY); setAuthed(false); setPwInput(''); };

  const fmt = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtD = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const agendado = (iso: string) => new Date(iso).getTime() > Date.now();

  // ─── Login ───────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ ...CARD, width: '100%', maxWidth: 360 }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: '#4A2A80' }}>Admin · Clube da Dra. Rô</div>
          <p style={{ fontSize: 13.5, color: '#7C7090', margin: '6px 0 16px' }}>Digite a senha de administrador.</p>
          <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && entrar()} placeholder="Senha" style={INPUT} />
          {loginErr && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 10 }}>{loginErr}</p>}
          <button onClick={entrar} style={{ marginTop: 14, width: '100%', border: 'none', background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 14, cursor: 'pointer' }}>Entrar</button>
        </div>
      </main>
    );
  }

  const navBtn = (id: 'materiais' | 'assinantes', label: string, Icon: () => React.ReactElement) => {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left', background: active ? 'rgba(145,99,224,.22)' : 'transparent', color: active ? '#D9CBF5' : 'rgba(255,255,255,.6)' }}>
        <Icon />{label}
      </button>
    );
  };

  const stats = {
    total: membros.length,
    trial: membros.filter(m => m.status === 'trial').length,
    ativos: membros.filter(m => m.status === 'ativo').length,
    cancel: membros.filter(m => m.status === 'cancelado').length,
  };

  // ─── Dashboard ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#F7F4FC' }}>
      {/* Sidebar */}
      <aside style={{ width: 230, flex: 'none', background: '#2A2438', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100dvh' }}>
        <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(150deg,#6C3FB0,#4A2A80)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <span className="serif" style={{ color: '#F8EFD6', fontSize: 17, fontWeight: 600 }}>Rô</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, lineHeight: 1.15 }}>Clube da Dra. Rô</div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px' }}>Painel de Admin</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navBtn('materiais', 'Materiais', IconMat)}
          {navBtn('assinantes', 'Assinantes', IconMemb)}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button onClick={sair} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: 'transparent', color: 'rgba(255,255,255,.4)' }}>
            <IconOut />Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, minWidth: 0, padding: '28px 26px 60px', overflowX: 'hidden' }}>
        {tab === 'materiais' && (
          <div style={{ maxWidth: 720 }}>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 4px' }}>Materiais</h1>
            <p style={{ fontSize: 14, color: '#7C7090', margin: '0 0 22px' }}>Adicione recursos e agende a liberação (drip).</p>

            <div style={{ ...CARD, marginBottom: 26 }}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Adicionar material</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div><label style={LABEL}>Título</label><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: Baralho Cartas do Inconsciente" style={INPUT} /></div>
                <div><label style={LABEL}>Descrição</label><textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={2} placeholder="Breve descrição" style={{ ...INPUT, resize: 'vertical' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={LABEL}>Categoria</label><select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={INPUT}>{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label style={LABEL}>Tipo</label><select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={INPUT}>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={LABEL}>Tema do mês</label><input value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} placeholder="Ex.: Arteterapia Junguiana" style={INPUT} /></div>
                  <div><label style={LABEL}>Rótulo</label><input value={form.rotulo} onChange={e => setForm({ ...form, rotulo: e.target.value })} placeholder='Ex.: "Semana 1"' style={INPUT} /></div>
                </div>
                <div><label style={LABEL}>Arquivo (upload)</label><input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 14 }} /><div style={{ fontSize: 12, color: '#9B95AC', marginTop: 4 }}>Ou use um link externo abaixo.</div></div>
                <div><label style={LABEL}>Link externo (opcional)</label><input value={form.link_externo} onChange={e => setForm({ ...form, link_externo: e.target.value })} placeholder="https://…" style={INPUT} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 14, alignItems: 'end' }}>
                  <div><label style={LABEL}>Liberar em (agendamento)</label><input type="datetime-local" value={form.liberar_em} onChange={e => setForm({ ...form, liberar_em: e.target.value })} style={INPUT} /><div style={{ fontSize: 12, color: '#9B95AC', marginTop: 4 }}>Vazio = agora. Futuro = agendado.</div></div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, paddingBottom: 8 }}><input type="checkbox" checked={form.gratis} onChange={e => setForm({ ...form, gratis: e.target.checked })} /> grátis</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, paddingBottom: 8 }}><input type="checkbox" checked={form.publicado} onChange={e => setForm({ ...form, publicado: e.target.checked })} /> publicado</label>
                </div>
                {err && <p style={{ color: '#C0392B', fontSize: 13, margin: 0 }}>{err}</p>}
                {msg && <p style={{ color: '#1F7A50', fontSize: 13, margin: 0 }}>{msg}</p>}
                <button onClick={salvar} disabled={busy} style={{ border: 'none', background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 14, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Salvando…' : 'Salvar material'}</button>
              </div>
            </div>

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
                    <div style={{ fontSize: 12.5, color: '#7C7090', marginTop: 3 }}>{m.tema ? `${m.tema} · ` : ''}{m.rotulo ? `${m.rotulo} · ` : ''}libera {fmt(m.liberar_em)}{m.arquivo ? ' · arquivo' : m.link_externo ? ' · link' : ''}</div>
                  </div>
                  <button onClick={() => excluir(m.id)} style={{ border: '1.5px solid #F3C7C1', background: '#FFF6F4', color: '#C0392B', fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 12, cursor: 'pointer', flex: 'none' }}>Excluir</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'assinantes' && (
          <div style={{ maxWidth: 820 }}>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 4px' }}>Assinantes</h1>
            <p style={{ fontSize: 14, color: '#7C7090', margin: '0 0 22px' }}>Quem entrou no Clube (trial e pagantes).</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 22 }}>
              {[['Total', stats.total, '#6C3FB0'], ['Em trial', stats.trial, '#C79A2E'], ['Ativos', stats.ativos, '#2FA36B'], ['Cancelados', stats.cancel, '#B24A4A']].map(([lbl, val, col]) => (
                <div key={lbl as string} style={{ ...CARD, padding: 16 }}>
                  <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: col as string }}>{val as number}</div>
                  <div style={{ fontSize: 12.5, color: '#7C7090', marginTop: 2 }}>{lbl as string}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {membros.length === 0 && (
                <div style={{ ...CARD, color: '#7C7090', fontSize: 14, lineHeight: 1.6 }}>
                  Nenhum assinante ainda. Eles vão aparecer aqui automaticamente assim que o <strong>webhook da assinatura</strong> estiver ativo (próximo passo) e alguém entrar no teste grátis.
                </div>
              )}
              {membros.map(m => (
                <div key={m.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: '#F0E8FB', color: '#6C3FB0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flex: 'none' }}>{(m.nome || m.email).charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.nome || m.email.split('@')[0]}</div>
                    <div style={{ fontSize: 12.5, color: '#7C7090' }}>{m.email} · entrou {fmtD(m.iniciou_em)}</div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flex: 'none',
                    ...(m.status === 'ativo' ? { color: '#1F7A50', background: '#E4F5EC' } : m.status === 'trial' ? { color: '#8A6716', background: '#FEF6E6' } : { color: '#B24A4A', background: '#FBEAEA' }) }}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
