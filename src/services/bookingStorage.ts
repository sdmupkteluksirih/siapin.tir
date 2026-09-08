import { Booking, BookingFormData, BookingStatus, RekapHarian } from '../types';
import { calculateEndTime, generateDepartmentBookingNumber, getTodayDateString } from '../utils/timeUtils';

const STORAGE_KEY = 'meeting_snack_bookings_v4';
const LISTEN_EVENT = 'meeting_bookings_changed';

// Initial realistic Indonesian corporate seed data for today (2026-08-20) and surrounding dates
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-001',
    bookingNumber: 'OPR-20260820-0001',
    meetingDate: '2026-08-20',
    startTime: '09:00',
    durationHours: 2,
    endTime: '11:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Iya',
    bookerName: 'Budi Santoso',
    department: 'Operasi',
    whatsapp: '081234567890',
    meetingTitle: 'Meeting Koordinasi Operasional Unit & Vendor Eksternal',
    meetingLocation: 'War room lt. 3',
    participantCount: 20,
    organizationOrGuests: 'PT PLN Nusantara Power & PT Cogindo DayaBersama',
    invitationLetter: {
      name: 'Surat_Undangan_Rapat_Koordinasi_PLN.pdf',
      size: 425600,
      type: 'application/pdf'
    },
    notes: 'Mohon siapkan proyektor HDMI dan sound system.',
    status: 'CONFIRMED',
    createdAt: '2026-08-19T08:30:00.000Z'
  },
  {
    id: 'b-002',
    bookingNumber: 'KSA-20260820-0001',
    meetingDate: '2026-08-20',
    startTime: '10:30',
    durationHours: 1.5,
    endTime: '12:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Siti Rahmawati',
    department: 'Keuangan & Umum',
    whatsapp: '081398765432',
    meetingTitle: 'Evaluasi Anggaran & Administrasi Umum',
    meetingLocation: 'Room meeting KU lt. 1',
    participantCount: 30,
    organizationOrGuests: 'Internal Divisi Keuangan & Bagian Akuntansi',
    notes: 'Snack disajikan tepat pukul 10:45.',
    status: 'BOOKED',
    createdAt: '2026-08-19T10:15:00.000Z'
  },
  {
    id: 'b-003',
    bookingNumber: 'HAR-20260820-0001',
    meetingDate: '2026-08-20',
    startTime: '13:00',
    durationHours: 3,
    endTime: '16:00',
    snackRingan: 'Tidak Ada',
    snackBerat: 'Baso',
    makanSiang: 'Iya',
    bookerName: 'Hendra Gunawan',
    department: 'Pemeliharaan',
    whatsapp: '081765432109',
    meetingTitle: 'Preventive Maintenance Planning & Review',
    meetingLocation: 'Room meeting Har',
    participantCount: 40,
    organizationOrGuests: 'Tim Ahli Boiler & Turbin (Mitra OEM)',
    invitationLetter: {
      name: 'Izin_Kunjungan_Teknisi_Mitra_OEM.pdf',
      size: 614400,
      type: 'application/pdf'
    },
    notes: 'Makan siang disajikan jam 12:30 sebelum sesi dimulai.',
    status: 'CONFIRMED',
    createdAt: '2026-08-18T14:20:00.000Z'
  },
  {
    id: 'b-004',
    bookingNumber: 'ENJ-20260820-0001',
    meetingDate: '2026-08-20',
    startTime: '14:00',
    durationHours: 2,
    endTime: '16:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Baso',
    makanSiang: 'Iya',
    bookerName: 'Dewi Lestari',
    department: 'Enjiniring',
    whatsapp: '081299887766',
    meetingTitle: 'Kajian Teknis & Evaluasi Efisiensi Termal',
    meetingLocation: 'Ruang integritas lt. 2',
    participantCount: 30,
    notes: 'Perlu tambahan flipchart dan spidol.',
    status: 'COMPLETED',
    createdAt: '2026-08-17T09:00:00.000Z'
  },
  {
    id: 'b-005',
    bookingNumber: 'CAH-20260820-0001',
    meetingDate: '2026-08-20',
    startTime: '15:30',
    durationHours: 1.5,
    endTime: '17:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Soto',
    makanSiang: 'Iya',
    bookerName: 'Agus Setiawan',
    department: 'Coal & Ash Handling',
    whatsapp: '081311223344',
    meetingTitle: 'Briefing Stockpile & Distribusi Batubara',
    meetingLocation: 'War room lt. 3',
    participantCount: 20,
    notes: 'Snack sehat rebusan tanpa kacang-kacangan.',
    status: 'CONFIRMED',
    createdAt: '2026-08-19T11:45:00.000Z'
  },
  {
    id: 'b-006',
    bookingNumber: 'KKK-20260820-0001',
    meetingDate: '2026-08-20',
    startTime: '16:00',
    durationHours: 1,
    endTime: '17:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Baso',
    makanSiang: 'Iya',
    bookerName: 'Rina Kusuma',
    department: 'K3 & Keamanan',
    whatsapp: '081555443322',
    meetingTitle: 'Sosialisasi Safety Golden Rules & K3',
    meetingLocation: 'Ruang integritas lt. 2',
    participantCount: 15,
    notes: 'Rapat internal K3.',
    status: 'BOOKED',
    createdAt: '2026-08-19T16:10:00.000Z'
  },
  {
    id: 'b-007',
    bookingNumber: 'LIN-20260820-0001',
    meetingDate: '2026-08-20',
    startTime: '08:30',
    durationHours: 1,
    endTime: '09:30',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Soto',
    makanSiang: 'Tidak',
    bookerName: 'Farhan Maulana',
    department: 'Lingkungan',
    whatsapp: '081877665544',
    meetingTitle: 'Monitoring Baku Mutu Emisi & Limbah',
    meetingLocation: 'Room meeting KU lt. 1',
    participantCount: 15,
    notes: 'Dibatalkan karena agenda inspeksi lapangan mendadak.',
    status: 'CANCELLED',
    createdAt: '2026-08-18T10:00:00.000Z'
  },
  {
    id: 'b-008',
    bookingNumber: 'DAN-20260821-0001',
    meetingDate: '2026-08-21',
    startTime: '09:00',
    durationHours: 3,
    endTime: '12:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Sate Padang',
    makanSiang: 'Iya',
    bookerName: 'Arif Prasetyo',
    department: 'Pengadaan',
    whatsapp: '081122334455',
    meetingTitle: 'Evaluasi Penawaran & Aanwijzing Vendor Batubara',
    meetingLocation: 'War room lt. 3',
    participantCount: 25,
    notes: 'Sajikan teh hangat, kopi, dan air mineral.',
    status: 'CONFIRMED',
    createdAt: '2026-08-19T13:00:00.000Z'
  },
  {
    id: 'b-009',
    bookingNumber: 'ENJ-20260821-0002',
    meetingDate: '2026-08-21',
    startTime: '10:00',
    durationHours: 2,
    endTime: '12:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Baso',
    makanSiang: 'Iya',
    bookerName: 'Nurul Hidayah',
    department: 'Enjiniring',
    whatsapp: '081233445566',
    meetingTitle: 'Review Reliability & Efisiensi Pembangkit',
    meetingLocation: 'Room meeting Har',
    participantCount: 35,
    notes: 'Sound system disiapkan untuk microfon 2 buah.',
    status: 'CONFIRMED',
    createdAt: '2026-08-19T15:20:00.000Z'
  },
  {
    id: 'b-009b',
    bookingNumber: 'KSA-20260821-0003',
    meetingDate: '2026-08-21',
    startTime: '13:30',
    durationHours: 2.5,
    endTime: '16:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Bambang Irawan',
    department: 'Keuangan & Umum',
    whatsapp: '081377889900',
    meetingTitle: 'Rapat Penataan Aset & Sarana Prasarana Gedung',
    meetingLocation: 'Ruang integritas lt. 2',
    participantCount: 20,
    notes: 'Perlu kabel roll dan sambungan proyektor.',
    status: 'BOOKED',
    createdAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'b-009c',
    bookingNumber: 'OPR-20260822-0001',
    meetingDate: '2026-08-22',
    startTime: '08:30',
    durationHours: 2,
    endTime: '10:30',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Wahyu Hidayat',
    department: 'Operasi',
    whatsapp: '081288776655',
    meetingTitle: 'Daily Morning Briefing Tim Shift & Kesiapan Daya',
    meetingLocation: 'War room lt. 3',
    participantCount: 18,
    notes: 'Briefing rutin akhir pekan.',
    status: 'CONFIRMED',
    createdAt: '2026-08-21T07:30:00.000Z'
  },
  {
    id: 'b-009d',
    bookingNumber: 'HAR-20260824-0001',
    meetingDate: '2026-08-24',
    startTime: '09:00',
    durationHours: 3,
    endTime: '12:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Soto',
    makanSiang: 'Iya',
    bookerName: 'Ilham Syahputra',
    department: 'Pemeliharaan',
    whatsapp: '081366554433',
    meetingTitle: 'Kickoff Rencana Pemeliharaan Periodik Unit 2',
    meetingLocation: 'Room meeting Har',
    participantCount: 30,
    notes: 'Sediakan microphone meja dan proyektor.',
    status: 'CONFIRMED',
    createdAt: '2026-08-22T10:00:00.000Z'
  },
  {
    id: 'b-009e',
    bookingNumber: 'KKK-20260824-0002',
    meetingDate: '2026-08-24',
    startTime: '13:00',
    durationHours: 2,
    endTime: '15:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Rina Kusuma',
    department: 'K3 & Keamanan',
    whatsapp: '081555443322',
    meetingTitle: 'Audit SMK3 & Peninjauan Jalur Evakuasi Kebakaran',
    meetingLocation: 'Ruang integritas lt. 2',
    participantCount: 25,
    notes: 'Ruangan disterilkan 15 menit sebelum acara.',
    status: 'CONFIRMED',
    createdAt: '2026-08-23T09:00:00.000Z'
  },
  {
    id: 'b-010',
    bookingNumber: 'OPR-20260825-0001',
    meetingDate: '2026-08-25',
    startTime: '09:00',
    durationHours: 2,
    endTime: '11:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Iya',
    bookerName: 'Agus Purnomo',
    department: 'Operasi',
    whatsapp: '081234567891',
    meetingTitle: 'Rapat Koordinasi Efisiensi Boiler & Penanganan Batubara',
    meetingLocation: 'War room lt. 3',
    participantCount: 25,
    organizationOrGuests: 'Tim Operasi PLTU & Vendor Coal Handling',
    notes: 'Mohon proyektor dan mic wireless disiapkan.',
    status: 'CONFIRMED',
    createdAt: '2026-08-24T08:00:00.000Z'
  },
  {
    id: 'b-011',
    bookingNumber: 'KSA-20260825-0002',
    meetingDate: '2026-08-25',
    startTime: '10:00',
    durationHours: 2,
    endTime: '12:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Soto',
    makanSiang: 'Iya',
    bookerName: 'Maya Indriani',
    department: 'Keuangan & Umum',
    whatsapp: '081399887711',
    meetingTitle: 'Sosialisasi Kebijakan Anggaran Semester II & Audit Internal',
    meetingLocation: 'Room meeting KU lt. 1',
    participantCount: 30,
    organizationOrGuests: 'Divisi Keuangan & Tim SPI Kantor Pusat',
    notes: 'Sajikan snack sehat rebusan pukul 10:15.',
    status: 'BOOKED',
    createdAt: '2026-08-24T09:30:00.000Z'
  },
  {
    id: 'b-012',
    bookingNumber: 'HAR-20260825-0003',
    meetingDate: '2026-08-25',
    startTime: '13:30',
    durationHours: 2.5,
    endTime: '16:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Baso',
    makanSiang: 'Tidak',
    bookerName: 'Rudi Hartono',
    department: 'Pemeliharaan',
    whatsapp: '081711223344',
    meetingTitle: 'Technical Review Overhaul Turbin Generator Unit 1',
    meetingLocation: 'Room meeting Har',
    participantCount: 40,
    organizationOrGuests: 'Tim Engineer Overhaul & Tenaga Ahli Siemens',
    notes: 'Layar proyektor lebar digunakan untuk paparan diagram teknik.',
    status: 'CONFIRMED',
    createdAt: '2026-08-23T14:15:00.000Z'
  },
  {
    id: 'b-013',
    bookingNumber: 'ENJ-20260825-0004',
    meetingDate: '2026-08-25',
    startTime: '14:00',
    durationHours: 2,
    endTime: '16:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Fajar Nugraha',
    department: 'Enjiniring',
    whatsapp: '081544332211',
    meetingTitle: 'Kajian Modifikasi Cooling Water System & FGD',
    meetingLocation: 'Ruang integritas lt. 2',
    participantCount: 20,
    notes: 'Diskusi teknis tertutup divisi enjiniring.',
    status: 'CONFIRMED',
    createdAt: '2026-08-24T11:00:00.000Z'
  },
  {
    id: 'b-014',
    bookingNumber: 'CAH-20260826-0001',
    meetingDate: '2026-08-26',
    startTime: '09:00',
    durationHours: 2,
    endTime: '11:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Doni Pratama',
    department: 'Coal & Ash Handling',
    whatsapp: '081266778899',
    meetingTitle: 'Evaluasi Operasional Jetty & Unloading Tongkang',
    meetingLocation: 'War room lt. 3',
    participantCount: 20,
    notes: 'Sediakan layar proyektor untuk presentasi data logistik.',
    status: 'CONFIRMED',
    createdAt: '2026-08-25T08:30:00.000Z'
  },
  {
    id: 'b-015',
    bookingNumber: 'LIN-20260826-0002',
    meetingDate: '2026-08-26',
    startTime: '10:30',
    durationHours: 2,
    endTime: '12:30',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Soto',
    makanSiang: 'Iya',
    bookerName: 'Farhan Maulana',
    department: 'Lingkungan',
    whatsapp: '081877665544',
    meetingTitle: 'Sosialisasi Program Pengelolaan FABA (Fly Ash & Bottom Ash)',
    meetingLocation: 'Room meeting KU lt. 1',
    participantCount: 30,
    organizationOrGuests: 'Dinas Lingkungan Hidup Prov. Sumatera Barat',
    notes: 'Makan siang prasmanan disiapkan jam 12:00.',
    status: 'CONFIRMED',
    createdAt: '2026-08-25T10:00:00.000Z'
  },
  {
    id: 'b-016',
    bookingNumber: 'OPR-20260827-0001',
    meetingDate: '2026-08-27',
    startTime: '09:00',
    durationHours: 3,
    endTime: '12:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Baso',
    makanSiang: 'Iya',
    bookerName: 'Budi Santoso',
    department: 'Operasi',
    whatsapp: '081234567890',
    meetingTitle: 'Simulasi Tanggap Darurat Blackout & Kesiapan Sistem Kelistrikan',
    meetingLocation: 'War room lt. 3',
    participantCount: 25,
    organizationOrGuests: 'Tim Dispatcher UIP3B Sumatera',
    notes: 'Video conference online terhubung dengan kantor pusat.',
    status: 'CONFIRMED',
    createdAt: '2026-08-26T09:00:00.000Z'
  },
  {
    id: 'b-017',
    bookingNumber: 'HAR-20260827-0002',
    meetingDate: '2026-08-27',
    startTime: '14:00',
    durationHours: 2,
    endTime: '16:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Hendra Gunawan',
    department: 'Pemeliharaan',
    whatsapp: '081765432109',
    meetingTitle: 'Evaluasi Kinerja Pompa Feedwater & Condensate',
    meetingLocation: 'Room meeting Har',
    participantCount: 30,
    notes: 'Siapkan whiteboard tambahan.',
    status: 'BOOKED',
    createdAt: '2026-08-26T11:30:00.000Z'
  },
  {
    id: 'b-018',
    bookingNumber: 'DAN-20260828-0001',
    meetingDate: '2026-08-28',
    startTime: '09:30',
    durationHours: 2.5,
    endTime: '12:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Soto',
    makanSiang: 'Iya',
    bookerName: 'Arif Prasetyo',
    department: 'Pengadaan',
    whatsapp: '081122334455',
    meetingTitle: 'Klarifikasi & Negosiasi Pengadaan Sparepart Turbin',
    meetingLocation: 'Room meeting KU lt. 1',
    participantCount: 20,
    organizationOrGuests: 'Mitra Rekanan PT Nusantara Power Services',
    notes: 'Ruang meeting harap dipersiapkan dingin sebelum jam 09:15.',
    status: 'CONFIRMED',
    createdAt: '2026-08-27T08:00:00.000Z'
  },
  {
    id: 'b-019',
    bookingNumber: 'ENJ-20260828-0002',
    meetingDate: '2026-08-28',
    startTime: '14:00',
    durationHours: 2,
    endTime: '16:00',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Tidak',
    bookerName: 'Dewi Lestari',
    department: 'Enjiniring',
    whatsapp: '081299887766',
    meetingTitle: 'Monthly Review Performance & Heat Rate Pembangkit',
    meetingLocation: 'Ruang integritas lt. 2',
    participantCount: 25,
    notes: 'Disajikan kopi dan teh hangat.',
    status: 'CONFIRMED',
    createdAt: '2026-08-27T10:00:00.000Z'
  }
];

