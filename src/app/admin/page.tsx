'use client';

import { useState, useEffect, useCallback } from 'react';

interface Material {
  id: string; titulo: string; descricao: string | null; categoria: string | null;
  tipo: string | null; arquivo: string | null; link_externo: string | null;
  tema: string | null; rotulo: string | null; liberar_em: string; gratis: boolean; publicado: boolean;
}
interface Membro { id: string; email: string; nome: string | null; status: string; plano: string | null; iniciou_em: string; criado_em: string; }
interface Tema { id: string; nome: string; inicio_em: string; }
interface Enquete { id: string; pergunta: string; opcoes: string[]; publicar_em: string; encerrar_em: string; publicado: boolean; }

const CATEGORIAS = ['Baralhos', 'Fichas', 'Áudios & Aulas', 'Protocolos'];
const TIPOS = ['pdf', 'audio', 'video', 'link'];
const PW_KEY = 'clube_admin_pw';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #ECE7F1', borderRadius: 16, padding: 20, boxShadow: '0 6px 20px rgba(108,63,176,.06)' };
const LABEL: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#6C3FB0', textTransform: 'uppercase', letterSpacing: '.4px', margin: '0 0 6px' };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '1.5px solid #ECE7F1', fontSize: 14, background: '#FBFAFE', color: '#251A38' };

const IconMat = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3.4 8.4 4.2L12 11.8 3.6 7.6z"></path><path d="m3.6 12 8.4 4.2 8.4-4.2"></path><path d="m3.6 16.4 8.4 4.2 8.4-4.2"></path></svg>);
const IconMemb = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7.6" r="3.4"></circle><path d="M2.8 20.4v-1.3a4.6 4.6 0 0 1 4.6-4.6h3.2a4.6 4.6 0 0 1 4.6 4.6v1.3"></path><path d="M17 4.4a3.6 3.6 0 0 1 0 6.8"></path></svg>);
const IconOut = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.6 4.6h3.8a1.5 1.5 0 0 1 1.5 1.5v11.8a1.5 1.5 0 0 1-1.5 1.5h-3.8"></path><path d="m9.6 8.6-3.4 3.4 3.4 3.4"></path><path d="M6.4 12h9.2"></path></svg>);
const IconEnq = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 20V11M12 20V5M19 20v-6"></path></svg>);
const IconBell = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8.6a6 6 0 1 0-12 0c0 4.9-2 6.4-2 6.4h16s-2-1.5-2-6.4"></path><path d="M13.7 19a2 2 0 0 1-3.4 0"></path></svg>);

function emptyForm() {
  return { titulo: '', descricao: '', categoria: CATEGORIAS[0], tipo: 'pdf', link_externo: '', tema_id: '', semana: '', dataManual: '', gratis: true, publicado: true };
}
async function safeJson(res: Response) { const t = await res.text(); try { return JSON.parse(t); } catch { return { error: t || `HTTP ${res.status}` }; } }

