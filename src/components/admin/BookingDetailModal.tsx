import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { authStorage } from '../../services/authStorage';
import { formatDateIndo, formatDuration } from '../../utils/timeUtils';
import { StatusBadge } from '../common/StatusBadge';
import { BookingEditApprovalModal } from './BookingEditApprovalModal';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import { whatsappService } from '../../services/whatsappService';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UtensilsCrossed, 
  Phone, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  CheckCheck, 
  Printer, 
  Trash2,
  FileText,
  Edit3,
  ShieldCheck,
  MessageSquare,
  Send
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onStatusChanged?: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onStatusChanged
}) => {
  const [isEditApprovalOpen, setIsEditApprovalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waStatusTarget, setWaStatusTarget] = useState<BookingStatus | undefined>(undefined);
  const [waAdminNotes, setWaAdminNotes] = useState<string | undefined>(undefined);

  if (!booking) return null;

  const currentUser = authStorage.getCurrentUser();
  const adminName = currentUser?.name || 'Admin GA UPK Teluk Sirih';

  const handleUpdateStatus = (newStatus: BookingStatus, customNote?: string) => {
    bookingStorage.updateStatus(booking.id, newStatus);
    setWaStatusTarget(newStatus);
    setWaAdminNotes(customNote || (newStatus === 'CONFIRMED' ? 'Disetujui oleh Pengelola Ruangan & Konsumsi.' : undefined));
    setIsWaModalOpen(true);
    if (onStatusChanged) onStatusChanged();
  };

  const handleDirectWhatsAppClick = () => {
    setWaStatusTarget(booking.status);
    setWaAdminNotes(booking.approvalNotes);
    setIsWaModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 relative my-8 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-7 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-indigo-300">
                  {booking.bookingNumber}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-400">
                  Dibuat {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {booking.meetingTitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-7 space-y-6">
            {/* Status & Quick Action Bar */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status:</span>
                <StatusBadge status={booking.status} size="lg" />
              </div>

              {/* Quick Status Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Edit & Approve Button */}
                <button
                  type="button"
                  id="btn-edit-approval-modal"
                  onClick={() => setIsEditApprovalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{booking.status === 'BOOKED' ? 'Edit & Setujui' : 'Edit Booking'}</span>
                </button>

                {booking.status === 'BOOKED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('CONFIRMED')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui (Approve)</span>
                  </button>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai Selesai</span>
                  </button>
                )}

                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Batalkan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Approval Info Banner if Confirmed or Cancelled */}
            {(booking.approvedBy || booking.approvalNotes) && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Catatan Otorisasi / Approval Admin:</span>
                </div>
                {booking.approvedBy && (
                  <p className="text-slate-600 text-[11px]">
                    Diverifikasi oleh: <strong className="text-indigo-900">{booking.approvedBy}</strong> {booking.approvedAt && `pada ${new Date(booking.approvedAt).toLocaleDateString('id-ID')}`}
                  </p>
                )}
                {booking.approvalNotes && (
                  <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-indigo-100">
                    "{booking.approvalNotes}"
                  </p>
                )}
              </div>
            )}

            {/* 3 Blocks: Jadwal, Konsumsi, Pemesan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* Jadwal */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Waktu & Ruangan</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Tanggal:</span>
                  <strong className="text-slate-900">{formatDateIndo(booking.meetingDate)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Jam:</span>
                  <strong className="text-slate-900">{booking.startTime} - {booking.endTime} WIB</strong>
                  <span className="text-xs text-slate-500 block">({formatDuration(booking.durationHours)})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Ruangan:</span>
                  <span className="font-semibold">
                    {booking.meetingLocation === 'Tidak menggunakan ruang meeting' ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Tanpa Ruang Meeting (Hanya Konsumsi)
                      </span>
                    ) : (
                      <span className="text-slate-800">{booking.meetingLocation}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Konsumsi */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="text-xs font-bold uppercase text-amber-600 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Konsumsi ({booking.participantCount} Peserta)</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Snack Ringan:</span>
                  <strong className={booking.snackRingan !== 'Tidak Ada' ? 'text-slate-900' : 'text-slate-400'}>
                    {booking.snackRingan !== 'Tidak Ada' ? booking.snackRingan : '- (Tidak Pesan)'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Snack Berat:</span>
                  <strong className={booking.snackBerat !== 'Tidak Ada' ? 'text-slate-900' : 'text-slate-400'}>
                    {booking.snackBerat !== 'Tidak Ada' ? booking.snackBerat : '- (Tidak Pesan)'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Makan Siang:</span>
                  <strong className={booking.makanSiang === 'Iya' ? 'text-emerald-700' : 'text-slate-600'}>
                    {booking.makanSiang === 'Iya' ? 'Iya (Paket Lengkap)' : 'Tidak Disediakan'}
                  </strong>
                </div>
              </div>
            </div>

              {/* Pemesan Info */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Penanggung Jawab (PIC)</span>
                </div>

                <button
                  type="button"
                  onClick={handleDirectWhatsAppClick}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim Notifikasi WA</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 text-xs block">Nama Pemesan:</span>
                  <strong className="text-slate-900">{booking.bookerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Divisi:</span>
                  <span className="text-slate-800 font-medium">{booking.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Nomor WhatsApp:</span>
                  <span className="text-slate-800 font-medium font-mono">{booking.whatsapp}</span>
                </div>
              </div>

              {booking.organizationOrGuests && (
                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-400 block">Organisasi / Tamu yang Hadir:</span>
                  <span className="text-slate-900 font-bold mt-0.5 inline-block bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {booking.organizationOrGuests}
                  </span>
                </div>
              )}

              {booking.invitationLetter && (
                <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block">Surat Undangan / Izin Kegiatan:</span>
                    <span className="text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                      {booking.invitationLetter.name}
                    </span>
                  </div>
                  {booking.invitationLetter.dataUrl && (
                    <a
                      href={booking.invitationLetter.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                    >
                      Buka File Surat
                    </a>
                  )}
                </div>
              )}

              {booking.notes && (
                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-400 block">Catatan Logistik / Fasilitas:</span>
                  <p className="text-slate-700 italic mt-0.5">"{booking.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Booking</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit & Approval Modal Trigger */}
      {isEditApprovalOpen && (
        <BookingEditApprovalModal
          booking={booking}
          onClose={() => setIsEditApprovalOpen(false)}
          onSuccess={() => {
            setIsEditApprovalOpen(false);
            if (onStatusChanged) onStatusChanged();
            onClose();
          }}
        />
      )}

      {/* WhatsApp Notification Modal */}
      {isWaModalOpen && (
        <WhatsAppNotificationModal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          booking={booking}
          type="STATUS_UPDATE"
          newStatus={waStatusTarget || booking.status}
          adminNotes={waAdminNotes}
          adminName={adminName}
        />
      )}
    </>
  );
};