// BroadcastChannel for instant zero-latency cross-tab communication
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('siapin_booking_sync_channel') 
  : null;

// In-memory cache for ultra-fast synchronous UI rendering
let cachedBookings: Booking[] | null = null;
let isInitialized = false;

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LISTEN_EVENT));
    try {
      broadcastChannel?.postMessage({ type: 'BOOKINGS_CHANGED', timestamp: Date.now() });
    } catch {
      // Ignore broadcast errors
    }
  }
}

// Fetch all bookings from the central Express API and update local cache non-destructively
async function fetchBookingsFromServer(initialSync: boolean = false) {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/bookings');
    if (!res.ok) return;
    const serverBookings: Booking[] = await res.json();
    if (!Array.isArray(serverBookings)) return;

    // 1. Gather all local bookings currently available (cache or localStorage)
    let localItems: Booking[] = cachedBookings || [];
    if (localItems.length === 0) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localItems = parsed;
        }
      } catch {
        // Ignore JSON error
      }
    }

    // 2. Identify any local-only bookings (e.g. submitted while offline or before sync)
    const serverIds = new Set(serverBookings.map(b => b.id));
    const localOnly = localItems.filter(b => !serverIds.has(b.id));

    // 3. If there are local-only bookings, securely push them to the server immediately
    if (localOnly.length > 0) {
      fetch('/api/bookings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookings: localOnly })
      }).catch(() => {});
    }

    // 4. Non-destructive merge: union of server bookings and local bookings
    const mergedMap = new Map<string, Booking>();
    
    // Server bookings first
    serverBookings.forEach(b => mergedMap.set(b.id, b));
    
    // Always preserve local-only submitted bookings
    localOnly.forEach(b => mergedMap.set(b.id, b));

    // For overlapping bookings, keep the newest version or locally approved version
    localItems.forEach(localB => {
      const serverB = mergedMap.get(localB.id);
      if (serverB) {
        const localTime = new Date((localB as any).updatedAt || localB.createdAt || 0).getTime();
        const serverTime = new Date((serverB as any).updatedAt || serverB.createdAt || 0).getTime();
        if (localTime > serverTime) {
          mergedMap.set(localB.id, localB);
        }
      }
    });

    const finalBookings = Array.from(mergedMap.values());
    const currentStr = JSON.stringify(cachedBookings || []);
    const finalStr = JSON.stringify(finalBookings);

    if (currentStr !== finalStr) {
      cachedBookings = finalBookings;
      try {
        localStorage.setItem(STORAGE_KEY, finalStr);
      } catch {
        // Ignore localStorage quota errors
      }
      notifySubscribers();
    }
  } catch (err) {
    // Silent fail in offline or fallback to cache without ever deleting local data
  }
}

