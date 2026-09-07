import React, { useState, useRef } from 'react';
import { BookingFormData, AttachedDocument } from '../../types';
import { 
  calculateEndTime, 
  formatDateIndo, 
  formatDuration 
} from '../../utils/timeUtils';
import { 
  User, 
  Building, 
  Phone, 
  MapPin, 
  Users, 
  FileText, 
  ArrowLeft, 
  UploadCloud,
  FileCheck,
  Trash2,
  Paperclip,
  CheckCircle2,
  Calendar,
  Clock,
  UtensilsCrossed,
  Sparkles,
  HelpCircle,
  X,
  Send,
  AlertCircle
} from 'lucide-react';

interface Step3PemesanProps {
  formData: BookingFormData;
  onChange: (field: keyof BookingFormData, value: any) => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const DEPARTMENTS = [
  'Operasi',
  'Pemeliharaan',
  'Enjiniring',
  'Coal & Ash Handling',
  'Keuangan & Umum',
  'K3 & Keamanan',
  'Lingkungan',
  'Pengadaan'
];

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const Step3Pemesan: React.FC<Step3PemesanProps> = ({
  formData,
  onChange,
  onBack,
  onConfirm,
  isSubmitting = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const endTime = calculateEndTime(formData.startTime, formData.durationHours);

  const isFormValid = Boolean(
    formData.bookerName.trim() &&
    formData.department.trim() &&
    formData.whatsapp.trim() &&
    formData.meetingTitle.trim() &&
    formData.participantCount > 0
  );

  const handleProcessFile = (file: File) => {
    setUploadError(null);
    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    if (file.size > MAX_SIZE) {
      setUploadError('Ukuran file maksimal adalah 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const attachedDoc: AttachedDocument = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string
      };
      onChange('invitationLetter', attachedDoc);
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onChange('invitationLetter', null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFinalSubmit = () => {
    if (!isAgreed) return;
    setShowConfirmModal(false);
    setIsAgreed(false);
    onConfirm();
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full">
      {/* 1. Form Input Data Pemesan & Agenda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 w-full max-w-full">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Tahap 3 dari 3
              </span>
              <span className="text-xs text-slate-500 font-medium">Data Pemesan & Konfirmasi</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate mt-0.5">
              Data Pemesan & Agenda Pertemuan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Lengkapi identitas PIC dan tinjau ringkasan sebelum mengirimkan permohonan reservasi.
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {/* Row 1: Nama Pemesan & Divisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-booker-name" className="block text-sm font-bold text-slate-800 mb-1">
                Nama Pemesan (PIC) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-booker-name"
                placeholder="Contoh: Budi Santoso"
                value={formData.bookerName}
                onChange={(e) => onChange('bookerName', e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label htmlFor="select-department" className="block text-sm font-bold text-slate-800 mb-1">
                Departemen / Divisi <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-department"
                value={formData.department}
                onChange={(e) => onChange('department', e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              >
                <option value="">Pilih Departemen...</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: WhatsApp & Judul Acara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-whatsapp" className="block text-sm font-bold text-slate-800 mb-1">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                id="input-whatsapp"
                placeholder="Contoh: 081234567890"
                value={formData.whatsapp}
                onChange={(e) => onChange('whatsapp', e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">Untuk koordinasi konfirmasi logistik konsumsi.</p>
            </div>

            <div>
              <label htmlFor="input-meeting-title" className="block text-sm font-bold text-slate-800 mb-1">
                Nama Kegiatan / Agenda Rapat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-meeting-title"
                placeholder="Contoh: Rapat Koordinasi Boiler #1"
                value={formData.meetingTitle}
                onChange={(e) => onChange('meetingTitle', e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Row 3: Tamu / Instansi Eksternal */}
          <div>
            <label htmlFor="input-organization-guests" className="block text-sm font-bold text-slate-800 mb-1">
              Instansi / Tamu Eksternal (Opsional)
            </label>
            <input
              type="text"
              id="input-organization-guests"
              placeholder="Contoh: Tim Vendor PT Siemens / Tamu PLN Kantor Pusat"
              value={formData.organizationOrGuests || ''}
              onChange={(e) => onChange('organizationOrGuests', e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Row 4: Upload Surat Undangan */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              Upload Nota Dinas / Surat Undangan (Opsional, Max 1 MB)
            </label>

            {!formData.invitationLetter ? (
              <div
                id="dropzone-invitation-letter"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-100/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="input-invitation-file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Klik untuk unggah <span className="font-normal text-slate-500">atau drag & drop file di sini</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Format didukung: PDF, Word (DOCX), atau Gambar (Maks. 1 MB)
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {formData.invitationLetter.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(formData.invitationLetter.size)} • Dokumen Terlampir
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                  title="Hapus Dokumen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-rose-600 mt-1 font-semibold">
                ⚠️ {uploadError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Review & Live Summary Cards */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 w-full max-w-full">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Ringkasan Reservasi Rapat
            </h3>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
            Verifikasi Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Card 1: Jadwal & Ruangan */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 pb-1.5 border-b border-slate-100">
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwal & Ruangan</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 block">Tanggal</span>
                <span className="font-bold text-slate-900">{formatDateIndo(formData.meetingDate)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Waktu</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formData.startTime} - {endTime} WIB
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Ruangan</span>
              <span className={`font-bold inline-block px-2 py-0.5 rounded-md text-xs mt-0.5 ${
                formData.meetingLocation === 'Tidak menggunakan ruang meeting'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {formData.meetingLocation === 'Tidak menggunakan ruang meeting'
                  ? 'Tanpa Ruang Meeting'
                  : `🏢 ${formData.meetingLocation}`}
              </span>
            </div>
          </div>

          {/* Card 2: Konsumsi & Peserta */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 pb-1.5 border-b border-slate-100">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Konsumsi ({formData.participantCount} Porsi)</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Snack:</span>
                <span className="font-bold text-slate-900">
                  {formData.snackRingan !== 'Tidak Ada' 
                    ? formData.snackRingan 
                    : formData.snackBerat !== 'Tidak Ada'
                    ? formData.snackBerat
                    : 'Tidak Pesan Snack'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Makan Siang:</span>
                <span className={`font-bold ${
                  formData.makanSiang === 'Iya' ? 'text-emerald-700' : 'text-slate-600'
                }`}>
                  {formData.makanSiang === 'Iya' ? '✓ Disediakan (Prasmanan/Box)' : 'Tidak Ada'}
                </span>
              </div>
              {formData.notes && (
                <div className="pt-1 text-[11px] text-slate-500 italic">
                  Note: "{formData.notes}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Submit Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          id="btn-step3-back"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Konsumsi</span>
        </button>

        <button
          type="button"
          id="btn-step3-submit"
          onClick={() => {
            setIsAgreed(false);
            setShowConfirmModal(true);
          }}
          disabled={!isFormValid || isSubmitting}
          className={`flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
            isFormValid && !isSubmitting
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-2 ring-emerald-500/20'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Mengirim...' : 'Konfirmasi & Kirim Booking'}</span>
        </button>
      </div>

      {/* Modal Konfirmasi Akhir */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <HelpCircle className="w-5 h-5" />
                <span>Konfirmasi Pemesanan</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setIsAgreed(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Apakah Anda yakin data pemesanan ruang rapat dan konsumsi untuk kegiatan <strong className="text-slate-900">"{formData.meetingTitle}"</strong> sudah benar?
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>📅 <strong>{formatDateIndo(formData.meetingDate)}</strong> ({formData.startTime} - {endTime} WIB)</div>
              <div>🏢 <strong>{formData.meetingLocation === 'Tidak menggunakan ruang meeting' ? 'Tanpa Ruangan' : formData.meetingLocation}</strong></div>
              <div>👥 <strong>{formData.participantCount} Peserta</strong> ({formData.snackRingan !== 'Tidak Ada' ? formData.snackRingan : formData.snackBerat !== 'Tidak Ada' ? formData.snackBerat : 'Tanpa Snack'} {formData.makanSiang === 'Iya' ? '+ Makan Siang' : ''})</div>
            </div>

            {/* Keterangan & Checklist Persetujuan Peninjauan Admin */}
            <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200/90 text-amber-950 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed font-medium text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Permohonan ruangan dan konsumsi akan ditinjau dan dievaluasi kembali oleh admin</span>
              </div>
              <label 
                htmlFor="checkbox-paham-evaluasi"
                className="flex items-center gap-2.5 pt-2 border-t border-amber-200/70 cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  id="checkbox-paham-evaluasi"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-amber-400 cursor-pointer accent-emerald-600"
                />
                <span className="text-xs sm:text-sm font-semibold text-amber-950 group-hover:text-amber-900 transition-colors">
                  ya, mengerti
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="btn-confirm-cancel"
                onClick={() => {
                  setShowConfirmModal(false);
                  setIsAgreed(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cek Lagi
              </button>
              <button
                type="button"
                id="btn-confirm-submit"
                onClick={handleFinalSubmit}
                disabled={!isAgreed || isSubmitting}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5 ${
                  isAgreed && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-2 ring-emerald-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/50 shadow-none'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses...' : 'Ya, kirim sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
