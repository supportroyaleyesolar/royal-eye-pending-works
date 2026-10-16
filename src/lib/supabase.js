import { createClient } from '@supabase/supabase-js';

// Storage keys for in-app configuration
export const SB_URL_KEY = 'royal-eye-supabase-url';
export const SB_ANON_KEY = 'royal-eye-supabase-anon-key';

let cachedClient = null;
let lastUrl = null;
let lastKey = null;

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(SB_URL_KEY) || '' : '';
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem(SB_ANON_KEY) || '' : '';

  const url = (storedUrl || envUrl).trim();
  const key = (storedKey || envKey).trim();

  return { url, key, isCustom: Boolean(storedUrl) };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabase() {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 10 } },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

export async function testSupabaseConnection(testUrl, testKey) {
  const url = (testUrl || getSupabaseCredentials().url || '').trim();
  const key = (testKey || getSupabaseCredentials().key || '').trim();

  if (!url || !key) {
    return { ok: false, error: 'Project URL and Anon Key are required.' };
  }

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false },
    });
    // Ping customers table or just do a light select
    const { data, error } = await client.from('customers').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, it's connected to Supabase but needs schema
      if (error.code === '42P01') {
        return {
          ok: true,
          tableMissing: true,
          message: 'Connected to Supabase! (Note: The "customers" table needs to be created using the provided SQL schema)',
        };
      }
      return { ok: false, error: `${error.message} (code: ${error.code})` };
    }
    return { ok: true, message: 'Connected to Supabase PostgreSQL & Realtime successfully!', rowCount: data?.length ?? 0 };
  } catch (err) {
    return { ok: false, error: err.message || 'Connection failed' };
  }
}

export function saveSupabaseConfig(url, key) {
  try {
    if (url) localStorage.setItem(SB_URL_KEY, url.trim());
    else localStorage.removeItem(SB_URL_KEY);

    if (key) localStorage.setItem(SB_ANON_KEY, key.trim());
    else localStorage.removeItem(SB_ANON_KEY);

    cachedClient = null;
    lastUrl = null;
    lastKey = null;
    return true;
  } catch {
    return false;
  }
}
