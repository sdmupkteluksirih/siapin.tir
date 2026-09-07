import React, { useState, useEffect } from 'react';
import { AdminTab, Booking } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { AdminSidebar } from './AdminSidebar';
import { DashboardOverview } from './DashboardOverview';
import { BookingManagement } from './BookingManagement';
import { MeetingCalendar } from './MeetingCalendar';
import { RekapKonsumsi } from './RekapKonsumsi';
import { AdminSettings } from './AdminSettings';
import { BookingDetailModal } from './BookingDetailModal';
import { 
  Menu, 
  Building2, 
  LayoutDashboard, 
  BookOpenCheck, 
  Calendar, 
  UtensilsCrossed, 
  Settings,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  initialTab?: AdminTab;
  onNavigateToCustomer: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  initialTab = 'dashboard',
  onNavigateToCustomer
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null);

  // Sync with storage
  useEffect(() => {
    const refreshData = () => {
      setBookings(bookingStorage.getAll());
    };

    refreshData();
    const unsubscribe = bookingStorage.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  const pendingCount = bookings.filter(b => b.status === 'BOOKED').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800">
      {/* Sidebar (Desktop + Mobile Drawer) - Fixed & Stationary */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Admin Content Wrapper with left padding for desktop sidebar and top padding for fixed header */}
      <div className="lg:pl-64 pt-16 sm:pt-20 min-h-screen flex flex-col">
        {/* Top Header bar for mobile / desktop - Dark Elegant & Permanently Fixed */}
        <header className="fixed top-0 left-0 lg:left-64 right-0 z-30 h-16 sm:h-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-md text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-toggle-mobile-sidebar"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Portal Administrator
              </span>
              <div className="font-black text-white text-base sm:text-lg tracking-tight">
                {currentTab === 'dashboard' && 'Dashboard Operasional'}
                {currentTab === 'booking' && 'Manajemen Booking Meeting'}
                {currentTab === 'kalender' && 'Kalender Ruangan'}
                {currentTab === 'rekap' && 'Rekapitulasi Konsumsi Harian'}
                {currentTab === 'pengaturan' && 'Pengaturan & Master Data'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateToCustomer}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 font-bold text-xs text-slate-200 hover:text-white transition-colors cursor-pointer shadow-xs"
            >
              Halaman Pemesan
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              bookings={bookings}
              onSelectBooking={(b) => setSelectedBookingForModal(b)}
              onNavigateToRekap={() => setCurrentTab('rekap')}
              onNavigateToBooking={() => setCurrentTab('booking')}
            />
          )}

          {currentTab === 'booking' && (
            <BookingManagement
              bookings={bookings}
              onSelectBooking={(b) => setSelectedBookingForModal(b)}
              onNewBookingClick={onNavigateToCustomer}
            />
          )}

          {currentTab === 'kalender' && (
            <MeetingCalendar
              bookings={bookings}
              onSelectBooking={(b) => setSelectedBookingForModal(b)}
            />
          )}

          {currentTab === 'rekap' && (
            <RekapKonsumsi
              onSelectBooking={(b) => setSelectedBookingForModal(b)}
            />
          )}

          {currentTab === 'pengaturan' && (
            <AdminSettings />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar for quick access (Prompt 2 requirement) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {[
            { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'booking' as AdminTab, label: 'Booking', icon: BookOpenCheck, badge: pendingCount },
            { id: 'kalender' as AdminTab, label: 'Kalender', icon: Calendar },
            { id: 'rekap' as AdminTab, label: 'Rekap', icon: UtensilsCrossed },
            { id: 'pengaturan' as AdminTab, label: 'Pengaturan', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-bold transition-all ${
                  isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge ? (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBookingForModal && (
        <BookingDetailModal
          booking={selectedBookingForModal}
          onClose={() => setSelectedBookingForModal(null)}
          onStatusChanged={() => {
            setBookings(bookingStorage.getAll());
            setSelectedBookingForModal(bookingStorage.getById(selectedBookingForModal.id) || null);
          }}
        />
      )}
    </div>
  );
};
