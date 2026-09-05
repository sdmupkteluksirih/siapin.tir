import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import { whatsappService, AdminContact } from '../../services/whatsappService';
import { 
  X, 
  Send, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Phone,
  AlertCircle
} from 'lucide-react';

interface WhatsAppNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  type: 'NEW_BOOKING' | 'STATUS_UPDATE';
  newStatus?: BookingStatus;
  adminNotes?: string;
  adminName?: string;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  isOpen,
  onClose,
  booking,
  type,
  newStatus = booking.status,
  adminNotes,
  adminName
}) => {
  if (!isOpen) return null;

  const adminContacts = whatsappService.getAdminContacts();
  const [recipientType, setRecipientType] = useState<'PEMESAN' | 'ADMIN' | 'SHARE'>('PEMESAN');
  const [selectedAdminId, setSelectedAdminId] = useState<string>(adminContacts[0]?.id || '');
  const [copied, setCopied] = useState(false);

  // Generate initial message
  const defaultMessage = type === 'NEW_BOOKING'
    ? whatsappService.generateNewBookingMessage(booking, recipientType === 'ADMIN' ? 'ADMIN' : 'PEMESAN')
    : whatsappService.generateStatusUpdateMessage(booking, newStatus, adminNotes, adminName);

  const [message, setMessage] = useState(defaultMessage);

  // When recipient changes for new booking, update message
  const handleRecipientChange = (newRecipient: 'PEMESAN' | 'ADMIN' | 'SHARE') => {
    setRecipientType(newRecipient);
    if (type === 'NEW_BOOKING') {
      setMessage(
        whatsappService.generateNewBookingMessage(booking, newRecipient === 'ADMIN' ? 'ADMIN' : 'PEMESAN')
      );
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (recipientType === 'PEMESAN') {
      whatsappService.openChat(booking.whatsapp, message);
    } else if (recipientType === 'ADMIN') {
      const contact = adminContacts.find(c => c.id === selectedAdminId) || adminContacts[0];
      if (contact) {
        whatsappService.openChat(contact.phone, message);
      } else {
        whatsappService.openShare(message);
      }
    } else {
      whatsappService.openShare(message);
    }
  };

  const selectedAdmin = adminContacts.find(c => c.id === selectedAdminId) || adminContacts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative my-6">
        {/* Header */}
        <div className="bg-emerald-700 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Notifikasi WhatsApp SI APIN
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {type === 'NEW_BOOKING' ? 'Kirim Bukti Reservasi' : 'Kirim Notifikasi Update Status'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Target Recipient Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Tujuan Pengiriman WhatsApp:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRecipientChange('PEMESAN')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  recipientType === 'PEMESAN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 text-xs'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate font-semibold">Pemesan</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {booking.whatsapp}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRecipientChange('ADMIN')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  recipientType === 'ADMIN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 text-xs'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate font-semibold">Admin GA</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  PIC Tim GA
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRecipientChange('SHARE')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  recipientType === 'SHARE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 text-xs'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate font-semibold">Bagikan</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Grup / Kontak Lain
                </p>
              </button>
            </div>
          </div>

          {/* If Admin selected, choose which Admin */}
          {recipientType === 'ADMIN' && adminContacts.length > 1 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 animate-in fade-in">
              <label className="font-bold text-slate-700 block">
                Pilih Kontak Admin GA / PIC:
              </label>
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 text-xs"
              >
                {adminContacts.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    {adm.name} ({adm.phone}) - {adm.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Teks Pesan WhatsApp (Otomatis & Siap Kirim):
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-300 bg-slate-50/70 font-mono text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all resize-none shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Klik tombol di bawah untuk membuka WhatsApp dengan teks yang sudah otomatis tersusun rapi.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {recipientType === 'PEMESAN'
                ? `Buka WhatsApp Pemesan (${booking.whatsapp})`
                : recipientType === 'ADMIN'
                ? `Kirim ke ${selectedAdmin?.name?.split(' ')[0] || 'Admin'} (${selectedAdmin?.phone})`
                : 'Buka WhatsApp Share'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
