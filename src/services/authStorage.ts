import { UserAccount } from '../types';

const USERS_STORAGE_KEY = 'meeting_app_users_v1';
const CURRENT_USER_KEY = 'meeting_app_current_user_v1';
const AUTH_LISTEN_EVENT = 'meeting_app_auth_changed';

// Default user accounts with Admin credentials:
// Admin ID / Username: admin | Password: admin123
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator (Admin Si APIN / Konsumsi)',
    role: 'ADMIN',
    department: 'Keuangan & Umum',
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
    password: 'user123',
    avatarText: 'PG',
    lastLogin: '2026-08-19T15:10:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

function notifyAuthSubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_LISTEN_EVENT));
  }
}

export const authStorage = {
  getAllUsers(): UserAccount[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      const parsed: UserAccount[] = JSON.parse(stored);
      // Ensure all DEFAULT_USERS exist in parsed list
      let hasMissing = false;
      const combined = [...parsed];
      DEFAULT_USERS.forEach(def => {
        const found = combined.some(u => u.username.toLowerCase() === def.username.toLowerCase());
        if (!found) {
          combined.push(def);
          hasMissing = true;
        }
      });
      if (hasMissing) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(combined));
      }
      return combined;
    } catch {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
  },

  getCurrentUser(): UserAccount | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  login(username: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
    const users = this.getAllUsers();
    const cleanUsername = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername);

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

    return { success: true, user: updatedUser };
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
      notifyAuthSubscribers();
    }
  },

  resetPassword(userId: string, newPassword: string): boolean {
    const users = this.getAllUsers();
    let found = false;
    const updated = users.map(u => {
      if (u.id === userId || u.username.toLowerCase() === userId.toLowerCase()) {
        found = true;
        return {
          ...u,
          password: newPassword
        };
      }
      return u;
    });

    if (found) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      // If the current logged in user was reset, update their session too
      const current = this.getCurrentUser();
      if (current && (current.id === userId || current.username.toLowerCase() === userId.toLowerCase())) {
        const updatedCurrent = { ...current, password: newPassword };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
      }
      notifyAuthSubscribers();
      return true;
    }
    return false;
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
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      const current = this.getCurrentUser();
      if (current && (current.id === userId || current.username.toLowerCase() === userId.toLowerCase())) {
        const updatedCurrent = { ...current, role: newRole };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
      }
      notifyAuthSubscribers();
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
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      const current = this.getCurrentUser();
      if (current && (current.id === userId || current.username.toLowerCase() === userId.toLowerCase())) {
        const updatedCurrent = { ...current, ...updates };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
      }
      notifyAuthSubscribers();
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
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    notifyAuthSubscribers();
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
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    notifyAuthSubscribers();
    return true;
  },

  resetToDefault(): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    notifyAuthSubscribers();
  },

  subscribe(callback: () => void) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(AUTH_LISTEN_EVENT, callback);
    return () => window.removeEventListener(AUTH_LISTEN_EVENT, callback);
  }
};
