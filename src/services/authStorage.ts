import { UserAccount } from '../types';
import { activityLogger } from './activityLogger';
import { sseClient } from './sseClient';

const USERS_STORAGE_KEY = 'meeting_app_users_v1';
const CURRENT_USER_KEY = 'meeting_app_current_user_v1';
const AUTH_LISTEN_EVENT = 'meeting_app_auth_changed';

// Default user accounts with Admin credentials:
// Admin 1 (User 1): NOFI ZAHARA (ID: nofi / admin.nofi)
// Admin 2 (User 2): RESNA WATI (ID: resna / admin.resna)
// Admin 3 (Aplikasi 1): DERI TIALIS PERISTIAWAN (ID: deri / admin.deri)
// Admin 4 (Aplikasi 2): YUDA PUTRA UTAMA (ID: yuda / admin.yuda)
// Master Admin: admin | Password awal: admin123
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin-nofi',
    username: 'nofi',
    name: 'NOFI ZAHARA',
    role: 'ADMIN',
    department: 'Keuangan & Umum (Admin User 1)',
    email: 'nofi.zahara@pln.co.id',
    password: 'admin123',
    avatarText: 'NZ',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-resna',
    username: 'resna',
    name: 'RESNA WATI',
    role: 'ADMIN',
    department: 'Keuangan & Umum (Admin User 2)',
    email: 'resna.wati@pln.co.id',
    password: 'admin123',
    avatarText: 'RW',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-deri',
    username: 'deri',
    name: 'DERI TIALIS PERISTIAWAN',
    role: 'ADMIN',
    department: 'Sistem Informasi & TI (Admin Aplikasi 1)',
    email: 'deri.tialis@pln.co.id',
    password: 'PLNip@2026',
    avatarText: 'DP',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-yuda',
    username: 'yuda',
    name: 'YUDA PUTRA UTAMA',
    role: 'ADMIN',
    department: 'Sistem Informasi & TI (Admin Aplikasi 2)',
    email: 'yuda.putra@pln.co.id',
    password: 'admin123',
    avatarText: 'YP',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator Si APIN (Master)',
    role: 'ADMIN',
    department: 'Keuangan & Umum',
    email: 'sdm.upkteluksirih@gmail.com',
    password: 'admin123',
    avatarText: 'AD',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ops',
    username: 'operasi',
    name: 'PIC Operasi',
    role: 'USER',
    department: 'Operasi',
    email: 'operasi.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'OP',
    lastLogin: '2026-08-19T09:15:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-har',
    username: 'pemeliharaan',
    name: 'PIC Pemeliharaan',
    role: 'USER',
    department: 'Pemeliharaan',
    email: 'pemeliharaan.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'PH',
    lastLogin: '2026-08-19T11:20:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-enj',
    username: 'enjiniring',
    name: 'PIC Enjiniring',
    role: 'USER',
    department: 'Enjiniring',
    email: 'enjiniring.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'EN',
    lastLogin: '2026-08-18T14:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-cah',
    username: 'coal_ash',
    name: 'PIC Coal & Ash Handling',
    role: 'USER',
    department: 'Coal & Ash Handling',
    email: 'coalash.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'CA',
    lastLogin: '2026-08-17T10:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ku',
    username: 'keuangan',
    name: 'PIC Keuangan & Umum',
    role: 'USER',
    department: 'Keuangan & Umum',
    email: 'keuangan.teluksirih@gmail.com',
    password: 'PLNip@KU2026',
    avatarText: 'KU',
    lastLogin: '2026-08-19T13:45:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-k3',
    username: 'k3_keamanan',
    name: 'PIC K3 & Keamanan',
    role: 'USER',
    department: 'K3 & Keamanan',
    email: 'k3.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'K3',
    lastLogin: '2026-08-18T16:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ling',
    username: 'lingkungan',
    name: 'PIC Lingkungan Hidup',
    role: 'USER',
    department: 'Lingkungan',
    email: 'lingkungan.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'LH',
    lastLogin: '2026-08-16T08:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-proc',
    username: 'pengadaan',
    name: 'PIC Pengadaan',
    role: 'USER',
    department: 'Pengadaan',
    email: 'pengadaan.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'PG',
    lastLogin: '2026-08-19T15:10:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-smt',
    username: 'sm_terintegrasi',
    name: 'PIC Sistem Manajemen Terintegrasi',
    role: 'USER',
    department: 'Sistem Manajemen Terintegrasi',
    email: 'smt.teluksirih@gmail.com',
    password: 'user123',
    avatarText: 'SM',
    lastLogin: '2026-08-20T09:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// BroadcastChannel for instant cross-tab auth communication
const authBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('siapin_auth_sync_channel')
  : null;

function getLocalStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_USERS;
}

let cachedUsers: UserAccount[] | null = typeof window !== 'undefined' ? getLocalStoredUsers() : null;
let isAuthSyncInitialized = false;

function notifyAuthSubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_LISTEN_EVENT));
    try {
      authBroadcast?.postMessage({ 
        type: 'AUTH_USERS_CHANGED', 
        timestamp: Date.now(),
        users: cachedUsers 
      });
    } catch {
      // Ignore
    }
  }
}

function applyServerUsersUpdate(newUsers: UserAccount[]) {
  if (!Array.isArray(newUsers) || newUsers.length === 0) return;
  cachedUsers = newUsers;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
  } catch {}

  // Check if current active session user has updated password/data
  if (typeof window !== 'undefined') {
    try {
      const storedCurr = localStorage.getItem(CURRENT_USER_KEY);
      if (storedCurr) {
        const curr = JSON.parse(storedCurr);
        if (curr && (curr.id || curr.username)) {
          const match = newUsers.find(u => 
            (curr.id && u.id === curr.id) || 
            (curr.username && u.username && u.username.toLowerCase() === curr.username.toLowerCase())
          );
          if (match) {
            const hasChanged = 
              match.password !== curr.password || 
              match.name !== curr.name || 
              match.role !== curr.role || 
              match.department !== curr.department ||
              match.email !== curr.email;
            if (hasChanged) {
              const updatedCurr = { ...curr, ...match };
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurr));
              console.log('[AuthStorage] Active user session updated in real-time');
            }
          }
        }
      }
    } catch {}
  }

  notifyAuthSubscribers();
}

async function fetchUsersFromServer(): Promise<UserAccount[]> {
  if (typeof window === 'undefined') return cachedUsers || DEFAULT_USERS;
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return cachedUsers || DEFAULT_USERS;
    const serverUsers: UserAccount[] = await res.json();
    if (!Array.isArray(serverUsers) || serverUsers.length === 0) return cachedUsers || DEFAULT_USERS;

    applyServerUsersUpdate(serverUsers);
    return serverUsers;
  } catch (err) {
    console.warn('Gagal memuat data pengguna dari server:', err);
    return cachedUsers || DEFAULT_USERS;
  }
}

async function syncUsersToServer(users: UserAccount[]) {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    });
  } catch (err) {
    console.warn('Gagal sinkronisasi data user ke server:', err);
  }
}

function setupAuthRealtimeSync() {
  if (typeof window === 'undefined' || isAuthSyncInitialized) return;
  isAuthSyncInitialized = true;

  fetchUsersFromServer();

  // Listen to SSE events for users_changed via unified SSE client
  sseClient.subscribe('users_changed', (payload: any) => {
    if (payload && Array.isArray(payload.users) && payload.users.length > 0) {
      applyServerUsersUpdate(payload.users);
    } else {
      fetchUsersFromServer();
    }
  });

  if (authBroadcast) {
    authBroadcast.onmessage = (event) => {
      if (event.data?.type === 'AUTH_USERS_CHANGED') {
        if (Array.isArray(event.data.users) && event.data.users.length > 0) {
          applyServerUsersUpdate(event.data.users);
        } else {
          fetchUsersFromServer();
        }
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === USERS_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) {
          applyServerUsersUpdate(parsed);
        }
      } catch {
        fetchUsersFromServer();
      }
    }
  });
}

