import React, { useEffect, useState } from 'react';
import { Booking } from '../../types';
import { formatDateIndo, formatDuration } from '../../utils/timeUtils';
import { StatusBadge } from '../common/StatusBadge';
import { whatsappService, AdminContact } from '../../services/whatsappService';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Copy, 
  Printer, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UtensilsCrossed, 
  Share2, 
  PlusCircle, 
  Search,
  Building2,
  Check,
  MessageSquare,
  Send,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface BookingSuccessProps {
  booking: Booking;
  onNewBooking: () => void;
  onCheckStatus: (bookingNumber: string) => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({
  booking,
  onNewBooking,
  onCheckStatus
}) => {
  const [copied, setCopied] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  
  const adminContacts = whatsappService.getAdminContacts();

  useEffect(() => {
    // Trigger confetti upon success
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if confetti fails
    }
  }, []);

  const copyBookingNumber = () => {
    navigator.clipboard.writeText(booking.bookingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToPemesan = () => {
    const msg = whatsappService.generateNewBookingMessage(booking, 'PEMESAN');
    whatsappService.openChat(booking.whatsapp, msg);
  };

  const handleSendToAdmin = (admin?: AdminContact) => {
    const targetAdmin = admin || adminContacts[0];
    if (!targetAdmin) return;
    const msg = whatsappService.generateNewBookingMessage(booking, 'ADMIN');
    whatsappService.openChat(targetAdmin.phone, msg);
    setShowAdminDropdown(false);
  };

  const handleShareGeneral = () => {
    const msg = whatsappService.generateNewBookingMessage(booking, 'PEMESAN');
    whatsappService.openShare(msg);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Success Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 text-center relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/60">
          <CheckCircle2 className="w-9 h-9 sm:w-12 sm:h-12" />
        </div>

        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-2">
          Booking Berhasil Dibuat
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Pemesanan Ruang & Konsumsi Diterima
        </h2>
        
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
          Permintaan booking telah tersimpan di sistem internal. Simpan nomor booking Anda untuk pelacakan dan koordinasi logistik.
        </p>

        {/* Unique Booking Code Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 max-w-md mx-auto shadow-inner flex items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Nomor Booking Resmi
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold tracking-wide text-indigo-300">
              {booking.bookingNumber}
            </span>
          </div>

          <button
            type="button"
            onClick={copyBookingNumber}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Multi-Chat Notification Sequence Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-3xl border border-emerald-200/80 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Kirim Bukti Reservasi via WhatsApp
              </h3>
              <p className="text-xs text-slate-600">
                Pilih opsi pengiriman chat otomatis berformat resmi di bawah ini:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWaModalOpen(true)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
          >
            Lihat & Edit Format Pesan
          </button>
        </div>

        {/* Action Buttons Sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Send to Booker WhatsApp */}
          <button
            type="button"
            onClick={handleSendToPemesan}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-left transition-all shadow-xs hover:shadow-md cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                1. WA Pemesan
              </span>
              <Send className="w-4 h-4 text-emerald-100 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-bold leading-tight">
                Kirim ke WA Saya
              </strong>
              <span className="text-[11px] text-emerald-100 block truncate mt-0.5 font-mono">
                {booking.whatsapp}
              </span>
            </div>
          </button>

          {/* 2. Forward to Admin GA / PIC */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (adminContacts.length > 1) {
                  setShowAdminDropdown(!showAdminDropdown);
                } else {
                  handleSendToAdmin();
                }
              }}
              className="w-full h-full p-3.5 rounded-2xl bg-white hover:bg-emerald-50/80 border border-emerald-300 text-slate-800 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  2. Admin GA
                </span>
                {adminContacts.length > 1 ? (
                  <ChevronDown className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <strong className="block text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Notifikasi Admin GA
                </strong>
                <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                  {adminContacts[0]?.name || 'PIC Logistik GA'}
                </span>
              </div>
            </button>

            {/* Dropdown if multi admins */}
            {showAdminDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 p-2 space-y-1 animate-in fade-in">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                  Pilih Kontak Admin GA:
                </div>
                {adminContacts.map((adm) => (
                  <button
                    key={adm.id}
                    type="button"
                    onClick={() => handleSendToAdmin(adm)}
                    className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 transition-colors text-xs flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <strong className="block text-slate-800">{adm.name}</strong>
                      <span className="text-[10px] text-slate-500">{adm.role} ({adm.phone})</span>
                    </div>
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Share to Meeting Group */}
          <button
            type="button"
            onClick={handleShareGeneral}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                3. Grup / Kontak
              </span>
              <Share2 className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                Bagikan ke WhatsApp
              </strong>
              <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                Grup Rapat / Rekan Kerja
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Booking Summary Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Ringkasan Bukti Booking Internal
            </h3>
            <p className="text-xs text-slate-500">
              Diajukan pada {new Date(booking.createdAt).toLocaleString('id-ID')}
            </p>
          </div>
          <StatusBadge status={booking.status} size="lg" />
        </div>

        {/* 3 Column info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jadwal */}
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwal</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Tanggal</span>
              <strong className="text-slate-900">{formatDateIndo(booking.meetingDate)}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Waktu</span>
              <strong className="text-slate-900">{booking.startTime} - {booking.endTime} WIB</strong>
              <span className="text-xs text-slate-500 block">({formatDuration(booking.durationHours)})</span>
            </div>
          </div>

          {/* Konsumsi */}
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Konsumsi ({booking.participantCount} Pax)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Snack Ringan</span>
              <strong className={booking.snackRingan !== 'Tidak Ada' ? 'text-slate-900' : 'text-slate-400'}>
                {booking.snackRingan !== 'Tidak Ada' ? booking.snackRingan : '- (Tidak Pesan)'}
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Snack Berat</span>
              <strong className={booking.snackBerat !== 'Tidak Ada' ? 'text-slate-900' : 'text-slate-400'}>
                {booking.snackBerat !== 'Tidak Ada' ? booking.snackBerat : '- (Tidak Pesan)'}
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Makan Siang</span>
              <strong className={booking.makanSiang === 'Iya' ? 'text-emerald-700' : 'text-slate-600'}>
                {booking.makanSiang === 'Iya' ? 'Iya (Disediakan)' : 'Tidak Ada'}
              </strong>
            </div>
          </div>

          {/* Pemesan & Acara */}
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Pemesan & Lokasi</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Nama / Divisi</span>
              <strong className="text-slate-900">{booking.bookerName}</strong>
              <span className="text-xs text-slate-500 block">{booking.department}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Ruangan</span>
              <strong className="text-slate-900">{booking.meetingLocation}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Kegiatan</span>
              <span className="text-slate-800 font-medium block">{booking.meetingTitle}</span>
            </div>
            {booking.organizationOrGuests && (
              <div>
                <span className="text-xs text-slate-400 block">Tamu / Organisasi</span>
                <span className="text-slate-900 font-semibold block">{booking.organizationOrGuests}</span>
              </div>
            )}
            {booking.invitationLetter && (
              <div>
                <span className="text-xs text-slate-400 block">Surat Undangan / Izin</span>
                <span className="text-indigo-600 font-semibold block text-xs truncate">
                  📎 {booking.invitationLetter.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {booking.notes && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <strong className="text-slate-700 block mb-1">Catatan Tambahan:</strong>
            <p className="text-slate-600 italic">"{booking.notes}"</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs sm:text-sm text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Bukti Booking</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCheckStatus(booking.bookingNumber)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-xs sm:text-sm text-slate-800 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Cek Status</span>
            </button>

            <button
              type="button"
              onClick={onNewBooking}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 font-bold text-xs sm:text-sm text-white shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Booking Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal for Preview / Customization */}
      {isWaModalOpen && (
        <WhatsAppNotificationModal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          booking={booking}
          type="NEW_BOOKING"
        />
      )}
    </div>
  );
};
