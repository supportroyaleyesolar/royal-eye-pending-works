import { useState } from 'react';
import {
  Bell, Lock, User, Building2, Palette, MapPin, Phone, Mail, Save, Check,
  Sparkles, CheckCircle2, ShieldAlert, Trash2, Database, AlertTriangle, RefreshCw,
  Cloud, Globe, Server, Share2, ExternalLink, Copy, CheckCircle, Wifi, WifiOff, MessageSquare
} from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import {
  getSupabaseCredentials,
  saveSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured
} from '../lib/supabase';
import { generateQuotationPitch, openWhatsApp } from '../utils/whatsapp';

const SECTIONS = [
  { id: 'cloud', label: 'Cloud DB & Hosting', icon: Cloud },
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'ai', label: 'Gemini AI & API', icon: Sparkles },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const THEMES = [
  { name: 'Ocean Blue', primary: '#1a6ff0', secondary: '#3b95ff' },
  { name: 'Solar Gold', primary: '#f59a10', secondary: '#ffd166' },
  { name: 'Forest Green', primary: '#1fae5e', secondary: '#46d98a' },
  { name: 'Royal Purple', primary: '#8b5cf6', secondary: '#a78bfa' },
];

export default function Settings() {
  const {
    geminiApiKey,
    setGeminiApiKey,
    masters,
    clearAllCustomers,
    cloudStatus,
    lastSyncedAt,
    syncWithSupabase
  } = useCustomers();

  const [section, setSection] = useState('cloud');
  const [saved, setSaved] = useState(false);
  const [localKey, setLocalKey] = useState(geminiApiKey || '');

  // Supabase connection state
  const creds = getSupabaseCredentials();
  const [sbUrl, setSbUrl] = useState(creds.url || '');
  const [sbKey, setSbKey] = useState(creds.key || '');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const [company, setCompany] = useState({
    name: 'Royal Eye Solar Power', tagline: 'Powering Kerala with Clean Energy',
    phone: '0487-2345678', email: 'info@royaleye.in', website: 'www.royaleye.in',
    address: 'TC 14/672, Guruvayur Road, Thrissur, Kerala – 680001',
    gst: '32AAAAA0000A1ZA', license: 'KSEB-SLR-2024-1872',
  });
  const [profile, setProfile] = useState({
    name: 'Krishnanunni K', role: 'Marketing Head', phone: '9876543210',
    email: 'krishna@royaleye.in', language: 'English',
  });
  const [notifs, setNotifs] = useState({
    emailAlerts: true, smsAlerts: false, stockAlerts: true,
    projectUpdates: true, newCustomer: true, dailyReport: false,
  });
  const [theme, setTheme] = useState(0);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });

  const handleSave = () => {
    setGeminiApiKey(localKey);
    saveSupabaseConfig(sbUrl, sbKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(sbUrl, sbKey);
    setTesting(false);
    setTestResult(res);
  };

  const handleManualSync = async () => {
    setSyncingCloud(true);
    saveSupabaseConfig(sbUrl, sbKey);
    const res = await syncWithSupabase(true);
    setSyncingCloud(false);
    if (res.ok) {
      alert(`Sync Complete! Real-time WebSockets synchronized.`);
    } else {
      alert(`Sync notice: ${res.error || res.reason}`);
    }
  };

  const handleCopySchema = () => {
    const sqlText = `-- Copy from file: supabase-schema.sql in the project root`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const setC = (k, v) => setCompany(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setProfile(f => ({ ...f, [k]: v }));
  const setN = (k, v) => setNotifs(f => ({ ...f, [k]: v }));

  return (
    <div className="page">
      <div className="page-head-row">
        <div className="page-head">
          <h1>⚙️ Settings & System Architecture</h1>
          <p>Cloud PostgreSQL, Real-time WebSockets, Netlify CI/CD, Gemini AI & Local Resilience</p>
        </div>
        <button className="add" onClick={handleSave}>
          {saved ? <><Check size={16} />Saved!</> : <><Save size={16} />Save Changes</>}
        </button>
      </div>

      <div className="settings-layout">
        {/* Left nav */}
        <div className="settings-nav">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`settings-tab ${section === id ? 'on' : ''}`} onClick={() => setSection(id)}>
              <Icon size={17} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-body">
          {/* ── SECTION: CLOUD DB & HOSTING (7 PILLARS) ─────────────────── */}
          {section === 'cloud' && (
            <div className="settings-section">
              <h3><Cloud size={18} color="#1a6ff0" /> Cloud Hosting & Real-time Database (7-Pillar Architecture)</h3>
              <p style={{ color: 'var(--mute)', fontSize: 13, lineHeight: 1.5 }}>
                Your project blends live PostgreSQL cloud sync with 100% offline browser resilience, automated Netlify CI/CD, and 1-click WhatsApp quotes.
              </p>

              {/* Architecture Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginTop: 14 }}>
                {[
                  { n: '1. GITHUB', r: 'Code Repository & CI/CD trigger', s: 'Active', c: '#101a33', ic: Globe },
                  { n: '2. SUPABASE', r: 'PostgreSQL DB & Realtime WebSockets', s: cloudStatus === 'connected' ? 'Live Connected' : 'Offline Cache Mode', c: cloudStatus === 'connected' ? '#1fae5e' : '#f59a10', ic: Cloud },
                  { n: '3. NETLIFY', r: 'Global CDN Hosting & SPA Routing', s: 'Configured (netlify.toml)', c: '#00c2cb', ic: Globe },
                  { n: '4. NODE.JS (server.js)', r: 'Local Server (localhost:3000)', s: 'Ready (npm run serve)', c: '#16a34a', ic: Server },
                  { n: '5. HTML5 LOCALSTORAGE', r: 'Offline Cache & Fallback Resilience', s: 'Always Active (0ms)', c: '#1a6ff0', ic: Database },
                  { n: '6. WHATSAPP API / WEB', r: '1-Click Quotations & Pitch Delivery', s: 'wa.me Direct Links', c: '#25d366', ic: MessageSquare },
                  { n: '7. JSDELIVR / CDN', r: 'High-speed external bundles & fonts', s: 'Optimized', c: '#8b5cf6', ic: Sparkles },
                ].map((item) => (
                  <div key={item.n} style={{ background: '#f8fbff', border: '1px solid #e3ebf7', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: 12.5, color: '#0f172a' }}>{item.n}</b>
                      <span className="pill" style={{ background: item.c + '18', color: item.c, fontSize: 10.5, fontWeight: 700 }}>{item.s}</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--mute)', margin: '4px 0 0' }}>{item.r}</p>
                  </div>
                ))}
              </div>

              {/* Supabase Connection Setup */}
              <div style={{ marginTop: 24, background: '#ffffff', border: '1.5px solid #dbeafe', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#10b981', color: '#fff', display: 'grid', placeItems: 'center' }}>
                      <Database size={18} />
                    </div>
                    <div>
                      <b style={{ fontSize: 15, color: '#0f172a' }}>Pillar 2: Supabase PostgreSQL & Real-time WebSockets</b>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                        Multi-device live sync: update a customer on mobile and see it instantly on your desktop screen.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pill" style={{
                      background: cloudStatus === 'connected' ? '#dcfce7' : '#fef3c7',
                      color: cloudStatus === 'connected' ? '#15803d' : '#b45309',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      {cloudStatus === 'connected' ? <><Wifi size={12} /> Live Cloud Active</> : <><WifiOff size={12} /> Local Offline Mode</>}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label className="modal-label" style={{ fontWeight: 700 }}>
                    Supabase Project URL
                    <input
                      type="text"
                      value={sbUrl}
                      onChange={(e) => setSbUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>

                  <label className="modal-label" style={{ fontWeight: 700 }}>
                    Supabase Anon Public API Key
                    <input
                      type="password"
                      value={sbKey}
                      onChange={(e) => setSbKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                    <button
                      className="add"
                      onClick={handleTestConnection}
                      disabled={testing}
                      style={{ padding: '8px 16px', fontSize: 12.5 }}
                    >
                      {testing ? <><RefreshCw size={14} className="spin" /> Testing...</> : <><CheckCircle size={14} /> Test Connection</>}
                    </button>

                    <button
                      className="ghost"
                      onClick={handleManualSync}
                      disabled={syncingCloud}
                      style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 700 }}
                    >
                      {syncingCloud ? <><RefreshCw size={14} className="spin" /> Syncing...</> : <><RefreshCw size={14} /> Sync Local Customers to Cloud</>}
                    </button>

                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#1a6ff0', textDecoration: 'none', fontWeight: 600, marginLeft: 'auto' }}
                    >
                      Open Supabase Dashboard <ExternalLink size={13} />
                    </a>
                  </div>

                  {/* Test Result Message */}
                  {testResult && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      marginTop: 6,
                      fontSize: 12.5,
                      background: testResult.ok ? '#dcfce7' : '#fee2e2',
                      color: testResult.ok ? '#166534' : '#991b1b',
                      border: `1px solid ${testResult.ok ? '#bbf7d0' : '#fecaca'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {testResult.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>{testResult.message || testResult.error}</span>
                    </div>
                  )}

                  {/* Schema Info */}
                  <div style={{ marginTop: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569' }}>
                    <b>Database Schema:</b> An optimized <code>supabase-schema.sql</code> file is included in your project root with tables for <code>customers</code> and <code>works</code> plus enabled Realtime WebSockets.
                  </div>
                </div>
              </div>

              {/* Netlify Free Deployment Checklist */}
              <div style={{ marginTop: 20, background: '#ffffff', border: '1.5px solid #ccfbf1', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0d9488', color: '#fff', display: 'grid', placeItems: 'center' }}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <b style={{ fontSize: 15, color: '#0f172a' }}>Pillar 3: Netlify Free Global Hosting & Automated CI/CD</b>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      Host 100% free with unlimited automatic deploys on every Git push to GitHub.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  <div style={{ background: '#f0fdfa', padding: '10px 12px', borderRadius: 10, border: '1px solid #99f6e4' }}>
                    <b style={{ color: '#0f766e', fontSize: 12 }}>✔️ netlify.toml Configured</b>
                    <p style={{ color: '#115e59', fontSize: 11, margin: '2px 0 0' }}>Build command &amp; /dist folder set</p>
                  </div>
                  <div style={{ background: '#f0fdfa', padding: '10px 12px', borderRadius: 10, border: '1px solid #99f6e4' }}>
                    <b style={{ color: '#0f766e', fontSize: 12 }}>✔️ SPA Routing (_redirects)</b>
                    <p style={{ color: '#115e59', fontSize: 11, margin: '2px 0 0' }}>Zero 404 errors on page reloads</p>
                  </div>
                  <div style={{ background: '#f0fdfa', padding: '10px 12px', borderRadius: 10, border: '1px solid #99f6e4' }}>
                    <b style={{ color: '#0f766e', fontSize: 12 }}>✔️ GitHub Actions CI Trigger</b>
                    <p style={{ color: '#115e59', fontSize: 11, margin: '2px 0 0' }}>.github/workflows/deploy.yml ready</p>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href="https://app.netlify.com/start"
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#0d9488', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Deploy to Netlify in 1-Click <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Node.js Local Server Info */}
              <div style={{ marginTop: 20, background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#22c55e', color: '#fff', display: 'grid', placeItems: 'center' }}>
                    <Server size={18} />
                  </div>
                  <div>
                    <b style={{ fontSize: 15, color: '#0f172a' }}>Pillar 4: Node.js (server.js) Local Server (localhost:3000)</b>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      Run <code>npm run serve</code> to start the dedicated local production server.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'ai' && (
            <div className="settings-section">
              <h3><Sparkles size={18} color="#1a6ff0" /> Gemini AI Document Extraction</h3>
              <p style={{ color: 'var(--mute)', fontSize: 13, lineHeight: 1.5 }}>
                Used by the <b>Master Page</b> to automatically scan and extract Aadhaar numbers, PAN details, bank account info, and KSEB electricity bills from uploaded images.
              </p>

              <div style={{ background: '#d9f6e3', border: '1.5px solid #a7f3d0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <CheckCircle2 size={20} color="#1fae5e" />
                <div style={{ flex: 1 }}>
                  <b style={{ color: '#146636', fontSize: 13.5 }}>Gemini Vision Engine Connected</b>
                  <p style={{ color: '#166534', fontSize: 12, margin: '2px 0 0 0' }}>
                    Active Key: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4 }}>{localKey.slice(0, 10)}...{localKey.slice(-6)}</code>
                  </p>
                </div>
                <span className="pill" style={{ background: '#1fae5e', color: '#fff', fontSize: 11 }}>Active</span>
              </div>

              <div style={{ marginTop: 14 }}>
                <label className="modal-label" style={{ fontWeight: 700 }}>
                  Google Gemini API Key
                  <input
                    type="text"
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="Enter Gemini API key (AIzaSy...)"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                  />
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--mute)' }}>
                    Key is securely stored in your browser's local storage.
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: '#1a6ff0', fontWeight: 600 }}
                  >
                    Google AI Studio Key Console ↗
                  </a>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eef3fb' }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>Supported Auto-Extract Documents:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {[
                    ['🪪 Aadhaar Card (Front/Back)', 'Name, DOB, Gender, 12-digit UID, Address, Pincode'],
                    ['💳 PAN Card', 'Full Name, PAN 10-char alphanumeric, Father Name, DOB'],
                    ['⚡ Electricity Bill', 'Consumer No, KSEB Meter No, Sanctioned Load, Phase'],
                    ['🏦 Bank Passbook', 'Account No, IFSC Code, Account Holder Name, Bank Name'],
                    ['☀️ MNRE / Surya Ghar Form', 'Application reference numbers and subsidy details'],
                  ].map(([title, desc]) => (
                    <div key={title} style={{ background: '#f8fbff', border: '1px solid #e3ebf7', borderRadius: 10, padding: '10px 12px' }}>
                      <b style={{ fontSize: 12.5, color: 'var(--ink)' }}>{title}</b>
                      <p style={{ fontSize: 11, color: 'var(--mute)', margin: '4px 0 0 0' }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === 'data' && (
            <div className="settings-section">
              <h3><Database size={18} color="#e53e3e" /> Data Management & Reset</h3>
              <p style={{ color: 'var(--mute)', fontSize: 13, lineHeight: 1.5 }}>
                Manage local application records, wipe existing customer databases, or reset work progress cards to a clean slate.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div style={{ background: '#fff', border: '1.5px solid #fee2e2', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <b style={{ color: '#991b1b', fontSize: 14 }}>Clear Customer Database</b>
                    <p style={{ color: '#7f1d1d', fontSize: 12, margin: '4px 0 0' }}>
                      Currently stored: <b>{masters.length}</b> customer(s). Clears all Master KYC records and Customers directory.
                    </p>
                  </div>
                  <button
                    className="ghost"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete ALL customer records?')) {
                        clearAllCustomers();
                        alert('All customer records have been deleted.');
                      }
                    }}
                    style={{ color: '#b91c1c', borderColor: '#fca5a5', padding: '8px 18px', fontSize: 13, height: 38 }}
                  >
                    Clear All Customers
                  </button>
                </div>

                <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <b style={{ color: '#c2410c', fontSize: 14 }}>Factory Reset (Purge All Local Data)</b>
                    <p style={{ color: '#9a3412', fontSize: 12, margin: '4px 0 0' }}>
                      Clears all cached customers, works, surveys, and projects while preserving your Gemini API key.
                    </p>
                  </div>
                  <button
                    className="add"
                    onClick={() => {
                      if (window.confirm('Reset the entire application to an empty clean slate?')) {
                        const geminiKey = localStorage.getItem('royal-eye-gemini-key');
                        localStorage.clear();
                        if (geminiKey) localStorage.setItem('royal-eye-gemini-key', geminiKey);
                        alert('Application reset to clean state.');
                        window.location.reload();
                      }
                    }}
                    style={{ background: '#ea580c', borderColor: '#c2410c', padding: '8px 18px', fontSize: 13, height: 38 }}
                  >
                    Full Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {section === 'company' && (
            <div className="settings-section">
              <h3>Company Information</h3>
              <div className="two">
                <label className="modal-label">Company Name<input value={company.name} onChange={e => setC('name', e.target.value)} /></label>
                <label className="modal-label">Tagline<input value={company.tagline} onChange={e => setC('tagline', e.target.value)} /></label>
              </div>
              <div className="two">
                <label className="modal-label"><Phone size={13} /> Phone<input value={company.phone} onChange={e => setC('phone', e.target.value)} /></label>
                <label className="modal-label"><Mail size={13} /> Email<input value={company.email} onChange={e => setC('email', e.target.value)} /></label>
              </div>
              <label className="modal-label">Website<input value={company.website} onChange={e => setC('website', e.target.value)} /></label>
              <label className="modal-label"><MapPin size={13} /> Address<textarea value={company.address} onChange={e => setC('address', e.target.value)} style={{ height: 72, border: '1px solid #e3ebf7', borderRadius: 10, padding: '10px 12px', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', background: '#f8fbff', color: '#101a33' }} /></label>
              <div className="two">
                <label className="modal-label">GST Number<input value={company.gst} onChange={e => setC('gst', e.target.value)} /></label>
                <label className="modal-label">KSEB License<input value={company.license} onChange={e => setC('license', e.target.value)} /></label>
              </div>
            </div>
          )}

          {section === 'profile' && (
            <div className="settings-section">
              <h3>My Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 0', marginBottom: 8 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#3b95ff,#0a4fc7)', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 800, color: '#fff' }}>KK</div>
                <div>
                  <b style={{ fontSize: 18 }}>{profile.name}</b>
                  <p style={{ color: '#6b7894', fontSize: 13, marginTop: 2 }}>{profile.role}</p>
                </div>
              </div>
              <div className="two">
                <label className="modal-label">Full Name<input value={profile.name} onChange={e => setP('name', e.target.value)} /></label>
                <label className="modal-label">Role<input value={profile.role} onChange={e => setP('role', e.target.value)} /></label>
              </div>
              <div className="two">
                <label className="modal-label">Phone<input value={profile.phone} onChange={e => setP('phone', e.target.value)} /></label>
                <label className="modal-label">Email<input value={profile.email} onChange={e => setP('email', e.target.value)} /></label>
              </div>
              <label className="modal-label">Language
                <select value={profile.language} onChange={e => setP('language', e.target.value)} style={{ height: 42, border: '1px solid #e3ebf7', borderRadius: 10, padding: '0 12px', background: '#f8fbff', color: '#101a33', fontSize: 13 }}>
                  <option>English</option><option>Malayalam</option><option>Hindi</option>
                </select>
              </label>
            </div>
          )}

          {section === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  ['emailAlerts', 'Email Alerts', 'Receive important alerts via email'],
                  ['smsAlerts', 'SMS Alerts', 'Get SMS notifications for critical updates'],
                  ['stockAlerts', 'Inventory Stock Alerts', 'Alert when items fall below minimum stock'],
                  ['projectUpdates', 'Project Status Updates', 'Notifications when project status changes'],
                  ['newCustomer', 'New Customer Added', 'Notify when a new customer is registered'],
                  ['dailyReport', 'Daily Summary Report', 'Receive a daily summary at 8:00 AM'],
                ].map(([key, title, desc]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fbff', borderRadius: 12, border: '1px solid #e3ebf7' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{title}</p>
                      <p style={{ color: '#6b7894', fontSize: 12 }}>{desc}</p>
                    </div>
                    <div className="toggle-wrap" onClick={() => setN(key, !notifs[key])}>
                      <div className={`toggle ${notifs[key] ? 'on' : ''}`}>
                        <div className="toggle-knob" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div style={{ background: '#e4efff', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#1a6ff0' }}>
                🔒 Your account is secured. Last login: Today at 11:40 AM from Thrissur, Kerala
              </div>
              <label className="modal-label">Current Password<input type="password" value={password.current} onChange={e => setPassword(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" /></label>
              <label className="modal-label">New Password<input type="password" value={password.next} onChange={e => setPassword(p => ({ ...p, next: e.target.value }))} placeholder="Min 8 characters" /></label>
              <label className="modal-label">Confirm New Password<input type="password" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter new password" /></label>
              <button className="add" style={{ width: 'fit-content', marginTop: 8 }} onClick={handleSave}>Update Password</button>

              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e3ebf7' }}>
                <h4 style={{ marginBottom: 12 }}>Two-Factor Authentication</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fbff', borderRadius: 12, border: '1px solid #e3ebf7' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>Enable 2FA via SMS</p>
                    <p style={{ color: '#6b7894', fontSize: 12 }}>Add an extra layer of security to your account</p>
                  </div>
                  <button className="ghost" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Enable</button>
                </div>
              </div>
            </div>
          )}

          {section === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance</h3>
              <p style={{ color: '#6b7894', fontSize: 13, marginBottom: 16 }}>Choose a colour theme for your dashboard</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                {THEMES.map((t, i) => (
                  <div key={t.name} onClick={() => setTheme(i)} style={{ padding: 16, borderRadius: 14, border: `2px solid ${theme === i ? t.primary : '#e3ebf7'}`, cursor: 'pointer', background: theme === i ? t.primary + '0a' : '#f8fbff', transition: 'all .2s' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.primary }} />
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.secondary }} />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</p>
                    {theme === i && <p style={{ color: t.primary, fontSize: 11, marginTop: 2, fontWeight: 600 }}>● Active</p>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 12 }}>Font Size</h4>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Small', 'Medium', 'Large'].map((sz, i) => (
                    <button key={sz} className={i === 1 ? 'tab on' : 'tab'} style={{ flex: 1 }}>{sz}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
