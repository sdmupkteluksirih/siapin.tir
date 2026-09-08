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

// Persistent JSON Storage Directory
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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
  const currentIds = new Set(current.map(b => b.id));
  
  // Merge client bookings with server bookings
  const newItems = bookings.filter(b => !currentIds.has(b.id));
  if (newItems.length > 0) {
    const merged = [...newItems, ...current];
    writeBookings(merged);
    return res.json({ synced: newItems.length, total: merged.length });
  }

  res.json({ synced: 0, total: current.length });
});

// ==========================================
// USER ACCOUNTS ENDPOINTS
// ==========================================
const SEED_USERS = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator (Admin Si APIN / Konsumsi)',
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
    return Array.isArray(parsed) ? parsed : SEED_USERS;
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
