import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Default Master Customers (Clean empty state) ───────────────────────────
export const DEFAULT_MASTERS = [];

const CUS_STORAGE_KEY = 'royal-eye-master-customers-live';
const CUS_PURGED_FLAG = 'royal-eye-customers-purged-2026-10-15-v2';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  // 1. Initial State from HTML5 LocalStorage (Instant 0ms boot)
  const [masters, setMasters] = useState(() => {
    try {
      if (!localStorage.getItem(CUS_PURGED_FLAG)) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('royal-eye-master-customers')) {
            localStorage.removeItem(k);
          }
        });
        localStorage.setItem(CUS_PURGED_FLAG, 'true');
        return [];
      }
      const stored = localStorage.getItem(CUS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_MASTERS;
    } catch {
      return DEFAULT_MASTERS;
    }
  });

  const DEFAULT_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    const saved = localStorage.getItem('royal-eye-gemini-key');
    return saved !== null && saved !== '' ? saved : DEFAULT_KEY;
  });

  // Cloud sync status: 'offline' | 'connecting' | 'connected' | 'syncing' | 'error'
  const [cloudStatus, setCloudStatus] = useState(isSupabaseConfigured() ? 'connecting' : 'offline');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const isSyncingRef = useRef(false);

  // 2. LocalStorage Persistence (Pillar 5 Fallback)
  useEffect(() => {
    try {
      localStorage.setItem(CUS_STORAGE_KEY, JSON.stringify(masters));
    } catch {}
  }, [masters]);

  useEffect(() => {
    try {
      localStorage.setItem('royal-eye-gemini-key', geminiApiKey || DEFAULT_KEY);
    } catch {}
  }, [geminiApiKey]);

  // 3. Supabase Cloud Sync & Real-time WebSockets (Pillar 2)
  const syncWithSupabase = useCallback(async (pushLocal = false) => {
    if (!isSupabaseConfigured()) {
      setCloudStatus('offline');
      return { ok: false, reason: 'Supabase credentials not configured' };
    }

    const sb = getSupabase();
    if (!sb) {
      setCloudStatus('offline');
      return { ok: false, reason: 'Could not create Supabase client' };
    }

    try {
      setCloudStatus('syncing');
      isSyncingRef.current = true;

      // Fetch cloud records
      const { data: cloudRecords, error: fetchErr } = await sb
        .from('customers')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchErr) {
        console.warn('[Supabase Sync Error]', fetchErr.message);
        setCloudStatus('error');
        return { ok: false, error: fetchErr.message };
      }

      if (cloudRecords && cloudRecords.length > 0) {
        // Merge cloud records into state
        const mappedCloud = cloudRecords.map(fromSupabaseRecord);
        setMasters(mappedCloud);
        try {
          localStorage.setItem(CUS_STORAGE_KEY, JSON.stringify(mappedCloud));
        } catch {}
      } else if (pushLocal) {
        // If Supabase is empty and user requested push, upload local masters
        const localData = JSON.parse(localStorage.getItem(CUS_STORAGE_KEY) || '[]');
        if (localData.length > 0) {
          const payload = localData.map(toSupabaseRecord);
          await sb.from('customers').upsert(payload);
        }
      }

      setCloudStatus('connected');
      setLastSyncedAt(new Date());
      return { ok: true, count: cloudRecords ? cloudRecords.length : 0 };
    } catch (err) {
      console.warn('[Supabase Sync Exception]', err);
      setCloudStatus('error');
      return { ok: false, error: err.message };
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Mount effect: connect & listen to realtime postgres changes
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCloudStatus('offline');
      return;
    }

    const sb = getSupabase();
    if (!sb) return;

    // Initial sync
    syncWithSupabase(false);

    // Setup Realtime WebSocket Channel
    const channel = sb
      .channel('royal-eye-customers-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const incoming = fromSupabaseRecord(payload.new);
            setMasters((prev) => {
              const idx = prev.findIndex((m) => m.id === incoming.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...prev[idx], ...incoming };
                return next;
              }
              return [incoming, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            const delId = payload.old?.id;
            if (delId) {
              setMasters((prev) => prev.filter((m) => m.id !== delId));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setCloudStatus('connected');
        }
      });

    return () => {
      sb.removeChannel(channel);
    };
  }, [syncWithSupabase]);

  // 4. Data Mutations (Hybrid: Optimistic Local + Cloud Async)
  const addMaster = (customer) => {
    const id = customer.id || `CUS-${String(masters.length + 1).padStart(3, '0')}`;
    const newRecord = { ...blankMaster(id), ...customer, id };

    // Optimistic local update
    setMasters((prev) => [...prev, newRecord]);

    // Background Cloud Upload
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        sb.from('customers')
          .upsert(toSupabaseRecord(newRecord))
          .catch((e) => console.warn('[Supabase Add Error]', e));
      }
    }

    return id;
  };

  const updateMaster = (id, patch) => {
    let updatedObj = null;
    setMasters((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          updatedObj = deepMerge(m, patch);
          return updatedObj;
        }
        return m;
      })
    );

    // Background Cloud Update
    if (isSupabaseConfigured() && updatedObj) {
      const sb = getSupabase();
      if (sb) {
        sb.from('customers')
          .upsert(toSupabaseRecord(updatedObj))
          .catch((e) => console.warn('[Supabase Update Error]', e));
      }
    }
  };

  const deleteMaster = (id) => {
    setMasters((prev) => prev.filter((m) => m.id !== id));

    // Background Cloud Delete
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        sb.from('customers')
          .delete()
          .eq('id', id)
          .catch((e) => console.warn('[Supabase Delete Error]', e));
      }
    }
  };

  const clearAllCustomers = () => {
    setMasters([]);
    try {
      localStorage.setItem(CUS_STORAGE_KEY, '[]');
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('royal-eye-master-customers')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}

    // Cloud clear if desired
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        sb.from('customers')
          .delete()
          .neq('id', '__keep_none__')
          .catch((e) => console.warn('[Supabase Clear Error]', e));
      }
    }
  };

  const getMaster = (id) => masters.find((m) => m.id === id) || null;

  const findCustomerByNameOrId = (identifier) => {
    if (!identifier) return null;
    const lower = identifier.toLowerCase();
    return (
      masters.find(
        (m) => m.id.toLowerCase() === lower || (m.name && m.name.toLowerCase() === lower)
      ) || null
    );
  };

  return (
    <CustomerContext.Provider
      value={{
        masters,
        addMaster,
        updateMaster,
        deleteMaster,
        clearAllCustomers,
        getMaster,
        findCustomerByNameOrId,
        geminiApiKey,
        setGeminiApiKey,
        cloudStatus,
        lastSyncedAt,
        syncWithSupabase,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers must be used inside CustomerProvider');
  return ctx;
}

// ─────────────────────────────────────────────────────────
//  Helpers & Serializers
// ─────────────────────────────────────────────────────────
export function blankMaster(id = '') {
  return {
    id,
    name: '',
    phone: '',
    email: '',
    address: '',
    district: 'Thrissur',
    state: 'Kerala',
    pincode: '',
    aadharNumber: '',
    panNumber: '',
    dob: '',
    fatherName: '',
    electricityConsumerNo: '',
    ksebMeterNo: '',
    sanctionedLoad: '5 kW',
    phase: '1-Phase',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    passbookHolder: '',
    bankBranch: '',
    systemCapacity: '3 kW',
    roofType: 'Flat RCC',
    loanRequired: false,
    loanAmount: 0,
    loanBank: '',
    loanType: 'Solar Loan',
    loanStatus: 'Applied',
    subsidyApplied: true,
    subsidyAmount: 78000,
    mnreAppNo: '',
    suryaGharAppNo: '',
    docs: {
      aadharFront: null,
      aadharBack: null,
      panCard: null,
      electricityBill: null,
      passbook: null,
      mnreForm: null,
    },
    workflowStage: 'Anubhandham 1',
    status: 'Pending',
    joined: new Date().toISOString().slice(0, 10),
    type: 'Residential',
    totalBilled: 0,
    date: new Date().toISOString().slice(0, 10),
    aiExtracted: null,
  };
}

export function toSupabaseRecord(c) {
  return {
    id: c.id,
    name: c.name || '',
    phone: c.phone || '',
    email: c.email || '',
    address: c.address || '',
    district: c.district || 'Thrissur',
    state: c.state || 'Kerala',
    pincode: c.pincode || '',
    aadhar_number: c.aadharNumber || '',
    pan_number: c.panNumber || '',
    dob: c.dob || '',
    father_name: c.fatherName || '',
    electricity_consumer_no: c.electricityConsumerNo || '',
    kseb_meter_no: c.ksebMeterNo || '',
    sanctioned_load: c.sanctionedLoad || '5 kW',
    phase: c.phase || '1-Phase',
    bank_name: c.bankName || '',
    account_number: c.accountNumber || '',
    ifsc: c.ifsc || '',
    passbook_holder: c.passbookHolder || '',
    bank_branch: c.bankBranch || '',
    system_capacity: c.systemCapacity || '3 kW',
    roof_type: c.roofType || 'Flat RCC',
    loan_required: Boolean(c.loanRequired),
    loan_amount: Number(c.loanAmount || 0),
    loan_bank: c.loanBank || '',
    loan_type: c.loanType || 'Solar Loan',
    loan_status: c.loanStatus || 'Applied',
    subsidy_applied: Boolean(c.subsidyApplied ?? true),
    subsidy_amount: Number(c.subsidyAmount || 78000),
    mnre_app_no: c.mnreAppNo || '',
    surya_ghar_app_no: c.suryaGharAppNo || '',
    workflow_stage: c.workflowStage || 'Anubhandham 1',
    status: c.status || 'Pending',
    joined: c.joined || new Date().toISOString().slice(0, 10),
    type: c.type || 'Residential',
    total_billed: Number(c.totalBilled || 0),
    date: c.date || new Date().toISOString().slice(0, 10),
    docs: c.docs || {},
    raw_data: c,
    updated_at: new Date().toISOString(),
  };
}

export function fromSupabaseRecord(r) {
  if (r.raw_data && typeof r.raw_data === 'object' && Object.keys(r.raw_data).length > 0) {
    return { ...blankMaster(r.id), ...r.raw_data, id: r.id };
  }
  return {
    ...blankMaster(r.id),
    name: r.name || '',
    phone: r.phone || '',
    email: r.email || '',
    address: r.address || '',
    district: r.district || 'Thrissur',
    state: r.state || 'Kerala',
    pincode: r.pincode || '',
    aadharNumber: r.aadhar_number || '',
    panNumber: r.pan_number || '',
    dob: r.dob || '',
    fatherName: r.father_name || '',
    electricityConsumerNo: r.electricity_consumer_no || '',
    ksebMeterNo: r.kseb_meter_no || '',
    sanctionedLoad: r.sanctioned_load || '5 kW',
    phase: r.phase || '1-Phase',
    bankName: r.bank_name || '',
    accountNumber: r.account_number || '',
    ifsc: r.ifsc || '',
    passbookHolder: r.passbook_holder || '',
    bankBranch: r.bank_branch || '',
    systemCapacity: r.system_capacity || '3 kW',
    roofType: r.roof_type || 'Flat RCC',
    loanRequired: Boolean(r.loan_required),
    loanAmount: Number(r.loan_amount || 0),
    loanBank: r.loan_bank || '',
    loanType: r.loan_type || 'Solar Loan',
    loanStatus: r.loan_status || 'Applied',
    subsidyApplied: Boolean(r.subsidy_applied ?? true),
    subsidyAmount: Number(r.subsidy_amount || 78000),
    mnreAppNo: r.mnre_app_no || '',
    suryaGharAppNo: r.surya_ghar_app_no || '',
    docs: r.docs || {},
    workflowStage: r.workflow_stage || 'Anubhandham 1',
    status: r.status || 'Pending',
    joined: r.joined || new Date().toISOString().slice(0, 10),
    type: r.type || 'Residential',
    totalBilled: Number(r.total_billed || 0),
    date: r.date || new Date().toISOString().slice(0, 10),
  };
}

function deepMerge(base, patch) {
  const result = { ...base };
  for (const key of Object.keys(patch)) {
    if (patch[key] !== null && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
      result[key] = deepMerge(base[key] || {}, patch[key]);
    } else {
      result[key] = patch[key];
    }
  }
  return result;
}

// ─── Surya Ghar subsidy calculation ───────────────────────
export function calcSubsidy(capacityStr) {
  const kw = parseFloat(capacityStr) || 0;
  if (kw <= 0) return 0;
  if (kw <= 1) return 30000;
  if (kw <= 2) return 60000;
  return 78000;
}
