import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// High body limit to support base64 document attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS headers to enable seamless multi-origin & iframe communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Diagnostic request logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') && req.url !== '/api/health') {
    console.log(`[API ${req.method}] ${req.url}`);
  }
  next();
});

// Persistent JSON Storage Directory
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'activity_logs.json');
const LOGS_BACKUP_FILE = path.join(DATA_DIR, 'activity_logs_backup.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default corporate seed bookings
const SEED_BOOKINGS = [
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
    id: 'b-keu-20260908-01',
    bookingNumber: 'KSA-20260908-0001',
    meetingDate: '2026-09-08',
    startTime: '09:30',
    durationHours: 2,
    endTime: '11:30',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Iya',
    bookerName: 'Siti Rahmawati (Keuangan)',
    department: 'Keuangan & Umum',
    whatsapp: '081398765432',
    meetingTitle: 'Rapat Koordinasi Anggaran & Evaluasi Keuangan Semester II',
    meetingLocation: 'Room meeting KU lt. 1',
    participantCount: 20,
    organizationOrGuests: 'Tim Anggaran & Akuntansi PLTU Teluk Sirih',
    notes: 'Mohon proyektor dan snack disiapkan sebelum jam 09:30.',
    status: 'BOOKED',
    createdAt: '2026-09-08T02:30:00.000Z'
  },
  {
    id: 'b-adm-20260909-01',
    bookingNumber: 'ADM-20260909-0001',
    meetingDate: '2026-09-09',
    startTime: '09:00',
    durationHours: 2,
    endTime: '11:00',
    snackRingan: 'Snack Mix Basah Kering',
    snackBerat: 'Tidak Ada',
    makanSiang: 'Iya',
    bookerName: 'Admin SI APIN',
    department: 'Operasi',
    whatsapp: '081266554433',
    meetingTitle: 'Review Program Kerja & Evaluasi Fasilitas Operasional PLTU',
    meetingLocation: 'Ruang Rapat Lantai 2 Kantor Utama',
    participantCount: 25,
    organizationOrGuests: 'Manajemen & Tim Operasional PLTU',
    notes: 'Kegiatan pagi: evaluasi fasilitas dan kesiapan unit.',
    status: 'CONFIRMED',
    createdAt: '2026-09-08T03:00:00.000Z'
  },
  {
    id: 'b-adm-20260909-02',
    bookingNumber: 'ADM-20260909-0002',
    meetingDate: '2026-09-09',
    startTime: '13:30',
    durationHours: 2,
    endTime: '15:30',
    snackRingan: 'Snack Sehat Rebusan',
    snackBerat: 'Soto',
    makanSiang: 'Tidak',
    bookerName: 'Admin SI APIN',
    department: 'Operasi',
    whatsapp: '081266554433',
    meetingTitle: 'Sosialisasi Standar Pelayanan & Housekeeping Area PLTU Teluk Sirih',
    meetingLocation: 'Ruang Rapat Lantai 1',
    participantCount: 30,
    organizationOrGuests: 'Tim Administrasi & Pelayanan Fasilitas',
    notes: 'Kegiatan siang: snack sehat dan soto disiapkan pukul 13:15.',
    status: 'CONFIRMED',
    createdAt: '2026-09-08T03:15:00.000Z'
  }
];

// Helper functions for reading and writing data safely
function readBookings(): any[] {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(SEED_BOOKINGS, null, 2), 'utf-8');
      return SEED_BOOKINGS;
    }
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_BOOKINGS;
  } catch (err) {
    console.error('Error reading bookings file:', err);
    return SEED_BOOKINGS;
  }
}

const BACKUP_FILE = path.join(DATA_DIR, 'bookings_backup.json');

function writeBookings(data: any[]): void {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
    notifySSE('bookings_changed');
  } catch (err) {
    console.error('Error writing bookings file:', err);
  }
}

// Server-Sent Events (SSE) Client Connections
type SSEClient = express.Response;
const sseClients = new Set<SSEClient>();

function notifySSE(eventType: string, payload?: any) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// SSE Stream for Real-time Interlock Updates across All Tabs & Devices
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);
  sseClients.add(res);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// GET all bookings
app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