// Setup real-time listeners: SSE, BroadcastChannel, and interval polling
function setupRealtimeSync() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // 1. Initial server fetch & sync
  fetchBookingsFromServer(true);

  // 2. Setup Server-Sent Events (SSE) for instant push across all devices/accounts
  try {
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'bookings_changed' || payload.type === 'connected') {
          fetchBookingsFromServer(false);
        }
      } catch {
        fetchBookingsFromServer(false);
      }
    };
    eventSource.onerror = () => {
      // EventSource auto-reconnects
    };
  } catch {
    // SSE not supported or blocked
  }

  // 3. Fallback periodic polling every 2.5 seconds to guarantee interlock consistency
  setInterval(() => {
    fetchBookingsFromServer(false);
  }, 2500);

  // 4. Cross-tab BroadcastChannel listener
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'BOOKINGS_CHANGED') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            cachedBookings = JSON.parse(stored);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event(LISTEN_EVENT));
            }
          } catch {
            fetchBookingsFromServer(false);
          }
        } else {
          fetchBookingsFromServer(false);
        }
      }
    };
  }

  // 5. Cross-tab StorageEvent listener
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        cachedBookings = JSON.parse(e.newValue);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(LISTEN_EVENT));
        }
      } catch {
        fetchBookingsFromServer(false);
      }
    }
  });
}

