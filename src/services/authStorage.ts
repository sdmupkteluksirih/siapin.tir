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
    id: 'usr-admin-siapin',
    username: 'admin.siapin',
    name: 'Admin Si Apin',
    role: 'ADMIN',
    department: 'Administrasi & SDM',
    email: 'sdm.upkteluksirih@gmail.com',
    phone: '',
    password: 'Ip@2026admin',
    avatarText: 'AD',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-deri',
    username: 'deri.tialis',
    name: 'Deri Tialis Peristiawan',
    role: 'ADMIN',
    department: 'Sistem Informasi & TI',
    email: 'deri.tialis@plnindonesiapower.co.id',
    phone: '081275082259',
    password: 'Ip@2026dtp!',
    avatarText: 'DP',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-yuda',
    username: 'yuda.putra',
    name: 'Yuda Putra Utama',
    role: 'ADMIN',
    department: 'Sistem Informasi & TI',
    email: 'yuda.utama@plnindonesiapower.co.id',
    phone: '08126155893',
    password: 'Ip@2026ydp',
    avatarText: 'YP',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-nofi',
    username: 'nofi.zahara',
    name: 'Nofi Zahara',
    role: 'ADMIN',
    department: 'Keuangan & Umum',
    email: 'nofi.zahara@plnindonesiapower.co.id',
    phone: '081220207285',
    password: 'Ip@2026nofi!',
    avatarText: 'NZ',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-resna',
    username: 'resna.wati',
    name: 'Resna Wati',
    role: 'ADMIN',
    department: 'Keuangan & Umum',
    email: 'deri.tialis@plnindonesiapower.co.id',
    phone: '082391078016',
    password: 'Ip@2026resna',
    avatarText: 'RW',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-har',
    username: 'har.tir',
    name: 'Pemeliharaan',
    role: 'USER',
    department: 'Pemeliharaan',
    email: 'dheaprisha@gmail.com',
    phone: '085282533061',
    password: 'Ip@2026har!',
    avatarText: 'PH',
    lastLogin: '2026-08-19T11:20:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ops',
    username: 'opr.tir',
    name: 'Operasi',
    role: 'USER',
    department: 'Operasi',
    email: 'pujaseptya70@gmail.com',
    phone: '082289221662',
    password: 'Ip@2026opr',
    avatarText: 'OP',
    lastLogin: '2026-08-19T09:15:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ku',
    username: 'keu.mum',
    name: 'Keuangan & Umum',
    role: 'USER',
    department: 'Keuangan & Umum',
    email: 'krismonaandria@gmail.com',
    phone: '083182271472',
    password: 'Ip@2026ksa!',
    avatarText: 'KU',
    lastLogin: '2026-08-19T13:45:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-enj',
    username: 'enj.tir',
    name: 'Enjiniring',
    role: 'USER',
    department: 'Enjiniring',
    email: 'melatianggraini1507@gmail.com',
    phone: '081261739299',
    password: 'Ip@2026enj',
    avatarText: 'EN',
    lastLogin: '2026-08-18T14:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-cah',
    username: 'cah.tir',
    name: 'Coal & Ash Handling',
    role: 'USER',
    department: 'Coal & Ash Handling',
    email: 'ririnpermatasari85@gmail.com',
    phone: '082288119262',
    password: 'Ip@2026cah!',
    avatarText: 'CA',
    lastLogin: '2026-08-17T10:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-lin',
    username: 'lin.tir',
    name: 'Lingkungan',
    role: 'USER',
    department: 'Lingkungan',
    email: 'pipteluksirihenviro@gmail.com',
    phone: '081374151408',
    password: 'Ip@2026lin',
    avatarText: 'LH',
    lastLogin: '2026-08-16T08:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-k3',
    username: 'k3k.tir',
    name: 'K3 & Keamanan',
    role: 'USER',
    department: 'K3 & Keamanan',
    email: 'tesyamonika73@gmail.com',
    phone: '081378440298',
    password: 'Ip@2026k3k!',
    avatarText: 'K3',
    lastLogin: '2026-08-18T16:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-dan',
    username: 'dan.tir',
    name: 'Pengadaan',
    role: 'USER',
    department: 'Pengadaan',
    email: 'windatakawaii@gmail.com',
    phone: '081276813858',
    password: 'Ip@2026dan',
    avatarText: 'PG',
    lastLogin: '2026-08-19T15:10:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-smt',
    username: 'smt.tir',
    name: 'Sistem Manajemen Terintegrasi',
    role: 'USER',
    department: 'Sistem Manajemen Terintegrasi',
    email: 'lolalorenza947@gmail.com',
    phone: '082286684003',
    password: 'Ip@2026smt!',
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
      // Ensure all DEFAULT_USERS exist in parsed list and synchronize updated default names, phones, emails
      let needsSave = false;
      const combined = parsed.map(u => {
        const def = DEFAULT_USERS.find(d => 
          d.id === u.id || 
          d.username.toLowerCase() === u.username.toLowerCase() ||
          (d.name && d.name.toLowerCase() === u.name?.toLowerCase())
        );
        if (def) {
          let itemUpdated = false;
          const res = { ...u };
          if (u.name !== def.name) {
            res.name = def.name;
            res.department = def.department;
            itemUpdated = true;
          }
          if (def.phone && (!u.phone || u.phone !== def.phone)) {
            res.phone = def.phone;
            itemUpdated = true;
          }
          if (def.email && (!u.email || u.email.includes('.co.id') || u.email.includes('@pln.co.id') || u.email !== def.email)) {
            res.email = def.email;
            itemUpdated = true;
          }
          if (def.username && u.username !== def.username) {
            res.username = def.username;
            itemUpdated = true;
          }
          if (itemUpdated) {
            needsSave = true;
            return res;
          }
        }
        return u;
      });

      DEFAULT_USERS.forEach(def => {
        const found = combined.some(u => 
          u.id === def.id || 
          u.username.toLowerCase() === def.username.toLowerCase() ||
          (u.name && u.name.toLowerCase() === def.name.toLowerCase())
        );
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
      // 1. Admin Si Apin
      'admin.siapin': 'admin.siapin',
      'admin': 'admin.siapin',
      'administrator': 'admin.siapin',
      'master': 'admin.siapin',
      'sdm': 'admin.siapin',
      'sdm upk': 'admin.siapin',
      'sdm.upkteluksirih@gmail.com': 'admin.siapin',
      // 2. Deri Tialis Peristiawan
      'deri.tialis': 'deri.tialis',
      'admin.deri': 'deri.tialis',
      'deri': 'deri.tialis',
      'deritialis': 'deri.tialis',
      'deri tialis': 'deri.tialis',
      'deri tialis peristiawan': 'deri.tialis',
      // 3. Yuda Putra Utama
      'yuda.putra': 'yuda.putra',
      'admin.yuda': 'yuda.putra',
      'yuda': 'yuda.putra',
      'yudaputra': 'yuda.putra',
      'yuda putra': 'yuda.putra',
      'yuda putra utama': 'yuda.putra',
      // 4. Nofi Zahara
      'nofi.zahara': 'nofi.zahara',
      'admin.nofi': 'nofi.zahara',
      'nofi': 'nofi.zahara',
      'nofizahara': 'nofi.zahara',
      'nofi zahara': 'nofi.zahara',
      // 5. Resna Wati
      'resna.wati': 'resna.wati',
      'admin.resna': 'resna.wati',
      'resna': 'resna.wati',
      'resnawati': 'resna.wati',
      'resna wati': 'resna.wati',
      // 6. Pemeliharaan
      'har.tir': 'har.tir',
      'pemeliharaan': 'har.tir',
      'har': 'har.tir',
      'pemeliharaan pltu': 'har.tir',
      // 7. Operasi
      'opr.tir': 'opr.tir',
      'operasi': 'opr.tir',
      'opr': 'opr.tir',
      'ops': 'opr.tir',
      // 8. Keuangan & Umum
      'keu.mum': 'keu.mum',
      'keuangan & umum': 'keu.mum',
      'keuangan dan umum': 'keu.mum',
      'keuangan': 'keu.mum',
      'ku': 'keu.mum',
      'k&u': 'keu.mum',
      // 9. Enjiniring
      'enj.tir': 'enj.tir',
      'enjiniring': 'enj.tir',
      'enj': 'enj.tir',
      'engineering': 'enj.tir',
      // 10. Coal & Ash Handling
      'cah.tir': 'cah.tir',
      'coal_ash': 'cah.tir',
      'coal ash': 'cah.tir',
      'coal & ash': 'cah.tir',
      'coal and ash': 'cah.tir',
      'coal & ash handling': 'cah.tir',
      'coal and ash handling': 'cah.tir',
      'cah': 'cah.tir',
      // 11. Lingkungan
      'lin.tir': 'lin.tir',
      'lingkungan': 'lin.tir',
      'lingkungan hidup': 'lin.tir',
      'lh': 'lin.tir',
      'lin': 'lin.tir',
      // 12. K3 & Keamanan
      'k3k.tir': 'k3k.tir',
      'k3_keamanan': 'k3k.tir',
      'k3': 'k3k.tir',
      'k3k': 'k3k.tir',
      'k3 keamanan': 'k3k.tir',
      'k3 & keamanan': 'k3k.tir',
      'k3 dan keamanan': 'k3k.tir',
      'keamanan': 'k3k.tir',
      // 13. Pengadaan
      'dan.tir': 'dan.tir',
      'pengadaan': 'dan.tir',
      'proc': 'dan.tir',
      'procurement': 'dan.tir',
      'dan': 'dan.tir',
      // 14. Sistem Manajemen Terintegrasi
      'smt.tir': 'smt.tir',
      'sm_terintegrasi': 'smt.tir',
      'smt': 'smt.tir',
      'sm terintegrasi': 'smt.tir',
      'sistem manajemen terintegrasi': 'smt.tir'
    };

    const targetUsername = aliasMap[cleanUsername] || cleanUsername;
    const digitsOnly = cleanUsername.replace(/[^0-9]/g, '');

    let user = users.find(u => 
      u.username.toLowerCase() === targetUsername ||
      u.id.toLowerCase() === targetUsername ||
      u.username.toLowerCase() === cleanUsername ||
      (u.email && u.email.toLowerCase() === cleanUsername) ||
      (u.email && u.email.toLowerCase() === targetUsername) ||
      (u.phone && (u.phone === cleanUsername || (digitsOnly.length >= 8 && u.phone.replace(/[^0-9]/g, '') === digitsOnly)))
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
        error: `User ID, Email, atau Nomor HP "${username}" tidak ditemukan. Pastikan Anda menggunakan ID Bagian (contoh: admin.siapin, deri.tialis, har.tir, opr.tir) atau email/no HP terdaftar.` 
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

  async saveUserAccountAsync(userId: string, data: { email?: string; phone?: string; password?: string; name?: string; role?: 'ADMIN' | 'USER' }): Promise<boolean> {
    const cleanUserId = userId.trim();
    const cleanPass = data.password ? data.password.trim() : undefined;
    const cleanEmail = data.email !== undefined ? data.email.trim() : undefined;
    const cleanPhone = data.phone !== undefined ? data.phone.trim() : undefined;

    // Update local cache optimistically
    const currentUsers = this.getAllUsers();
    let updatedLocal = false;
    const nextUsers = currentUsers.map(u => {
      if (u.id === cleanUserId || (u.username && u.username.toLowerCase() === cleanUserId.toLowerCase())) {
        updatedLocal = true;
        return {
          ...u,
          ...(cleanEmail !== undefined ? { email: cleanEmail || undefined } : {}),
          ...(cleanPhone !== undefined ? { phone: cleanPhone || undefined } : {}),
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
          ...(cleanPhone !== undefined ? { phone: cleanPhone || undefined } : {}),
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
          phone: cleanPhone,
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
          phone: cleanPhone,
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
          phone: updates.phone,
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

  async batchUpdateUsersAsync(userUpdates: Array<{ id: string; email?: string; phone?: string; password?: string; name?: string; role?: 'ADMIN' | 'USER' }>): Promise<boolean> {
    const users = this.getAllUsers();
    const updated = users.map(u => {
      const match = userUpdates.find(up => up.id === u.id || (u.username && up.id.toLowerCase() === u.username.toLowerCase()));
      if (!match) return u;
      return {
        ...u,
        email: match.email !== undefined ? (match.email.trim() || undefined) : u.email,
        phone: match.phone !== undefined ? (match.phone.trim() || undefined) : u.phone,
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
