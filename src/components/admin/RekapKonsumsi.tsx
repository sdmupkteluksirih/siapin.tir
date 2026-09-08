import React, { useState } from 'react';
import { Booking, RekapHarian } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { formatDateIndo, formatDuration, getTodayDateString } from '../../utils/timeUtils';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Calendar, 
  Printer, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  UtensilsCrossed, 
  Cookie, 
  Soup, 
  Utensils, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  CalendarRange,
  X,
  Filter,
  Check
} from 'lucide-react';

interface RekapKonsumsiProps {
  onSelectBooking?: (booking: Booking) => void;
}

export const RekapKonsumsi: React.FC<RekapKonsumsiProps> = ({
  onSelectBooking
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [printMode, setPrintMode] = useState<'rekap' | 'detail' | null>(null);

  // Export CSV Modal state with date range
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportStartDate, setExportStartDate] = useState<string>(selectedDate);
  const [exportEndDate, setExportEndDate] = useState<string>(selectedDate);
  const [exportStatusFilter, setExportStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'ACTIVE'>('ALL');

  const rekap: RekapHarian = bookingStorage.getRekap(selectedDate);
  const activeBookings = rekap.bookings.filter(b => b.status !== 'CANCELLED');
  const cancelledBookings = rekap.bookings.filter(b => b.status === 'CANCELLED');

  // Change date helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayDateString());
  };

  const handlePrintRekap = () => {
    setPrintMode('rekap');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleOpenExportModal = () => {
    setExportStartDate(selectedDate);
    setExportEndDate(selectedDate);
    setIsExportModalOpen(true);
  };

  // Quick preset dates for Export
  const handlePresetExport = (preset: 'selected' | 'today' | '7days' | 'month' | 'all') => {
    const today = getTodayDateString();
    if (preset === 'selected') {
      setExportStartDate(selectedDate);
      setExportEndDate(selectedDate);
    } else if (preset === 'today') {
      setExportStartDate(today);
      setExportEndDate(today);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setExportStartDate(d.toISOString().split('T')[0]);
      setExportEndDate(today);
    } else if (preset === 'month') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      setExportStartDate(`${year}-${month}-01`);
      setExportEndDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
    } else if (preset === 'all') {
      const all = bookingStorage.getAll();
      if (all.length > 0) {
        const sorted = all.map(b => b.meetingDate).sort();
        setExportStartDate(sorted[0]);
        setExportEndDate(sorted[sorted.length - 1]);
      }
    }
  };

  // Matching bookings in export range
  const allBookings = bookingStorage.getAll();
  const exportBookings = allBookings
    .filter(b => {
      if (exportStartDate && b.meetingDate < exportStartDate) return false;
      if (exportEndDate && b.meetingDate > exportEndDate) return false;
      if (exportStatusFilter === 'CONFIRMED' && b.status !== 'CONFIRMED') return false;
      if (exportStatusFilter === 'ACTIVE' && b.status === 'CANCELLED') return false;
      return true;
    })
    .sort((a, b) => {
      if (a.meetingDate !== b.meetingDate) {
        return a.meetingDate.localeCompare(b.meetingDate);
      }
      return a.startTime.localeCompare(b.startTime);
    });

  const exportTotalPeserta = exportBookings.reduce((acc, b) => acc + (b.status !== 'CANCELLED' ? b.participantCount : 0), 0);
  const exportTotalMakanSiang = exportBookings.filter(b => b.status !== 'CANCELLED' && b.makanSiang === 'Iya').reduce((acc, b) => acc + b.participantCount, 0);

  const executeExportCSV = () => {
    if (exportBookings.length === 0) {
      alert('Tidak ada data meeting yang sesuai dengan rentang tanggal dan filter yang dipilih.');
      return;
    }

    const headers = [
      'No',
      'Nomor Booking',
      'Tanggal Meeting',
      'Jam Mulai',
      'Jam Selesai',
      'Durasi (Jam)',
      'Nama Meeting',
      'PIC / Pemesan',
      'Divisi / Bagian',
      'No. WhatsApp',
      'Tamu / Organisasi Luar',
      'Lokasi Ruangan',
      'Jumlah Peserta',
      'Snack Ringan',
      'Snack Berat',
      'Makan Siang',
      'Catatan',
      'Status'
    ];

    const rows = exportBookings.map((b, idx) => [
      idx + 1,
      `"${b.bookingNumber}"`,
      `"${b.meetingDate}"`,
      `"${b.startTime}"`,
      `"${b.endTime}"`,
      b.durationHours,
      `"${b.meetingTitle.replace(/"/g, '""')}"`,
      `"${b.bookerName.replace(/"/g, '""')}"`,
      `"${b.department.replace(/"/g, '""')}"`,
      `"${b.whatsapp}"`,
      `"${(b.organizationOrGuests || '-').replace(/"/g, '""')}"`,
      `"${b.meetingLocation.replace(/"/g, '""')}"`,
      b.participantCount,
      `"${b.snackRingan}"`,
      `"${b.snackBerat}"`,
      `"${b.makanSiang}"`,
      `"${(b.notes || '-').replace(/"/g, '""')}"`,
      `"${b.status}"`
    ]);

    // UTF-8 BOM (\uFEFF) ensures Excel handles characters properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filename = exportStartDate === exportEndDate
      ? `Rekap_Konsumsi_${exportStartDate}.csv`
      : `Rekap_Konsumsi_${exportStartDate}_sd_${exportEndDate}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Date Selection & Action Bar (Hidden during print) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Date controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-rekap-prev-day"
              onClick={handlePrevDay}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <input
                type="date"
                id="input-rekap-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="py-2.5 px-3.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              id="btn-rekap-next-day"
              onClick={handleNextDay}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-rekap-today"
              onClick={handleSetToday}
              className="px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 transition-colors"
            >
              Hari Ini
            </button>

            <span className="text-sm font-bold text-slate-700 ml-2 hidden sm:inline">
              {formatDateIndo(selectedDate)}
            </span>
          </div>

          {/* Action Buttons: Cetak Rekap & Export CSV */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-cetak-rekap"
              onClick={handlePrintRekap}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Cetak Rekap</span>
            </button>

            <button
              type="button"
              id="btn-export-csv"
              onClick={handleOpenExportModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINT HEADER FOR A4 PRINTING */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-800 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900">
              FORMULIR REKAPITULASI KONSUMSI MEETING
            </h1>
            <p className="text-sm font-semibold text-slate-600">
              Internal Logistik & Pantry Perusahaan
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Tanggal Rapat:</span>
            <strong className="text-base text-slate-900">{formatDateIndo(selectedDate)}</strong>
          </div>
        </div>
      </div>

      {/* RINGKASAN HARIAN (Prompt 3 requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-slate-800 print:shadow-none space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:border-slate-300">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
              Ringkasan Harian
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Rekap Kebutuhan Konsumsi ({formatDateIndo(selectedDate)})
            </h2>
          </div>
          <div className="text-xs text-slate-500 text-right print:hidden">
            Status: BOOKED, CONFIRMED, COMPLETED
          </div>
        </div>

        {/* Top 2 Big KPI: Total Meeting & Total Peserta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 print:bg-white print:border-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Total Meeting Aktif
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                {rekap.totalMeeting}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500">Rapat</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              (Dikecualikan yang CANCELLED)
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 print:bg-white print:border-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Total Peserta
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700">
                {rekap.totalPeserta}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500">Orang / Porsi</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              Total porsi konsumsi yang harus disiapkan
            </span>
          </div>
        </div>

        {/* 3 Categories Breakdown (Prompt 3 requirement) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 1. SNACK RINGAN */}
          <div className="bg-indigo-50/40 rounded-2xl p-5 border border-indigo-100 print:bg-white print:border-slate-300">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-indigo-100/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Cookie className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
                SNACK RINGAN
              </h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-indigo-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Snack Mix Basah Kering
                  </strong>
                  <span className="text-[11px] text-slate-500">Kue basah + gurih</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-indigo-700">
                    {rekap.snackRingan['Snack Mix Basah Kering']}
                  </span>
                  <span className="text-[11px] text-slate-500 block">peserta</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-indigo-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Snack Sehat Rebusan
                  </strong>
                  <span className="text-[11px] text-slate-500">Aneka rebusan</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-indigo-700">
                    {rekap.snackRingan['Snack Sehat Rebusan']}
                  </span>
                  <span className="text-[11px] text-slate-500 block">peserta</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SNACK BERAT */}
          <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-100 print:bg-white print:border-slate-300">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-amber-100/80">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                <Soup className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950">
                SNACK BERAT
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Baso
                  </strong>
                  <span className="text-[11px] text-slate-500">Kuah kaldu sapi</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {rekap.snackBerat['Baso'] || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 block">porsi</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Sate Padang
                  </strong>
                  <span className="text-[11px] text-slate-500">Kuah kental Minang</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {(rekap.snackBerat['Sate Padang'] || 0) + (rekap.snackBerat['Sate'] || 0)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">porsi</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Soto
                  </strong>
                  <span className="text-[11px] text-slate-500">Kuah bening rempah</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {rekap.snackBerat['Soto'] || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 block">porsi</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Siomay / Batagor
                  </strong>
                  <span className="text-[11px] text-slate-500">Bumbu kacang & limau</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {rekap.snackBerat['Siomay / Batagor'] || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 block">porsi</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Nasi Uduk
                  </strong>
                  <span className="text-[11px] text-slate-500">Nasi gurih komplit</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {rekap.snackBerat['Nasi Uduk'] || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 block">porsi</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Nasi Goreng
                  </strong>
                  <span className="text-[11px] text-slate-500">Nasi goreng spesial</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {rekap.snackBerat['Nasi Goreng'] || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 block">porsi</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MAKAN SIANG */}
          <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-100 print:bg-white print:border-slate-300">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-emerald-100/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950">
                MAKAN SIANG
              </h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-emerald-100/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-emerald-900 block">
                    Iya (Disediakan)
                  </strong>
                  <span className="text-[11px] text-slate-500">Paket buffet / box</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-emerald-700">
                    {rekap.makanSiang['Iya']}
                  </span>
                  <span className="text-[11px] text-slate-500 block">peserta</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-700 block">
                    Tidak (Hanya Snack)
                  </strong>
                  <span className="text-[11px] text-slate-500">Tanpa makan siang</span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-slate-700">
                    {rekap.makanSiang['Tidak']}
                  </span>
                  <span className="text-[11px] text-slate-500 block">peserta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABEL DETAIL MEETING DI BAWAH RINGKASAN (Prompt 3 requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-slate-800 print:shadow-none space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:border-slate-300">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Detail Meeting & Alokasi Konsumsi
            </h3>
            <p className="text-xs text-slate-500">
              Daftar seluruh rapat yang terjadwal pada {formatDateIndo(selectedDate)}.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {rekap.bookings.length} Pertemuan Terdaftar
          </span>
        </div>

        {rekap.bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">
              Tidak ada agenda meeting yang dijadwalkan pada tanggal ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-2">Jam</th>
                  <th className="py-3 px-2">Meeting & PIC</th>
                  <th className="py-3 px-2">Lokasi</th>
                  <th className="py-3 px-2 text-center">Peserta</th>
                  <th className="py-3 px-2">Snack Ringan</th>
                  <th className="py-3 px-2">Snack Berat</th>
                  <th className="py-3 px-2 text-center">Makan Siang</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekap.bookings.map((item) => {
                  const isCancelled = item.status === 'CANCELLED';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectBooking && onSelectBooking(item)}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCancelled ? 'opacity-50 line-through bg-rose-50/20' : 'cursor-pointer'
                      }`}
                    >
                      <td className="py-3.5 px-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.startTime}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900">{item.meetingTitle}</div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span>{item.bookerName} • {item.department}</span>
                          {item.organizationOrGuests && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                              👥 {item.organizationOrGuests}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-xs text-slate-600">
                        {item.meetingLocation.split('-')[0]}
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold text-slate-900">
                        {item.participantCount}
                      </td>
                      <td className="py-3.5 px-2">
                        {item.snackRingan !== 'Tidak Ada' ? (
                          <span className="font-medium text-indigo-900 bg-indigo-50/60 px-2 py-0.5 rounded text-xs">
                            {item.snackRingan}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2">
                        {item.snackBerat !== 'Tidak Ada' ? (
                          <span className="font-medium text-amber-900 bg-amber-50/60 px-2 py-0.5 rounded text-xs">
                            {item.snackBerat}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.makanSiang === 'Iya'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.makanSiang}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right whitespace-nowrap">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures for physical A4 print */}
        <div className="hidden print:grid grid-cols-3 gap-8 pt-12 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-16">Petugas Pantry / Konsumsi</p>
            <p className="font-bold text-slate-800 border-t border-slate-400 pt-1">
              ( ........................................ )
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-16">Koordinator General Affairs</p>
            <p className="font-bold text-slate-800 border-t border-slate-400 pt-1">
              ( ........................................ )
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-16">Supervisor Operasional</p>
            <p className="font-bold text-slate-800 border-t border-slate-400 pt-1">
              ( ........................................ )
            </p>
          </div>
        </div>
      </div>

      {/* Export CSV Range Modal Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Export Data Rekap ke CSV</h3>
                  <p className="text-xs text-slate-300">Tarik data meeting & konsumsi berdasarkan rentang tanggal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 text-slate-700 text-sm">
              {/* Preset Buttons */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Pilihan Cepat Rentang Tanggal
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetExport('today')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetExport('selected')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Hari Terpilih ({selectedDate})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetExport('7days')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    7 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetExport('month')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Bulan Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetExport('all')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Semua Data
                  </button>
                </div>
              </div>

              {/* Date Range Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Dari Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sampai Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={exportEndDate}
                      min={exportStartDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Status */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Filter Status Booking
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportStatusFilter('ALL')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      exportStatusFilter === 'ALL'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Semua Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportStatusFilter('ACTIVE')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      exportStatusFilter === 'ACTIVE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Aktif Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportStatusFilter('CONFIRMED')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      exportStatusFilter === 'CONFIRMED'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Disetujui Saja
                  </button>
                </div>
              </div>

              {/* Data Summary Preview */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-600 block">Total Data Ditemukan:</span>
                  <span className="text-slate-900 font-extrabold text-sm">
                    {exportBookings.length} Jadwal Meeting
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-600 block">Total Peserta & Konsumsi:</span>
                  <span className="text-indigo-700 font-bold">
                    {exportTotalPeserta} Peserta • {exportTotalMakanSiang} Makan Siang
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                id="btn-confirm-export-csv"
                onClick={executeExportCSV}
                disabled={exportBookings.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File CSV ({exportBookings.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
