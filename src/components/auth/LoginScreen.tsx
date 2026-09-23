import React, { useState, useEffect } from 'react';
import { authStorage } from '../../services/authStorage';
import { UserAccount } from '../../types';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  KeyRound,
  CheckCircle2
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
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [showAccountGuide, setShowAccountGuide] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Check caps lock on keydown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSelectAccount = (accUsername: string) => {
    setUsername(accUsername);
    const targetUser = authStorage.getAllUsers().find(
      u => u.username.toLowerCase() === accUsername.toLowerCase()
    );
    if (targetUser?.password) {
      setPassword(targetUser.password);
    }
    setCopiedAccount(accUsername);
    setErrorMsg('');
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Silakan masukkan User ID dan Kata Sandi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authStorage.loginAsync(username.trim(), password.trim());
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'User ID atau Kata Sandi tidak cocok.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Terjadi kesalahan verifikasi akun. Silakan coba lagi.');
    }
  };

  const ADMIN_ACCOUNTS = [
    { username: 'admin.siapin', name: 'Admin Si Apin', desc: 'Master Admin Si APIN & SDM' },
    { username: 'deri.tialis', name: 'Deri Tialis Peristiawan', desc: 'Admin Sistem Informasi & TI 1' },
    { username: 'yuda.putra', name: 'Yuda Putra Utama', desc: 'Admin Sistem Informasi & TI 2' },
    { username: 'nofi.zahara', name: 'Nofi Zahara', desc: 'Admin Keuangan & Umum 1' },
    { username: 'resna.wati', name: 'Resna Wati', desc: 'Admin Keuangan & Umum 2' },
  ];

  const DIVISION_ACCOUNTS = [
    { username: 'har.tir', name: 'Pemeliharaan', code: 'HAR' },
    { username: 'opr.tir', name: 'Operasi', code: 'OPR' },
    { username: 'keu.mum', name: 'Keuangan & Umum', code: 'KU' },
    { username: 'enj.tir', name: 'Enjiniring', code: 'ENJ' },
    { username: 'cah.tir', name: 'Coal & Ash Handling', code: 'CAH' },
    { username: 'lin.tir', name: 'Lingkungan', code: 'LIN' },
    { username: 'k3k.tir', name: 'K3 & Keamanan', code: 'K3K' },
    { username: 'dan.tir', name: 'Pengadaan', code: 'DAN' },
    { username: 'smt.tir', name: 'Sistem Manajemen Terintegrasi', code: 'SMT' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
      {/* Real Background Photo of PLTU Teluk Sirih */}
      <img
        src="/bg-teluk-sirih.jpg"
        alt="PLTU Teluk Sirih"
        className="fixed inset-0 w-full h-full object-cover object-center opacity-80 scale-100"
      />

      {/* Multi-gradient Vignette & Atmosphere */}
      <div className="fixed inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-950/50 to-indigo-950/40 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 my-auto">
        {/* Brand Header: PLN Logo on Top + Si APIN Logo */}
        <div className="text-center mb-5 sm:mb-6 flex flex-col items-center w-full">
          <div className="flex flex-col items-center justify-center w-full max-w-md px-2 py-1 mb-2">
            {/* 1. Logo Paling Atas: PLN */}
            <div className="flex items-center justify-center -mb-0.5 z-10">
              <img
                src="/PLN Putih.png"
                alt="PT PLN Indonesia Power"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-105"
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('pln-putih.png')) {
                    target.src = '/pln-putih.png';
                  }
                }}
              />
            </div>

            {/* 2. Logo Dibawahnya: Si APIN */}
            <div className="flex items-center justify-center w-full z-10">
              <img
                src="/Propper Logo SiApin.png"
                alt="SI APIN - Sistem Terpadu Pemesanan Ruang Meeting dan Konsumsi"
                className="w-full max-w-[360px] sm:max-w-[420px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-[1.02]"
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('propper-logo-siapin.png')) {
                    target.src = '/propper-logo-siapin.png';
                  }
                }}
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
            <div className="mb-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan User ID bagian, username, atau alamat email beserta kata sandi yang terdaftar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-rose-800">{errorMsg}</p>
                    <button
                      type="button"
                      onClick={() => setShowAccountGuide(true)}
                      className="text-[11px] text-indigo-700 font-bold underline hover:text-indigo-900 cursor-pointer block"
                    >
                      Klik di sini untuk melihat panduan User ID & Akun Resmi PLN
                    </button>
                  </div>
                </div>
              )}

              {/* User ID / Username / Email Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    User ID / Username / Email <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAccountGuide(!showAccountGuide)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showAccountGuide ? 'Tutup Daftar Akun' : 'Daftar Akun'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="login-username-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: keuangan, operasi, admin, atau email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    autoComplete="username"
                    className="w-full py-3 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-400">
                  User ID bagian: <code className="font-mono text-indigo-600 font-bold">keuangan</code>, <code className="font-mono text-indigo-600 font-bold">operasi</code>, <code className="font-mono text-indigo-600 font-bold">k3_keamanan</code>, <code className="font-mono text-indigo-600 font-bold">admin</code>, dll.
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  {isCapsLockOn && (
                    <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                      <span>⚠️ Caps Lock Aktif</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    placeholder="Masukkan kata sandi akun"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    autoComplete="current-password"
                    className={`w-full py-3 pl-11 pr-11 rounded-xl border text-sm font-medium bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 text-slate-900 font-mono transition-all ${
                      isCapsLockOn ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-200 focus:ring-indigo-500'
                    }`}
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
                {isCapsLockOn ? (
                  <p className="text-[11px] text-amber-600 font-medium">
                    Perhatian: Huruf besar/kecil berpengaruh pada kata sandi. Pastikan tombol Caps Lock tidak sengaja menyala.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Sandi peka huruf kapital. Jika diubah oleh admin, masukkan password baru yang diberikan.
                  </p>
                )}
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

            {/* Quick Helper / Directory Drawer */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAccountGuide(!showAccountGuide)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>Bantuan: Klik untuk Pilih Akun & User ID</span>
                </div>
                {showAccountGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAccountGuide && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 animate-in fade-in">
                  <div className="text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                    💡 <strong>Tips Masuk:</strong> Klik salah satu akun di bawah untuk otomatis mengisi User ID ke formulir. Jika kata sandi telah diubah oleh Admin, gunakan sandi baru yang ditentukan.
                  </div>

                  {/* Section Admin */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Akun Administrator (5 Akun)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {ADMIN_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.username}
                          type="button"
                          onClick={() => handleSelectAccount(acc.username)}
                          className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            username === acc.username 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                              : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <p className="font-bold truncate">{acc.name}</p>
                            <p className={`text-[10px] font-mono ${username === acc.username ? 'text-indigo-100' : 'text-slate-400'}`}>
                              ID: {acc.username}
                            </p>
                          </div>
                          {copiedAccount === acc.username ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${username === acc.username ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              Pilih
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section Divisi */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Akun Bagian / Divisi (9 Akun)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {DIVISION_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.username}
                          type="button"
                          onClick={() => handleSelectAccount(acc.username)}
                          className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            username === acc.username 
                              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs' 
                              : 'bg-white text-slate-800 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/40'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <p className="font-bold truncate">{acc.name}</p>
                            <p className={`text-[10px] font-mono ${username === acc.username ? 'text-cyan-100' : 'text-slate-400'}`}>
                              ID: {acc.username}
                            </p>
                          </div>
                          {copiedAccount === acc.username ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${username === acc.username ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              Pilih
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-600">PT PLN Indonesia Power UBP Teluk Sirih</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sistem Informasi Agenda Pemesanan Ruangan &amp; Konsumsi</p>
          </div>
        </div>
      </div>
    </div>
  );
};