// Auto-run realtime setup in browser
if (typeof window !== 'undefined') {
  setupRealtimeSync();
}

export const bookingStorage = {
  getAll(): Booking[] {
    if (typeof window === 'undefined') return INITIAL_BOOKINGS;

    // Return cached bookings if already loaded
    if (cachedBookings && Array.isArray(cachedBookings)) {
      return cachedBookings;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      cachedBookings = INITIAL_BOOKINGS;
      return INITIAL_BOOKINGS;
    }
    try {
      const parsed: Booking[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all default seeds are present if not already added
        const existingIds = new Set(parsed.map(b => b.id));
        const missingSeeds = INITIAL_BOOKINGS.filter(seed => !existingIds.has(seed.id));
        if (missingSeeds.length > 0) {
          const merged = [...parsed, ...missingSeeds];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          cachedBookings = merged;
          return merged;
        }
        cachedBookings = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      cachedBookings = INITIAL_BOOKINGS;
      return INITIAL_BOOKINGS;
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      cachedBookings = INITIAL_BOOKINGS;
      return INITIAL_BOOKINGS;
    }
  },

  getById(id: string): Booking | undefined {
    return this.getAll().find(b => b.id === id);
  },

  getByBookingNumber(bookingNumber: string): Booking | undefined {
    const cleanNum = bookingNumber.trim().toUpperCase();
    return this.getAll().find(b => 
      b.bookingNumber.toUpperCase() === cleanNum || 
      b.bookingNumber.toUpperCase().includes(cleanNum)
    );
  },

  search(query: string): Booking[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();
    return this.getAll().filter(b => 
      b.bookingNumber.toLowerCase().includes(q) ||
      b.bookerName.toLowerCase().includes(q) ||
      b.department.toLowerCase().includes(q) ||
      b.meetingTitle.toLowerCase().includes(q) ||
      b.whatsapp.includes(q) ||
      b.meetingLocation.toLowerCase().includes(q)
    );
  },

  create(formData: BookingFormData): Booking {
    const all = this.getAll();
    const endTime = calculateEndTime(formData.startTime, formData.durationHours);
    const newBooking: Booking = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookingNumber: generateDepartmentBookingNumber(formData.department, undefined, all),
      meetingDate: formData.meetingDate,
      startTime: formData.startTime,
      durationHours: formData.durationHours,
      endTime,
      snackRingan: formData.snackRingan,
      snackBerat: formData.snackBerat,
      makanSiang: formData.makanSiang,
      bookerName: formData.bookerName.trim(),
      department: formData.department.trim(),
      whatsapp: formData.whatsapp.trim(),
      meetingTitle: formData.meetingTitle.trim(),
      meetingLocation: formData.meetingLocation.trim(),
      participantCount: Number(formData.participantCount) || 1,
      organizationOrGuests: formData.organizationOrGuests?.trim() || undefined,
      invitationLetter: (formData.attachments && formData.attachments.length > 0) 
        ? formData.attachments[0] 
        : (formData.invitationLetter || undefined),
      attachments: (formData.attachments && formData.attachments.length > 0)
        ? formData.attachments
        : (formData.invitationLetter ? [formData.invitationLetter] : undefined),
      notes: formData.notes ? formData.notes.trim() : undefined,
      status: 'BOOKED',
      createdAt: new Date().toISOString()
    };

    const updated = [newBooking, ...all];
    cachedBookings = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
    notifySubscribers();

    // Persist to central server asynchronously
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    }).catch((err) => {
      console.warn('[SI APIN] Gagal sync booking ke server:', err);
    });

    return newBooking;
  },

  updateStatus(id: string, newStatus: BookingStatus, notes?: string, approvedBy?: string): Booking | undefined {
    const all = this.getAll();
    let updatedBooking: Booking | undefined;
    const updated = all.map(b => {
      if (b.id === id) {
        updatedBooking = {
          ...b,
          status: newStatus,
          approvalNotes: notes !== undefined ? notes : b.approvalNotes,
          approvedBy: approvedBy !== undefined ? approvedBy : (newStatus === 'CONFIRMED' ? (b.approvedBy || 'Admin Utama') : b.approvedBy),
          approvedAt: newStatus === 'CONFIRMED' ? new Date().toISOString() : b.approvedAt,
          updatedAt: new Date().toISOString()
        };
        return updatedBooking;
      }
      return b;
    });

    cachedBookings = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
    notifySubscribers();

    if (updatedBooking) {
      // Persist to central server asynchronously
      fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking)
      }).catch((err) => {
        console.warn('[SI APIN] Gagal sync status ke server:', err);
      });
    }

    return updatedBooking;
  },

  approveWithEdits(id: string, edits: Partial<Booking>, approvedBy: string = 'Admin Utama', approvalNotes?: string): Booking | undefined {
    const all = this.getAll();
    let updatedBooking: Booking | undefined;
    const updated = all.map(b => {
      if (b.id === id) {
        const startTime = edits.startTime ?? b.startTime;
        const durationHours = edits.durationHours ?? b.durationHours;
        const endTime = calculateEndTime(startTime, durationHours);

        updatedBooking = {
          ...b,
          ...edits,
          status: 'CONFIRMED' as BookingStatus,
          endTime,
          approvedBy,
          approvalNotes: approvalNotes ?? edits.approvalNotes ?? b.approvalNotes,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return updatedBooking;
      }
      return b;
    });

    cachedBookings = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
    notifySubscribers();

    if (updatedBooking) {
      // Persist to central server asynchronously
      fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking)
      }).catch((err) => {
        console.warn('[SI APIN] Gagal sync edit persetujuan ke server:', err);
      });
    }

    return updatedBooking;
  },

  update(id: string, updates: Partial<Booking>): Booking | undefined {
    const all = this.getAll();
    let updatedBooking: Booking | undefined;
    const updated = all.map(b => {
      if (b.id === id) {
        const endTime = (updates.startTime || updates.durationHours)
          ? calculateEndTime(updates.startTime || b.startTime, updates.durationHours ?? b.durationHours)
          : b.endTime;

        updatedBooking = {
          ...b,
          ...updates,
          endTime,
          updatedAt: new Date().toISOString()
        };
        return updatedBooking;
      }
      return b;
    });

    cachedBookings = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
    notifySubscribers();

    if (updatedBooking) {
      // Persist to central server asynchronously
      fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking)
      }).catch((err) => {
        console.warn('[SI APIN] Gagal sync update ke server:', err);
      });
    }

    return updatedBooking;
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter(b => b.id !== id);
    if (filtered.length !== all.length) {
      cachedBookings = filtered;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch {
        // Ignore quota errors
      }
      notifySubscribers();

      // Delete on central server asynchronously
      fetch(`/api/bookings/${id}`, {
        method: 'DELETE'
      }).catch((err) => {
        console.warn('[SI APIN] Gagal hapus di server:', err);
      });

      return true;
    }
    return false;
  },

  reset(): void {
    const all = this.getAll();
    const seedIds = new Set(INITIAL_BOOKINGS.map(s => s.id));
    const userSubmitted = all.filter(b => !seedIds.has(b.id));
    const preserved = [...userSubmitted, ...INITIAL_BOOKINGS];
    cachedBookings = preserved;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preserved));
    } catch {
      // Ignore quota errors
    }
    notifySubscribers();

    // Reset on central server asynchronously while protecting submitted bookings
    fetch('/api/bookings/reset', {
      method: 'POST'
    }).catch((err) => {
      console.warn('[SI APIN] Gagal reset di server:', err);
    });
  },

  /**
   * Rekap Konsumsi calculation for a specific date
   * STRICT REQUIREMENT: If status is CANCELLED, DO NOT include in rekap!
   * Counts BOOKED, CONFIRMED, COMPLETED only.
   */
  getRekap(dateStr: string): RekapHarian {
    const all = this.getAll();
    const dayBookings = all.filter(b => b.meetingDate === dateStr);
    
    // Filter out CANCELLED bookings as explicitly instructed
    const activeBookings = dayBookings.filter(b => b.status !== 'CANCELLED');

    const rekap: RekapHarian = {
      date: dateStr,
      totalMeeting: activeBookings.length,
      totalPeserta: 0,
      snackRingan: {
        'Snack Mix Basah Kering': 0,
        'Snack Sehat Rebusan': 0
      },
      snackBerat: {
        'Baso': 0,
        'Sate Padang': 0,
        'Soto': 0,
        'Siomay / Batagor': 0,
        'Nasi Uduk': 0,
        'Nasi Goreng': 0
      },
      makanSiang: {
        'Iya': 0,
        'Tidak': 0
      },
      bookings: dayBookings // include all for table, with clear cancelled badge
    };

    activeBookings.forEach(booking => {
      const count = Number(booking.participantCount) || 0;
      rekap.totalPeserta += count;

      // Snack Ringan
      if (booking.snackRingan === 'Snack Mix Basah Kering') {
        rekap.snackRingan['Snack Mix Basah Kering'] += count;
      } else if (booking.snackRingan === 'Snack Sehat Rebusan') {
        rekap.snackRingan['Snack Sehat Rebusan'] += count;
      }

      // Snack Berat
      if (booking.snackBerat === 'Baso') {
        rekap.snackBerat['Baso'] += count;
      } else if (booking.snackBerat === 'Sate Padang' || booking.snackBerat === 'Sate') {
        rekap.snackBerat['Sate Padang'] += count;
      } else if (booking.snackBerat === 'Soto') {
        rekap.snackBerat['Soto'] += count;
      } else if (booking.snackBerat === 'Siomay / Batagor') {
        rekap.snackBerat['Siomay / Batagor'] += count;
      } else if (booking.snackBerat === 'Nasi Uduk') {
        rekap.snackBerat['Nasi Uduk'] += count;
      } else if (booking.snackBerat === 'Nasi Goreng') {
        rekap.snackBerat['Nasi Goreng'] += count;
      }

      // Makan Siang
      if (booking.makanSiang === 'Iya') {
        rekap.makanSiang['Iya'] += count;
      } else if (booking.makanSiang === 'Tidak') {
        rekap.makanSiang['Tidak'] += count;
      }
    });

    return rekap;
  },

  subscribe(callback: () => void) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(LISTEN_EVENT, callback);
    return () => window.removeEventListener(LISTEN_EVENT, callback);
  }
};
