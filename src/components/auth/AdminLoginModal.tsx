import React, { useState } from 'react';
import { authStorage } from '../../services/authStorage';
import { UserAccount } from '../../types';
import { 
  ShieldCheck, 
  KeyRound, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Building2,
  X
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  redirectToCustomer?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  redirectToCustomer
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authStorage.login(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Login gagal. Periksa kembali ID dan Password.');
      }
    }, 250);
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header styling */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block font-mono">
                Sistem Ruang Meeting & Konsumsi
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Login Akun Admin
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Akses verifikasi persetujuan (approval) konsumsi, edit jadwal meeting, dan kelola reset password pengguna.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              User ID / Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="input-login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan ID Pengguna (misal: admin)"
                required
                className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Password <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="input-login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Account Credential Guide Card */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-2">
            <div className="flex items-center justify-between text-indigo-950 font-bold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pilih Akun Administrator (4 Admin):</span>
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded border border-indigo-200">
                Aktif & Siap
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div 
                onClick={() => handleQuickFill('nofi', 'admin123')}
                className="p-2 rounded-lg bg-white border border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/70 cursor-pointer transition-all space-y-0.5 shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="truncate">NOFI ZAHARA</span>
                  <span className="text-[8px] bg-indigo-600 text-white font-bold px-1 rounded">USER 1</span>
                </div>
                <div className="font-mono text-slate-600 text-[10px]">ID: <strong>nofi</strong></div>
                <div className="font-mono text-slate-500 text-[9px]">Pass: admin123</div>
              </div>

              <div 
                onClick={() => handleQuickFill('resna', 'admin123')}
                className="p-2 rounded-lg bg-white border border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/70 cursor-pointer transition-all space-y-0.5 shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="truncate">RESNA WATI</span>
                  <span className="text-[8px] bg-indigo-600 text-white font-bold px-1 rounded">USER 2</span>
                </div>
                <div className="font-mono text-slate-600 text-[10px]">ID: <strong>resna</strong></div>
                <div className="font-mono text-slate-500 text-[9px]">Pass: admin123</div>
              </div>

              <div 
                onClick={() => handleQuickFill('deri', 'admin123')}
                className="p-2 rounded-lg bg-white border border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/70 cursor-pointer transition-all space-y-0.5 shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="truncate">DERI TIALIS P.</span>
                  <span className="text-[8px] bg-blue-600 text-white font-bold px-1 rounded">APLIKASI 1</span>
                </div>
                <div className="font-mono text-slate-600 text-[10px]">ID: <strong>deri</strong></div>
                <div className="font-mono text-slate-500 text-[9px]">Pass: admin123</div>
              </div>

              <div 
                onClick={() => handleQuickFill('yuda', 'admin123')}
                className="p-2 rounded-lg bg-white border border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/70 cursor-pointer transition-all space-y-0.5 shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="truncate">YUDA PUTRA U.</span>
                  <span className="text-[8px] bg-blue-600 text-white font-bold px-1 rounded">APLIKASI 2</span>
                </div>
                <div className="font-mono text-slate-600 text-[10px]">ID: <strong>yuda</strong></div>
                <div className="font-mono text-slate-500 text-[9px]">Pass: admin123</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic text-center pt-0.5">
              *Klik nama admin di atas untuk login langsung, atau ketik ID & password secara manual.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk ke Portal Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {redirectToCustomer && (
              <button
                type="button"
                onClick={redirectToCustomer}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Kembali ke Halaman Buat Booking
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
