import { useState, useRef } from 'react';
import {
  User, Phone, Mail, MapPin, FileText, CreditCard, Zap, Building2,
  Upload, Sparkles, CheckCircle2, AlertCircle, Copy, RefreshCw,
  ChevronDown, ChevronRight, IndianRupee, Sun, Loader2, Eye,
  PlusCircle, Trash2, Edit3, Save, X, Check, ShieldCheck,
  Lock, Unlock, EyeOff,
} from 'lucide-react';
import { useCustomers, blankMaster, calcSubsidy } from '../context/CustomerContext';
import { SOLAR_STAGES } from '../data/solarStages';



const DOC_TYPES = [
  { key: 'aadharFront', label: 'Aadhaar Card (Front)', icon: ShieldCheck, accept: 'image/*', prompt: 'aadhar_front' },
  { key: 'aadharBack', label: 'Aadhaar Card (Back)', icon: ShieldCheck, accept: 'image/*', prompt: 'aadhar_back' },
  { key: 'panCard', label: 'PAN Card', icon: CreditCard, accept: 'image/*', prompt: 'pan' },
  { key: 'electricityBill', label: 'Electricity Bill', icon: Zap, accept: 'image/*,application/pdf', prompt: 'electricity_bill' },
  { key: 'passbook', label: 'Bank Passbook', icon: Building2, accept: 'image/*', prompt: 'passbook' },
  { key: 'mnreForm', label: 'MNRE / Surya Ghar Form', icon: Sun, accept: 'image/*,application/pdf', prompt: 'mnre_form' },
];

const CAPACITY_OPTIONS = ['1 kW', '2 kW', '3 kW', '4 kW', '5 kW', '6 kW', '7 kW', '8 kW', '10 kW', '12 kW', '15 kW', '20 kW', '25 kW'];
const DISTRICTS = ['Thrissur', 'Ernakulam', 'Palakkad', 'Kozhikode', 'Kannur', 'Malappuram', 'Wayanad', 'Idukki', 'Kottayam', 'Alappuzha', 'Kollam', 'Thiruvananthapuram', 'Pathanamthitta', 'Kasaragod'];
const BANKS = ['SBI', 'HDFC Bank', 'Canara Bank', 'Kerala Gramin Bank', 'Federal Bank', 'South Indian Bank', 'UCO Bank', 'Bank of Baroda', 'Union Bank', 'Indian Bank', 'Other'];

// ─── AI extraction prompt per doc type ───────────────────────────────────────
function buildGeminiPrompt(type) {
  const base = `You are a KYC document scanner for an Indian solar company. Extract all readable text fields from this document image and return ONLY a valid JSON object with these fields (use empty string "" if not visible or not applicable). No explanation, only JSON:\n`;
  if (type === 'aadhar_front') {
    return base + `{"name":"","dob":"","gender":"","aadharNumber":"","address":"","pincode":"","state":"","district":""}`;
  }
  if (type === 'pan') {
    return base + `{"name":"","dob":"","panNumber":"","fatherName":""}`;
  }
  if (type === 'electricity_bill') {
    return base + `{"name":"","electricityConsumerNo":"","ksebMeterNo":"","address":"","sanctionedLoad":"","district":"","pincode":""}`;
  }
  if (type === 'passbook') {
    return base + `{"passbookHolder":"","accountNumber":"","ifsc":"","bankName":"","branch":"","address":""}`;
  }
  return base + `{"name":"","address":"","district":"","pincode":"","state":""}`;
}

// Map AI extracted fields to master customer fields
function mergeAiFields(existing, extracted) {
  const map = {
    name: 'name', dob: 'dob', aadharNumber: 'aadharNumber', panNumber: 'panNumber',
    address: 'address', pincode: 'pincode', state: 'state', district: 'district',
    electricityConsumerNo: 'electricityConsumerNo', ksebMeterNo: 'ksebMeterNo',
    sanctionedLoad: 'sanctionedLoad', bankName: 'bankName', accountNumber: 'accountNumber',
    ifsc: 'ifsc', passbookHolder: 'passbookHolder', fatherName: 'fatherName',
  };
  const result = { ...existing };
  for (const [src, dst] of Object.entries(map)) {
    if (extracted[src] && !result[dst]) {
      result[dst] = extracted[src];
    }
  }
  return result;
}

