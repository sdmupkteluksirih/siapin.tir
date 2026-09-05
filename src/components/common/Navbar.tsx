import React, { useState, useRef, useEffect } from 'react';
import { MainView, UserAccount } from '../../types';
import { authStorage } from '../../services/authStorage';
import { SiApinLogo } from './SiApinLogo';
import { 
  CalendarCheck2, 
  Search, 
  ShieldCheck, 
  LogOut, 
  Sliders,
  Menu,
  X,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentView: MainView;
  onNavigate: (view: MainView) => void;
  pendingBookingsCount?: number;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenBackgroundSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  pendingBookingsCount = 0,
  currentUser,
  onLogout,
  onOpenBackgroundSettings
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      authStorage.logout();
      if (onLogout) onLogout();
    }
  };

  const handleSelectNav = (view: MainView) => {
    setIsMenuOpen(false);
    onNavigate(view);
  };

  const handleSelectTheme = () => {
    setIsMenuOpen(false);
    if (onOpenBackgroundSettings) {
      onOpenBackgroundSettings();
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.username === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 sm:h-20 py-2 gap-2 w-full">
          {/* SI APIN Application Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => onNavigate('booking')}
            className="flex items-center cursor-pointer group select-none py-1 min-w-0 shrink max-w-[calc(100vw-65px)] sm:max-w-none overflow-hidden"
            title="SI APIN - Sistem Terpadu Pemesanan Ruang Meeting dan Konsumsi"
          >
            <SiApinLogo size="md" />
          </div>

          {/* Top-Right Hamburger Menu Container */}
          <div className="relative shrink-0" ref={menuRef}>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Optional user badge indicator */}
              {currentUser && (
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-right select-none">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Bagian {currentUser.department}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {currentUser.avatarText || currentUser.department.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}

              {/* Tombol Garis 3 (Hamburger Menu Button) */}
              <button
                type="button"
                id="btn-hamburger-menu"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label="Buka Menu Utama"
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isMenuOpen
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
                }`}
                title="Menu Utama"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 transition-transform rotate-90 duration-200" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Dropdown Menu Popup (Muncul saat tombol garis 3 diklik) */}
            {isMenuOpen && (
              <div 
                id="hamburger-dropdown-panel"
                className="absolute right-0 mt-2.5 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 p-2.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* User Header Info in Dropdown */}
                {currentUser && (
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/60 mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {currentUser.avatarText || currentUser.department.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-xs sm:text-sm font-black text-slate-900 truncate">
                          {currentUser.name}
                        </strong>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Bagian {currentUser.department}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isAdmin 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isAdmin ? 'Admin' : 'User PIC'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Menu Utama
                </div>

                {/* 1. Menu: Buat Booking */}
                <button
                  type="button"
                  id="menu-item-buat-booking"
                  onClick={() => handleSelectNav('booking')}
                  className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group ${
                    currentView === 'booking'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      currentView === 'booking' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}>
                      <CalendarCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block leading-tight">
                        Buat Booking
                      </span>
                      <span className={`text-[10px] block ${
                        currentView === 'booking' ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        Form reservasi ruang rapat & konsumsi
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                    currentView === 'booking' ? 'text-slate-300' : 'text-slate-400'
                  }`} />
                </button>

                {/* 2. Menu: Cek Status */}
                <button
                  type="button"
                  id="menu-item-cek-status"
                  onClick={() => handleSelectNav('search')}
                  className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group ${
                    currentView === 'search'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      currentView === 'search' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}>
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block leading-tight">
                        Cek Status
                      </span>
                      <span className={`text-[10px] block ${
                        currentView === 'search' ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        Lacak tiket & persetujuan booking
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                    currentView === 'search' ? 'text-slate-300' : 'text-slate-400'
                  }`} />
                </button>

                {/* 3. Menu: Latar / Tema */}
                <button
                  type="button"
                  id="menu-item-latar-tema"
                  onClick={handleSelectTheme}
                  className="w-full p-2.5 rounded-2xl text-left flex items-center justify-between hover:bg-cyan-50/80 text-slate-700 hover:text-cyan-900 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block leading-tight">
                        Latar / Tema
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-cyan-700 block">
                        Visual latar PLTU Teluk Sirih & tone
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Optional Admin Panel Menu (Only for Admin) */}
                {isAdmin && (
                  <button
                    type="button"
                    id="menu-item-admin-panel"
                    onClick={() => handleSelectNav('admin')}
                    className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group ${
                      currentView === 'admin'
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'hover:bg-indigo-50 text-indigo-900 border border-indigo-100 bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        currentView === 'admin' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold block leading-tight">
                            Admin Panel
                          </span>
                          {pendingBookingsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                              {pendingBookingsCount}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] block ${
                          currentView === 'admin' ? 'text-indigo-200' : 'text-indigo-600/80'
                        }`}>
                          Kelola booking, approval & master data
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      currentView === 'admin' ? 'text-white' : 'text-indigo-600'
                    }`} />
                  </button>
                )}

                <div className="border-t border-slate-100 my-1 pt-1">
                  {/* 4. Menu: Sign Out */}
                  <button
                    type="button"
                    id="menu-item-signout"
                    onClick={handleLogoutClick}
                    className="w-full p-2.5 rounded-2xl text-left flex items-center justify-between hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold block leading-tight text-rose-700">
                          Sign Out
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-rose-600 block">
                          Keluar dari sesi akun saat ini
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

