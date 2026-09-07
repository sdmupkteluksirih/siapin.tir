import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Booking } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { 
  calculateEndTime, 
  formatDateIndo, 
  formatDuration, 
  getTodayDateString, 
  checkRoomConflict,
  isTimeOverlapping 
} from '../../utils/timeUtils';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Users, 
  Sparkles,
  CalendarCheck,
  Check,
  MapPin,
  HelpCircle,
  Layers,
  Info,
  UtensilsCrossed,
  Coffee,
  MoveHorizontal,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  ShieldAlert,
  GripVertical
} from 'lucide-react';

export const NO_ROOM_VALUE = 'Tidak menggunakan ruang meeting';

interface RoomAgendaCalendarProps {
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
  bookingDate: string;
  startTime: string;
  durationHours: number;
  onDateChange?: (newDate: string) => void;
  onTimeChange?: (newStartTime: string, newDurationHours: number) => void;
}

export const PHYSICAL_ROOMS = [
  {
    id: 'war-room',
    name: 'War room lt. 3',
    location: 'Gedung Administrasi Lt. 3',
    capacity: '35 Orang',
    badgeColor: 'indigo',
    colorHex: '#4f46e5',
    facilities: 'Layar Monitoring, Konferensi Terintegrasi, Dispenser, Stage dan Mimbar'
  },
  {
    id: 'ruang-integritas',
    name: 'Ruang integritas lt. 2',
    location: 'Gedung Administrasi Lt. 2',
    capacity: '10 Orang',
    badgeColor: 'sky',
    colorHex: '#0284c7',
    facilities: 'Smart Display, Meja Rapat, Whiteboard, Dispenser'
  },
  {
    id: 'room-ku',
    name: 'Room meeting KU lt. 1',
    location: 'Gedung Keuangan & Umum Lt. 1',
    capacity: '15 Orang',
    badgeColor: 'emerald',
    colorHex: '#059669',
    facilities: 'Smart Display, Meja Rapat, Whiteboard, Dispenser'
  },
  {
    id: 'room-har',
    name: 'Room meeting Har',
    location: 'Gedung Pemeliharaan (HAR)',
    capacity: '25 Orang',
    badgeColor: 'amber',
    colorHex: '#d97706',
    facilities: 'Smart Display, Meja Rapat, Whiteboard, Dispenser'
  }
];

// Working hours from 08:00 to 17:00 (9 hours total)
const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 17;
const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR; // 9 hours
const HOURS_SERIES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// Convert "HH:mm" string to decimal hours (e.g. "09:30" => 9.5)
function timeToDecimal(timeStr: string): number {
  if (!timeStr) return 8;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) + ((m || 0) / 60);
}

