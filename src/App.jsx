import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, Server, TrendingUp, Users, DollarSign,
  Shield, Bell, Settings, LogOut, Menu, Globe,
  Zap, BarChart2, X, Eye, EyeOff, Lock, User,
  AlertTriangle, CheckCircle
} from 'lucide-react';

// ─── Utilities ────────────────────────────────────────────────────────────────
const rnd    = (a, b) => Math.random() * (b - a) + a;
const rndInt = (a, b) => Math.round(rnd(a, b));
const tNow   = () => new Date().toLocaleTimeString('en-US', { hour12: false });
const mkArr  = (n, fn) => Array.from({ length: n }, fn);

const mkCPU  = n => mkArr(n, () => ({ t: tNow(), c1: rndInt(20,85), c2: rndInt(18,90), c3: rndInt(25,82), c4: rndInt(22,86) }));
const mkTraf = n => mkArr(n, () => ({ t: tNow(), req: rndInt(800,5200), err: rndInt(8,220), lat: rndInt(25,380) }));
const mkFin  = n => { let b = 43000; return mkArr(n, () => { b += rnd(-700,700); return { t: tNow(), BTC: Math.round(b), ETH: Math.round(b/15+rnd(-80,80)), SOL: Math.round(b/420+rnd(-5,5)) }; }); };
const mkMem  = n => mkArr(n, () => { const u = rndInt(45,86); return { t: tNow(), used: u, cached: rndInt(7,20), free: Math.max(4, 100-u-rndInt(7,17)) }; });

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = { bg:'#060B16', card:'#0B1422', border:'#0E1C32', text:'#E2E8F0', muted:'#3A506B', blue:'#3B82F6', green:'#10B981', red:'#EF4444', yellow:'#F59E0B', purple:'#A855F7', cyan:'#06B6D4' };
const TT = { contentStyle:{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontSize:11, color:C.text }, labelStyle:{ color:'#94A3B8' } };
const AX = { tick:{ fill:'#3A506B', fontSize:10 }, tickLine:false, axisLine:false };

