import React, { useState } from 'react';
import { Booking, BookingStatus, SnackRingan, SnackBerat, MakanSiang } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { authStorage } from '../../services/authStorage';
import { calculateEndTime, formatDateIndo, formatDuration, isEligibleForMakanSiang } from '../../utils/timeUtils';
import { getBookingAttachments, formatFileSize } from '../../utils/fileUtils';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Calendar, 
  Clock, 
  MapPin, 
  UtensilsCrossed, 
  Users, 
  Phone, 
  Building2, 
  CheckCheck,
  FileCheck,
  FileText,
  AlertCircle,
  Save,
  MessageSquare
} from 'lucide-react';

interface BookingEditApprovalModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: (message?: string) => void;
}

const DEPARTMENTS = [
  'Operasi',
  'Pemeliharaan',
  'Enjiniring',
  'Coal & Ash Handling',
  'Keuangan & Umum',
  'K3 & Keamanan',
  'Lingkungan',
  'Pengadaan',
  'Sistem Manajemen Terintegrasi'
];

const MEETING_ROOMS = [
  'War room lt. 3',
  'Ruang integritas lt. 2',
  'Room meeting KU lt. 1',
  'Room meeting Har',
  'Tidak menggunakan ruang meeting'
];

const DURATION_OPTIONS = [
  { value: 1, label: '1 Jam' },
  { value: 1.5, label: '1.5 Jam' },
  { value: 2, label: '2 Jam' },
  { value: 2.5, label: '2.5 Jam' },
  { value: 3, label: '3 Jam' },
  { value: 4, label: '4 Jam (Setengah Hari)' },
  { value: 6, label: '6 Jam' },
  { value: 8, label: '8 Jam (Seharian Penuh)' }
];

