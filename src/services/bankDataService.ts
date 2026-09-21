/**
 * bankDataService.ts
 * Layanan terpadu untuk 1 Source Bank Data SI APIN.
 * Semua data (14 akun pengguna, seluruh permohonan booking, dan seluruh log audit)
 * bermuara ke master bank data tunggal yang tersinkronisasi secara real-time.
 */

import { UserAccount, Booking, ActivityLog } from '../types';

export interface MasterBankData {
  system: string;
  schemaVersion: string;
  lastUpdated: string;
  lastTrigger?: string;
  meta: {
    totalAccounts: number;
    totalBookings: number;
    totalActivityLogs: number;
    activeBookings: number;
  };
  accounts: UserAccount[];
  bookings: Booking[];
  activityLogs: ActivityLog[];
}

const BANK_DATA_KEY = 'si_apin_master_bank_data';
const BANK_LISTEN_EVENT = 'si_apin_bank_data_updated';

let cachedBankData: MasterBankData | null = null;
let isInitialized = false;

let bankBroadcast: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    bankBroadcast = new BroadcastChannel('si_apin_bank_channel');
  } catch {}
}

function notifyBankSubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(BANK_LISTEN_EVENT));
    if (bankBroadcast) {
      bankBroadcast.postMessage({ type: 'BANK_DATA_UPDATED', timestamp: Date.now() });
    }
  }
}

export async function fetchMasterBankData(): Promise<MasterBankData | null> {
  try {
    const res = await fetch('/api/bank-data');
    if (res.ok) {
      const data: MasterBankData = await res.json();
      cachedBankData = data;
      try {
        localStorage.setItem(BANK_DATA_KEY, JSON.stringify(data));
      } catch {}
      notifyBankSubscribers();
      return data;
    }
  } catch {
    // Offline fallback
  }

  // Fallback to local cache
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(BANK_DATA_KEY);
      if (stored) {
        cachedBankData = JSON.parse(stored);
        return cachedBankData;
      }
    } catch {}
  }

  return cachedBankData;
}

export function initBankDataListener() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // 1. Initial fetch
  fetchMasterBankData();

  // 2. Real-time SSE listener
  try {
    const sse = new EventSource('/api/events');
    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (
          payload.type === 'bank_data_synced' ||
          payload.type === 'bookings_changed' ||
          payload.type === 'users_changed' ||
          payload.type === 'activity_logged'
        ) {
          fetchMasterBankData();
        }
      } catch {}
    };
  } catch {}

  // 3. Fallback interval sync
  setInterval(() => {
    fetchMasterBankData();
  }, 4000);

  // 4. Broadcast channel
  if (bankBroadcast) {
    bankBroadcast.onmessage = () => {
      fetchMasterBankData();
    };
  }
}

if (typeof window !== 'undefined') {
  initBankDataListener();
}

export const bankDataService = {
  getCached(): MasterBankData | null {
    if (cachedBankData) return cachedBankData;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(BANK_DATA_KEY);
        if (stored) {
          cachedBankData = JSON.parse(stored);
          return cachedBankData;
        }
      } catch {}
    }
    return null;
  },

  async refresh(): Promise<MasterBankData | null> {
    return await fetchMasterBankData();
  },

  async forceReconcile(): Promise<{ success: boolean; meta?: any }> {
    try {
      const res = await fetch('/api/bank-data/sync', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        await fetchMasterBankData();
        return result;
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  },

  async restore(backupData: any): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/bank-data/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: backupData })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchMasterBankData();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Gagal restore data' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Koneksi gagal' };
    }
  },

  exportUrl(): string {
    return '/api/bank-data/export';
  },

  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(BANK_LISTEN_EVENT, callback);
    return () => {
      window.removeEventListener(BANK_LISTEN_EVENT, callback);
    };
  }
};
