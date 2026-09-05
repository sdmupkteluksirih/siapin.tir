import React, { useState } from 'react';
import { authStorage } from '../../services/authStorage';
import { UserAccount } from '../../types';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Silakan masukkan User ID dan Kata Sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = authStorage.login(username.trim(), password.trim());
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'User ID atau Kata Sandi tidak cocok.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Real Background Photo of PLTU Teluk Sirih */}
      <img
        src="/bg-teluk-sirih.jpg"
        alt="PLTU Teluk Sirih"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80 scale-100"
      />

      {/* Multi-gradient Vignette & Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-950/50 to-indigo-950/40" />
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header: PLN Logo on Top + Si APIN Logo */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center w-full">
          <div className="flex flex-col items-center justify-center w-full max-w-md px-2 py-1 mb-2">
            {/* 1. Logo Paling Atas: PLN (Ukuran Kecil Proporsional) */}
            <div className="flex items-center justify-center -mb-0.5 z-10">
              <img
                src="/login-pln-logo.png"
                alt="PT PLN Indonesia Power"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-105"
                loading="eager"
              />
            </div>

            {/* 2. Logo Dibawahnya: Si APIN */}
            <div className="flex items-center justify-center w-full z-10">
              <img
                src="/login-header-logo.png"
                alt="SI APIN - Sistem Terpadu Pemesanan Ruang Meeting dan Konsumsi"
                className="w-full max-w-[360px] sm:max-w-[420px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-[1.02]"
                loading="eager"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-cyan-300 text-[11px] sm:text-xs font-bold shadow-md">
            <span>PT PLN INDONESIA POWER</span>
            <span>&bull;</span>
            <span>UBP TELUK SIRIH</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden ring-1 ring-black/5">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan User ID bagian atau Admin beserta kata sandi yang terdaftar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* User ID / Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  User ID / Bagian <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="login-username-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan User ID (contoh: operasi, admin)"
                    required
                    autoFocus
                    className="w-full py-3 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    className="w-full py-3 pl-11 pr-11 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-login"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Aplikasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-600">PT PLN Indonesia Power UBP Teluk Sirih</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Copyright &copy; 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};
