import React from 'react';
import { BookingFormData, Booking } from '../../types';
import { calculateEndTime, formatDateIndo, formatDuration, checkRoomConflict, isEligibleForMakanSiang } from '../../utils/timeUtils';
import { RoomAgendaCalendar, NO_ROOM_VALUE } from './RoomAgendaCalendar';
import { bookingStorage } from '../../services/bookingStorage';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Building, 
  Lock, 
  AlertTriangle,
  Layers,
  UtensilsCrossed,
  Sparkles,
  Check
} from 'lucide-react';

interface Step1JadwalRuanganProps {
  formData: BookingFormData;
  onChange: (field: keyof BookingFormData, value: any) => void;
  onNext: () => void;
}

export const Step1JadwalRuangan: React.FC<Step1JadwalRuanganProps> = ({
  formData,
  onChange,
  onNext
}) => {
  const allBookings: Booking[] = bookingStorage.getAll();
  const endTime = calculateEndTime(formData.startTime, formData.durationHours);

  // Check conflict for currently selected room
  const roomConflict = checkRoomConflict(
    formData.meetingLocation,
    formData.meetingDate,
    formData.startTime,
    formData.durationHours,
    allBookings
  );

  const isNoRoom = formData.meetingLocation === NO_ROOM_VALUE;
  const isRoomSelected = Boolean(formData.meetingLocation);
  const isComplete = isRoomSelected && (isNoRoom || !roomConflict.isLocked);

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Step Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 w-full max-w-full">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Tahap 1 dari 3
              </span>
              <span className="text-xs text-slate-500 font-medium">Jadwal & Ruang Rapat</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate mt-0.5">
              Pilih Tanggal, Jam & Ruangan Meeting
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih tanggal di kalender, geser kotak jam rapat, atur durasi, dan pilih ruangan meeting yang tersedia.
            </p>
          </div>
        </div>

        {/* Embedded Interactive Room Agenda Calendar & Timeline */}
        <div className="w-full">
          <RoomAgendaCalendar
            selectedRoom={formData.meetingLocation}
            onSelectRoom={(room) => onChange('meetingLocation', room)}
            bookingDate={formData.meetingDate}
            startTime={formData.startTime}
            durationHours={formData.durationHours}
            onDateChange={(newDate) => onChange('meetingDate', newDate)}
            onTimeChange={(newStartTime, newDuration) => {
              onChange('startTime', newStartTime);
              onChange('durationHours', newDuration);
              const lunchCheck = isEligibleForMakanSiang(newStartTime, newDuration);
              if (lunchCheck.isEligible && formData.makanSiang === 'Tidak') {
                onChange('makanSiang', 'Iya');
              }
            }}
          />
        </div>
      </div>

      {/* Selected Summary Card & Navigation Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pilihan Anda Saat Ini:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-semibold">
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
              📅 {formatDateIndo(formData.meetingDate)}
            </span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg font-mono">
              ⏰ {formData.startTime} - {endTime} WIB ({formatDuration(formData.durationHours)})
            </span>
            {isRoomSelected ? (
              <span className={`px-2.5 py-1 rounded-lg font-bold ${
                isNoRoom 
                  ? 'bg-emerald-600/90 text-white' 
                  : roomConflict.isLocked
                  ? 'bg-rose-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}>
                🏢 {isNoRoom ? 'Tanpa Ruang Meeting' : formData.meetingLocation}
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                ⚠️ Belum memilih ruangan / opsi
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          id="btn-step1-next"
          onClick={onNext}
          disabled={!isComplete}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 ${
            isComplete
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer ring-2 ring-indigo-400/30'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <span>Lanjut ke Konsumsi & Peserta</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