// ════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [users,    setUsers]    = useState([]);          // [{username, password}]
  const [me,       setMe]       = useState(null);        // current username or null
  const [authMode, setAuthMode] = useState('login');

  // ── UI ────────────────────────────────────────────────────────────────────
  const [page,      setPage]      = useState('overview');
  const [sideOpen,  setSideOpen]  = useState(true);
  const [showBell,  setShowBell]  = useState(false);
  const [tick,      setTick]      = useState(new Date());

  // ── Live data ─────────────────────────────────────────────────────────────
  const [cpuD,  setCpuD]  = useState(() => mkCPU(22));
  const [trafD, setTrafD] = useState(() => mkTraf(22));
  const [finD,  setFinD]  = useState(() => mkFin(22));
  const [memD,  setMemD]  = useState(() => mkMem(22));
  const [kpi,   setKpi]   = useState({ users:2847, rps:1243, lat:142, err:0.82, rev:48329, up:99.97, cpu:62, mem:68 });
  const [bells, setBells] = useState([
    { id:1, k:'warn', msg:'CPU Core 2 spike: 94%',         ago:'2s ago' },
    { id:2, k:'ok',   msg:'Deployment completed',           ago:'1m ago' },
    { id:3, k:'err',  msg:'DB timeout on shard-3',          ago:'3m ago' },
    { id:4, k:'ok',   msg:'+2 instances auto-scaled',       ago:'5m ago' },
  ]);

  // ── Live ticker (only runs when logged in) ────────────────────────────────
  useEffect(() => {
    if (!me) return;                       // ← guard uses `me`, not a stale var
    const id = window.setInterval(() => {
      const t = tNow();
      setCpuD(p  => [...p.slice(1),  { t, c1:rndInt(18,94), c2:rndInt(15,96), c3:rndInt(22,86), c4:rndInt(20,88) }]);
      setTrafD(p => [...p.slice(1),  { t, req:rndInt(600,5600), err:rndInt(4,260), lat:rndInt(12,420) }]);
      setFinD(p  => { const b=Math.max(28000, Math.round(p[p.length-1].BTC+rnd(-900,900))); return [...p.slice(1), { t, BTC:b, ETH:Math.round(b/15+rnd(-90,90)), SOL:Math.round(b/420+rnd(-7,7)) }]; });
      setMemD(p  => { const u=rndInt(44,88); return [...p.slice(1), { t, used:u, cached:rndInt(7,21), free:Math.max(4,100-u-rndInt(7,18)) }]; });
      setKpi(p   => ({ users:Math.round(p.users+rnd(-60,90)), rps:rndInt(880,1900), lat:rndInt(75,320), err:parseFloat(rnd(0.2,2.4).toFixed(2)), rev:Math.round(p.rev+rnd(8,240)), up:99.97, cpu:rndInt(42,88), mem:rndInt(52,86) }));
      setTick(new Date());
      if (Math.random() < 0.12) {
        const pool = [
          { k:'warn', msg:`CPU spike ${rndInt(88,99)}%` },
          { k:'ok',   msg:`${rndInt(80,400)} sessions joined` },
          { k:'err',  msg:'High latency: /api/search' },
          { k:'ok',   msg:'Cache invalidated' },
        ];
        setBells(prev => [{ id:Date.now(), ...pool[Math.floor(Math.random()*pool.length)], ago:'now' }, ...prev.slice(0,8)]);
      }
    }, 1500);
    return () => window.clearInterval(id);
  }, [me]);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const doRegister = ({ username, password, confirm }) => {
    const u = username.trim();
    if (u.length < 3)   return 'Username must be at least 3 characters.';
    if (password.length < 4) return 'Password must be at least 4 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    if (users.find(x => x.username.toLowerCase() === u.toLowerCase())) return `"${u}" is already taken.`;
    setUsers(prev => [...prev, { username: u, password }]);
    setMe(u);
    return null;
  };

  const doLogin = ({ username, password }) => {
    if (!username.trim()) return 'Please enter your username.';
    if (!password)        return 'Please enter your password.';
    const found = users.find(x => x.username === username.trim() && x.password === password);
    if (!found) return 'Incorrect username or password.';
    setMe(username.trim());
    return null;
  };

  // ── Not logged in → show auth ─────────────────────────────────────────────
  if (!me) return (
    <AuthScreen mode={authMode} setMode={setAuthMode} onLogin={doLogin} onRegister={doRegister} />
  );

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Sidebar open={sideOpen} page={page} setPage={setPage} username={me} onLogout={() => setMe(null)} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', marginLeft:sideOpen ? 220 : 56, transition:'margin-left .26s' }}>
        <TopBar sideOpen={sideOpen} toggle={() => setSideOpen(p=>!p)} bells={bells} showBell={showBell} setShowBell={setShowBell} tick={tick} username={me} />
        <main style={{ flex:1, overflowY:'auto', padding:'24px 24px 50px' }}>
          {page === 'overview'  && <PageOverview  kpi={kpi} cpu={cpuD} traffic={trafD} />}
          {page === 'server'    && <PageServer    kpi={kpi} cpu={cpuD} mem={memD} />}
          {page === 'traffic'   && <PageTraffic   traffic={trafD} kpi={kpi} />}
          {page === 'financial' && <PageFinancial fin={finD} />}
          {page === 'settings'  && <PageSettings  />}
        </main>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN  — register any username + password, then sign in with it