if (typeof window !== 'undefined') {
  setupAuthRealtimeSync();
}

export const authStorage = {
  getAllUsers(): UserAccount[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    if (cachedUsers && Array.isArray(cachedUsers)) {
      return cachedUsers;
    }

    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      cachedUsers = DEFAULT_USERS;
      return DEFAULT_USERS;
    }
    try {
      const parsed: UserAccount[] = JSON.parse(stored);
      // Ensure all DEFAULT_USERS exist in parsed list and synchronize updated default names
      let needsSave = false;
      const combined = parsed.map(u => {
        const def = DEFAULT_USERS.find(d => d.username.toLowerCase() === u.username.toLowerCase());
        if (def && u.name !== def.name) {
          needsSave = true;
          return { ...u, name: def.name, department: def.department };
        }
        return u;
      });

      DEFAULT_USERS.forEach(def => {
        const found = combined.some(u => u.username.toLowerCase() === def.username.toLowerCase());
        if (!found) {
          combined.push(def);
          needsSave = true;
        }
      });
      if (needsSave) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(combined));
      }
      cachedUsers = combined;
      return combined;
    } catch {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      cachedUsers = DEFAULT_USERS;
      return DEFAULT_USERS;
    }
  },

  getCurrentUser(): UserAccount | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) return null;
    try {
      const user: UserAccount = JSON.parse(stored);
      const def = DEFAULT_USERS.find(d => d.username.toLowerCase() === user.username.toLowerCase());
      if (def && user.name !== def.name) {
        const updated = { ...user, name: def.name, department: def.department };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        return updated;
      }
      return user;
    } catch {
      return null;
    }
  },

  login(username: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
    const users = this.getAllUsers();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Map common aliases to their respective usernames
    const aliasMap: Record<string, string> = {
      // Admin 1 - Nofi Zahara
      'admin.nofi': 'nofi',
      'admin1': 'nofi',
      'nofizahara': 'nofi',
      'nofi zahara': 'nofi',
      // Admin 2 - Resna Wati
      'admin.resna': 'resna',
      'admin2': 'resna',
      'resnawati': 'resna',
      'resna wati': 'resna',
      // Admin 3 - Deri Tialis Peristiawan
      'admin.deri': 'deri',
      'admin3': 'deri',
      'deritialis': 'deri',
      'deri tialis': 'deri',
      'deri tialis peristiawan': 'deri',
      // Admin 4 - Yuda Putra Utama
      'admin.yuda': 'yuda',
      'admin4': 'yuda',
      'yudaputra': 'yuda',
      'yuda putra': 'yuda',
      'yuda putra utama': 'yuda',
      // Master Administrator / SDM Teluk Sirih
      'admin': 'admin',
      'administrator': 'admin',
      'master': 'admin',
      'master admin': 'admin',
      'admin master': 'admin',
      'admin utama': 'admin',
      'sdm': 'admin',
      'sdm upk': 'admin',
      'sdm upk teluk sirih': 'admin',
      'sdm teluk sirih': 'admin',
      // PIC Keuangan & Umum
      'keuangan & umum': 'keuangan',
      'keuangan dan umum': 'keuangan',
      'keuangan': 'keuangan',
      'ku': 'keuangan',
      'k&u': 'keuangan',
      // PIC Operasi
      'operasi': 'operasi',
      'opr': 'operasi',
      'ops': 'operasi',
      // PIC Pemeliharaan
      'pemeliharaan': 'pemeliharaan',
      'har': 'pemeliharaan',
      // PIC Enjiniring
      'enjiniring': 'enjiniring',
      'enj': 'enjiniring',
      'engineering': 'enjiniring',
      // PIC Coal & Ash Handling
      'coal_ash': 'coal_ash',
      'coal ash': 'coal_ash',
      'coal & ash': 'coal_ash',
      'coal and ash': 'coal_ash',
      'coal & ash handling': 'coal_ash',
      'coal and ash handling': 'coal_ash',
      'cah': 'coal_ash',
      // PIC K3 & Keamanan
      'k3_keamanan': 'k3_keamanan',
      'k3': 'k3_keamanan',
      'k3 keamanan': 'k3_keamanan',
      'k3 & keamanan': 'k3_keamanan',
      'k3 dan keamanan': 'k3_keamanan',
      'keamanan': 'k3_keamanan',
      'keselamatan': 'k3_keamanan',
      // PIC Lingkungan Hidup
      'lingkungan': 'lingkungan',
      'lingkungan hidup': 'lingkungan',
      'lh': 'lingkungan',
      'lin': 'lingkungan',
      // PIC Pengadaan
      'pengadaan': 'pengadaan',
      'proc': 'pengadaan',
      'procurement': 'pengadaan',
      'dan': 'pengadaan',
      // PIC Sistem Manajemen Terintegrasi
      'sm_terintegrasi': 'sm_terintegrasi',
      'smt': 'sm_terintegrasi',
      'sm terintegrasi': 'sm_terintegrasi',
      'sistem manajemen terintegrasi': 'sm_terintegrasi'
    };

    const targetUsername = aliasMap[cleanUsername] || cleanUsername;
    let user = users.find(u => 
      u.username.toLowerCase() === targetUsername ||
      u.id.toLowerCase() === targetUsername ||
      (u.email && u.email.toLowerCase() === cleanUsername) ||
      (u.email && u.email.toLowerCase() === targetUsername)
    );

    if (!user) {
      user = users.find(u => 
        (u.name && u.name.toLowerCase() === cleanUsername) ||
        (u.department && u.department.toLowerCase() === cleanUsername)
      );
    }

    if (!user) {
      return { 
        success: false, 
        error: `User ID atau Email "${username}" tidak ditemukan. Pastikan Anda menggunakan User ID bagian (contoh: keuangan, operasi, admin) atau alamat email terdaftar.` 
      };
    }

    if (user.password !== cleanPassword) {
      if (user.password.toLowerCase() === cleanPassword.toLowerCase()) {
        return { 
          success: false, 
          error: 'Kata Sandi salah karena perbedaan huruf besar/kecil (Caps Lock aktif). Mohon perhatikan huruf kapital dan huruf kecil sesuai yang diatur admin.' 
        };
      }
      return { 
        success: false, 
        error: `Kata Sandi yang dimasukkan untuk akun "${user.username}" salah. Jika admin baru saja mengubah kata sandi Anda, pastikan memasukkan kata sandi terbaru.` 
      };
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    // Update last login in user list
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    notifyAuthSubscribers();

    // Log login activity
    try {
      activityLogger.log(
        'LOGIN',
        `User ${updatedUser.name} (${updatedUser.department}) berhasil login ke sistem`,
        updatedUser.username,
        { role: updatedUser.role, department: updatedUser.department },
        updatedUser
      );
    } catch {}

    return { success: true, user: updatedUser };
  },

  async loginAsync(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, error: 'User ID dan Kata Sandi wajib diisi.' };
    }

    // 1. Try authoritative server login
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
          const currentUsers = this.getAllUsers();
          const updatedUsers = currentUsers.map(u =>
            (u.id === data.user.id || (u.username && u.username.toLowerCase() === data.user.username.toLowerCase())) ? data.user : u
          );
          cachedUsers = updatedUsers;
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
          } catch {}
          notifyAuthSubscribers();
          return { success: true, user: data.user };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || 'User ID atau Kata Sandi tidak cocok.' };
      }
    } catch {
      // Offline fallback
    }

    // 2. Client-side login fallback
    return this.login(cleanUsername, cleanPassword);
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      const current = this.getCurrentUser();
      if (current) {
        try {
          activityLogger.log(
            'LOGOUT',
            `User ${current.name} (${current.department}) keluar (logout) dari sesi aplikasi`,
            current.username,
            undefined,
            current
          );
        } catch {}
      }
      localStorage.removeItem(CURRENT_USER_KEY);
      notifyAuthSubscribers();
    }
  },

  resetPassword(userId: string, newPassword: string): boolean {
    const users = this.getAllUsers();
    let found = false;
    const cleanPass = newPassword.trim();
    const currentUser = this.getCurrentUser();
    const nowIso = new Date().toISOString();
    const actorId = currentUser?.username || currentUser?.id || 'admin';
    const actorName = currentUser?.name || 'Administrator';
    const actorRole = currentUser?.role || 'ADMIN';

    const updated = users.map(u => {
      if (u.id === userId || (u.username && u.username.toLowerCase() === userId.toLowerCase())) {
        found = true;
        return {
          ...u,
          password: cleanPass,
          updatedAt: nowIso,
          updatedById: actorId,
          updatedByName: actorName,
          updatedByRole: actorRole
        };
      }
      return u;
    });

    if (found) {
      cachedUsers = updated;
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      // If the current logged in user was reset, update their session too
      if (currentUser && (currentUser.id === userId || (currentUser.username && currentUser.username.toLowerCase() === userId.toLowerCase()))) {
        const updatedCurrent = { ...currentUser, password: cleanPass, updatedAt: nowIso };
        try {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
        } catch {}
      }
      notifyAuthSubscribers();

      // Trigger server update
      if (typeof window !== 'undefined') {
        fetch('/api/users/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            newPassword: cleanPass,
            _user: currentUser ? {
              id: currentUser.id,
              username: currentUser.username,
              name: currentUser.name,
              role: currentUser.role,
              department: currentUser.department
            } : undefined
          })
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.users) {
              applyServerUsersUpdate(data.users);
            }
          }
        }).catch(() => {});
      }

      try {
        activityLogger.log('PASSWORD_RESET', `Mereset password untuk akun: ${userId}`, userId);
      } catch {}
      return true;
    }
    return false;
  },

  async resetPasswordAsync(userId: string, newPassword: string): Promise<boolean> {
    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 4) return false;

    const currentUser = this.getCurrentUser();
    const nowIso = new Date().toISOString();
    const actorId = currentUser?.username || currentUser?.id || 'admin';
    const actorName = currentUser?.name || 'Administrator';
    const actorRole = currentUser?.role || 'ADMIN';

    // 1. Optimistic update
    const users = this.getAllUsers();
    let found = false;
    const updated = users.map(u => {
      if (u.id === userId || (u.username && u.username.toLowerCase() === userId.toLowerCase())) {
        found = true;
        return {
          ...u,
          password: cleanPass,
          updatedAt: nowIso,
          updatedById: actorId,
          updatedByName: actorName,
          updatedByRole: actorRole
        };
      }
      return u;
    });

    if (found) {
      cachedUsers = updated;
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      if (currentUser && (currentUser.id === userId || (currentUser.username && currentUser.username.toLowerCase() === userId.toLowerCase()))) {
        const updatedCurrent = { ...currentUser, password: cleanPass, updatedAt: nowIso };
        try {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
        } catch {}
      }
      notifyAuthSubscribers();
    }

    // 2. Authoritative server persistence
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword: cleanPass,
          _user: currentUser ? {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            role: currentUser.role,
            department: currentUser.department
          } : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          applyServerUsersUpdate(data.users);
        } else if (data.user) {
          const fresh = this.getAllUsers().map(u => 
            (u.id === data.user.id || (u.username && u.username.toLowerCase() === data.user.username?.toLowerCase()))
              ? { ...u, ...data.user, password: cleanPass }
              : u
          );
          applyServerUsersUpdate(fresh);
        }
        return true;
      }
    } catch (err) {
      console.warn('Error resetting password on server:', err);
    }

    return found;
  },

  updateUserRole(userId: string, newRole: 'ADMIN' | 'USER'): boolean {
    const users = this.getAllUsers();
    let found = false;
    const updated = users.map(u => {
      if (u.id === userId || u.username.toLowerCase() === userId.toLowerCase()) {
        found = true;
        return {
          ...u,
          role: newRole
        };
      }
      return u;
    });

    if (found) {
      cachedUsers = updated;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      const current = this.getCurrentUser();
      if (current && (current.id === userId || current.username.toLowerCase() === userId.toLowerCase())) {
        const updatedCurrent = { ...current, role: newRole };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
      }
      notifyAuthSubscribers();
      syncUsersToServer(updated);
      return true;
    }
    return false;
  },

  updateUser(userId: string, updates: Partial<Omit<UserAccount, 'id' | 'createdAt'>>): boolean {
    const users = this.getAllUsers();
    let found = false;
    const updated = users.map(u => {
      if (u.id === userId || u.username.toLowerCase() === userId.toLowerCase()) {
        found = true;
        return {
          ...u,
          ...updates,
          avatarText: updates.name ? updates.name.substring(0, 2).toUpperCase() : u.avatarText
        };
      }
      return u;
    });

    if (found) {
      cachedUsers = updated;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      const current = this.getCurrentUser();
      if (current && (current.id === userId || current.username.toLowerCase() === userId.toLowerCase())) {
        const updatedCurrent = { ...current, ...updates };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
      }
      notifyAuthSubscribers();
      syncUsersToServer(updated);
      return true;
    }
    return false;
  },

  async forceSyncFromServer(): Promise<UserAccount[]> {
    return await fetchUsersFromServer();
  },

  async saveUserAccountAsync(userId: string, data: { email?: string; password?: string; name?: string; role?: 'ADMIN' | 'USER' }): Promise<boolean> {
    const cleanUserId = userId.trim();
    const cleanPass = data.password ? data.password.trim() : undefined;
    const cleanEmail = data.email !== undefined ? data.email.trim() : undefined;

    // Update local cache optimistically
    const currentUsers = this.getAllUsers();
    let updatedLocal = false;
    const nextUsers = currentUsers.map(u => {
      if (u.id === cleanUserId || (u.username && u.username.toLowerCase() === cleanUserId.toLowerCase())) {
        updatedLocal = true;
        return {
          ...u,
          ...(cleanEmail !== undefined ? { email: cleanEmail || undefined } : {}),
          ...(cleanPass && cleanPass.length >= 4 ? { password: cleanPass } : {}),
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.role ? { role: data.role } : {})
        };
      }
      return u;
    });

    if (updatedLocal) {
      cachedUsers = nextUsers;
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
      } catch {}
      // Also update currentUser session if it's the active logged in user
      const curr = this.getCurrentUser();
      if (curr && (curr.id === cleanUserId || (curr.username && curr.username.toLowerCase() === cleanUserId.toLowerCase()))) {
        const updatedCurr = {
          ...curr,
          ...(cleanEmail !== undefined ? { email: cleanEmail || undefined } : {}),
          ...(cleanPass && cleanPass.length >= 4 ? { password: cleanPass } : {})
        };
        try {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurr));
        } catch {}
      }
      notifyAuthSubscribers();
    }

    // Direct authoritative call to /api/users/update
    try {
      const currentUser = this.getCurrentUser();
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: cleanUserId,
          email: cleanEmail,
          password: cleanPass,
          name: data.name,
          role: data.role,
          _user: currentUser ? {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            role: currentUser.role,
            department: currentUser.department
          } : undefined
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.users && Array.isArray(json.users)) {
          applyServerUsersUpdate(json.users);
        } else if (json.user) {
          const refreshed = this.getAllUsers().map(u => 
            (u.id === json.user.id || (u.username && u.username.toLowerCase() === json.user.username?.toLowerCase()))
              ? { ...u, ...json.user }
              : u
          );
          applyServerUsersUpdate(refreshed);
        }
        return true;
      } else {
        // Fallback to batch-update
        return await this.batchUpdateUsersAsync([{
          id: cleanUserId,
          email: cleanEmail,
          password: cleanPass,
          name: data.name,
          role: data.role
        }]);
      }
    } catch {
      return updatedLocal;
    }
  },

  async updateUserAsync(userId: string, updates: Partial<Omit<UserAccount, 'id' | 'createdAt'>>): Promise<boolean> {
    const success = this.updateUser(userId, updates);
    if (!success) return false;

    try {
      const currentUser = this.getCurrentUser();
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username: updates.username,
          department: updates.department,
          email: updates.email,
          password: updates.password,
          name: updates.name,
          role: updates.role,
          _user: currentUser ? {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            role: currentUser.role,
            department: currentUser.department
          } : undefined
        })
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.users) {
          applyServerUsersUpdate(json.users);
        }
        return true;
      }
    } catch {
      // Fallback
    }

    await syncUsersToServer(this.getAllUsers());
    return true;
  },

  async batchUpdateUsersAsync(userUpdates: Array<{ id: string; email?: string; password?: string; name?: string; role?: 'ADMIN' | 'USER' }>): Promise<boolean> {
    const users = this.getAllUsers();
    const updated = users.map(u => {
      const match = userUpdates.find(up => up.id === u.id || (u.username && up.id.toLowerCase() === u.username.toLowerCase()));
      if (!match) return u;
      return {
        ...u,
        email: match.email !== undefined ? (match.email.trim() || undefined) : u.email,
        password: match.password && match.password.trim().length >= 4 ? match.password.trim() : u.password,
        name: match.name && match.name.trim() ? match.name.trim() : u.name,
        role: match.role || u.role
      };
    });

    cachedUsers = updated;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    notifyAuthSubscribers();

    try {
      const res = await fetch('/api/users/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: userUpdates })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          cachedUsers = data.users;
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data.users));
          } catch {}
          notifyAuthSubscribers();
        }
        return true;
      }
    } catch {
      await syncUsersToServer(updated);
    }
    return true;
  },

  addUser(userData: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount {
    const users = this.getAllUsers();
    const newUser: UserAccount = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      avatarText: userData.name ? userData.name.substring(0, 2).toUpperCase() : 'US'
    };
    users.push(newUser);
    cachedUsers = users;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    notifyAuthSubscribers();
    syncUsersToServer(users);
    try {
      activityLogger.log('USER_CREATE', `Menambahkan pengguna baru: ${newUser.name} (${newUser.department}) [${newUser.role}]`, newUser.username);
    } catch {}
    return newUser;
  },

  deleteUser(userId: string): boolean {
    const users = this.getAllUsers();
    const target = users.find(u => u.id === userId);
    if (target?.username === 'admin') {
      // Prevent deleting master admin
      return false;
    }
    const filtered = users.filter(u => u.id !== userId);
    cachedUsers = filtered;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    notifyAuthSubscribers();
    syncUsersToServer(filtered);
    try {
      if (target) {
        activityLogger.log('USER_UPDATE', `Menghapus akun pengguna: ${target.name} (@${target.username})`, target.username);
      }
    } catch {}
    return true;
  },

  resetToDefault(): void {
    cachedUsers = DEFAULT_USERS;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    notifyAuthSubscribers();
    syncUsersToServer(DEFAULT_USERS);
  },

  subscribe(callback: () => void) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(AUTH_LISTEN_EVENT, callback);
    return () => window.removeEventListener(AUTH_LISTEN_EVENT, callback);
  }
};