// POST create booking
app.post('/api/bookings', (req, res) => {
  const newBooking = req.body;
  if (!newBooking || !newBooking.id || !newBooking.meetingTitle) {
    return res.status(400).json({ error: 'Data booking tidak lengkap' });
  }

  const current = readBookings();
  // Put new booking at the top
  const updated = [newBooking, ...current.filter((b) => b.id !== newBooking.id)];
  writeBookings(updated);

  res.status(201).json(newBooking);
});

// PUT update / approve booking
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const current = readBookings();
  let found = false;
  let updatedItem: any = null;

  const updated = current.map((b) => {
    if (b.id === id) {
      found = true;
      updatedItem = { ...b, ...updates, updatedAt: new Date().toISOString() };
      return updatedItem;
    }
    return b;
  });

  if (!found) {
    return res.status(404).json({ error: 'Booking tidak ditemukan' });
  }

  writeBookings(updated);
  res.json(updatedItem);
});

// DELETE booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const current = readBookings();
  const filtered = current.filter((b) => b.id !== id);

  writeBookings(filtered);
  res.json({ success: true, deletedId: id });
});

// POST reset bookings: restores seed bookings while safely preserving all custom bookings submitted by users
app.post('/api/bookings/reset', (req, res) => {
  const current = readBookings();
  const seedIds = new Set(SEED_BOOKINGS.map(s => s.id));
  const userSubmitted = current.filter(b => !seedIds.has(b.id));
  const preserved = [...userSubmitted, ...SEED_BOOKINGS];
  writeBookings(preserved);
  res.json({ success: true, count: preserved.length, preservedCustomCount: userSubmitted.length });
});

// POST sync multiple bookings (e.g. initial upload or bulk sync)
app.post('/api/bookings/sync', (req, res) => {
  const { bookings } = req.body;
  if (!Array.isArray(bookings)) {
    return res.status(400).json({ error: 'Array bookings dibutuhkan' });
  }

  const current = readBookings();
  const currentMap = new Map<string, any>();
  current.forEach((b) => currentMap.set(b.id, b));

  let changed = false;
  bookings.forEach((incoming) => {
    if (!incoming || !incoming.id) return;
    const existing = currentMap.get(incoming.id);
    if (!existing) {
      currentMap.set(incoming.id, incoming);
      changed = true;
    } else {
      // If incoming has newer status or timestamp, update it
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const incomingTime = new Date(incoming.updatedAt || incoming.createdAt || 0).getTime();
      if (incomingTime >= existingTime && JSON.stringify(existing) !== JSON.stringify(incoming)) {
        currentMap.set(incoming.id, { ...existing, ...incoming });
        changed = true;
      }
    }
  });

  const merged = Array.from(currentMap.values());
  if (changed) {
    writeBookings(merged);
  }

  res.json({ success: true, count: merged.length, bookings: merged });
});