// Convert decimal hour to "HH:mm"
function decimalToTimeString(dec: number): string {
  const clamped = Math.max(TIMELINE_START_HOUR, Math.min(TIMELINE_END_HOUR, dec));
  const totalMinutes = Math.round(clamped * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Convert decimal to percentage in the 08:00 - 17:00 timeline
function getTimelinePercentage(timeDec: number): number {
  const clamped = Math.max(TIMELINE_START_HOUR, Math.min(TIMELINE_END_HOUR, timeDec));
  return ((clamped - TIMELINE_START_HOUR) / TOTAL_HOURS) * 100;
}

interface DragState {
  roomId: string;
  mode: 'move' | 'resize-right' | 'resize-left';
  startX: number;
  initialStartDec: number;
  initialDuration: number;
  trackRect: DOMRect;
  currentStartDec: number;
  currentDuration: number;
  isColliding: boolean;
  collidingBookingTitle?: string;
  collidingBookingTime?: string;
}

export const RoomAgendaCalendar: React.FC<RoomAgendaCalendarProps> = ({
  selectedRoom,
  onSelectRoom,
  bookingDate,
  startTime,
  durationHours,
  onDateChange,
  onTimeChange
}) => {
  const [allBookings, setAllBookings] = useState<Booking[]>(() => bookingStorage.getAll());
  const [inspectedDate, setInspectedDate] = useState<string>(bookingDate || getTodayDateString());
  const [interlockAlert, setInterlockAlert] = useState<{ message: string; roomName: string } | null>(null);

  // Month navigation based on inspectedDate
  const parsedDate = new Date(inspectedDate || getTodayDateString());
  const [currentYear, setCurrentYear] = useState<number>(
    isNaN(parsedDate.getFullYear()) ? 2026 : parsedDate.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    isNaN(parsedDate.getMonth()) ? 7 : parsedDate.getMonth()
  );

  // Dragging and resizing state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const trackRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Sync state if bookings change in storage
  useEffect(() => {
    const unsub = bookingStorage.subscribe(() => {
      setAllBookings(bookingStorage.getAll());
    });
    return () => unsub();
  }, []);

  // Sync calendar month when bookingDate prop changes
  useEffect(() => {
    if (bookingDate) {
      setInspectedDate(bookingDate);
      const [y, m] = bookingDate.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setCurrentYear(y);
        setCurrentMonth(m - 1);
      }
    }
  }, [bookingDate]);

  // Clear interlock alert after 5 seconds
  useEffect(() => {
    if (interlockAlert) {
      const timer = setTimeout(() => setInterlockAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [interlockAlert]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

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

  const currentStartDec = timeToDecimal(startTime);
  const currentDuration = durationHours || 1;
  const currentEndDec = currentStartDec + currentDuration;
  const proposedEndTime = calculateEndTime(startTime, currentDuration);

  // Active time during drag or default
  const activeStartDec = dragState ? dragState.currentStartDec : currentStartDec;
  const activeDuration = dragState ? dragState.currentDuration : currentDuration;
  const activeEndDec = activeStartDec + activeDuration;
  const activeStartTimeStr = decimalToTimeString(activeStartDec);
  const activeEndTimeStr = decimalToTimeString(activeEndDec);

  const myLeftPercent = getTimelinePercentage(activeStartDec);
  const myWidthPercent = Math.max(3.5, getTimelinePercentage(activeEndDec) - myLeftPercent);

  // Bookings on the inspected date
  const inspectedDayBookings = allBookings.filter(
    b => b.meetingDate === inspectedDate && b.status !== 'CANCELLED'
  );

  // Check collision helper
  const checkOverlapWithBookings = useCallback((
    roomName: string,
    startDec: number,
    duration: number
  ) => {
    const startStr = decimalToTimeString(startDec);
    const endStr = decimalToTimeString(startDec + duration);
    const bookingsInRoom = inspectedDayBookings.filter(b => b.meetingLocation === roomName);

    for (const b of bookingsInRoom) {
      if (isTimeOverlapping(startStr, endStr, b.startTime, b.endTime)) {
        return {
          isColliding: true,
          booking: b
        };
      }
    }
    return { isColliding: false, booking: null };
  }, [inspectedDayBookings]);

  // Pointer down handler for Drag & Resize
  const handlePointerDown = (
    e: React.PointerEvent,
    roomId: string,
    roomName: string,
    mode: 'move' | 'resize-right' | 'resize-left'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const trackElem = trackRefs.current[roomId];
    if (!trackElem) return;

    const rect = trackElem.getBoundingClientRect();
    const initStart = timeToDecimal(startTime);
    const initDur = durationHours || 1;

    const collision = checkOverlapWithBookings(roomName, initStart, initDur);

    setDragState({
      roomId,
      mode,
      startX: e.clientX,
      initialStartDec: initStart,
      initialDuration: initDur,
      trackRect: rect,
      currentStartDec: initStart,
      currentDuration: initDur,
      isColliding: collision.isColliding,
      collidingBookingTitle: collision.booking?.meetingTitle,
      collidingBookingTime: collision.booking ? `${collision.booking.startTime} - ${collision.booking.endTime}` : undefined
    });
  };

  // Global Pointer Move and Pointer Up listener during Drag
  useEffect(() => {
    if (!dragState) return;

    const roomObj = PHYSICAL_ROOMS.find(r => r.id === dragState.roomId);
    const roomName = roomObj ? roomObj.name : '';

    const handlePointerMove = (e: PointerEvent) => {
      const { mode, startX, initialStartDec, initialDuration, trackRect } = dragState;
      const deltaPx = e.clientX - startX;
      // Convert delta px to hours
      const rawDeltaHours = (deltaPx / trackRect.width) * TOTAL_HOURS;
      // Snap to 15-minute intervals (0.25h)
      const snappedDelta = Math.round(rawDeltaHours * 4) / 4;

      let nextStartDec = initialStartDec;
      let nextDuration = initialDuration;

      if (mode === 'move') {
        nextStartDec = initialStartDec + snappedDelta;
        // Clamp bounds: 08:00 <= start and start + duration <= 17:00
        nextStartDec = Math.max(TIMELINE_START_HOUR, Math.min(TIMELINE_END_HOUR - initialDuration, nextStartDec));
      } else if (mode === 'resize-right') {
        nextDuration = initialDuration + snappedDelta;
        // Minimum duration 0.5h (30 min), max until 17:00
        nextDuration = Math.max(0.5, Math.min(TIMELINE_END_HOUR - initialStartDec, nextDuration));
      } else if (mode === 'resize-left') {
        nextStartDec = initialStartDec + snappedDelta;
        // Clamp start: >= 08:00 and <= (initialEnd - 0.5)
        const initialEnd = initialStartDec + initialDuration;
        nextStartDec = Math.max(TIMELINE_START_HOUR, Math.min(initialEnd - 0.5, nextStartDec));
        nextDuration = initialEnd - nextStartDec;
      }

      // Check collision in real-time
      const collision = checkOverlapWithBookings(roomName, nextStartDec, nextDuration);

      setDragState(prev => prev ? ({
        ...prev,
        currentStartDec: nextStartDec,
        currentDuration: nextDuration,
        isColliding: collision.isColliding,
        collidingBookingTitle: collision.booking?.meetingTitle,
        collidingBookingTime: collision.booking ? `${collision.booking.startTime} - ${collision.booking.endTime}` : undefined
      }) : null);
    };

    const handlePointerUp = () => {
      if (!dragState) return;

      const { currentStartDec: finalStart, currentDuration: finalDur, isColliding, collidingBookingTitle, collidingBookingTime } = dragState;
      const finalStartStr = decimalToTimeString(finalStart);

      if (isColliding) {
        // AUTO-INTERLOCK: Reject placement onto occupied slot and warn user!
        setInterlockAlert({
          roomName,
          message: `Auto-Interlock Aktif: Tidak dapat menggeser ke jam tersebut karena "${roomName}" sudah terisi agenda "${collidingBookingTitle || 'Rapat Lain'}" (${collidingBookingTime || ''}). Jadwal dikembalikan ke posisi aman.`
        });
      } else {
        // Safe placement: Update start time and duration in form state
        if (onTimeChange) {
          onTimeChange(finalStartStr, finalDur);
        }
        // Auto select this room if valid and not yet selected
        if (selectedRoom !== roomName && selectedRoom !== NO_ROOM_VALUE) {
          onSelectRoom(roomName);
        }
        if (inspectedDate !== bookingDate && onDateChange) {
          onDateChange(inspectedDate);
        }
      }

      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, checkOverlapWithBookings, onTimeChange, onSelectRoom, selectedRoom, inspectedDate, bookingDate, onDateChange]);

  // Click on empty track slot to position meeting start
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>, roomName: string, roomId: string) => {
    if (dragState) return;
    const trackElem = trackRefs.current[roomId];
    if (!trackElem) return;

    const rect = trackElem.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const rawClickedDec = TIMELINE_START_HOUR + clickPercent * TOTAL_HOURS;
    // Snap to 30 min (0.5) or 15 min (0.25)
    const snappedStart = Math.round(rawClickedDec * 2) / 2;
    const clampedStart = Math.max(TIMELINE_START_HOUR, Math.min(TIMELINE_END_HOUR - currentDuration, snappedStart));

    const collision = checkOverlapWithBookings(roomName, clampedStart, currentDuration);
    if (collision.isColliding) {
      setInterlockAlert({
        roomName,
        message: `Auto-Interlock: Slot pukul ${decimalToTimeString(clampedStart)} - ${decimalToTimeString(clampedStart + currentDuration)} bentrok dengan "${collision.booking?.meetingTitle}" (${collision.booking?.startTime} - ${collision.booking?.endTime}).`
      });
      return;
    }

    const newStartStr = decimalToTimeString(clampedStart);
    if (onTimeChange) {
      onTimeChange(newStartStr, currentDuration);
    }
    onSelectRoom(roomName);
    if (inspectedDate !== bookingDate && onDateChange) {
      onDateChange(inspectedDate);
    }
  };

  // Quick toolbar shifts
  const handleShiftTime = (deltaMinutes: number) => {
    const currentDec = timeToDecimal(startTime);
    const newDec = currentDec + (deltaMinutes / 60);
    const clamped = Math.max(TIMELINE_START_HOUR, Math.min(TIMELINE_END_HOUR - currentDuration, newDec));
    const newStartStr = decimalToTimeString(clamped);
    if (onTimeChange) {
      onTimeChange(newStartStr, currentDuration);
    }
  };

  const handleSetDuration = (newDur: number) => {
    const currentDec = timeToDecimal(startTime);
    const clampedDur = Math.max(0.5, Math.min(TIMELINE_END_HOUR - currentDec, newDur));
    if (onTimeChange) {
      onTimeChange(startTime, clampedDur);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Banner: Info Interlock & Sinkronisasi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-indigo-950 font-bold">
              Rencana Jadwal Rapat: <span className="underline decoration-indigo-300">{formatDateIndo(inspectedDate)}</span> ({activeStartTimeStr} - {activeEndTimeStr} WIB)
            </div>
            <p className="text-[11px] text-indigo-700/80">
              💡 <strong>Interaktif:</strong> Anda bisa <strong>menggeser (drag) kotak jam</strong> pada ruangan untuk ubah waktu mulai, atau <strong>tarik ujung kanannya</strong> untuk atur durasi rapat!
            </p>
          </div>
        </div>

        {inspectedDate !== bookingDate && onDateChange && (
          <button
            type="button"
            onClick={() => onDateChange(inspectedDate)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Pindah Tanggal Booking ke {inspectedDate.split('-').reverse().join('/')}</span>
          </button>
        )}
      </div>

      {/* Auto-Interlock Alert Banner (Popup Notification) */}
      {interlockAlert && (
        <div className="p-3.5 rounded-xl bg-rose-600 text-white shadow-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <span>Auto-Interlock Perlindungan Bentrok Jadwal</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-800 text-[10px] uppercase font-mono">Terkunci</span>
            </div>
            <p className="text-rose-100 mt-0.5 leading-relaxed">
              {interlockAlert.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInterlockAlert(null)}
            className="text-white/80 hover:text-white text-xs px-2 py-1 bg-rose-700 hover:bg-rose-800 rounded-md cursor-pointer font-bold shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Month Grid & Selected Day Agenda (Option 1) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* Card 1: Interactive Month Calendar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center font-bold text-[10px] text-slate-400 uppercase py-1 border-b border-slate-100">
            <div>Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
          </div>

          {/* Day Cells with Visual Agenda Badges */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank tiles before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-11 sm:h-12 rounded-lg bg-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayBookings = allBookings.filter(
                b => b.meetingDate === dateStr && b.status !== 'CANCELLED'
              );
              
              const isInspected = inspectedDate === dateStr;
              const isTargetBookingDate = bookingDate === dateStr;
              const hasBookings = dayBookings.length > 0;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    setInspectedDate(dateStr);
                    if (onDateChange) {
                      onDateChange(dateStr);
                    }
                  }}
                  className={`h-11 sm:h-12 p-1 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                    isTargetBookingDate || isInspected
                      ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-500/30'
                      : hasBookings
                      ? 'border-amber-200 bg-amber-50/70 hover:border-amber-300 text-slate-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] leading-none font-bold">{dayNum}</span>
                    {hasBookings && (
                      <span
                        className={`px-1 py-0.2 rounded-full text-[8px] font-extrabold leading-tight ${
                          isTargetBookingDate || isInspected
                            ? 'bg-white text-indigo-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                        title={`${dayBookings.length} Rapat Terjadwal`}
                      >
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* Room status preview */}
                  <div className="flex items-center gap-0.5 overflow-hidden">
                    {hasBookings ? (
                      dayBookings.slice(0, 3).map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isTargetBookingDate || isInspected ? 'bg-amber-300 ring-1 ring-white/40' : 'bg-rose-500'
                          }`}
                          title={`${b.meetingLocation}: ${b.startTime} - ${b.endTime}`}
                        />
                      ))
                    ) : (
                      <span className={`text-[8px] leading-none opacity-60 ${isTargetBookingDate || isInspected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        Kosong
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 flex-wrap gap-1.5">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
              <span>Tanggal Terpilih</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Ada Rapat Terisi</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Bebas</span>
            </div>
          </div>
        </div>

        {/* Card 2: Agenda & Status Tanggal Terpilih (Option 1) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wide">
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Agenda & Ketersediaan</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-700 mt-0.5 truncate">
                {formatDateIndo(inspectedDate)}
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
              inspectedDayBookings.length > 0 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {inspectedDayBookings.length > 0 ? `${inspectedDayBookings.length} Rapat` : 'Semua Bebas'}
            </span>
          </div>

          {/* Quick Metrics / Status Cards */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                {Math.max(0, PHYSICAL_ROOMS.length - new Set(inspectedDayBookings.map(b => b.meetingLocation)).size)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-emerald-950 text-[10px] leading-tight">Ruang Kosong</div>
                <div className="text-[9px] text-emerald-700">Tersedia</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                {new Set(inspectedDayBookings.map(b => b.meetingLocation)).size}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-[10px] leading-tight">Ruang Terpakai</div>
                <div className="text-[9px] text-slate-500">Ada agenda</div>
              </div>
            </div>
          </div>

          {/* Meeting List or Empty State */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {inspectedDayBookings.length > 0 ? 'Daftar Rapat Hari Ini:' : 'Status Ruangan Hari Ini:'}
            </div>

            {inspectedDayBookings.length > 0 ? (
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {inspectedDayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {b.startTime} - {b.endTime} WIB
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[110px]" title={b.meetingLocation}>
                        🏢 {b.meetingLocation}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-[11px] truncate" title={b.title}>
                      {b.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      👤 {b.picName} {b.unitKerja ? `(${b.unitKerja})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-center space-y-1">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="font-bold text-emerald-900 text-xs">
                  {PHYSICAL_ROOMS.length} Ruang Meeting Bebas & Kosong
                </div>
                <p className="text-[10px] text-emerald-700 leading-relaxed">
                  Tidak ada agenda rapat terjadwal sepanjang hari (08:00 - 17:00 WIB).
                </p>
              </div>
            )}
          </div>

          {/* Quick Reminder Footer */}
          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[10px] text-indigo-900 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <strong>Tips:</strong> Klik tanggal lain di kalender untuk cek agenda hari tersebut, atau geser kotak jam rapat biru di timeline kanan.
            </div>
          </div>
        </div>
      </div>

        {/* Right Column: MODEL 1 - Visual Timeline Bar Horizontal (08:00 - 17:00) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-4">
            {/* Header info for the day */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Interactive Timeline
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                    {formatDateIndo(inspectedDate)}
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
                  Visual Time-Slot Grid (08:00 - 17:00 WIB)
                </h4>
              </div>

              {/* Quick Time & Duration Summary Badge */}
              <div className="text-xs text-slate-700 bg-indigo-50/90 border border-indigo-200 px-3 py-1.5 rounded-xl self-start sm:self-auto font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Slot: <strong className="text-indigo-950 font-mono font-bold">{activeStartTimeStr} - {activeEndTimeStr} WIB</strong> ({formatDuration(activeDuration)})</span>
              </div>
            </div>

            {/* Quick Adjustment Toolbar: Geser Jam & Atur Durasi Cepat */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Geser Waktu */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[11px]">Geser Jam Mulai:</span>
                <button
                  type="button"
                  onClick={() => handleShiftTime(-30)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
                  title="Maju 30 Menit"
                >
                  -30m
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftTime(30)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
                  title="Mundur 30 Menit"
                >
                  +30m
                </button>
              </div>

              {/* Ubah Durasi */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-600 text-[11px]">Pilih Durasi:</span>
                {[1, 1.5, 2, 3, 4].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleSetDuration(dur)}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      activeDuration === dur
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {dur} Jam
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSetDuration(Math.max(0.5, activeDuration - 0.5))}
                  className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer"
                  title="Kurang 30 Menit"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDuration(Math.min(8, activeDuration + 0.5))}
                  className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer"
                  title="Tambah 30 Menit"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Timeline Visual Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500 shadow-2xs" />
                <span><strong>Merah:</strong> Rapat Terisi (Interlock)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-600 ring-2 ring-indigo-300" />
                <span><strong>Biru (Draggable):</strong> Jam Rapat Anda</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-600 ring-2 ring-rose-400 animate-pulse" />
                <span><strong>Garis Bentrok:</strong> Menimpa Jadwal Lain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                <span><strong>Garis Abu:</strong> Slot Kosong (Bisa Diklik)</span>
              </div>
            </div>

            {/* Pilihan Khusus: Tidak Menggunakan Ruang Meeting (Hanya Pesan Konsumsi) */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                selectedRoom === NO_ROOM_VALUE
                  ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/25 shadow-sm'
                  : 'border-slate-200 bg-slate-50/80 hover:border-emerald-300 hover:bg-emerald-50/30 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  selectedRoom === NO_ROOM_VALUE
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className={`text-xs sm:text-sm font-bold ${
                      selectedRoom === NO_ROOM_VALUE ? 'text-emerald-950 font-extrabold' : 'text-slate-900'
                    }`}>
                      Tidak Menggunakan Ruang Meeting
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Hanya Pesan Snack & Makan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pilih opsi ini jika Anda <strong>hanya memerlukan konsumsi</strong> tanpa memakai ruangan rapat fisik.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-auto">
                {selectedRoom === NO_ROOM_VALUE ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>Opsi Terpilih (Tanpa Ruangan)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRoom(NO_ROOM_VALUE);
                      if (inspectedDate !== bookingDate && onDateChange) {
                        onDateChange(inspectedDate);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Pilih Tanpa Ruang Meeting</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 Physical Meeting Rooms with Visual Horizontal Timeline Bars */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {PHYSICAL_ROOMS.map((room) => {
                // Bookings in this room on inspected date
                const roomBookings = inspectedDayBookings.filter(b => b.meetingLocation === room.name);
                
                // Conflict checking with active time
                const conflictCheck = checkRoomConflict(
                  room.name,
                  inspectedDate,
                  activeStartTimeStr,
                  activeDuration,
                  allBookings
                );

                const isLocked = conflictCheck.isLocked;
                const isSelected = selectedRoom === room.name && inspectedDate === bookingDate;
                const isRoomBeingDragged = dragState?.roomId === room.id;
                const isCurrentDragColliding = isRoomBeingDragged && dragState?.isColliding;

                return (
                  <div
                    key={room.name}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all space-y-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm'
                        : isLocked
                        ? 'border-rose-300 bg-rose-50/40 shadow-2xs'
                        : 'border-slate-200 hover:border-indigo-400 bg-white shadow-2xs'
                    }`}
                  >
                    {/* Room Header & 1-Click Select Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className={`text-xs sm:text-sm font-bold ${
                            isLocked ? 'text-slate-700' : isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-900'
                          }`}>
                            {room.name}
                          </h5>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {room.capacity}
                          </span>
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Bentrok Jam Rapat</span>
                            </span>
                          )}
                          {!isLocked && roomBookings.length === 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Kosong Sepanjang Hari
                            </span>
                          )}
                          {!isLocked && roomBookings.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                              Tersedia di Jam Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {room.location} &bull; Fasilitas: {room.facilities}
                        </p>
                      </div>

                      {/* Right Action Button (Locked vs Selected vs Available) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isLocked ? (
                          <div 
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs select-none cursor-not-allowed opacity-90"
                            title="Ruangan ini terkunci karena sudah ada agenda di jam yang sama"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Terkunci</span>
                          </div>
                        ) : isSelected ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Ruangan Terpilih</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectRoom(room.name);
                              if (inspectedDate !== bookingDate && onDateChange) {
                                onDateChange(inspectedDate);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>Pilih Ruang Ini</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* HORIZONTAL TIMELINE BAR (08:00 - 17:00) */}
                    <div className="space-y-1">
                      {/* Hours Markings Header */}
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5 select-none">
                        {HOURS_SERIES.map((hr) => (
                          <span key={hr} className="w-4 text-center">
                            {String(hr).padStart(2, '0')}
                          </span>
                        ))}
                      </div>

                      {/* The Visual Bar Track */}
                      <div 
                        ref={(el) => { trackRefs.current[room.id] = el; }}
                        onClick={(e) => handleTrackClick(e, room.name, room.id)}
                        className="relative h-8 sm:h-9 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-300 cursor-pointer select-none group"
                        title="Klik pada slot jam kosong untuk memindahkan jam mulai"
                      >
                        {/* Hour Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-9 pointer-events-none">
                          {Array.from({ length: 9 }).map((_, gIdx) => (
                            <div
                              key={gIdx}
                              className="border-r border-slate-200 h-full"
                            />
                          ))}
                        </div>

                        {/* Existing Booked Segments (Red Blocks) */}
                        {roomBookings.map((b) => {
                          const startDec = timeToDecimal(b.startTime);
                          const endDec = timeToDecimal(b.endTime);
                          const leftPct = getTimelinePercentage(startDec);
                          const widthPct = Math.max(5, getTimelinePercentage(endDec) - leftPct);
                          
                          const isConflictingWithMe = isTimeOverlapping(
                            activeStartTimeStr,
                            activeEndTimeStr,
                            b.startTime,
                            b.endTime
                          );

                          return (
                            <div
                              key={b.id}
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                              className={`absolute top-0.5 bottom-0.5 rounded-md px-1.5 flex items-center overflow-hidden transition-all text-white text-[10px] font-bold shadow-2xs pointer-events-auto ${
                                isConflictingWithMe
                                  ? 'bg-rose-600 border-2 border-rose-800 z-10 animate-pulse ring-2 ring-rose-400'
                                  : 'bg-rose-500/90 border border-rose-600 z-5'
                              }`}
                              title={`Terisi: ${b.startTime} - ${b.endTime} WIB | ${b.meetingTitle} (${b.department})`}
                            >
                              <span className="truncate whitespace-nowrap leading-tight">
                                {b.startTime}-{b.endTime} {b.department}
                              </span>
                            </div>
                          );
                        })}

                        {/* PROPOSED MEETING TIME BOX (DRAGGABLE & RESIZABLE) */}
                        <div
                          style={{ left: `${myLeftPercent}%`, width: `${myWidthPercent}%` }}
                          onPointerDown={(e) => handlePointerDown(e, room.id, room.name, 'move')}
                          className={`absolute top-0.5 bottom-0.5 rounded-md z-20 flex items-center justify-between border-2 select-none shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
                            isCurrentDragColliding || isLocked
                              ? 'bg-rose-600/90 border-rose-800 text-white ring-2 ring-rose-400'
                              : isSelected
                              ? 'bg-indigo-600 border-indigo-800 text-white ring-2 ring-indigo-400'
                              : 'bg-indigo-500/90 border-indigo-700 text-white hover:bg-indigo-600'
                          }`}
                          title="Tahan & geser untuk ubah jam mulai | Tarik ujung kanan untuk ubah durasi"
                        >
                          {/* Left Resize Handle */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, room.id, room.name, 'resize-left')}
                            className="h-full w-2 flex items-center justify-center cursor-ew-resize hover:bg-white/30 rounded-l-md shrink-0"
                            title="Tarik untuk ubah jam mulai"
                          >
                            <span className="w-0.5 h-3 bg-white/60 rounded-full" />
                          </div>

                          {/* Center Content: Info Jam Rapat & Drag Icon */}
                          <div className="flex-1 flex items-center justify-center gap-1 overflow-hidden px-1 pointer-events-none">
                            {isCurrentDragColliding || isLocked ? (
                              <div className="flex items-center gap-1 text-[9px] font-extrabold whitespace-nowrap">
                                <AlertTriangle className="w-3 h-3 text-amber-200 shrink-0" />
                                <span className="truncate">BENTROK JADWAL!</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[9px] font-extrabold whitespace-nowrap">
                                <MoveHorizontal className="w-3 h-3 text-white/80 shrink-0 hidden sm:inline-block" />
                                <span className="truncate">{activeStartTimeStr} - {activeEndTimeStr} ({formatDuration(activeDuration)})</span>
                              </div>
                            )}
                          </div>

                          {/* Right Resize Handle (Durasi Rapat) */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, room.id, room.name, 'resize-right')}
                            className="h-full w-3 flex items-center justify-center cursor-ew-resize hover:bg-white/40 bg-white/10 rounded-r-md shrink-0"
                            title="Tarik ujung ini ke kanan/kiri untuk mengatur durasi rapat"
                          >
                            <GripVertical className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Text Sub-Details */}
                    {roomBookings.length > 0 ? (
                      <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <Info className="w-3 h-3 text-slate-400" />
                          <span>Rincian Rapat Terjadwal pada Tanggal Ini:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {roomBookings.map((b) => (
                            <div
                              key={b.id}
                              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between gap-1 text-[11px]"
                            >
                              <div className="min-w-0 truncate">
                                <span className="font-bold font-mono text-slate-900">{b.startTime}-{b.endTime}</span>: "{b.meetingTitle}" ({b.department})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Ruangan ini kosong sepanjang hari (08:00 - 17:00). Sangat leluasa untuk digunakan!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Sync Indicator */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>Visual Timeline sinkron dengan jam rapat ({activeStartTimeStr} - {activeEndTimeStr} WIB).</span>
            <span className="font-semibold text-slate-600">{allBookings.filter(b => b.status !== 'CANCELLED').length} Total Booking Terdaftar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
