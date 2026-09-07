import React, { useState, useEffect } from 'react';
import { MainView, AdminTab, Booking, UserAccount } from './types';
import { bookingStorage } from './services/bookingStorage';
import { authStorage } from './services/authStorage';
import { themeStorage, BackgroundSettings } from './services/themeStorage';
import { Navbar } from './components/common/Navbar';
import { BookingWizard } from './components/booking/BookingWizard';
import { SearchBooking } from './components/booking/SearchBooking';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginScreen } from './components/auth/LoginScreen';
import { BackgroundSettingsModal } from './components/common/BackgroundSettingsModal';
import { Sliders, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authStorage.getCurrentUser());
  const [currentView, setCurrentView] = useState<MainView>('booking');
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTab>('dashboard');
  const [searchTargetNumber, setSearchTargetNumber] = useState<string>('');
  const [pendingBookingsCount, setPendingBookingsCount] = useState<number>(0);
  const [isBgSettingsOpen, setIsBgSettingsOpen] = useState(false);
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>(() => themeStorage.getSettings());

  // Listen to bg theme changes
  useEffect(() => {
    const unsub = themeStorage.subscribe((updated) => {
      setBgSettings(updated);
    });
    return () => unsub();
  }, []);

  // Listen to auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authStorage.getCurrentUser());
    };

    handleAuthChange();
    const unsubAuth = authStorage.subscribe(handleAuthChange);
    return () => unsubAuth();
  }, []);

  // Read URL / pathname on mount to support /admin and /admin/rekap routes
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      const tabParam = searchParams.get('tab');
      const user = authStorage.getCurrentUser();
      const isAdmin = user?.role === 'ADMIN' || user?.username === 'admin';

      if (path.includes('/admin/rekap') || tabParam === 'rekap') {
        if (isAdmin) {
          setCurrentView('admin');
          setAdminInitialTab('rekap');
        } else {
          setCurrentView('booking');
        }
      } else if (path.includes('/admin') || viewParam === 'admin') {
        if (isAdmin) {
          setCurrentView('admin');
          if (tabParam === 'booking' || tabParam === 'kalender' || tabParam === 'rekap' || tabParam === 'pengaturan') {
            setAdminInitialTab(tabParam as AdminTab);
          }
        } else {
          setCurrentView('booking');
        }
      } else if (path.includes('/search') || viewParam === 'search') {
        setCurrentView('search');
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, [currentUser]);

  // Listen to bookings count for navbar badge
  useEffect(() => {
    const updateStats = () => {
      const all = bookingStorage.getAll();
      const pending = all.filter(b => b.status === 'BOOKED').length;
      setPendingBookingsCount(pending);
    };

    updateStats();
    const unsub = bookingStorage.subscribe(updateStats);
    return () => unsub();
  }, []);

  const handleNavigateToSearch = (bookingNumber: string) => {
    setSearchTargetNumber(bookingNumber);
    setCurrentView('search');
  };

  const handleNavigate = (view: MainView) => {
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.username === 'admin';

    // Strict access control: Only admin can access admin panel
    if (view === 'admin' && !isAdmin) {
      alert('Akses Ditolak: Otoritas akun bagian hanya dapat mengakses Halaman Pemesanan. Menu Admin Panel khusus untuk Administrator (id: admin).');
      setCurrentView('booking');
      window.history.pushState({}, '', '/');
      return;
    }

    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'search') {
      window.history.pushState({}, '', '/search');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleLogout = () => {
    authStorage.logout();
    setCurrentUser(null);
    setCurrentView('booking');
    window.history.pushState({}, '', '/');
  };

  // If not logged in, show the Login Screen first
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'ADMIN' || user.username === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('booking');
          }
        }}
      />
    );
  }

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.username === 'admin';

  // Compute background backdrop styling with high visual clarity for PLTU Teluk Sirih
  const getOverlayClasses = () => {
    switch (bgSettings.overlayTone) {
      case 'dark':
        return 'bg-black/55';
      case 'indigo':
        return 'bg-indigo-950/45';
      case 'light':
        return 'bg-slate-100/60 backdrop-blur-[1px]';
      case 'slate':
      default:
        return 'bg-slate-950/40';
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-900 selection:bg-cyan-500 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
      {/* Background Layer System - Real PLTU Teluk Sirih Landscape */}
      {bgSettings.style === 'panorama' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full max-w-full">
          {/* Real Aerial Drone Photo of PLTU UBP Teluk Sirih */}
          <img
            src="/bg-teluk-sirih.jpg"
            alt="Latar Belakang PLTU UBP Teluk Sirih"
            className="w-full h-full object-cover object-center fixed inset-0 scale-100"
            style={{
              opacity: (bgSettings.opacity || 70) / 100,
              filter: `blur(${bgSettings.blur || 0}px)`
            }}
          />
          {/* Dynamic Tone Overlay */}
          <div className={`fixed inset-0 ${getOverlayClasses()}`} />
          {/* Subtle ambient grid pattern */}
          <div className="fixed inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
        </div>
      )}

      {bgSettings.style === 'gradient' && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-indigo-950 w-full max-w-full overflow-hidden">
          <div className="fixed inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
      )}

      {bgSettings.style === 'minimal' && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-slate-100 w-full max-w-full overflow-hidden" />
      )}

      {bgSettings.style === 'banner' && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-slate-50 w-full max-w-full overflow-hidden" />
      )}

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen flex flex-col w-full max-w-full overflow-x-clip">
        {currentView !== 'admin' && (
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            pendingBookingsCount={pendingBookingsCount}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenBackgroundSettings={() => setIsBgSettingsOpen(true)}
          />
        )}

        {currentView === 'booking' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full max-w-full overflow-x-clip sm:overflow-x-visible">
            <BookingWizard
              currentUser={currentUser}
              onCheckStatus={handleNavigateToSearch}
              onOpenSettings={() => setIsBgSettingsOpen(true)}
              onBookingCreated={() => {
                // Notification / trigger
              }}
            />
          </main>
        )}

        {currentView === 'search' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full max-w-full overflow-x-clip sm:overflow-x-visible">
            <SearchBooking
              initialSearchQuery={searchTargetNumber}
              onNewBooking={() => handleNavigate('booking')}
            />
          </main>
        )}

        {currentView === 'admin' && isAdmin && (
          <AdminLayout
            initialTab={adminInitialTab}
            onNavigateToCustomer={() => handleNavigate('booking')}
          />
        )}
      </div>

      {/* Floating Quick Background Settings Trigger Button */}
      <button
        type="button"
        id="btn-floating-bg-settings"
        onClick={() => setIsBgSettingsOpen(true)}
        className="fixed bottom-5 right-5 z-40 p-3 rounded-2xl bg-slate-900/90 hover:bg-cyan-600 text-white shadow-xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-xs font-bold cursor-pointer group"
        title="Pengaturan Background Lanskap PLTU Teluk Sirih"
      >
        <Sliders className="w-4 h-4 text-cyan-300 group-hover:rotate-45 transition-transform" />
        <span className="hidden sm:inline">Latar PLTU Teluk Sirih</span>
      </button>

      {/* Background Customizer Modal */}
      <BackgroundSettingsModal
        isOpen={isBgSettingsOpen}
        onClose={() => setIsBgSettingsOpen(false)}
      />
    </div>
  );
}
