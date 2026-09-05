import React from 'react';
import { Booking, BookingStatus } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { formatDateIndo, formatDuration, getTodayDateString } from '../../utils/timeUtils';
import { StatusBadge } from '../common/StatusBadge';
import { 
  CalendarDays, 
  CalendarCheck2, 
  Clock, 
  Users, 
  AlertCircle, 
  ArrowUpRight, 
  Cookie, 
  Soup, 
  Utensils, 
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin
} from 'lucide-react';

interface DashboardOverviewProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onNavigateToRekap: () => void;
  onNavigateToBooking: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  bookings,
  onSelectBooking,
  onNavigateToRekap,
  onNavigateToBooking
}) => {
  const todayStr = getTodayDateString();
  
  // Calculate tomorrow date string
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Stats calculation
  const todayBookings = bookings.filter(b => b.meetingDate === todayStr);
  const tomorrowBookings = bookings.filter(b => b.meetingDate === tomorrowStr);
  const pendingBookings = bookings.filter(b => b.status === 'BOOKED');
  
  // Total participants in active bookings (excluding cancelled)
  const totalPesertaAll = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (Number(b.participantCount) || 0), 0);

  // Today Rekap for snack consumption
  const todayRekap = bookingStorage.getRekap(todayStr);

  // Booking terdekat (upcoming sorted by date and time, today or future)
  const sortedUpcoming = [...bookings]
    .sort((a, b) => {
      const dateA = `${a.meetingDate} ${a.startTime}`;
      const dateB = `${b.meetingDate} ${b.startTime}`;
      return dateA.localeCompare(dateB);
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Pusat Pengelolaan Booking & Konsumsi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dashboard Operasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Pantau jadwal ruang meeting hari ini ({formatDateIndo(todayStr)}) dan alokasi konsumsi peserta secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-quick-rekap"
              onClick={onNavigateToRekap}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Lihat Rekap Konsumsi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards (Prompt 2 requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. Booking Hari Ini */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Booking Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {todayBookings.length}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              {todayBookings.filter(b => b.status === 'CONFIRMED').length} terkonfirmasi
            </span>
          </div>
        </div>

        {/* 2. Booking Besok */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Booking Besok</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {tomorrowBookings.length}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Jadwal esok hari
            </span>
          </div>
        </div>

        {/* 3. Total Booking */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Booking</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {bookings.length}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Seluruh data sistem
            </span>
          </div>
        </div>

        {/* 4. Total Peserta */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Peserta</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {totalPesertaAll}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Orang teralokasi
            </span>
          </div>
        </div>

        {/* 5. Belum Dikonfirmasi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Perlu Konfirmasi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {pendingBookings.length}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Status BOOKED
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Ringkasan Konsumsi Hari Ini & Booking Terdekat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ringkasan Konsumsi Hari Ini (Prompt 2 requirement) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:col-span-1 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Ringkasan Konsumsi Hari Ini
                </h3>
                <p className="text-xs text-slate-500">
                  {formatDateIndo(todayStr, false)} • {todayRekap.totalPeserta} Peserta
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToRekap}
                className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Rekap Detail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Snack Ringan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase">
                  <Cookie className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Snack Ringan</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Snack Mix Basah Kering:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.snackRingan['Snack Mix Basah Kering']} porsi
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Snack Sehat Rebusan:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.snackRingan['Snack Sehat Rebusan']} porsi
                    </strong>
                  </div>
                </div>
              </div>

              {/* Snack Berat */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                  <Soup className="w-3.5 h-3.5 text-amber-600" />
                  <span>Snack Berat</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Baso:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.snackBerat['Baso'] || 0} porsi
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Sate Padang:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {(todayRekap.snackBerat['Sate Padang'] || 0) + (todayRekap.snackBerat['Sate'] || 0)} porsi
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Soto:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.snackBerat['Soto'] || 0} porsi
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Siomay / Batagor:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.snackBerat['Siomay / Batagor'] || 0} porsi
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Nasi Uduk:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.snackBerat['Nasi Uduk'] || 0} porsi
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Nasi Goreng:</span>
                    <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.snackBerat['Nasi Goreng'] || 0} porsi
                    </strong>
                  </div>
                </div>
              </div>

              {/* Makan Siang */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Makan Siang</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Iya (Perlu Makan Siang):</span>
                    <strong className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {todayRekap.makanSiang['Iya']} porsi
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tidak (Hanya Snack):</span>
                    <strong className="text-slate-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {todayRekap.makanSiang['Tidak']} peserta
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            *Dihitung otomatis dari peserta meeting aktif (tanpa CANCELLED)
          </div>
        </div>

        {/* Booking Terdekat (Prompt 2 requirement) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Booking Terdekat
              </h3>
              <p className="text-xs text-slate-500">
                Daftar meeting terdekat berdasarkan tanggal dan jam pelaksanaan.
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToBooking}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Semua Booking ({bookings.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table / List on mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px]">
                  <th className="pb-3">Nomor Booking</th>
                  <th className="pb-3">Jadwal & Jam</th>
                  <th className="pb-3">Nama Meeting</th>
                  <th className="pb-3">Lokasi</th>
                  <th className="pb-3 text-center">Peserta</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedUpcoming.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectBooking(item)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-mono font-bold text-indigo-900 text-xs">
                      {item.bookingNumber}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.startTime} - {item.endTime}</div>
                      <div className="text-xs text-slate-400">{formatDateIndo(item.meetingDate, false)}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.meetingTitle}</div>
                      <div className="text-xs text-slate-500">{item.bookerName} ({item.department})</div>
                    </td>
                    <td className="py-3 text-xs text-slate-600">
                      {item.meetingLocation.split('-')[0]}
                    </td>
                    <td className="py-3 text-center font-bold text-slate-800">
                      {item.participantCount}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
