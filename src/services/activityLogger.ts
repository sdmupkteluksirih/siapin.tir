import { ActivityAction, ActivityLog, UserAccount } from '../types';
import { authStorage } from './authStorage';

const STORAGE_KEY = 'siapin_activity_logs_v1';
const LISTEN_EVENT = 'siapin_activity_logs_changed';

// Initial realistic Indonesian corporate seed logs
const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-08T02:25:00.000Z',
    userId: 'usr-ku',
    userName: 'PIC Keuangan & Umum',
    userDepartment: 'Keuangan & Umum',
    userRole: 'USER',
    action: 'LOGIN',
    details: 'Berhasil login ke sistem SI APIN dari IP Internal PLTU'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-08T02:30:00.000Z',
    userId: 'usr-ku',
    userName: 'PIC Keuangan & Umum',
    userDepartment: 'Keuangan & Umum',
    userRole: 'USER',
    action: 'BOOKING_CREATE',
    targetId: 'KSA-20260908-0001',
    details: 'Mengajukan booking baru: "Rapat Koordinasi Anggaran & Evaluasi Keuangan Semester II" (Room meeting KU lt. 1)'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-08T02:50:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'LOGIN',
    details: 'Login administrator ke portal pengelolaan fasilitas'
  },
  {
    id: 'log-004',
    timestamp: '2026-09-08T03:00:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'BOOKING_CREATE',
    targetId: 'ADM-20260909-0001',
    details: 'Membuat jadwal kegiatan: "Review Program Kerja & Evaluasi Fasilitas Operasional PLTU" (Ruang Rapat Lantai 2)'
  },
  {
    id: 'log-005',
    timestamp: '2026-09-08T03:15:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'BOOKING_CREATE',
    targetId: 'ADM-20260909-0002',
    details: 'Membuat jadwal kegiatan: "Sosialisasi Standar Pelayanan & Housekeeping Area PLTU Teluk Sirih" (Ruang Rapat Lantai 1)'
  },
  {
    id: 'log-006',
    timestamp: '2026-09-08T03:30:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'BOOKING_APPROVE',
    targetId: 'OPR-20260820-0001',
    details: 'Menyetujui permohonan booking OPR-20260820-0001 (Meeting Koordinasi Operasional Unit)'
  }
];

let cachedLogs: ActivityLog[] | null = null;
let isInitialized = false;

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('siapin_activity_logs_channel')
  : null;

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LISTEN_EVENT));
    try {
      broadcastChannel?.postMessage({ type: 'LOGS_CHANGED', timestamp: Date.now() });
    } catch {
      // Ignore broadcast error
    }
  }
}

async function fetchLogsFromServer() {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/logs');
    if (!res.ok) return;
    const serverLogs: ActivityLog[] = await res.json();
    if (!Array.isArray(serverLogs)) return;

    // Merge server logs with local
    const localMap = new Map<string, ActivityLog>();
    if (Array.isArray(cachedLogs)) {
      cachedLogs.forEach(l => { if (l && l.id) localMap.set(l.id, l); });
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((l: ActivityLog) => { if (l && l.id) localMap.set(l.id, l); });
        }
      }
    } catch {
      // ignore
    }

    serverLogs.forEach(l => localMap.set(l.id, l));
    const merged = Array.from(localMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 2000);

    const currStr = JSON.stringify(cachedLogs || []);
    const newStr = JSON.stringify(merged);
    if (currStr !== newStr) {
      cachedLogs = merged;
      try {
        localStorage.setItem(STORAGE_KEY, newStr);
      } catch {}
      notifySubscribers();
    }
  } catch {
    // Offline fallback
  }
}

function setupLogsRealtime() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  fetchLogsFromServer();

  try {
    const sse = new EventSource('/api/events');
    sse.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'activity_logged') {
          fetchLogsFromServer();
        }
      } catch {}
    };
  } catch {}

  // Periodic refresh
  setInterval(() => {
    fetchLogsFromServer();
  }, 4000);

  if (broadcastChannel) {
    broadcastChannel.onmessage = (e) => {
      if (e.data?.type === 'LOGS_CHANGED') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            cachedLogs = JSON.parse(stored);
            window.dispatchEvent(new Event(LISTEN_EVENT));
          } catch {
            fetchLogsFromServer();
          }
        }
      }
    };
  }
}

if (typeof window !== 'undefined') {
  setupLogsRealtime();
}

export const activityLogger = {
  getAll(filterUserId?: string): ActivityLog[] {
    if (typeof window === 'undefined') return INITIAL_LOGS;

    let all: ActivityLog[] = [];
    if (cachedLogs && Array.isArray(cachedLogs)) {
      all = cachedLogs;
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          all = JSON.parse(stored);
          cachedLogs = all;
        } catch {
          all = INITIAL_LOGS;
        }
      } else {
        all = INITIAL_LOGS;
        cachedLogs = INITIAL_LOGS;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
        } catch {}
      }
    }

    if (!filterUserId) return all;

    const cleanFilter = filterUserId.toLowerCase();
    return all.filter(
      l =>
        l.userId.toLowerCase() === cleanFilter ||
        l.userName.toLowerCase().includes(cleanFilter) ||
        l.userDepartment.toLowerCase().includes(cleanFilter)
    );
  },

  log(
    action: ActivityAction,
    details: string,
    targetId?: string,
    metadata?: Record<string, any>,
    userOverride?: UserAccount | null
  ): ActivityLog {
    const user = userOverride !== undefined ? userOverride : authStorage.getCurrentUser();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: user ? user.username : 'tamu',
      userName: user ? user.name : 'Pengunjung / Tamu',
      userDepartment: user ? user.department : 'Umum',
      userRole: user ? user.role : 'USER',
      action,
      details,
      targetId,
      metadata
    };

    const all = this.getAll();
    const updated = [newLog, ...all].slice(0, 2000);
    cachedLogs = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    notifySubscribers();

    // Async push to server
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(() => {});

    return newLog;
  },

  async clearLogs(): Promise<void> {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
    } catch {}
    cachedLogs = INITIAL_LOGS;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
    } catch {}
    notifySubscribers();
  },

  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(LISTEN_EVENT, callback);
    return () => {
      window.removeEventListener(LISTEN_EVENT, callback);
    };
  }
};