// ════════════════════════════════════════════════════════════════════════════
function AuthScreen({ mode, setMode, onLogin, onRegister }) {
  const isLogin = mode === 'login';
  const [form,   setForm]   = useState({ username:'', password:'', confirm:'' });
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [okMsg,  setOkMsg]  = useState('');
  const [busy,   setBusy]   = useState(false);

  const switchMode = m => { setMode(m); setErrMsg(''); setOkMsg(''); setForm({ username:'', password:'', confirm:'' }); };

  const submit = () => {
    setErrMsg(''); setOkMsg(''); setBusy(true);
    window.setTimeout(() => {
      const err = isLogin
        ? onLogin({ username: form.username, password: form.password })
        : onRegister({ username: form.username, password: form.password, confirm: form.confirm });
      if (err) setErrMsg(err);
      else if (!isLogin) setOkMsg('Account created! Signing you in…');
      setBusy(false);
    }, 800);
  };

  const inp = { width:'100%', padding:'11px 14px 11px 40px', background:'rgba(14,28,50,.75)', border:'1px solid rgba(59,130,246,.18)', borderRadius:8, color:C.text, fontSize:14, outline:'none', boxSizing:'border-box' };
  const lbl = { fontSize:11, color:'#94A3B8', letterSpacing:1.1, textTransform:'uppercase', display:'block', marginBottom:7 };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(ellipse at 28% 18%, #0B1D3A 0%, #030710 65%)', position:'relative', overflow:'hidden' }}>
      {/* dot grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(59,130,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.03) 1px,transparent 1px)', backgroundSize:'50px 50px' }} />
      <div style={{ position:'absolute', top:'10%', left:'8%',   width:360, height:360, background:'radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'12%', right:'6%', width:280, height:280, background:'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ background:'rgba(9,15,28,.96)', border:'1px solid rgba(59,130,246,.16)', borderRadius:18, padding:'38px 36px 44px', width:'100%', maxWidth:420, backdropFilter:'blur(20px)', position:'relative', zIndex:1, boxShadow:'0 0 80px rgba(59,130,246,.07),0 28px 60px rgba(0,0,0,.55)' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:11, marginBottom:20 }}>
          <div style={{ background:'linear-gradient(135deg,#3B82F6,#7C3AED)', borderRadius:10, padding:8 }}><Activity size={20} color='#fff' /></div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:'-.3px' }}>NexusDash</div>
            <div style={{ fontSize:9.5, color:'#475569', letterSpacing:2.5, textTransform:'uppercase' }}>Analytics Platform</div>
          </div>
        </div>

        {/* Status dot */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, marginBottom:22 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, boxShadow:`0 0 8px ${C.green}`, display:'inline-block' }} />
          <span style={{ fontSize:10.5, color:'#475569', letterSpacing:1.8, textTransform:'uppercase' }}>All Systems Operational</span>
        </div>

        {/* Tab toggle */}
        <div style={{ display:'flex', background:'rgba(14,28,50,.8)', borderRadius:9, padding:3, marginBottom:26 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{ flex:1, padding:'8px 0', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all .2s', background:mode===m ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'transparent', color:mode===m ? '#fff' : '#3A506B', boxShadow:mode===m ? '0 3px 12px rgba(59,130,246,.28)' : 'none' }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <h2 style={{ fontSize:19, fontWeight:700, textAlign:'center', marginBottom:4 }}>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        <p style={{ fontSize:12.5, color:'#475569', textAlign:'center', marginBottom:24 }}>{isLogin ? 'Sign in with your credentials' : 'Choose any username & password'}</p>

        {/* Username */}
        <div style={{ marginBottom:13 }}>
          <label style={lbl}>Username</label>
          <div style={{ position:'relative' }}>
            <User size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
            <input type='text' value={form.username} placeholder={isLogin ? 'Your username' : 'Pick a username (min 3 chars)'} onChange={e => setForm(p => ({ ...p, username:e.target.value }))} onKeyDown={e => e.key==='Enter' && submit()} style={inp} />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: isLogin ? 2 : 13 }}>
          <label style={lbl}>Password</label>
          <div style={{ position:'relative' }}>
            <Lock size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
            <input type={showPw ? 'text' : 'password'} value={form.password} placeholder={isLogin ? 'Your password' : 'Pick a password (min 4 chars)'} onChange={e => setForm(p => ({ ...p, password:e.target.value }))} onKeyDown={e => e.key==='Enter' && submit()} style={{ ...inp, paddingRight:40 }} />
            <button onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#475569', cursor:'pointer', display:'flex' }}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Confirm (register only) */}
        {!isLogin && (
          <div style={{ marginBottom:2 }}>
            <label style={lbl}>Confirm Password</label>
            <div style={{ position:'relative' }}>
              <Lock size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
              <input type={showCp ? 'text' : 'password'} value={form.confirm} placeholder='Re-enter your password' onChange={e => setForm(p => ({ ...p, confirm:e.target.value }))} onKeyDown={e => e.key==='Enter' && submit()} style={{ ...inp, paddingRight:40 }} />
              <button onClick={() => setShowCp(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#475569', cursor:'pointer', display:'flex' }}>
                {showCp ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Error banner */}
        {errMsg && <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:13, padding:'9px 13px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.24)', borderRadius:7 }}>
          <AlertTriangle size={12} color={C.red} /><span style={{ fontSize:12, color:C.red }}>{errMsg}</span>
        </div>}

        {/* Success banner */}
        {okMsg && <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:13, padding:'9px 13px', background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.24)', borderRadius:7 }}>
          <CheckCircle size={12} color={C.green} /><span style={{ fontSize:12, color:C.green }}>{okMsg}</span>
        </div>}

        {/* Submit */}
        <button onClick={submit} disabled={busy} style={{ width:'100%', marginTop:18, padding:'13px', background:busy ? 'rgba(59,130,246,.4)' : 'linear-gradient(135deg,#3B82F6,#6366F1)', border:'none', borderRadius:8, color:'#fff', fontSize:14.5, fontWeight:700, cursor:busy ? 'not-allowed' : 'pointer', boxShadow:'0 5px 20px rgba(59,130,246,.24)', transition:'all .2s' }}>
          {busy ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign In →' : 'Create Account →')}
        </button>

        {/* Switch link */}
        <p style={{ textAlign:'center', fontSize:12, color:'#2D3F5A', marginTop:18 }}>
          {isLogin ? 'No account yet? ' : 'Already registered? '}
          <span onClick={() => switchMode(isLogin ? 'register' : 'login')} style={{ color:'#60A5FA', cursor:'pointer', fontWeight:600 }}>
            {isLogin ? 'Register free' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}

function Sidebar({ open, page, setPage, username, onLogout }) {
  const nav = [
    { key:'overview', label:'Overview', icon:<Activity size={14} /> },
    { key:'server', label:'Server', icon:<Server size={14} /> },
    { key:'traffic', label:'Traffic', icon:<TrendingUp size={14} /> },
    { key:'financial', label:'Financial', icon:<DollarSign size={14} /> },
    { key:'settings', label:'Settings', icon:<Settings size={14} /> },
  ];

  return (
    <aside style={{ position:'fixed', left:0, top:0, bottom:0, width: open ? 220 : 56, background:C.card, borderRight:`1px solid ${C.border}`, transition:'width .26s', overflow:'hidden', display:'flex', flexDirection:'column', zIndex:4 }}>
      <div style={{ padding:'24px 18px 12px', display:'flex', alignItems:'center', justifyContent: open ? 'space-between' : 'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:'rgba(59,130,246,.16)', display:'grid', placeItems:'center' }}><Zap size={18} color='#60A5FA' /></div>
          {open && <div>
            <div style={{ fontSize:15, fontWeight:700 }}>NexusDash</div>
            <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>Realtime view</div>
          </div>}
        </div>
      </div>
      <nav style={{ flex:1, display:'grid', gap:6, padding:'8px 8px 0' }}>
        {nav.map(item => (
          <button key={item.key} onClick={() => setPage(item.key)} style={{ width:'100%', display:'flex', alignItems:'center', gap:open ? 12 : 0, padding:'12px 14px', border:'none', background:'none', color: item.key===page ? '#fff' : '#94A3B8', borderRadius:12, cursor:'pointer', justifyContent: open ? 'flex-start' : 'center', textAlign:'left', transition:'background .2s' }}>
            {item.icon}
            {open && <span style={{ fontSize:13, fontWeight:600 }}>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding:'18px 14px 24px', borderTop:`1px solid ${C.border}` }}>
        <button onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:open ? 12 : 0, padding:'11px 12px', border:'none', background:'rgba(59,130,246,.08)', color:'#fff', borderRadius:12, cursor:'pointer', justifyContent: open ? 'flex-start' : 'center' }}>
          <LogOut size={14} />
          {open && <span style={{ fontSize:13 }}>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

function TopBar({ sideOpen, toggle, bells, showBell, setShowBell, tick, username }) {
  return (
    <header style={{ position:'sticky', top:0, zIndex:3, background:C.bg, borderBottom:`1px solid ${C.border}`, padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={toggle} style={{ width:38, height:38, borderRadius:12, border:'1px solid rgba(255,255,255,.06)', background:C.card, color:'#fff', display:'grid', placeItems:'center', cursor:'pointer' }}><Menu size={18} /></button>
        <div>
          <div style={{ fontSize:12, color:'#94A3B8', letterSpacing:1.4, textTransform:'uppercase' }}>Welcome back</div>
          <div style={{ fontSize:18, fontWeight:700 }}>{username}</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:12, color:'#94A3B8' }}>Last update</div>
          <div style={{ fontSize:14, fontWeight:600 }}>{tick.toLocaleTimeString('en-US', { hour12:false })}</div>
        </div>
        <button onClick={() => setShowBell(v => !v)} style={{ width:42, height:42, borderRadius:14, border:'1px solid rgba(255,255,255,.06)', background:C.card, color:'#fff', position:'relative', cursor:'pointer' }}>
          <Bell size={18} />
          <span style={{ position:'absolute', top:8, right:8, width:8, height:8, borderRadius:'50%', background:C.red }} />
        </button>
      </div>
      {showBell && (
        <div style={{ position:'absolute', right:24, top:72, width:260, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:'0 18px 40px rgba(0,0,0,.35)', padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>Alerts</div>
            <span style={{ fontSize:12, color:'#94A3B8' }}>Recent</span>
          </div>
          {bells.map(item => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background: item.k === 'ok' ? C.green : item.k === 'warn' ? C.yellow : C.red }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:C.text }}>{item.msg}</div>
                <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>{item.ago}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

function KPIBox({ title, value, delta, icon, accent }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:18, minWidth:180, display:'flex', justifyContent:'space-between', gap:12, alignItems:'center' }}>
      <div>
        <div style={{ fontSize:12, letterSpacing:1.2, color:'#94A3B8', textTransform:'uppercase', marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:24, fontWeight:700 }}>{value}</div>
        <div style={{ fontSize:12, color:'#94A3B8', marginTop:4 }}>{delta}</div>
      </div>
      <div style={{ width:42, height:42, borderRadius:14, background:accent, display:'grid', placeItems:'center' }}>{icon}</div>
    </div>
  );
}

function PageOverview({ kpi, cpu, traffic }) {
  return (
    <div style={{ display:'grid', gap:22 }}>
      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:18 }}>
        <KPIBox title='Users' value={kpi.users.toLocaleString()} delta='+7.6%' icon={<Users size={18} />} accent='rgba(59,130,246,.16)' />
        <KPIBox title='Requests/sec' value={kpi.rps.toLocaleString()} delta='+4.1%' icon={<Globe size={18} />} accent='rgba(16,185,129,.16)' />
        <KPIBox title='Latency' value={`${kpi.lat} ms`} delta='-8.2%' icon={<Zap size={18} />} accent='rgba(241,245,249,.14)' />
        <KPIBox title='Errors' value={`${kpi.err}%`} delta='0.4%' icon={<Shield size={18} />} accent='rgba(251,191,36,.14)' />
      </section>

      <section style={{ display:'grid', gap:18, gridTemplateColumns:'1.6fr 1fr' }}>
        <Panel title='CPU utilization' badge='Realtime'>
          <ResponsiveContainer width='100%' height={260}>
            <LineChart data={cpu} margin={{ top:10, right:18, bottom:0, left:0 }}>
              <CartesianGrid stroke='#14233B' strokeDasharray='3 3' />
              <XAxis dataKey='t' {...AX} />
              <YAxis {...AX} />
              <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
              <Legend wrapperStyle={{ color:C.text, fontSize:12 }} />
              <Line type='monotone' dataKey='c1' stroke={C.blue} strokeWidth={3} dot={false} />
              <Line type='monotone' dataKey='c2' stroke={C.green} strokeWidth={3} dot={false} />
              <Line type='monotone' dataKey='c3' stroke={C.purple} strokeWidth={3} dot={false} />
              <Line type='monotone' dataKey='c4' stroke={C.yellow} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title='Traffic breakdown' badge='Live'>
          <ResponsiveContainer width='100%' height={260}>
            <BarChart data={traffic} margin={{ top:10, right:14, left:0, bottom:0 }}>
              <CartesianGrid stroke='#14233B' strokeDasharray='3 3' />
              <XAxis dataKey='t' {...AX} />
              <YAxis {...AX} />
              <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
              <Legend wrapperStyle={{ color:C.text, fontSize:12 }} />
              <Bar dataKey='req' fill={C.blue} radius={[10,10,0,0]} />
              <Bar dataKey='err' fill={C.red} radius={[10,10,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </section>
    </div>
  );
}

function PageServer({ kpi, cpu, mem }) {
  return (
    <div style={{ display:'grid', gap:22 }}>
      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:18 }}>
        <KPIBox title='Uptime' value={`${kpi.up}%`} delta='Stable' icon={<CheckCircle size={18} />} accent='rgba(16,185,129,.16)' />
        <KPIBox title='CPU' value={`${kpi.cpu}%`} delta='+3.9%' icon={<BarChart2 size={18} />} accent='rgba(59,130,246,.16)' />
        <KPIBox title='Memory' value={`${kpi.mem}%`} delta='-1.1%' icon={<Server size={18} />} accent='rgba(168,85,247,.16)' />
      </section>

      <section style={{ display:'grid', gap:18, gridTemplateColumns:'1.4fr 1fr' }}>
        <Panel title='Memory usage' badge='Current'>
          <ResponsiveContainer width='100%' height={260}>
            <AreaChart data={mem} margin={{ top:10, right:14, left:0, bottom:0 }}>
              <defs>
                <linearGradient id='memGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={C.blue} stopOpacity={0.35} />
                  <stop offset='95%' stopColor={C.blue} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke='#14233B' strokeDasharray='3 3' />
              <XAxis dataKey='t' {...AX} />
              <YAxis {...AX} />
              <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
              <Area type='monotone' dataKey='used' stroke={C.blue} fill='url(#memGrad)' fillOpacity={1} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title='Server health'>
          <div style={{ display:'grid', gap:14 }}>
            <StatRow label='Load average' value='1.28' />
            <StatRow label='Disk I/O' value='142 MB/s' />
            <StatRow label='Network' value='822 Mbps' />
          </div>
        </Panel>
      </section>
    </div>
  );
}

function PageTraffic({ traffic, kpi }) {
  return (
    <div style={{ display:'grid', gap:22 }}>
      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:18 }}>
        <KPIBox title='Throughput' value={`${kpi.rps} rps`} delta='+6.4%' icon={<Globe size={18} />} accent='rgba(59,130,246,.16)' />
        <KPIBox title='Errors' value={`${kpi.err}%`} delta='-0.9%' icon={<Shield size={18} />} accent='rgba(248,113,113,.16)' />
        <KPIBox title='Latency' value={`${kpi.lat} ms`} delta='-4.7%' icon={<Zap size={18} />} accent='rgba(16,185,129,.16)' />
      </section>

      <Panel title='Request volume' badge='Past minute'>
        <ResponsiveContainer width='100%' height={320}>
          <AreaChart data={traffic} margin={{ top:12, right:18, left:0, bottom:0 }}>
            <defs>
              <linearGradient id='reqGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={C.green} stopOpacity={0.35} />
                <stop offset='95%' stopColor={C.green} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='#14233B' strokeDasharray='3 3' />
            <XAxis dataKey='t' {...AX} />
            <YAxis {...AX} />
            <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
            <Area type='monotone' dataKey='req' stroke={C.green} fill='url(#reqGrad)' fillOpacity={1} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function PageFinancial({ fin }) {
  const colors = [C.blue, C.green, C.purple];
  return (
    <div style={{ display:'grid', gap:22 }}>
      <Panel title='Market performance' badge='24h'>
        <ResponsiveContainer width='100%' height={360}>
          <LineChart data={fin} margin={{ top:10, right:24, left:0, bottom:0 }}>
            <CartesianGrid stroke='#14233B' strokeDasharray='3 3' />
            <XAxis dataKey='t' {...AX} />
            <YAxis {...AX} />
            <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
            <Legend wrapperStyle={{ color:C.text, fontSize:12 }} />
            <Line type='monotone' dataKey='BTC' stroke={C.blue} strokeWidth={3} dot={false} />
            <Line type='monotone' dataKey='ETH' stroke={C.green} strokeWidth={3} dot={false} />
            <Line type='monotone' dataKey='SOL' stroke={C.purple} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title='Asset distribution' badge='Estimated'>
        <ResponsiveContainer width='100%' height={240}>
          <PieChart>
            <Pie data={[{ name:'BTC', value:52 }, { name:'ETH', value:31 }, { name:'SOL', value:17 }]} dataKey='value' outerRadius={90} innerRadius={46} paddingAngle={3}>
              {colors.map((color, idx) => <Cell key={idx} fill={color} />)}
            </Pie>
            <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
          </PieChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function PageSettings() {
  return (
    <div style={{ display:'grid', gap:18 }}>
      <Panel title='Application settings'>
        <div style={{ display:'grid', gap:18 }}>
          {['Notifications', 'Auto-scale', 'Dark mode', 'Weekly reports'].map(item => (
            <div key={item} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'rgba(255,255,255,.02)', borderRadius:14, border:`1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{item}</div>
                <div style={{ fontSize:12, color:'#94A3B8' }}>Manage your preferences</div>
              </div>
              <div style={{ width:42, height:24, borderRadius:999, background:'rgba(59,130,246,.16)', display:'grid', placeItems:'center', color:'#fff' }}>On</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, badge, children }) {
  return (
    <section style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:22, minHeight:180, boxShadow:'0 10px 30px rgba(0,0,0,.12)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:18 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700 }}>{title}</div>
          {badge && <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>{badge}</div>}
        </div>
        <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:1.4 }}>Updated</div>
      </div>
      {children}
    </section>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'16px', borderRadius:18, background:'rgba(255,255,255,.02)', border:`1px solid ${C.border}` }}>
      <span style={{ color:'#94A3B8', fontSize:13 }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:700 }}>{value}</span>
    </div>
  );
}