export default function AdminClube() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [tab, setTab] = useState<'materiais' | 'assinantes' | 'enquetes' | 'notificacoes'>('materiais');

  const [list, setList] = useState<Material[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [temaForm, setTemaForm] = useState({ nome: '', inicio_em: '' });
  const [membros, setMembros] = useState<Membro[]>([]);
  const [enquetes, setEnquetes] = useState<Enquete[]>([]);
  const [enqForm, setEnqForm] = useState({ pergunta: '', opcoes: '', publicar_em: '', encerrar_em: '' });
  const [notif, setNotif] = useState({ titulo: '', corpo: '' });
  const [notifRes, setNotifRes] = useState('');

  const loadMateriais = useCallback(async (p: string) => {
    const res = await fetch('/api/admin/materiais', { headers: { 'x-admin-password': p } });
    if (res.status === 401) { setLoginErr('Senha incorreta.'); setAuthed(false); localStorage.removeItem(PW_KEY); return false; }
    const data = await safeJson(res);
    setList(data.materiais ?? []);
    return true;
  }, []);
  const loadTemas = useCallback(async (p: string) => {
    const res = await fetch('/api/admin/temas', { headers: { 'x-admin-password': p } });
    if (res.ok) { const d = await safeJson(res); setTemas(d.temas ?? []); }
  }, []);
  const loadMembros = useCallback(async (p: string) => {
    const res = await fetch('/api/admin/membros', { headers: { 'x-admin-password': p } });
    if (res.ok) { const d = await safeJson(res); setMembros(d.membros ?? []); }
  }, []);
  const loadEnquetes = useCallback(async (p: string) => {
    const res = await fetch('/api/admin/enquetes', { headers: { 'x-admin-password': p } });
    if (res.ok) { const d = await safeJson(res); setEnquetes(d.enquetes ?? []); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(PW_KEY);
    if (saved) {
      setPw(saved);
      loadMateriais(saved).then(ok => { if (ok) { setAuthed(true); loadTemas(saved); loadMembros(saved); loadEnquetes(saved); } });
    }
  }, [loadMateriais, loadTemas, loadMembros, loadEnquetes]);

  const entrar = async () => {
    const p = pwInput.trim();
    if (!p) return;
    setPw(p);
    const ok = await loadMateriais(p);
    if (ok) { localStorage.setItem(PW_KEY, p); setAuthed(true); setLoginErr(''); loadTemas(p); loadMembros(p); loadEnquetes(p); }
  };

  const criarEnquete = async () => {
    setErr(''); setMsg('');
    const opcoes = enqForm.opcoes.split('\n').map(s => s.trim()).filter(Boolean);
    if (!enqForm.pergunta.trim()) { setErr('Escreva a pergunta da enquete.'); return; }
    if (opcoes.length < 2) { setErr('Adicione ao menos 2 opções (uma por linha).'); return; }
    if (!enqForm.encerrar_em) { setErr('Defina quando a enquete encerra.'); return; }
    const body = {
      pergunta: enqForm.pergunta.trim(), opcoes,
      publicar_em: enqForm.publicar_em ? new Date(enqForm.publicar_em).toISOString() : new Date().toISOString(),
      encerrar_em: new Date(enqForm.encerrar_em).toISOString(),
    };
    const res = await fetch('/api/admin/enquetes', { method: 'POST', headers: { 'x-admin-password': pw, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await safeJson(res);
    if (!res.ok) { setErr(d.error || 'Erro ao criar enquete'); return; }
    setEnqForm({ pergunta: '', opcoes: '', publicar_em: '', encerrar_em: '' });
    setMsg('Enquete criada! ✓');
    loadEnquetes(pw);
  };
  const excluirEnquete = async (id: string) => {
    if (!confirm('Excluir esta enquete? (os votos também são apagados)')) return;
    await fetch(`/api/admin/enquetes/${id}`, { method: 'DELETE', headers: { 'x-admin-password': pw } });
    loadEnquetes(pw);
  };
  const enviarNotif = async () => {
    setNotifRes('');
    if (!notif.titulo.trim()) { setNotifRes('Escreva o título.'); return; }
    if (!confirm('Enviar esta notificação para todos os assinantes?')) return;
    const res = await fetch('/api/admin/notificar', { method: 'POST', headers: { 'x-admin-password': pw, 'Content-Type': 'application/json' }, body: JSON.stringify(notif) });
    const d = await safeJson(res);
    if (!res.ok) { setNotifRes(d.error || 'Erro ao enviar'); return; }
    setNotifRes(`✓ Enviado para ${d.enviados} de ${d.total} aparelho(s).`);
    setNotif({ titulo: '', corpo: '' });
  };
  const sair = () => { localStorage.removeItem(PW_KEY); setAuthed(false); setPwInput(''); };

  // ─── Cálculo do agendamento por Tema + Semana ────────────────────
  const semanaNum = /^[1-4]$/.test(form.semana) ? parseInt(form.semana) : 0;
  const temaSel = temas.find(t => t.id === form.tema_id);
  const dataAuto: Date | null = (temaSel && semanaNum) ? (() => {
    const d = new Date(temaSel.inicio_em + 'T08:00:00');
    d.setDate(d.getDate() + (semanaNum - 1) * 7);
    return d;
  })() : null;

  const criarTema = async () => {
    if (!temaForm.nome.trim() || !temaForm.inicio_em) { setErr('Preencha nome e data de início do tema.'); return; }
    const res = await fetch('/api/admin/temas', { method: 'POST', headers: { 'x-admin-password': pw, 'Content-Type': 'application/json' }, body: JSON.stringify(temaForm) });
    const d = await safeJson(res);
    if (!res.ok) { setErr(d.error || 'Erro ao criar tema'); return; }
    setTemaForm({ nome: '', inicio_em: '' }); setErr('');
    loadTemas(pw);
  };
  const excluirTema = async (id: string) => {
    if (!confirm('Excluir este tema? (os materiais já criados continuam)')) return;
    await fetch(`/api/admin/temas/${id}`, { method: 'DELETE', headers: { 'x-admin-password': pw } });
    loadTemas(pw);
  };

  const salvar = async () => {
    setErr(''); setMsg('');
    if (!form.titulo.trim()) { setErr('Preencha o título.'); return; }
    setBusy(true);
    try {
      let arquivo: string | null = null;
      if (file) {
        const r = await fetch('/api/admin/upload-url', { method: 'POST', headers: { 'x-admin-password': pw, 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name }) });
        const ud = await safeJson(r);
        if (!r.ok) throw new Error(ud.error || 'Erro ao preparar upload');
        const put = await fetch(ud.signedUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type || 'application/octet-stream', 'x-upsert': 'true' } });
        if (!put.ok) throw new Error(`Falha ao enviar o arquivo (${put.status})`);
        arquivo = ud.path;
      }
      const liberar_em = dataAuto ? dataAuto.toISOString() : (form.dataManual ? new Date(form.dataManual).toISOString() : new Date().toISOString());
      const rotulo = semanaNum ? `Semana ${semanaNum}` : null;
      const body = {
        titulo: form.titulo.trim(), descricao: form.descricao || null, categoria: form.categoria, tipo: form.tipo,
        arquivo, link_externo: form.link_externo || null, tema: temaSel ? temaSel.nome : null, rotulo,
        liberar_em, gratis: form.gratis, publicado: form.publicado,
      };
      const res = await fetch('/api/admin/materiais', { method: 'POST', headers: { 'x-admin-password': pw, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setMsg('Material salvo! ✓');
      setForm(f => ({ ...emptyForm(), categoria: f.categoria, tema_id: f.tema_id })); // mantém tema/categoria pra agilizar
      setFile(null);
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

  const fmt = (iso: string | Date) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtD = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  const navBtn = (id: 'materiais' | 'assinantes' | 'enquetes' | 'notificacoes', label: string, Icon: () => React.ReactElement) => {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left', background: active ? 'rgba(145,99,224,.22)' : 'transparent', color: active ? '#D9CBF5' : 'rgba(255,255,255,.6)' }}>
        <Icon />{label}
      </button>
    );
  };

  const stats = { total: membros.length, trial: membros.filter(m => m.status === 'trial').length, ativos: membros.filter(m => m.status === 'ativo').length, cancel: membros.filter(m => m.status === 'cancelado').length };

  // ─── Dashboard ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#F7F4FC' }}>
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
          {navBtn('enquetes', 'Enquetes', IconEnq)}
          {navBtn('notificacoes', 'Notificações', IconBell)}
          {navBtn('assinantes', 'Assinantes', IconMemb)}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button onClick={sair} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: 'transparent', color: 'rgba(255,255,255,.4)' }}>
            <IconOut />Sair
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: '28px 26px 60px', overflowX: 'hidden' }}>
        {tab === 'materiais' && (
          <div style={{ maxWidth: 720 }}>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 4px' }}>Materiais</h1>
            <p style={{ fontSize: 14, color: '#7C7090', margin: '0 0 22px' }}>Crie um tema do mês, depois é só escolher a semana — o material agenda sozinho.</p>

            {/* Temas do mês */}
            <div style={{ ...CARD, marginBottom: 20 }}>
              <div className="serif" style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Temas do mês</div>
              <p style={{ fontSize: 12.5, color: '#7C7090', margin: '0 0 14px' }}>Ex.: “Arteterapia Junguiana”, com a data da Semana 1. As semanas seguintes agendam de 7 em 7 dias.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end', marginBottom: temas.length ? 14 : 0 }}>
                <div style={{ flex: '1 1 220px' }}><label style={LABEL}>Nome do tema</label><input value={temaForm.nome} onChange={e => setTemaForm({ ...temaForm, nome: e.target.value })} placeholder="Arteterapia Junguiana" style={INPUT} /></div>
                <div style={{ flex: '0 1 180px' }}><label style={LABEL}>Início (Semana 1)</label><input type="date" value={temaForm.inicio_em} onChange={e => setTemaForm({ ...temaForm, inicio_em: e.target.value })} style={INPUT} /></div>
                <button onClick={criarTema} style={{ border: 'none', background: '#9163E0', color: '#fff', fontWeight: 700, fontSize: 14, padding: '11px 18px', borderRadius: 12, cursor: 'pointer' }}>Criar tema</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {temas.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FBFAFE', border: '1px solid #EFEAF7', borderRadius: 12, padding: '9px 13px' }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, flex: 1 }}>{t.nome}</span>
                    <span style={{ fontSize: 12, color: '#7C7090' }}>Semana 1: {fmtD(t.inicio_em)}</span>
                    <button onClick={() => excluirTema(t.id)} style={{ border: 'none', background: 'none', color: '#B24A4A', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>excluir</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Adicionar material */}
            <div style={{ ...CARD, marginBottom: 26 }}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Adicionar material</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div><label style={LABEL}>Título</label><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: Baralho Cartas do Inconsciente" style={INPUT} /></div>
                <div><label style={LABEL}>Descrição</label><textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={2} placeholder="Breve descrição" style={{ ...INPUT, resize: 'vertical' }} /></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14 }}>
                  <div><label style={LABEL}>Tema do mês</label>
                    <select value={form.tema_id} onChange={e => setForm({ ...form, tema_id: e.target.value })} style={INPUT}>
                      <option value="">— sem tema —</option>
                      {temas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                  </div>
                  <div><label style={LABEL}>Semana</label>
                    <select value={form.semana} onChange={e => setForm({ ...form, semana: e.target.value })} style={INPUT}>
                      <option value="">avulso</option>
                      <option value="1">Semana 1</option><option value="2">Semana 2</option><option value="3">Semana 3</option><option value="4">Semana 4</option>
                    </select>
                  </div>
                  <div><label style={LABEL}>Categoria</label>
                    <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={INPUT}>{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                </div>

                {/* Agendamento */}
                <div style={{ background: dataAuto ? '#EFEBFA' : '#FBFAFE', border: '1px solid #EAE2F6', borderRadius: 12, padding: '11px 14px' }}>
                  {dataAuto ? (
                    <div style={{ fontSize: 13, color: '#4A2A80' }}>📅 Será liberado automaticamente em <strong>{fmt(dataAuto)}</strong> ({temaSel?.nome} · Semana {semanaNum}).</div>
                  ) : (
                    <div>
                      <label style={LABEL}>Liberar em (manual)</label>
                      <input type="datetime-local" value={form.dataManual} onChange={e => setForm({ ...form, dataManual: e.target.value })} style={INPUT} />
                      <div style={{ fontSize: 12, color: '#9B95AC', marginTop: 4 }}>Vazio = liberar agora. (Escolha um Tema + Semana pra agendar automático.)</div>
                    </div>
                  )}
                </div>

                {/* Arquivo */}
                <div>
                  <label style={LABEL}>Arquivo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ border: '1.5px solid #DCD2EC', background: '#F5F0FC', color: '#6C3FB0', fontWeight: 700, fontSize: 13.5, padding: '10px 16px', borderRadius: 12, cursor: 'pointer' }}>
                      Escolher arquivo
                      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: 13, color: file ? '#251A38' : '#9B95AC', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file ? file.name : 'nenhum arquivo selecionado'}</span>
                    {file && <button onClick={() => setFile(null)} style={{ border: 'none', background: 'none', color: '#B24A4A', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>remover</button>}
                  </div>
                  <div style={{ fontSize: 12, color: '#9B95AC', marginTop: 5 }}>Ou use um link externo abaixo (vídeo, etc.).</div>
                </div>
                <div><label style={LABEL}>Link externo (opcional)</label><input value={form.link_externo} onChange={e => setForm({ ...form, link_externo: e.target.value })} placeholder="https://…" style={INPUT} /></div>

                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><input type="checkbox" checked={form.gratis} onChange={e => setForm({ ...form, gratis: e.target.checked })} /> grátis</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><input type="checkbox" checked={form.publicado} onChange={e => setForm({ ...form, publicado: e.target.checked })} /> publicado</label>
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
                  Nenhum assinante ainda. Eles vão aparecer aqui automaticamente assim que o <strong>webhook da assinatura (Hotmart)</strong> estiver ativo e alguém entrar no teste grátis.
                </div>
              )}
              {membros.map(m => (
                <div key={m.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: '#F0E8FB', color: '#6C3FB0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flex: 'none' }}>{(m.nome || m.email).charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.nome || m.email.split('@')[0]}</div>
                    <div style={{ fontSize: 12.5, color: '#7C7090' }}>{m.email}</div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flex: 'none', ...(m.status === 'ativo' ? { color: '#1F7A50', background: '#E4F5EC' } : m.status === 'trial' ? { color: '#8A6716', background: '#FEF6E6' } : { color: '#B24A4A', background: '#FBEAEA' }) }}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'enquetes' && (
          <div style={{ maxWidth: 680 }}>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 4px' }}>Enquetes</h1>
            <p style={{ fontSize: 14, color: '#7C7090', margin: '0 0 22px' }}>Crie a votação do tema e agende quando abre e encerra. O assinante vê um aviso na tela inicial.</p>

            <div style={{ ...CARD, marginBottom: 26 }}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Nova enquete</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div><label style={LABEL}>Pergunta</label><input value={enqForm.pergunta} onChange={e => setEnqForm({ ...enqForm, pergunta: e.target.value })} placeholder="Qual tema você quer no próximo mês?" style={INPUT} /></div>
                <div><label style={LABEL}>Opções (uma por linha)</label><textarea value={enqForm.opcoes} onChange={e => setEnqForm({ ...enqForm, opcoes: e.target.value })} rows={4} placeholder={'Regulação e Nervo Vago\nAnsiedade\nLuto\nCriança e TEA'} style={{ ...INPUT, resize: 'vertical' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={LABEL}>Abrir em</label><input type="datetime-local" value={enqForm.publicar_em} onChange={e => setEnqForm({ ...enqForm, publicar_em: e.target.value })} style={INPUT} /><div style={{ fontSize: 12, color: '#9B95AC', marginTop: 4 }}>Vazio = agora.</div></div>
                  <div><label style={LABEL}>Encerrar em</label><input type="datetime-local" value={enqForm.encerrar_em} onChange={e => setEnqForm({ ...enqForm, encerrar_em: e.target.value })} style={INPUT} /></div>
                </div>
                {err && <p style={{ color: '#C0392B', fontSize: 13, margin: 0 }}>{err}</p>}
                {msg && <p style={{ color: '#1F7A50', fontSize: 13, margin: 0 }}>{msg}</p>}
                <button onClick={criarEnquete} style={{ border: 'none', background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 14, cursor: 'pointer' }}>Criar enquete</button>
              </div>
            </div>

            <div className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Enquetes ({enquetes.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {enquetes.length === 0 && <div style={{ ...CARD, color: '#7C7090', fontSize: 14 }}>Nenhuma enquete ainda.</div>}
              {enquetes.map(e => {
                const now = Date.now();
                const st = new Date(e.publicar_em).getTime() > now ? { t: 'Agendada', c: '#8A6716', b: '#FEF6E6' } : new Date(e.encerrar_em).getTime() > now ? { t: 'Ativa', c: '#1F7A50', b: '#E4F5EC' } : { t: 'Encerrada', c: '#7C7090', b: '#F1EDF6' };
                return (
                  <div key={e.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{e.pergunta}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: st.c, background: st.b, padding: '2px 8px', borderRadius: 20 }}>{st.t}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#7C7090', marginTop: 3 }}>{e.opcoes.length} opções · encerra {fmt(e.encerrar_em)}</div>
                    </div>
                    <button onClick={() => excluirEnquete(e.id)} style={{ border: '1.5px solid #F3C7C1', background: '#FFF6F4', color: '#C0392B', fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 12, cursor: 'pointer', flex: 'none' }}>Excluir</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'notificacoes' && (
          <div style={{ maxWidth: 540 }}>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 4px' }}>Notificações</h1>
            <p style={{ fontSize: 14, color: '#7C7090', margin: '0 0 22px' }}>Envie um aviso no celular de todos os assinantes que ativaram as notificações.</p>
            <div style={{ ...CARD }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div><label style={LABEL}>Título</label><input value={notif.titulo} onChange={e => setNotif({ ...notif, titulo: e.target.value })} placeholder="Ex.: Novo material no ar! 💜" style={INPUT} /></div>
                <div><label style={LABEL}>Mensagem</label><textarea value={notif.corpo} onChange={e => setNotif({ ...notif, corpo: e.target.value })} rows={3} placeholder="Ex.: O baralho da Semana 2 já está na sua biblioteca." style={{ ...INPUT, resize: 'vertical' }} /></div>
                {notifRes && <p style={{ fontSize: 13, margin: 0, color: notifRes.startsWith('✓') ? '#1F7A50' : '#C0392B' }}>{notifRes}</p>}
                <button onClick={enviarNotif} style={{ border: 'none', background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 14, cursor: 'pointer' }}>Enviar notificação</button>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: '#9B95AC', marginTop: 14, lineHeight: 1.5 }}>Só recebe quem ativou as notificações no celular. O assinante ativa pelo aviso 🔔 na tela inicial dele.</p>
          </div>
        )}
      </main>
    </div>
  );
}
