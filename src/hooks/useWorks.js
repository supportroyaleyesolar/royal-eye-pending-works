import { useEffect, useState, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'royal-eye-solar-works-live';
const PURGED_FLAG = 'royal-eye-works-purged-2026-10-15-v2';

export default function useWorks() {
  const [works, setWorks] = useState(() => {
    try {
      if (!localStorage.getItem(PURGED_FLAG)) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('royal-eye-solar-works')) {
            localStorage.removeItem(k);
          }
        });
        localStorage.setItem(PURGED_FLAG, 'true');
        return [];
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // LocalStorage persistence (Pillar 5)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
    } catch {
      /* storage unavailable */
    }
  }, [works]);

  // Supabase Real-time Sync (Pillar 2)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabase();
    if (!sb) return;

    // Fetch existing works from cloud
    sb.from('works')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((w) => ({
            id: Number(w.id),
            title: w.title,
            customer: w.customer,
            date: w.date,
            status: w.status,
            progress: Number(w.progress || 0),
            team: w.team,
            location: w.location,
            ...(w.raw_data || {}),
          }));
          setWorks(mapped);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          } catch {}
        }
      });

    // Realtime channel
    const channel = sb
      .channel('royal-eye-works-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'works' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const w = payload.new;
          const mapped = {
            id: Number(w.id),
            title: w.title,
            customer: w.customer,
            date: w.date,
            status: w.status,
            progress: Number(w.progress || 0),
            team: w.team,
            location: w.location,
            ...(w.raw_data || {}),
          };
          setWorks((prev) => {
            const idx = prev.findIndex((item) => item.id === mapped.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...mapped };
              return copy;
            }
            return [mapped, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const delId = Number(payload.old?.id);
          if (delId) {
            setWorks((prev) => prev.filter((item) => item.id !== delId));
          }
        }
      })
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  const add = (work) => {
    const newWork = { ...work, id: Date.now() };
    setWorks((p) => [...p, newWork]);

    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        sb.from('works')
          .upsert({
            id: newWork.id,
            title: newWork.title || 'Work Task',
            customer: newWork.customer || '',
            date: newWork.date || new Date().toISOString().slice(0, 10),
            status: newWork.status || 'Pending',
            progress: Number(newWork.progress || 0),
            team: newWork.team || '',
            location: newWork.location || '',
            raw_data: newWork,
            updated_at: new Date().toISOString(),
          })
          .catch((e) => console.warn('[Supabase Works Error]', e));
      }
    }
  };

  const remove = (id) => {
    setWorks((p) => p.filter((w) => w.id !== id));
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        sb.from('works').delete().eq('id', id).catch((e) => console.warn(e));
      }
    }
  };

  const update = (id, patch) => {
    let updated = null;
    setWorks((p) =>
      p.map((w) => {
        if (w.id === id) {
          updated = { ...w, ...patch };
          return updated;
        }
        return w;
      })
    );

    if (isSupabaseConfigured() && updated) {
      const sb = getSupabase();
      if (sb) {
        sb.from('works')
          .upsert({
            id: updated.id,
            title: updated.title,
            customer: updated.customer,
            date: updated.date,
            status: updated.status,
            progress: Number(updated.progress || 0),
            team: updated.team,
            location: updated.location,
            raw_data: updated,
            updated_at: new Date().toISOString(),
          })
          .catch((e) => console.warn(e));
      }
    }
  };

  const clearAllWorks = () => {
    setWorks([]);
    try {
      localStorage.setItem(STORAGE_KEY, '[]');
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('royal-eye-solar-works')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}

    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        sb.from('works').delete().neq('id', 0).catch((e) => console.warn(e));
      }
    }
  };

  return { works, add, remove, update, clearAllWorks };
}
