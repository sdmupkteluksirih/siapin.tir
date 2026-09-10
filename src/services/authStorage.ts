import { UserAccount } from '../types';
import { activityLogger } from './activityLogger';

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
    password: 'admin123',
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
    password: 'user123',
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
      authBroadcast?.postMessage({ type: 'AUTH_USERS_CHANGED', timestamp: Date.now() });
    } catch {
      // Ignore
    }
  }
}

async function fetchUsersFromServer() {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return;
    const serverUsers: UserAccount[] = await res.json();
    if (!Array.isArray(serverUsers) || serverUsers.length === 0) return;

    const localUsers = authStorage.getAllUsers();

    // Smart merge: Never overwrite a user's custom changed password with a default seed password
    let localHasCustomPasswords = false;
    const mergedUsers = serverUsers.map(sUser => {
      const localMatch = localUsers.find(
        l => l.id === sUser.id || (l.username && l.username.toLowerCase() === sUser.username.toLowerCase())
      );
      if (localMatch) {
        const defUser = DEFAULT_USERS.find(d => d.username.toLowerCase() === sUser.username.toLowerCase());
        const defaultPass = defUser ? defUser.password : 'user123';

        // If local user has custom password that differs from default, but server still has default, prioritize local!
        if (localMatch.password !== defaultPass && sUser.password === defaultPass) {
          localHasCustomPasswords = true;
          return {
            ...sUser,
            password: localMatch.password
          };
        }
      }
      return sUser;
    });

    // Also include any local-only users
    localUsers.forEach(lUser => {
      if (!mergedUsers.some(m => m.id === lUser.id || (m.username && m.username.toLowerCase() === lUser.username.toLowerCase()))) {
        mergedUsers.push(lUser);
        localHasCustomPasswords = true;
      }
    });

    cachedUsers = mergedUsers;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mergedUsers));
    } catch {}
    notifyAuthSubscribers();

    // If local had custom passwords that server lacked, sync back to server so server is permanently updated
    if (localHasCustomPasswords) {
      syncUsersToServer(mergedUsers);
    }
  } catch {
    // Ignore network error
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

  // Listen to SSE events for users_changed
  try {
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'users_changed') {
          fetchUsersFromServer();
        }
      } catch {}
    };
  } catch {}

  if (authBroadcast) {
    authBroadcast.onmessage = (event) => {
      if (event.data?.type === 'AUTH_USERS_CHANGED') {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) {
          try {
            cachedUsers = JSON.parse(stored);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event(AUTH_LISTEN_EVENT));
            }
          } catch {
            fetchUsersFromServer();
          }
        } else {
          fetchUsersFromServer();
        }
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === USERS_STORAGE_KEY && e.newValue) {
      try {
        cachedUsers = JSON.parse(e.newValue);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(AUTH_LISTEN_EVENT));
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

    // Map common aliases to their respective usernames
    const aliasMap: Record<string, string> = {
      'admin.nofi': 'nofi',
      'admin1': 'nofi',
      'nofizahara': 'nofi',
      'nofi zahara': 'nofi',
      'admin.resna': 'resna',
      'admin2': 'resna',
      'resnawati': 'resna',
      'resna wati': 'resna',
      'admin.deri': 'deri',
      'admin3': 'deri',
      'deritialis': 'deri',
      'deri tialis': 'deri',
      'deri tialis peristiawan': 'deri',
      'admin.yuda': 'yuda',
      'admin4': 'yuda',
      'yudaputra': 'yuda',
      'yuda putra': 'yuda',
      'yuda putra utama': 'yuda',
    };

    const targetUsername = aliasMap[cleanUsername] || cleanUsername;
    const user = users.find(u => u.username.toLowerCase() === targetUsername);

    if (!user) {
      return { success: false, error: 'User ID / Username tidak ditemukan.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Password yang dimasukkan salah.' };
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
      } else if (res.status === 401) {
        // Fallback check if client storage has a valid match
        const localRes = this.login(cleanUsername, cleanPassword);
        if (localRes.success && localRes.user) {
          // Sync to server so server learns the new password
          fetch('/api/users/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: localRes.user.id, newPassword: cleanPassword })
          }).catch(() => {});
          return localRes;
        }
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
    const updated = users.map(u => {
      if (u.id === userId || (u.username && u.username.toLowerCase() === userId.toLowerCase())) {
        found = true;
        return {
          ...u,
          password: cleanPass
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
      const current = this.getCurrentUser();
      if (current && (current.id === userId || (current.username && current.username.toLowerCase() === userId.toLowerCase()))) {
        const updatedCurrent = { ...current, password: cleanPass };
        try {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
        } catch {}
      }
      notifyAuthSubscribers();

      // Trigger immediate server updates
      if (typeof window !== 'undefined') {
        fetch('/api/users/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newPassword: cleanPass })
        }).then(res => {
          if (!res.ok) {
            syncUsersToServer(updated);
          }
        }).catch(() => {
          syncUsersToServer(updated);
        });
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

    // First update locally
    const localOk = this.resetPassword(userId, cleanPass);
    if (!localOk) return false;

    // Then guarantee server persistence
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: cleanPass })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const users = this.getAllUsers().map(u => u.id === data.user.id ? { ...u, password: cleanPass } : u);
          cachedUsers = users;
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
          } catch {}
          notifyAuthSubscribers();
        }
        return true;
      } else {
        await syncUsersToServer(this.getAllUsers());
        return true;
      }
    } catch {
      await syncUsersToServer(this.getAllUsers());
      return true;
    }
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
