import React, { useState } from 'react';
import { Booking } from '../../types';
import { formatDateIndo, formatDuration, getTodayDateString } from '../../utils/timeUtils';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  UtensilsCrossed 
} from 'lucide-react';

interface MeetingCalendarProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  bookings,
  onSelectBooking
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed (7 = August)

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Bookings for selected date
  const selectedDayBookings = bookings.filter(b => b.meetingDate === selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Kalender Jadwal Meeting
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Visualisasi jadwal penggunaan ruangan dan alokasi konsumsi setiap tanggal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const today = getTodayDateString();
            setSelectedDate(today);
            const [y, m] = today.split('-').map(Number);
            setCurrentYear(y);
            setCurrentMonth(m - 1);
          }}
          className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
        >
          Lompat ke Hari Ini
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center font-bold text-[11px] text-slate-400 uppercase pb-2">
            <div>Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank tiles before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 bg-slate-50/50 rounded-xl border border-transparent" />
            ))}

            {/* Days in current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayBookings = bookings.filter(b => b.meetingDate === dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === getTodayDateString();

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                      : isToday
                      ? 'border-indigo-300 bg-white'
                      : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isSelected
                        ? 'text-indigo-900'
                        : isToday
                        ? 'text-indigo-600'
                        : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* Booking mini indicator dots */}
                  {dayBookings.length > 0 && (
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="text-[10px] font-medium text-slate-600 truncate hidden sm:block">
                        {dayBookings[0].meetingTitle}
                      </div>
                      {dayBookings.length > 1 && (
                        <div className="text-[9px] text-slate-400 hidden sm:block">
                          +{dayBookings.length - 1} lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                  Agenda Terjadwal
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {formatDateIndo(selectedDate)}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {selectedDayBookings.length} Rapat
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs sm:text-sm">
                    Tidak ada meeting pada tanggal ini.
                  </p>
                </div>
              ) : (
                selectedDayBookings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectBooking(item)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-900">
                        {item.startTime} - {item.endTime} WIB
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {item.meetingTitle}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Lokasi:</span>
                        <span className="text-slate-700 font-medium">{item.meetingLocation.split('-')[0]}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Peserta:</span>
                        <span className="text-slate-700 font-bold">{item.participantCount} orang</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            Klik jadwal meeting untuk melihat rincian konsumsi & PIC.
          </div>
        </div>
      </div>
    </div>
  );
};
