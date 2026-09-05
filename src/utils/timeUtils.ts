/**
 * Helper utilities for time calculations and Indonesian date formatting
 */

/**
 * Calculates end time based on start time (HH:MM) and duration in hours
 */
export function calculateEndTime(startTime: string, durationHours: number): string {
  if (!startTime) return '';
  const [hoursStr, minsStr] = startTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const mins = parseInt(minsStr, 10);

  if (isNaN(hours) || isNaN(mins)) return '';

  const totalStartMinutes = hours * 60 + mins;
  const durationMinutes = Math.round(durationHours * 60);
  const totalEndMinutes = totalStartMinutes + durationMinutes;

  const endHours = Math.floor(totalEndMinutes / 60) % 24;
  const endMinutes = totalEndMinutes % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

/**
 * Formats YYYY-MM-DD into Indonesian string, e.g. "Kamis, 20 Agustus 2026"
 */
export function formatDateIndo(dateStr: string, includeDay: boolean = true): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const yearNum = date.getFullYear();

    if (includeDay) {
      return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
    }
    return `${dayNum} ${monthName} ${yearNum}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns today's date in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  // Let's ensure default is 2026-08-20 or real system date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats duration in hours to friendly Indonesian string
 */
export function formatDuration(duration: number): string {
  if (duration === 1) return '1 Jam';
  if (duration === 1.5) return '1.5 Jam (90 Menit)';
  if (duration === 2) return '2 Jam';
  if (duration === 2.5) return '2.5 Jam (150 Menit)';
  if (duration === 3) return '3 Jam';
  if (duration === 4) return '4 Jam (Setengah Hari)';
  if (duration === 8) return '8 Jam (Seharian Penuh)';
  return `${duration} Jam`;
}

/**
 * Checks if meeting is eligible for Makan Siang
 * Criteria: Duration >= 4 hours (or > 4 hours) OR meeting spans / reaches at least 12:00 WIB
 */
export function isEligibleForMakanSiang(startTime: string, durationHours: number): {
  isEligible: boolean;
  endTime: string;
  reason: string;
} {
  const endTime = calculateEndTime(startTime, durationHours);
  if (!startTime || !durationHours) {
    return {
      isEligible: false,
      endTime: '',
      reason: 'Waktu dan durasi meeting belum ditentukan'
    };
  }

  const [hoursStr, minsStr] = startTime.split(':');
  const startHour = parseInt(hoursStr, 10);
  const startMin = parseInt(minsStr, 10);
  const startMinutes = startHour * 60 + startMin;
  const durationMinutes = Math.round(durationHours * 60);
  const endMinutes = startMinutes + durationMinutes;

  // 12:00 in minutes is 12 * 60 = 720
  const NOON_MINUTES = 12 * 60;

  // 1. Long duration (>= 4 hours)
  const isLongDuration = durationHours >= 4;

  // 2. Reaches or crosses noon (start is before/at 13:00 and end is at or after 12:00)
  const reachesNoon = (startMinutes <= 13 * 60 && endMinutes >= NOON_MINUTES);

  const isEligible = isLongDuration || reachesNoon;

  let reason = '';
  if (isLongDuration && reachesNoon) {
    reason = `Durasi meeting ${formatDuration(durationHours)} dan jadwal mencapai/melewati pukul 12:00 WIB (${endTime} WIB)`;
  } else if (isLongDuration) {
    reason = `Durasi meeting (${formatDuration(durationHours)}) memenuhi syarat minimal 4 jam`;
  } else if (reachesNoon) {
    reason = `Jadwal meeting berlangsung hingga pukul ${endTime} WIB (mencapai pukul 12:00 WIB)`;
  } else {
    reason = `Meeting selesai pukul ${endTime} WIB (sebelum pukul 12:00) dan durasi ${formatDuration(durationHours)} (< 4 jam)`;
  }

  return { isEligible, endTime, reason };
}

/**
 * Maps department / account login to standard company prefix code:
 * Operasi = OPR
 * Pemeliharaan = HAR
 * Enjiniring = ENJ
 * Coal & Ash Handling = CAH
 * Keuangan & Umum = KSA
 * K3 & Keamanan = KKK
 * Lingkungan = LIN
 * Pengadaan = DAN
 */
export function getDepartmentPrefix(department?: string, username?: string): string {
  const dept = (department || '').toLowerCase().trim();
  const uname = (username || '').toLowerCase().trim();

  // Operasi = OPR
  if (dept.includes('operasi') || uname === 'operasi' || uname.includes('ops')) {
    return 'OPR';
  }
  // Pemeliharaan = HAR
  if (dept.includes('pemeliharaan') || dept.includes('har') || uname === 'pemeliharaan' || uname.includes('har')) {
    return 'HAR';
  }
  // Enjiniring = ENJ
  if (dept.includes('enjiniring') || dept.includes('engineering') || uname === 'enjiniring' || uname.includes('enj')) {
    return 'ENJ';
  }
  // Coal & Ash Handling = CAH
  if (dept.includes('coal') || dept.includes('ash') || dept.includes('cah') || uname.includes('coal') || uname.includes('cah')) {
    return 'CAH';
  }
  // Keuangan & Umum = KSA
  if (dept.includes('keuangan') || dept.includes('umum') || dept.includes('ksa') || dept.includes('ku') || uname === 'keuangan' || uname === 'admin') {
    return 'KSA';
  }
  // K3 & Keamanan = KKK
  if (dept.includes('k3') || dept.includes('keamanan') || dept.includes('safety') || uname.includes('k3')) {
    return 'KKK';
  }
  // Lingkungan = LIN
  if (dept.includes('lingkungan') || uname.includes('lingkungan') || uname.includes('ling')) {
    return 'LIN';
  }
  // Pengadaan = DAN
  if (dept.includes('pengadaan') || dept.includes('logistik') || dept.includes('procurement') || uname.includes('pengadaan') || uname.includes('proc')) {
    return 'DAN';
  }

  return 'APN';
}

/**
 * Checks if two time ranges [start1, end1) and [start2, end2) overlap
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hoursStr, minsStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const mins = parseInt(minsStr, 10);
  if (isNaN(hours) || isNaN(mins)) return 0;
  return hours * 60 + mins;
}

export function isTimeOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Overlap condition: start of one is before end of other AND end of one is after start of other
  return s1 < e2 && e1 > s2;
}

export interface RoomConflictResult {
  isLocked: boolean;
  conflictingBookings: any[];
  firstConflict?: any;
  reason?: string;
}

export function checkRoomConflict(
  room: string,
  date: string,
  startTime: string,
  durationHours: number,
  allBookings: any[],
  excludeBookingId?: string
): RoomConflictResult {
  if (
    !room ||
    room === 'Tidak menggunakan ruang meeting' ||
    !date ||
    !startTime ||
    !durationHours
  ) {
    return { isLocked: false, conflictingBookings: [] };
  }

  const proposedEndTime = calculateEndTime(startTime, durationHours);

  const conflicts = allBookings.filter((b) => {
    if (!b || b.status === 'CANCELLED') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.meetingDate !== date) return false;
    if (b.meetingLocation !== room) return false;

    // Check time overlap
    return isTimeOverlapping(startTime, proposedEndTime, b.startTime, b.endTime);
  });

  if (conflicts.length > 0) {
    const first = conflicts[0];
    return {
      isLocked: true,
      conflictingBookings: conflicts,
      firstConflict: first,
      reason: `Terkunci: Ruangan sudah dibooking untuk "${first.meetingTitle}" (${first.department}) pukul ${first.startTime} - ${first.endTime} WIB`
    };
  }

  return { isLocked: false, conflictingBookings: [] };
}

/**
 * Generates sequential booking number starting from 0001 with department prefix and yyyymmdd date
 * Example format: OPR-20260825-0001, HAR-20260825-0001, etc.
 */
export function generateDepartmentBookingNumber(
  department?: string,
  username?: string,
  existingBookings: Array<{ bookingNumber: string; department?: string; createdAt?: string }> = []
): string {
  const prefix = getDepartmentPrefix(department, username);
  const now = new Date();
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const prefixWithDate = `${prefix}-${dateCode}`;
  
  let maxSeq = 0;
  existingBookings.forEach(b => {
    if (!b.bookingNumber) return;
    const clean = b.bookingNumber.trim().toUpperCase();
    if (clean.startsWith(`${prefixWithDate}-`)) {
      const parts = clean.split('-');
      const lastPart = parts[parts.length - 1];
      const parsed = parseInt(lastPart, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const seqFormatted = String(nextSeq).padStart(4, '0');
  return `${prefixWithDate}-${seqFormatted}`;
}

/**
 * Generates next unique booking number based on department prefix, input date, and sequence
 */
export function generateBookingNumber(department?: string, existingBookings: Array<{ bookingNumber: string; department?: string }> = []): string {
  return generateDepartmentBookingNumber(department, undefined, existingBookings);
}

