import React from 'react';
import { AdminTab } from '../../types';
import { authStorage } from '../../services/authStorage';
import { SiApinLogo } from '../common/SiApinLogo';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  Calendar, 
  UtensilsCrossed, 
  Settings, 
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'booking' as AdminTab, label: 'Booking', icon: BookOpenCheck },
  { id: 'kalender' as AdminTab, label: 'Kalender', icon: Calendar },
  { id: 'rekap' as AdminTab, label: 'Rekap Konsumsi', icon: UtensilsCrossed },
  { id: 'logs' as AdminTab, label: 'Log Aktivitas', icon: ShieldCheck },
  { id: 'pengaturan' as AdminTab, label: 'Pengaturan & User', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const currentUser = authStorage.getCurrentUser();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Permanently Fixed on desktop & animated drawer on mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header - Stacked layout to prevent logo & user text overlapping */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between">
              {/* Logo PLN and Si APIN Container */}
              <div className="bg-white/95 px-2.5 py-1.5 rounded-xl inline-flex items-center gap-2 shadow-xs">
                <img 
                  src="/pln-logo.png" 
                  alt="PLN" 
                  className="h-5 w-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('login-pln-logo.png')) {
                      target.src = '/login-pln-logo.png';
                    }
                  }}
                />
                <div className="h-4 w-px bg-slate-300" />
                <img 
                  src="/si-apin-logo.png" 
                  alt="SI APIN" 
                  className="h-6 w-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('login-siapin-logo.png')) {
                      target.src = '/login-siapin-logo.png';
                    }
                  }}
                />
              </div>

              {/* Mobile close btn */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User & Admin Panel Title placed nicely BELOW the logos */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="font-bold text-xs text-white tracking-wide uppercase">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-semibold mt-0.5 tracking-tight">
                UPK TELUK SIRIH
              </p>
              {currentUser && (
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  Login: <span className="text-slate-200 font-medium">{currentUser.name || currentUser.username}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Menu Utama
            </div>

            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isBookingTab = item.id === 'booking';

              return (
                <button
                  key={item.id}
                  id={`admin-menu-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {isBookingTab && pendingCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[11px] font-bold flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-300">Sistem Aktif</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Keluar dari sesi Administrator?')) {
                  authStorage.logout();
                }
              }}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Keluar / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Internal Corporate Workspace UPK Teluk Sirih
          </p>
        </div>
      </aside>
    </>
  );
};