// ==========================================
// USER ACCOUNTS ENDPOINTS
// ==========================================
const SEED_USERS = [
  {
    id: 'usr-admin-nofi',
    username: 'nofi',
    name: 'NOFI ZAHARA',
    role: 'ADMIN',
    department: 'Keuangan & Umum (Admin User 1)',
    password: 'admin123',
    avatarText: 'NZ',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-resna',
    username: 'resna',
    name: 'RESNA WATI',
    role: 'ADMIN',
    department: 'Keuangan & Umum (Admin User 2)',
    password: 'admin123',
    avatarText: 'RW',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-deri',
    username: 'deri',
    name: 'DERI TIALIS PERISTIAWAN',
    role: 'ADMIN',
    department: 'Sistem Informasi & TI (Admin Aplikasi 1)',
    password: 'admin123',
    avatarText: 'DP',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin-yuda',
    username: 'yuda',
    name: 'YUDA PUTRA UTAMA',
    role: 'ADMIN',
    department: 'Sistem Informasi & TI (Admin Aplikasi 2)',
    password: 'admin123',
    avatarText: 'YP',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator Si APIN (Master)',
    role: 'ADMIN',
    department: 'Keuangan & Umum',
    password: 'admin123',
    avatarText: 'AD',
    lastLogin: '2026-08-20T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ops',
    username: 'operasi',
    name: 'PIC Operasi',
    role: 'USER',
    department: 'Operasi',
    password: 'user123',
    avatarText: 'OP',
    lastLogin: '2026-08-19T09:15:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-har',
    username: 'pemeliharaan',
    name: 'PIC Pemeliharaan',
    role: 'USER',
    department: 'Pemeliharaan',
    password: 'user123',
    avatarText: 'PH',
    lastLogin: '2026-08-19T11:20:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-enj',
    username: 'enjiniring',
    name: 'PIC Enjiniring',
    role: 'USER',
    department: 'Enjiniring',
    password: 'user123',
    avatarText: 'EN',
    lastLogin: '2026-08-18T14:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-cah',
    username: 'coal_ash',
    name: 'PIC Coal & Ash Handling',
    role: 'USER',
    department: 'Coal & Ash Handling',
    password: 'user123',
    avatarText: 'CA',
    lastLogin: '2026-08-17T10:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ku',
    username: 'keuangan',
    name: 'PIC Keuangan & Umum',
    role: 'USER',
    department: 'Keuangan & Umum',
    password: 'user123',
    avatarText: 'KU',
    lastLogin: '2026-08-19T13:45:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-k3',
    username: 'k3_keamanan',
    name: 'PIC K3 & Keamanan',
    role: 'USER',
    department: 'K3 & Keamanan',
    password: 'user123',
    avatarText: 'K3',
    lastLogin: '2026-08-18T16:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ling',
    username: 'lingkungan',
    name: 'PIC Lingkungan Hidup',
    role: 'USER',
    department: 'Lingkungan',
    password: 'user123',
    avatarText: 'LH',
    lastLogin: '2026-08-16T08:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-proc',
    username: 'pengadaan',
    name: 'PIC Pengadaan',
    role: 'USER',
    department: 'Pengadaan',
    password: 'user123',
    avatarText: 'PG',
    lastLogin: '2026-08-19T15:10:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-smt',
    username: 'sm_terintegrasi',
    name: 'PIC Sistem Manajemen Terintegrasi',
    role: 'USER',
    department: 'Sistem Manajemen Terintegrasi',
    password: 'user123',
    avatarText: 'SM',
    lastLogin: '2026-08-20T09:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

function readUsers(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(SEED_USERS, null, 2), 'utf-8');
      return SEED_USERS;
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_USERS;

    let modified = false;
    SEED_USERS.forEach(seed => {
      const exists = parsed.some(p => p.username.toLowerCase() === seed.username.toLowerCase());
      if (!exists) {
        parsed.unshift(seed);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch {
    return SEED_USERS;
  }
}

function writeUsers(data: any[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    notifySSE('users_changed');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

app.get('/api/users', (req, res) => {
  res.json(readUsers());
});

app.post('/api/users/sync', (req, res) => {
  const { users } = req.body;
  if (Array.isArray(users)) {
    writeUsers(users);
    return res.json({ success: true, count: users.length });
  }
  res.status(400).json({ error: 'Array users dibutuhkan' });
});

// ==========================================
// ACTIVITY AUDIT LOGS ENDPOINTS
// ==========================================
const SEED_LOGS = [
  {
    id: 'log-001',
    timestamp: '2026-09-08T02:25:00.000Z',
    userId: 'usr-ku',
    userName: 'PIC Keuangan & Umum',
    userDepartment: 'Keuangan & Umum',
    userRole: 'USER',
    action: 'LOGIN',
    details: 'Berhasil login ke sistem SI APIN dari IP Internal PLTU'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-08T02:30:00.000Z',
    userId: 'usr-ku',
    userName: 'PIC Keuangan & Umum',
    userDepartment: 'Keuangan & Umum',
    userRole: 'USER',
    action: 'BOOKING_CREATE',
    targetId: 'KSA-20260908-0001',
    details: 'Mengajukan booking baru: "Rapat Koordinasi Anggaran & Evaluasi Keuangan Semester II" (Room meeting KU lt. 1)'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-08T02:50:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'LOGIN',
    details: 'Login administrator ke portal pengelolaan fasilitas'
  },
  {
    id: 'log-004',
    timestamp: '2026-09-08T03:00:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'BOOKING_CREATE',
    targetId: 'ADM-20260909-0001',
    details: 'Membuat jadwal kegiatan: "Review Program Kerja & Evaluasi Fasilitas Operasional PLTU" (Ruang Rapat Lantai 2)'
  },
  {
    id: 'log-005',
    timestamp: '2026-09-08T03:15:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'BOOKING_CREATE',
    targetId: 'ADM-20260909-0002',
    details: 'Membuat jadwal kegiatan: "Sosialisasi Standar Pelayanan & Housekeeping Area PLTU Teluk Sirih" (Ruang Rapat Lantai 1)'
  },
  {
    id: 'log-006',
    timestamp: '2026-09-08T03:30:00.000Z',
    userId: 'usr-admin',
    userName: 'Administrator (Admin Si APIN)',
    userDepartment: 'Administrasi',
    userRole: 'ADMIN',
    action: 'BOOKING_APPROVE',
    targetId: 'OPR-20260820-0001',
    details: 'Menyetujui permohonan booking OPR-20260820-0001 (Meeting Koordinasi Operasional Unit)'
  }
];

function readActivityLogs(): any[] {
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      fs.writeFileSync(LOGS_FILE, JSON.stringify(SEED_LOGS, null, 2), 'utf-8');
      return SEED_LOGS;
    }
    const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_LOGS;
  } catch {
    return SEED_LOGS;
  }
}

function writeActivityLogs(data: any[]): void {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    fs.writeFileSync(LOGS_BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
    notifySSE('activity_logged');
  } catch (err) {
    console.error('Error writing activity logs:', err);
  }
}

// GET activity logs with optional user or action filter
app.get('/api/logs', (req, res) => {
  const { user, action, limit } = req.query;
  let logs = readActivityLogs();

  if (user && typeof user === 'string') {
    const cleanUser = user.toLowerCase();
    logs = logs.filter(
      (l) =>
        (l.userId && l.userId.toLowerCase().includes(cleanUser)) ||
        (l.userName && l.userName.toLowerCase().includes(cleanUser)) ||
        (l.userDepartment && l.userDepartment.toLowerCase().includes(cleanUser))
    );
  }

  if (action && typeof action === 'string') {
    logs = logs.filter((l) => l.action === action);
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (limit && !isNaN(Number(limit))) {
    logs = logs.slice(0, Number(limit));
  }

  res.json(logs);
});

// POST new activity log entry
app.post('/api/logs', (req, res) => {
  const newLog = req.body;
  if (!newLog || !newLog.action || !newLog.details) {
    return res.status(400).json({ error: 'Data log tidak lengkap' });
  }

  const logEntry = {
    id: newLog.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: newLog.timestamp || new Date().toISOString(),
    userId: newLog.userId || 'anonymous',
    userName: newLog.userName || 'Pengguna',
    userDepartment: newLog.userDepartment || '-',
    userRole: newLog.userRole || 'USER',
    action: newLog.action,
    details: newLog.details,
    targetId: newLog.targetId,
    metadata: newLog.metadata
  };

  const current = readActivityLogs();
  // Keep up to 2000 most recent logs
  const updated = [logEntry, ...current].slice(0, 2000);
  writeActivityLogs(updated);

  res.status(201).json(logEntry);
});

// POST sync activity logs
app.post('/api/logs/sync', (req, res) => {
  const { logs } = req.body;
  if (!Array.isArray(logs)) {
    return res.status(400).json({ error: 'Array logs dibutuhkan' });
  }

  const current = readActivityLogs();
  const currentIds = new Set(current.map((l) => l.id));
  const newLogs = logs.filter((l) => l && l.id && !currentIds.has(l.id));

  if (newLogs.length > 0) {
    const merged = [...newLogs, ...current]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 2000);
    writeActivityLogs(merged);
    return res.json({ success: true, count: merged.length, added: newLogs.length });
  }

  res.json({ success: true, count: current.length, added: 0 });
});

// DELETE clear activity logs (admin action)
app.delete('/api/logs', (req, res) => {
  writeActivityLogs(SEED_LOGS);
  res.json({ success: true, message: 'Logs di-reset ke log awal' });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SI APIN] Central server running on port ${PORT} (0.0.0.0)`);
  });
}

startServer();