export default function MasterPage() {
  const { masters, addMaster, updateMaster, deleteMaster, getMaster, geminiApiKey, setGeminiApiKey } = useCustomers();
  const MASTER_PASSWORD = '121312';
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('royal-eye-master-unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [selectedId, setSelectedId] = useState(masters[0]?.id || null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [aiLoading, setAiLoading] = useState({});
  const [aiResults, setAiResults] = useState({});
  const [aiError, setAiError] = useState({});
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);
  const [activeSection, setActiveSection] = useState('personal');
  const [toast, setToast] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileRefs = useRef({});

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput.trim() === MASTER_PASSWORD) {
      sessionStorage.setItem('royal-eye-master-unlocked', 'true');
      setIsUnlocked(true);
      setPinError('');
      showToast('Master Database unlocked!');
    } else {
      setPinError('Incorrect password. Please enter 121312');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('royal-eye-master-unlocked');
    setIsUnlocked(false);
    setPinInput('');
    setPinError('');
    showToast('Master Database locked.');
  };

  const selected = selectedId ? getMaster(selectedId) : null;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Enter edit mode
  const startEdit = () => {
    setFormData(JSON.parse(JSON.stringify(selected)));
    setEditMode(true);
  };

  const cancelEdit = () => {
    setFormData(null);
    setEditMode(false);
  };

  const saveEdit = () => {
    updateMaster(selectedId, formData);
    setEditMode(false);
    setFormData(null);
    showToast('Customer details saved successfully!');
  };

  const field = (key, nested = null) => ({
    value: nested ? (formData?.[nested]?.[key] ?? '') : (formData?.[key] ?? ''),
    onChange: (e) => {
      if (nested) {
        setFormData((f) => ({ ...f, [nested]: { ...f[nested], [key]: e.target.value } }));
      } else {
        setFormData((f) => ({ ...f, [key]: e.target.value }));
      }
    },
  });

  // ── Handle document upload ──────────────────────────────
  const handleDocUpload = async (docKey, file, docType) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      // Save to doc in master
      if (editMode) {
        setFormData((f) => ({ ...f, docs: { ...f.docs, [docKey]: base64 } }));
      } else {
        updateMaster(selectedId, { docs: { ...selected.docs, [docKey]: base64 } });
      }
      showToast(`${DOC_TYPES.find(d => d.key === docKey)?.label} uploaded!`);
      // Optionally auto-extract if API key is set
      if (geminiApiKey && file.type.startsWith('image/')) {
        await extractWithAI(docKey, base64, docType);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── AI Extraction ──────────────────────────────────────
  const extractWithAI = async (docKey, base64Data, docType) => {
    if (!geminiApiKey) {
      setShowApiKeyInput(true);
      showToast('Please set your Gemini API key in Settings above', 'error');
      return;
    }
    setAiLoading((l) => ({ ...l, [docKey]: true }));
    setAiError((e) => ({ ...e, [docKey]: null }));
    try {
      const imageData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const mimeType = base64Data.split(';')[0].replace('data:', '') || 'image/jpeg';

      const key = (geminiApiKey || '').trim();
      const payload = {
        contents: [{
          parts: [
            { text: buildGeminiPrompt(docType) },
            { inlineData: { mimeType, data: imageData } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      };

      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-flash-lite-latest',
        'gemini-3.8-flash',
        'gemini-flash-latest',
      ];

      let lastError = null;
      let text = '';

      for (const model of candidateModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          if (response.ok) {
            const data = await response.json();
            text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) break;
          } else {
            const errBody = await response.json().catch(() => ({}));
            lastError = errBody?.error?.message || `HTTP ${response.status}`;
          }
        } catch (e) {
          lastError = e.message;
        }
      }

      if (!text) {
        throw new Error(lastError || 'Failed to extract data from document');
      }

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');
      const extracted = JSON.parse(jsonMatch[0]);
      setAiResults((r) => ({ ...r, [docKey]: extracted }));
      showToast(`AI extracted data from ${DOC_TYPES.find(d => d.key === docKey)?.label}!`);
    } catch (err) {
      setAiError((e) => ({ ...e, [docKey]: err.message }));
      showToast(`AI extraction failed: ${err.message}`, 'error');
    } finally {
      setAiLoading((l) => ({ ...l, [docKey]: false }));
    }
  };

  // Apply AI extracted fields to form
  const applyAiResult = (docKey) => {
    const extracted = aiResults[docKey];
    if (!extracted) return;
    const current = editMode ? formData : selected;
    const merged = mergeAiFields({ ...current }, extracted);
    if (editMode) {
      setFormData(merged);
    } else {
      updateMaster(selectedId, merged);
    }
    setAiResults((r) => ({ ...r, [docKey]: null }));
    showToast('AI data applied to customer profile!');
  };

  // Apply ALL AI results
  const applyAllAiResults = () => {
    let current = editMode ? { ...formData } : { ...selected };
    for (const [, extracted] of Object.entries(aiResults)) {
      if (extracted) current = mergeAiFields(current, extracted);
    }
    if (editMode) setFormData(current);
    else updateMaster(selectedId, current);
    setAiResults({});
    showToast('All AI-extracted data applied to profile & synced to all pages!');
  };

  // Add new customer
  const handleAddNew = () => {
    const newId = `CUS-${String(masters.length + 1).padStart(3, '0')}`;
    const blank = blankMaster(newId);
    addMaster(blank);
    setSelectedId(newId);
    setEditMode(true);
    setFormData({ ...blank });
    setShowAddForm(false);
    showToast('New customer created! Fill in the details.');
  };

  const subsidyAmount = selected ? calcSubsidy(selected.systemCapacity) : 0;
  const pendingAiCount = Object.values(aiResults).filter(Boolean).length;

  const sect = (id, label, icon) => (
    <button
      key={id}
      className={`master-sect-tab ${activeSection === id ? 'on' : ''}`}
      onClick={() => setActiveSection(id)}
    >
      {icon} {label}
    </button>
  );

  const I = (props) => (
    <input
      {...props}
      className="master-input"
      disabled={!editMode}
      style={!editMode ? { background: '#f8fbff', cursor: 'default' } : {}}
    />
  );

  const S = ({ children, ...props }) => (
    <select
      {...props}
      className="master-input"
      disabled={!editMode}
      style={!editMode ? { background: '#f8fbff', cursor: 'default' } : {}}
    >
      {children}
    </select>
  );

  if (!isUnlocked) {
    return (
      <div className="page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {toast && (
          <div className={`master-toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}
        <div className="master-lock-card">
          <div className="master-lock-icon">
            <Lock size={32} color="#1a6ff0" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 8px', color: '#101a33' }}>
            🔒 Master Database Locked
          </h2>
          <p style={{ color: '#64748b', fontSize: 13.5, maxWidth: 360, margin: '0 auto 22px', lineHeight: 1.5 }}>
            Security verification required. Enter password to access customer KYC documents, Aadhaar, PAN & financial data.
          </p>

          <form onSubmit={handleUnlock} style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                placeholder="Enter password..."
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: pinError ? '2px solid #ef4444' : '2px solid #cbd5e1',
                  padding: '0 44px 0 16px',
                  fontSize: 16,
                  letterSpacing: showPin ? 'normal' : '4px',
                  textAlign: 'center',
                  fontWeight: 700,
                  background: '#f8fafc',
                  color: '#101a33',
                  outline: 'none',
                  transition: 'border-color .2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {pinError && (
              <p style={{ color: '#ef4444', fontSize: 12.5, fontWeight: 600, marginBottom: 14 }}>
                ⚠ {pinError}
              </p>
            )}

            <button
              type="submit"
              className="add"
              style={{
                width: '100%',
                height: 46,
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Unlock size={16} /> Unlock Master Database
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div className={`master-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-head-row">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <h1>🏠 Master Customer Profile</h1>
          <p>Central database for KYC, documents, loan & Surya Ghar subsidy — auto-syncs to all pages</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="tab"
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', borderColor: '#fca5a5' }}
            onClick={handleLock}
            title="Lock Master Page"
          >
            <Lock size={14} /> Lock Page
          </button>
          <button
            className="tab"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            <Sparkles size={14} /> AI Settings
          </button>
          <button
            className="add"
            onClick={handleAddNew}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <PlusCircle size={16} /> New Customer
          </button>
        </div>
      </div>

      {/* API Key Setup Bar */}
      {showApiKeyInput && (
        <div className="master-ai-bar">
          <Sparkles size={18} color="#1a6ff0" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Gemini AI Key (for document extraction):</span>
          <input
            className="master-input"
            type="password"
            placeholder="AIza..."
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            style={{ flex: 1, minWidth: 250 }}
          />
          <button
            className="add"
            style={{ height: 38, padding: '0 18px', fontSize: 13 }}
            onClick={() => { setGeminiApiKey(tempApiKey); setShowApiKeyInput(false); showToast('API Key saved!'); }}
          >
            <Save size={14} /> Save Key
          </button>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#1a6ff0', whiteSpace: 'nowrap' }}>
            Get free key →
          </a>
        </div>
      )}

      {/* Pending AI results banner */}
      {pendingAiCount > 0 && (
        <div className="master-ai-pending-banner">
          <Sparkles size={16} color="#f59a10" />
          <span><b>{pendingAiCount} document(s)</b> have AI-extracted data ready for review.</span>
          <button className="add" style={{ height: 34, padding: '0 16px', fontSize: 13, marginLeft: 'auto' }} onClick={applyAllAiResults}>
            <Check size={14} /> Apply All to Profile
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="master-layout">
        {/* LEFT — Customer List */}
        <div className="master-sidebar">
          <div className="master-sidebar-head">Customers <span>{masters.length}</span></div>
          <div className="master-cus-list">
            {masters.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--mute)' }}>
                <p style={{ fontSize: 26, marginBottom: 8 }}>👥</p>
                <b style={{ color: 'var(--ink)', fontSize: 14 }}>No Customers Registered</b>
                <p style={{ fontSize: 12, marginTop: 4 }}>Click "+ New Customer" above to register a client.</p>
              </div>
            ) : (
              masters.map((m) => {
                const sub = calcSubsidy(m.systemCapacity);
                const stageIdx = SOLAR_STAGES.findIndex(s => s.id === m.workflowStage);
                const stageProg = SOLAR_STAGES[stageIdx]?.progress || 0;
                return (
                  <button
                    key={m.id}
                    className={`master-cus-item ${selectedId === m.id ? 'on' : ''}`}
                    onClick={() => { setSelectedId(m.id); setEditMode(false); setFormData(null); }}
                  >
                    <div className="master-cus-avatar">{m.name ? m.name[0].toUpperCase() : '?'}</div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.name || 'Unnamed'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>{m.id} · {m.systemCapacity}</div>
                      <div style={{ marginTop: 4, height: 4, background: '#e3ebf7', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${stageProg}%`, height: '100%', background: '#1a6ff0', borderRadius: 4, transition: 'width .3s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>{m.workflowStage}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT — Detail */}
        {selected ? (
          <div className="master-detail">
            {/* Customer Header */}
            <div className="master-detail-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="master-big-avatar">{selected.name ? selected.name[0].toUpperCase() : '?'}</div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800 }}>{selected.name || 'Unnamed Customer'}</h2>
                  <p style={{ color: 'var(--mute)', fontSize: 13, marginTop: 2 }}>{selected.id} · {selected.district} · {selected.systemCapacity}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <span className={`pill ${(selected.status || 'pending').toLowerCase().replace(' ', '')}`}>{selected.status}</span>
                    <span className="pill" style={{ background: '#f0edff', color: '#6366f1' }}>{selected.workflowStage}</span>
                    {selected.subsidyApplied && <span className="pill" style={{ background: '#d9f6e3', color: '#1c9a55' }}>Subsidy Applied</span>}
                    {selected.loanRequired && <span className="pill" style={{ background: '#e4efff', color: '#1a6ff0' }}>Loan Required</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {!editMode ? (
                  <>
                    <button className="add" onClick={startEdit} style={{ height: 38, padding: '0 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Edit3 size={14} /> Edit Profile
                    </button>
                    <button
                      className="del-btn"
                      style={{ width: 'auto', padding: '0 14px', height: 38, fontSize: 13 }}
                      onClick={() => { if (window.confirm('Delete this customer?')) { deleteMaster(selectedId); setSelectedId(masters.find(m => m.id !== selectedId)?.id || null); } }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="add" onClick={saveEdit} style={{ height: 38, padding: '0 18px', fontSize: 13, background: 'linear-gradient(180deg,#3ed884,#1fae5e)', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Save size={14} /> Save Changes
                    </button>
                    <button className="ghost" onClick={cancelEdit} style={{ height: 38, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <X size={14} /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Section tabs */}
            <div className="master-sect-tabs">
              {sect('personal', 'Personal Info', '👤')}
              {sect('kyc', 'KYC & Electricity', '🪪')}
              {sect('bank', 'Bank & Loan', '🏦')}
              {sect('subsidy', 'Surya Ghar Subsidy', '☀️')}
              {sect('docs', 'Documents & AI', '🤖')}
              {sect('workflow', 'Work Stages', '📋')}
            </div>

            {/* ── SECTION: Personal Info ────────────────── */}
            {activeSection === 'personal' && (
              <div className="master-form-grid">
                <div className="master-form-section">
                  <h3><User size={16} /> Personal Details</h3>
                  <div className="master-row-2">
                    <label>Full Name<I {...field('name')} placeholder="e.g. Anil Kumar" /></label>
                    <label>Phone<I {...field('phone')} placeholder="9876543210" /></label>
                  </div>
                  <div className="master-row-2">
                    <label>Email<I {...field('email')} type="email" placeholder="email@example.com" /></label>
                    <label>Customer Type
                      <S {...field('type')}>
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Industrial</option>
                        <option>Agricultural</option>
                      </S>
                    </label>
                  </div>
                  <label>Full Address<I {...field('address')} placeholder="House No, Street, Area" /></label>
                  <div className="master-row-3">
                    <label>District
                      <S {...field('district')}>
                        <option value="">Select District</option>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </S>
                    </label>
                    <label>State<I {...field('state')} /></label>
                    <label>Pincode<I {...field('pincode')} placeholder="670001" /></label>
                  </div>
                </div>

                <div className="master-form-section">
                  <h3><Sun size={16} /> Solar System Details</h3>
                  <div className="master-row-2">
                    <label>System Capacity
                      <S {...field('systemCapacity')}>
                        {CAPACITY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                      </S>
                    </label>
                    <label>Roof Type
                      <S {...field('roofType')}>
                        <option>Flat RCC</option>
                        <option>Sloped Tile</option>
                        <option>Mangalore Tile</option>
                        <option>Sloped Metal</option>
                        <option>GI Sheet</option>
                      </S>
                    </label>
                  </div>
                  <div className="master-row-2">
                    <label>Status
                      <S {...field('status')}>
                        <option>Pending</option>
                        <option>Active</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </S>
                    </label>
                    <label>Workflow Stage
                      <S {...field('workflowStage')}>
                        {SOLAR_STAGES.map(s => <option key={s.id}>{s.id}</option>)}
                      </S>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION: KYC & Electricity ────────────── */}
            {activeSection === 'kyc' && (
              <div className="master-form-grid">
                <div className="master-form-section">
                  <h3><ShieldCheck size={16} /> KYC Documents</h3>
                  <div className="master-row-2">
                    <label>Aadhaar Number<I {...field('aadharNumber')} placeholder="XXXX XXXX XXXX" /></label>
                    <label>PAN Number<I {...field('panNumber')} placeholder="ABCDE1234F" /></label>
                  </div>
                  <div className="master-row-2">
                    <label>Date of Birth<I {...field('dob')} type="date" /></label>
                    <label>Father's Name<I {...field('fatherName')} placeholder="Father's full name" /></label>
                  </div>
                </div>

                <div className="master-form-section">
                  <h3><Zap size={16} /> Electricity Details (KSEB)</h3>
                  <div className="master-row-2">
                    <label>Consumer Number<I {...field('electricityConsumerNo')} placeholder="KSEB Consumer No" /></label>
                    <label>Meter Number<I {...field('ksebMeterNo')} placeholder="Meter serial no." /></label>
                  </div>
                  <div className="master-row-2">
                    <label>Sanctioned Load<I {...field('sanctionedLoad')} placeholder="e.g. 10 kW" /></label>
                    <label>Phase<S {...field('phase')}>
                      <option>1-Phase</option>
                      <option>3-Phase</option>
                    </S></label>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION: Bank & Loan ──────────────────── */}
            {activeSection === 'bank' && (
              <div className="master-form-grid">
                <div className="master-form-section">
                  <h3><Building2 size={16} /> Bank Details</h3>
                  <div className="master-row-2">
                    <label>Bank Name
                      <S {...field('bankName')}>
                        <option value="">Select Bank</option>
                        {BANKS.map(b => <option key={b}>{b}</option>)}
                      </S>
                    </label>
                    <label>Account Holder Name<I {...field('passbookHolder')} placeholder="As in passbook" /></label>
                  </div>
                  <div className="master-row-2">
                    <label>Account Number<I {...field('accountNumber')} placeholder="Account number" /></label>
                    <label>IFSC Code<I {...field('ifsc')} placeholder="e.g. SBIN0001234" /></label>
                  </div>
                  <label>Branch / Address<I {...field('bankBranch')} placeholder="Branch name and city" /></label>
                </div>

                <div className="master-form-section">
                  <h3><IndianRupee size={16} /> Loan Details</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={editMode ? formData?.loanRequired : selected.loanRequired}
                        onChange={(e) => editMode && setFormData(f => ({ ...f, loanRequired: e.target.checked }))}
                        disabled={!editMode}
                        style={{ width: 18, height: 18, accentColor: '#1a6ff0' }}
                      />
                      <span style={{ fontWeight: 600 }}>Loan Required</span>
                    </label>
                  </div>
                  {(editMode ? formData?.loanRequired : selected.loanRequired) && (
                    <>
                      <div className="master-row-2">
                        <label>Loan Amount (₹)<I {...field('loanAmount')} type="number" placeholder="e.g. 150000" /></label>
                        <label>Loan Bank<S {...field('loanBank')}>
                          <option value="">Select Bank</option>
                          {BANKS.map(b => <option key={b}>{b}</option>)}
                        </S></label>
                      </div>
                      <div className="master-row-2">
                        <label>Loan Type<S {...field('loanType')}>
                          <option>Solar Loan</option>
                          <option>Personal Loan</option>
                          <option>Home Loan</option>
                          <option>KSEB Solar Loan</option>
                        </S></label>
                        <label>Loan Status<S {...field('loanStatus')}>
                          <option>Not Applied</option>
                          <option>Applied</option>
                          <option>Under Review</option>
                          <option>Sanctioned</option>
                          <option>Disbursed</option>
                          <option>Rejected</option>
                        </S></label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── SECTION: Surya Ghar Subsidy ──────────── */}
            {activeSection === 'subsidy' && (
              <div className="master-form-grid">
                <div className="master-form-section">
                  <h3><Sun size={16} /> MNRE PM Surya Ghar Subsidy</h3>
                  <div className="master-subsidy-card">
                    <div className="subsidy-slab-title">Subsidy Estimate</div>
                    <div className="subsidy-amount">₹{subsidyAmount.toLocaleString('en-IN')}</div>
                    <div className="subsidy-for">for {selected.systemCapacity} system</div>
                    <div className="subsidy-slabs">
                      <div className="slab">Upto 2 kW → ₹30,000</div>
                      <div className="slab">2–3 kW → ₹18,000/kW extra</div>
                      <div className="slab">Max residential → ₹78,000</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                    <input
                      type="checkbox"
                      checked={editMode ? formData?.subsidyApplied : selected.subsidyApplied}
                      onChange={(e) => editMode && setFormData(f => ({ ...f, subsidyApplied: e.target.checked, subsidyAmount: e.target.checked ? calcSubsidy(f.systemCapacity) : 0 }))}
                      disabled={!editMode}
                      style={{ width: 18, height: 18, accentColor: '#1fae5e' }}
                    />
                    <span style={{ fontWeight: 600 }}>Surya Ghar Subsidy Applied</span>
                  </div>
                  {(editMode ? formData?.subsidyApplied : selected.subsidyApplied) && (
                    <div className="master-row-2">
                      <label>MNRE Application No.<I {...field('mnreAppNo')} placeholder="MNRE-XXXX" /></label>
                      <label>Surya Ghar App No.<I {...field('suryaGharAppNo')} placeholder="SG-XXXXX" /></label>
                    </div>
                  )}
                </div>

                <div className="master-form-section">
                  <h3><FileText size={16} /> Subsidy & Loan Summary</h3>
                  <div className="cost-table">
                    <div className="cost-row"><span>System Capacity</span><b>{selected.systemCapacity}</b></div>
                    <div className="cost-row highlight"><span>MNRE Subsidy Eligibility</span><b style={{ color: '#1fae5e' }}>₹{subsidyAmount.toLocaleString('en-IN')}</b></div>
                    {selected.loanRequired && (
                      <div className="cost-row"><span>Bank Loan Amount</span><b>₹{(selected.loanAmount || 0).toLocaleString('en-IN')}</b></div>
                    )}
                    <div className="cost-row"><span>Subsidy Status</span><b style={{ color: (editMode ? formData?.subsidyApplied : selected.subsidyApplied) ? '#1fae5e' : '#f59a10' }}>{(editMode ? formData?.subsidyApplied : selected.subsidyApplied) ? 'Applied' : 'Pending Application'}</b></div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION: Documents & AI ───────────────── */}
            {activeSection === 'docs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!geminiApiKey && (
                  <div className="master-ai-hint">
                    <Sparkles size={18} color="#f59a10" />
                    <div>
                      <b>AI Auto-Extract is OFF</b> — Set your free Gemini API key to enable auto-extraction of Aadhaar, PAN, bank details from uploaded images.
                    </div>
                    <button className="tab on" style={{ fontSize: 12, whiteSpace: 'nowrap' }} onClick={() => setShowApiKeyInput(true)}>Set API Key</button>
                  </div>
                )}

                {geminiApiKey && (
                  <div className="master-ai-hint" style={{ background: '#d9f6e3', borderColor: '#a7f3d0' }}>
                    <CheckCircle2 size={18} color="#1fae5e" />
                    <div><b>AI Auto-Extract is ON</b> — Upload any document image and we'll automatically extract all fields.</div>
                  </div>
                )}

                <div className="master-docs-grid">
                  {DOC_TYPES.map(({ key, label, icon: DIcon, accept, prompt }) => {
                    const docData = selected.docs?.[key];
                    const result = aiResults[key];
                    const loading = aiLoading[key];
                    const error = aiError[key];
                    return (
                      <div key={key} className="master-doc-card">
                        <div className="master-doc-header">
                          <DIcon size={18} color="#1a6ff0" />
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                          {docData && <CheckCircle2 size={16} color="#1fae5e" style={{ marginLeft: 'auto' }} />}
                        </div>

                        {docData && docData.startsWith('data:image') && (
                          <img src={docData} alt={label} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 8, border: '1px solid #e3ebf7' }} />
                        )}
                        {docData && !docData.startsWith('data:image') && (
                          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--mute)', fontSize: 13 }}>📄 File uploaded</div>
                        )}

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                          <button
                            className="tab"
                            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}
                            onClick={() => fileRefs.current[key]?.click()}
                          >
                            <Upload size={13} /> {docData ? 'Replace' : 'Upload'}
                          </button>
                          <input
                            type="file"
                            accept={accept}
                            ref={el => fileRefs.current[key] = el}
                            style={{ display: 'none' }}
                            onChange={(e) => e.target.files[0] && handleDocUpload(key, e.target.files[0], prompt)}
                          />
                          {docData && geminiApiKey && (
                            <button
                              className={`tab ${result ? 'on' : ''}`}
                              style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                              disabled={loading}
                              onClick={() => extractWithAI(key, docData, prompt)}
                            >
                              {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
                              {loading ? 'Extracting...' : 'AI Extract'}
                            </button>
                          )}
                        </div>

                        {error && <div style={{ color: '#d9342b', fontSize: 11, marginTop: 6 }}>⚠ {error}</div>}

                        {result && (
                          <div className="ai-result-box">
                            <div style={{ fontWeight: 700, fontSize: 12, color: '#1a6ff0', marginBottom: 8 }}>
                              <Sparkles size={12} /> AI Extracted Data:
                            </div>
                            {Object.entries(result).filter(([, v]) => v).map(([k, v]) => (
                              <div key={k} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0', borderBottom: '1px solid #e3ebf7' }}>
                                <span style={{ color: 'var(--mute)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                                <b>{v}</b>
                              </div>
                            ))}
                            <button
                              className="add"
                              style={{ width: '100%', marginTop: 10, height: 34, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                              onClick={() => applyAiResult(key)}
                            >
                              <Check size={13} /> Apply to Profile
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SECTION: Work Stages ──────────────────── */}
            {activeSection === 'workflow' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="master-form-section">
                  <h3>📋 Solar Project Workflow</h3>
                  <p style={{ color: 'var(--mute)', fontSize: 13, marginBottom: 16 }}>
                    Track all stages of this customer's solar installation from agreement to handover.
                  </p>
                  <div className="workflow-track">
                    {SOLAR_STAGES.map((stage, idx) => {
                      const currentIdx = SOLAR_STAGES.findIndex(s => s.id === selected.workflowStage);
                      const done = idx < currentIdx;
                      const active = idx === currentIdx;
                      return (
                        <div key={stage.id} className={`workflow-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                          <div className="wf-icon" style={{ background: done || active ? stage.color : '#e3ebf7', color: done || active ? '#fff' : 'var(--mute)' }}>
                            {done ? <CheckCircle2 size={20} /> : <span style={{ fontSize: 18 }}>{stage.icon}</span>}
                          </div>
                          {idx < SOLAR_STAGES.length - 1 && (
                            <div className="wf-line" style={{ background: done ? stage.color : '#e3ebf7' }} />
                          )}
                          <div className="wf-label">
                            <b>{stage.label}</b>
                            <span>{stage.desc}</span>
                            <span style={{ color: stage.color, fontWeight: 700 }}>{stage.progress}%</span>
                          </div>
                          {editMode && (
                            <button
                              className={`tab ${active ? 'on' : ''}`}
                              style={{ fontSize: 11, padding: '5px 10px' }}
                              onClick={() => setFormData(f => ({ ...f, workflowStage: stage.id }))}
                            >
                              {active ? '✓ Current' : 'Set'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--mute)', padding: 40 }}>
            <div style={{ textAlign: 'center', maxWidth: 380 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eef4ff', color: '#1a6ff0', display: 'grid', placeItems: 'center', fontSize: 28, margin: '0 auto 16px' }}>
                👥
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>No Customer Selected</h3>
              <p style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 20, lineHeight: 1.5 }}>
                Current customer database is clear. Register a new customer to start managing KYC documents, subsidies, and workflow stages.
              </p>
              <button className="add" style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setShowAddForm(true)}>
                <Plus size={16} /> Register New Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