export const BookingEditApprovalModal: React.FC<BookingEditApprovalModalProps> = ({
  booking,
  onClose,
  onSuccess
}) => {
  if (!booking) return null;

  const currentUser = authStorage.getCurrentUser();
  const adminName = currentUser?.name || 'Administrator Utama';

  // Form State initialized from booking
  const [meetingTitle, setMeetingTitle] = useState(booking.meetingTitle);
  const [meetingDate, setMeetingDate] = useState(booking.meetingDate);
  const [startTime, setStartTime] = useState(booking.startTime);
  const [durationHours, setDurationHours] = useState<number>(booking.durationHours);
  const [meetingLocation, setMeetingLocation] = useState(booking.meetingLocation);
  
  // Consumption State
  const [snackRingan, setSnackRingan] = useState<SnackRingan>(booking.snackRingan);
  const [snackBerat, setSnackBerat] = useState<SnackBerat>(booking.snackBerat);
  const [makanSiang, setMakanSiang] = useState<MakanSiang>(booking.makanSiang);
  const [participantCount, setParticipantCount] = useState<number>(booking.participantCount);

  // PIC Info
  const [bookerName, setBookerName] = useState(booking.bookerName);
  const [department, setDepartment] = useState(booking.department);
  const [whatsapp, setWhatsapp] = useState(booking.whatsapp);
  const [organizationOrGuests, setOrganizationOrGuests] = useState(booking.organizationOrGuests || '');
  const [notes, setNotes] = useState(booking.notes || '');

  // Approval specific fields
  const [approvalNotes, setApprovalNotes] = useState(booking.approvalNotes || '');
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Calculate live end time
  const calculatedEndTime = calculateEndTime(startTime, durationHours);

  // Handle Save with immediate Approval (CONFIRMED)
  const handleApproveWithEdits = (e: React.FormEvent) => {
    e.preventDefault();

    const edits: Partial<Booking> = {
      meetingTitle,
      meetingDate,
      startTime,
      durationHours,
      meetingLocation,
      snackRingan,
      snackBerat,
      makanSiang,
      participantCount: Number(participantCount) || 1,
      bookerName,
      department,
      whatsapp,
      organizationOrGuests: organizationOrGuests.trim() || undefined,
      notes,
      approvalNotes: approvalNotes.trim() || 'Disetujui oleh Pengelola Konsumsi & Ruangan.'
    };

    bookingStorage.approveWithEdits(booking.id, edits, adminName, edits.approvalNotes);
    onSuccess(`Permohonan ${booking.bookingNumber} berhasil DISETUJUI (CONFIRMED) beserta perubahan data.`);
    onClose();
  };

  // Handle Save Changes Only (Without changing status to CONFIRMED if already COMPLETED or CANCELLED)
  const handleSaveChangesOnly = () => {
    const edits: Partial<Booking> = {
      meetingTitle,
      meetingDate,
      startTime,
      durationHours,
      meetingLocation,
      snackRingan,
      snackBerat,
      makanSiang,
      participantCount: Number(participantCount) || 1,
      bookerName,
      department,
      whatsapp,
      organizationOrGuests: organizationOrGuests.trim() || undefined,
      notes,
      approvalNotes: approvalNotes.trim() || booking.approvalNotes,
      status
    };

    bookingStorage.update(booking.id, edits);
    onSuccess(`Perubahan data booking ${booking.bookingNumber} berhasil disimpan.`);
    onClose();
  };

  // Handle Reject
  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Mohon tuliskan alasan penolakan/pembatalan permohonan.');
      return;
    }

    bookingStorage.updateStatus(booking.id, 'CANCELLED', `Ditolak/Dibatalkan: ${rejectReason.trim()}`, adminName);
    onSuccess(`Permohonan ${booking.bookingNumber} telah DITOLAK / DIBATALKAN.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-indigo-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {booking.bookingNumber}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-semibold">
                Status Saat Ini: <strong className="text-amber-300">{booking.status}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <span>Verifikasi, Edit & Approval Permohonan Konsumsi</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Approval Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="text-xs text-indigo-950">
              <span className="font-bold block text-sm">Mode Edit saat Persetujuan (Approval)</span>
              <span>
                Sebagai admin, Anda dapat menyesuaikan jadwal, pilihan snack, porsi, maupun lokasi rapat sebelum memberikan konfirmasi persetujuan kepada pemesan.
              </span>
            </div>
          </div>

          <form id="form-edit-approval" onSubmit={handleApproveWithEdits} className="space-y-6">
            {/* Section 1: Data Rapat & Waktu */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-2 border-b border-slate-200">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>1. Judul & Waktu Rapat</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Agenda / Judul Rapat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  required
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Tanggal Rapat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Jam Mulai (WIB) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Durasi Rapat
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Estimasi Waktu Selesai:</span>
                <strong className="text-indigo-700 font-mono text-xs sm:text-sm">
                  {startTime} - {calculatedEndTime} WIB ({formatDuration(durationHours)})
                </strong>
              </div>
            </div>

            {/* Section 2: Ruangan & Peserta */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-2 border-b border-slate-200">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>2. Lokasi Ruangan & Jumlah Peserta</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Lokasi Meeting <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    required
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  >
                    {MEETING_ROOMS.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Jumlah Peserta (Porsi Konsumsi) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={participantCount}
                      onChange={(e) => setParticipantCount(parseInt(e.target.value) || 1)}
                      required
                      className="w-full py-2 pl-3 pr-12 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Orang
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Menu Konsumsi */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-2 border-b border-slate-200">
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                <span>3. Paket Menu Konsumsi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Snack Ringan */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Snack Ringan
                  </label>
                  <select
                    value={snackRingan}
                    onChange={(e) => {
                      const val = e.target.value as SnackRingan;
                      setSnackRingan(val);
                      if (val !== 'Tidak Ada') {
                        setSnackBerat('Tidak Ada');
                      }
                    }}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Snack Mix Basah Kering">Snack Mix Basah Kering</option>
                    <option value="Snack Sehat Rebusan">Snack Sehat Rebusan</option>
                    <option value="Tidak Ada">Tidak Ada (Pilih Snack Berat)</option>
                  </select>
                </div>

                {/* Snack Berat */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Snack Berat
                  </label>
                  <select
                    value={snackBerat}
                    onChange={(e) => {
                      const val = e.target.value as SnackBerat;
                      setSnackBerat(val);
                      if (val !== 'Tidak Ada') {
                        setSnackRingan('Tidak Ada');
                      }
                    }}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Baso">Baso</option>
                    <option value="Sate Padang">Sate Padang</option>
                    <option value="Soto">Soto</option>
                    <option value="Siomay / Batagor">Siomay / Batagor</option>
                    <option value="Nasi Uduk">Nasi Uduk</option>
                    <option value="Nasi Goreng">Nasi Goreng</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                </div>

                {/* Makan Siang */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                      Makan Siang
                    </label>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isEligibleForMakanSiang(startTime, durationHours).isEligible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isEligibleForMakanSiang(startTime, durationHours).isEligible ? 'Memenuhi Syarat' : 'Jadwal < 4 Jam / < 12:00'}
                    </span>
                  </div>
                  <select
                    value={makanSiang}
                    onChange={(e) => setMakanSiang(e.target.value as MakanSiang)}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Iya">Iya (Disediakan)</option>
                    <option value="Tidak">Tidak Disediakan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: PIC Pemesan & Catatan */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-2 border-b border-slate-200">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>4. PIC Pemesan & Logistik</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Nama Pemesan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookerName}
                    onChange={(e) => setBookerName(e.target.value)}
                    required
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Departemen / Divisi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    WhatsApp PIC <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  />
                </div>
              </div>

              {/* Organisasi / Tamu yang Hadir */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Nama Organisasi / Tamu yang Hadir (Pihak Eksternal)
                </label>
                <input
                  type="text"
                  value={organizationOrGuests}
                  onChange={(e) => setOrganizationOrGuests(e.target.value)}
                  placeholder="Contoh: PT PLN Nusantara Power, Siemens Energy, atau Tim Auditor"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>

              {/* File Pendukung / Surat Undangan Terlampir */}
              {getBookingAttachments(booking).length > 0 && (
                <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">
                    File Pendukung / Surat Undangan Terlampir ({getBookingAttachments(booking).length}):
                  </span>
                  <div className="space-y-1.5">
                    {getBookingAttachments(booking).map((doc, idx) => (
                      <div key={doc.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-[300px]">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({formatFileSize(doc.size)})
                          </span>
                        </div>
                        {doc.dataUrl && (
                          <a
                            href={doc.dataUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-md border border-indigo-200 text-[11px] shrink-0"
                          >
                            Buka File
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Catatan Pemesan / Kebutuhan Fasilitas
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kebutuhan proyektor, mic, dll..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>

              {/* Approval Notes from Admin */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Catatan Persetujuan / Catatan Dapur / Pantry (Admin)</span>
                </label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="misal: Siap dihidangkan jam 09:30 di War Room lt. 3"
                  className="w-full py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs font-medium text-indigo-950 focus:bg-white"
                />
              </div>
            </div>

            {/* Rejection box if triggered */}
            {isRejecting && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Konfirmasi Penolakan / Pembatalan Permohonan</span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-rose-900 block">
                    Alasan Penolakan (akan dicatat dalam riwayat booking): <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="misal: Ruangan bentrok dengan acara VIP, atau melebihi kuota konsumsi..."
                    className="w-full py-2 px-3 rounded-xl border border-rose-300 bg-white text-xs font-medium text-rose-950 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Ya, Tolak Permohonan Ini
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isRejecting && booking.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak / Batalkan</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveChangesOnly}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Simpan Perubahan Saja</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>

            {booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED' ? (
              <button
                type="submit"
                form="form-edit-approval"
                id="btn-confirm-approve-with-edits"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui Permohonan (Approve)</span>
              </button>
            ) : (
              <button
                type="submit"
                form="form-edit-approval"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Perbarui Data & Simpan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
