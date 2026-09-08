import React, { useState, useEffect } from 'react';
import { authStorage } from '../../services/authStorage';
import { UserAccount } from '../../types';
import { 
  Users, 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Copy, 
  Search,
  Building2,
  Trash2,
  Edit,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Modals state
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add user modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Operasi');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  const [newUserPass, setNewUserPass] = useState('user123');

  // Edit user modal state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editDepartment, setEditDepartment] = useState('Operasi');
  const [editRole, setEditRole] = useState<'ADMIN' | 'USER'>('USER');

  // Revealed passwords state for admin review
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const refreshData = () => {
      setUsers(authStorage.getAllUsers());
      setCurrentUser(authStorage.getCurrentUser());
    };
    refreshData();
    const unsub = authStorage.subscribe(refreshData);
    return () => unsub();
  }, []);

  const showNotificationMsg = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenResetModal = (user: UserAccount) => {
    setSelectedUserForReset(user);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowPassword(false);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = 'UPK-';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(rand);
    setConfirmPasswordInput(rand);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    if (!newPasswordInput.trim()) {
      showNotificationMsg('Password baru tidak boleh kosong.', 'error');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      showNotificationMsg('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    const success = authStorage.resetPassword(selectedUserForReset.id, newPasswordInput.trim());
    if (success) {
      showNotificationMsg(`Password untuk akun "${selectedUserForReset.username}" (${selectedUserForReset.name}) berhasil diperbarui menjadi "${newPasswordInput.trim()}".`);
      setSelectedUserForReset(null);
    } else {
      showNotificationMsg('Gagal mereset password akun.', 'error');
    }
  };

  const handleToggleReveal = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const text = `Akun Meeting PLN Teluk Sirih\nUser ID: ${user.username}\nPassword: ${user.password}\nNama: ${user.name}\nDivisi: ${user.department}`;
    navigator.clipboard.writeText(text);
    showNotificationMsg(`Kredensial akun ${user.username} berhasil disalin ke clipboard!`);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newUserPass.trim()) {
      showNotificationMsg('Mohon lengkapi seluruh kolom isian.', 'error');
      return;
    }

    // Check duplicate
    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      showNotificationMsg(`Username "${newUsername}" sudah terdaftar dalam sistem. Gunakan ID lain.`, 'error');
      return;
    }

    authStorage.addUser({
      username: newUsername.trim().toLowerCase(),
      name: newFullName.trim(),
      department: newDepartment,
      role: newRole,
      password: newUserPass.trim(),
      lastLogin: undefined
    });

    showNotificationMsg(`Akun baru "${newUsername}" untuk ${newFullName} berhasil ditambahkan!`);
    setIsAddUserOpen(false);
    setNewUsername('');
    setNewFullName('');
    setNewUserPass('user123');
  };

  const handleOpenEditUserModal = (user: UserAccount) => {
    setSelectedUserForEdit(user);
    setEditFullName(user.name);
    setEditDepartment(user.department);
    setEditRole(user.role);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    if (!editFullName.trim()) {
      showNotificationMsg('Nama lengkap tidak boleh kosong.', 'error');
      return;
    }

    // Prevent changing master admin role to non-admin
    const finalRole = selectedUserForEdit.username === 'admin' ? 'ADMIN' : editRole;

    authStorage.updateUser(selectedUserForEdit.id, {
      name: editFullName.trim(),
      department: editDepartment,
      role: finalRole
    });

    showNotificationMsg(`Data akun "${selectedUserForEdit.username}" berhasil diperbarui.`);
    setSelectedUserForEdit(null);
  };

  const handleToggleUserRole = (user: UserAccount) => {
    if (user.username === 'admin') {
      showNotificationMsg('Role Master Administrator tidak dapat diubah.', 'error');
      return;
    }

    const nextRole: 'ADMIN' | 'USER' = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const actionLabel = nextRole === 'ADMIN' ? 'menjadi Administrator' : 'menjadi User Divisi (Non-Admin)';
    
    if (window.confirm(`Apakah Anda yakin ingin mengubah hak akses akun ${user.name} (${user.username}) ${actionLabel}?`)) {
      authStorage.updateUserRole(user.id, nextRole);
      showNotificationMsg(`Hak akses akun "${user.username}" berhasil diubah menjadi ${nextRole === 'ADMIN' ? 'Administrator' : 'User Divisi'}.`);
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (user.username === 'admin') {
      showNotificationMsg('Akun Master Administrator tidak dapat dihapus.', 'error');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus akun ${user.username} (${user.name})?`)) {
      authStorage.deleteUser(user.id);
      showNotificationMsg(`Akun ${user.username} berhasil dihapus.`);
    }
  };

  const handleResetAllToFactory = () => {
    if (window.confirm('Kembalikan semua akun ke pengaturan awal (Admin: admin/admin123, PIC: user123)?')) {
      authStorage.resetToDefault();
      showNotificationMsg('Seluruh akun pengguna berhasil dikembalikan ke kredensial default.');
    }
  };

  // Filtered list
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-indigo-600" />
            <span>Manajemen Akun & Reset Password</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sebagai Administrator, Anda memiliki otoritas penuh untuk mereset password akun divisi lain dan mengelola hak akses sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetAllToFactory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Reset semua password ke default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            type="button"
            id="btn-add-new-user"
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-semibold animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Highlight Admin Master Box */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 shrink-0">
              AD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Akun Administrator Utama</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase">
                  MASTER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ID: <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">admin</code> • Password: <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">{users.find(u => u.username === 'admin')?.password || 'admin123'}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const adminUser = users.find(u => u.username === 'admin');
                if (adminUser) handleOpenResetModal(adminUser);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-300" />
              <span>Ubah Password Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            id="search-user-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pengguna, username, atau divisi..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold">
            Total Terdaftar: <strong className="text-slate-900">{users.length} Akun</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            Admin: <strong>{users.filter(u => u.role === 'ADMIN').length}</strong>, Divisi/PIC: <strong>{users.filter(u => u.role === 'USER').length}</strong>
          </span>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">User ID (Login)</th>
                <th className="py-3.5 px-4">Departemen / Divisi</th>
                <th className="py-3.5 px-4">Hak Akses</th>
                <th className="py-3.5 px-4">Password Saat Ini</th>
                <th className="py-3.5 px-4 text-right">Opsi & Reset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Tidak ada akun yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isMaster = user.username === 'admin';
                  const isPassRevealed = revealedPasswords[user.id];

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            user.role === 'ADMIN' 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {user.avatarText || user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.id === currentUser?.id && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {user.lastLogin ? `Login: ${new Date(user.lastLogin).toLocaleDateString('id-ID')}` : 'Belum pernah login'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <code className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100">
                          {user.username}
                        </code>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium text-xs">
                        {user.department}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isMaster ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700 uppercase flex items-center gap-1 w-fit" title="Akun Master Administrator permanen">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(user)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer border ${
                              user.role === 'ADMIN'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}
                            title={`Klik untuk ubah hak akses ke ${user.role === 'ADMIN' ? 'User Divisi (Non-Admin)' : 'Administrator'}`}
                          >
                            {user.role === 'ADMIN' ? (
                              <>
                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                <span>Administrator</span>
                                <RefreshCw className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 text-slate-500" />
                                <span>User Divisi</span>
                                <RefreshCw className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Current Password (Admin can peek or copy) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                            {isPassRevealed ? user.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleReveal(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            title={isPassRevealed ? 'Sembunyikan password' : 'Lihat password'}
                          >
                            {isPassRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(user)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Salin Kredensial Akun"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditUserModal(user)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors cursor-pointer"
                            title="Edit Data Akun & Hak Akses"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenResetModal(user)}
                            className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Reset Password</span>
                          </button>

                          {!isMaster && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal (Admin Capability #1) */}
      {selectedUserForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Reset Password Pengguna
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui kata sandi untuk akun <strong className="text-indigo-600">{selectedUserForReset.username}</strong> ({selectedUserForReset.name})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Password Baru
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Buat Password Acak</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-reset-new-password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Masukkan kata sandi baru"
                    required
                    className="w-full py-2.5 pl-3 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Konfirmasi Password Baru
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-reset-confirm-password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Catatan Administrator:</div>
                <p>
                  Setelah direset, pengguna dapat langsung login menggunakan password baru ini untuk pemesanan ruangan dan pelacakan konsumsi.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForReset(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-reset-password"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Simpan & Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Tambah Akun Pengguna Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Daftarkan PIC divisi baru untuk hak akses aplikasi.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  User ID / Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="misal: sekper, hse_shift, dll"
                  required
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Nama Lengkap / PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="misal: PIC Sekretariat Perusahaan"
                  required
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Departemen
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 focus:bg-white"
                  >
                    {[
                      'Operasi',
                      'Pemeliharaan',
                      'Enjiniring',
                      'Coal & Ash Handling',
                      'Keuangan & Umum',
                      'K3 & Keamanan',
                      'Lingkungan',
                      'Pengadaan',
                      'Sistem Manajemen Terintegrasi'
                    ].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Hak Akses
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 focus:bg-white"
                  >
                    <option value="USER">User Divisi</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Password Awal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  placeholder="Password awal (misal: user123)"
                  required
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Tambahkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User & Role Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Edit Profil & Hak Akses Akun
                </h3>
                <p className="text-xs text-slate-500">
                  ID Login: <code className="font-mono font-bold text-indigo-700">{selectedUserForEdit.username}</code>
                </p>
              </div>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Nama Lengkap / PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Nama lengkap PIC"
                  required
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Departemen / Divisi
                </label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 focus:bg-white"
                >
                  {[
                    'Operasi',
                    'Pemeliharaan',
                    'Enjiniring',
                    'Coal & Ash Handling',
                    'Keuangan & Umum',
                    'K3 & Keamanan',
                    'Lingkungan',
                    'Pengadaan',
                    'Sistem Manajemen Terintegrasi'
                  ].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Hak Akses (Role)
                </label>
                
                {selectedUserForEdit.username === 'admin' ? (
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Master Administrator:</strong>
                    Role akun admin utama terkunci permanen sebagai Administrator demi keamanan sistem.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditRole('USER')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        editRole === 'USER'
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>User Divisi</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Akses pemesanan ruangan dan cek status booking divisi.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditRole('ADMIN')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        editRole === 'ADMIN'
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Administrator</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Akses penuh: approve booking, kelola user, ekspor, & pengaturan.
                      </p>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
