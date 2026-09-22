import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { authStorage } from '../../services/authStorage';
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  User,
  Mail,
  Building2
} from 'lucide-react';

interface ChangePasswordModalProps {
  currentUser: UserAccount;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: (updatedUser: UserAccount) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'profile'>('password');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleKeyModifier = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    const specials = ['@', '#', '$', '!'];
    let rand = 'PLNip';
    rand += specials[Math.floor(Math.random() * specials.length)];
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    rand += '2026';
    setNewPassword(rand);
    setConfirmPassword(rand);
    setShowNewPass(true);
    setShowConfirmPass(true);
    setErrorMsg('');
  };

  const handleCopyNewPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    // Verification
    if (currentUser.password && cleanCurrent !== currentUser.password) {
      setErrorMsg('Kata sandi saat ini tidak sesuai. Mohon periksa kembali sandi lama Anda.');
      return;
    }

    if (!cleanNew || cleanNew.length < 4) {
      setErrorMsg('Kata sandi baru minimal harus terdiri dari 4 karakter.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.');
      return;
    }

    if (cleanCurrent && cleanNew === cleanCurrent) {
      setErrorMsg('Kata sandi baru tidak boleh sama persis dengan kata sandi lama.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await authStorage.resetPasswordAsync(currentUser.id, cleanNew);
      if (success) {
        setSuccessMsg(`Kata sandi untuk akun "${currentUser.username}" berhasil diubah dan langsung tersimpan ke server!`);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        const freshUser = authStorage.getCurrentUser();
        if (freshUser && onUserUpdated) {
          onUserUpdated(freshUser);
        }
      } else {
        setErrorMsg('Gagal memperbarui kata sandi di server. Silakan coba sesaat lagi.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan saat memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMsg('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await authStorage.updateUserAsync(currentUser.id, {
        name: cleanName,
        email: cleanEmail
      });

      if (success) {
        setSuccessMsg('Profil akun Anda berhasil diperbarui di server pusat!');
        const freshUser = authStorage.getCurrentUser();
        if (freshUser && onUserUpdated) {
          onUserUpdated(freshUser);
        }
      } else {
        setErrorMsg('Gagal memperbarui data profil.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Pengaturan Akun & Sandi</h2>
              <p className="text-xs text-slate-300">Ubah langsung di dalam sistem (Tersimpan & Sinkron Otomatis)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Overview */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-700 text-white font-black text-xs flex items-center justify-center shrink-0">
              {currentUser.avatarText || currentUser.department.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-mono font-bold text-indigo-700">@{currentUser.username}</span>
                <span>•</span>
                <span className="truncate">{currentUser.department}</span>
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            currentUser.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-cyan-100 text-cyan-800'
          }`}>
            {currentUser.role === 'ADMIN' ? 'Admin' : 'User Bagian'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-white shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'password'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Ganti Kata Sandi</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil Akun</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1">
                <p>{successMsg}</p>
                <p className="text-[11px] text-emerald-700 font-normal mt-0.5">
                  Perubahan langsung aktif dan tersinkronisasi ke seluruh sistem & server tanpa perlu ubah file manual.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed">
                💡 <strong>Perubahan Langsung:</strong> Kata sandi baru yang Anda simpan di sini otomatis tersimpan di server pusat dan langsung aktif saat Anda atau rekan divisi login berikutnya.
              </div>

              {/* Current Password */}
              {currentUser.password && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      onKeyDown={handleKeyModifier}
                      onKeyUp={handleKeyModifier}
                      placeholder="Masukkan kata sandi saat ini"
                      required
                      className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buat Otomatis</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={handleKeyModifier}
                    onKeyUp={handleKeyModifier}
                    placeholder="Minimal 4 karakter"
                    required
                    className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Panjang: {newPassword.length} karakter</span>
                    <button
                      type="button"
                      onClick={handleCopyNewPassword}
                      className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Tersalin!' : 'Salin Sandi'}</span>
                    </button>
                  </div>
                )}

                {isCapsLockOn && (
                  <p className="text-[11px] font-semibold text-amber-600 animate-pulse">
                    ⚠️ Tombol Caps Lock aktif. Huruf besar/kecil berpengaruh pada kata sandi.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyModifier}
                    onKeyUp={handleKeyModifier}
                    placeholder="Ketik ulang kata sandi baru"
                    required
                    className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold">
                    Kata sandi konfirmasi tidak cocok.
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Kata sandi cocok!
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Menyimpan ke server...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  User ID / Akun Bagian
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentUser.username}
                    disabled
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-100 text-slate-500 font-mono"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-slate-400">
                  User ID akun resmi bagian dikunci untuk menjaga integritas pembagian divisi.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Nama Lengkap / Nama PIC <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama PIC atau Bagian"
                    required
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email.resmi@pln.co.id"
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Menyimpan ke server...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>PT PLN Indonesia Power UBP Teluk Sirih</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
