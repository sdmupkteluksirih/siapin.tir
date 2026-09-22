import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { emailService } from './server/emailService';

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
const BANK_DATA_FILE = path.join(DATA_DIR, 'master_bank_data.json');

// Master Bank Data Synchronizer: unifies users, bookings, activity logs, and metadata into a single authoritative source
function syncMasterBankData(triggerEvent?: string): void {
  try {
    const users = readUsers();
    const bookings = readBookings();
    const logs = readActivityLogs();

    const masterBank = {
      system: 'SI APIN - PT PLN Indonesia Power UBP Teluk Sirih',
      schemaVersion: '2.0-unified',
      lastUpdated: new Date().toISOString(),
      lastTrigger: triggerEvent || 'system_init',
      meta: {
        totalAccounts: users.length,
        totalBookings: bookings.length,
        totalActivityLogs: logs.length,
        activeBookings: bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'BOOKED').length,
      },
      accounts: users,
      bookings: bookings,
      activityLogs: logs
    };

    fs.writeFileSync(BANK_DATA_FILE, JSON.stringify(masterBank, null, 2), 'utf-8');
    notifySSE('bank_data_synced', { lastUpdated: masterBank.lastUpdated, meta: masterBank.meta });
  } catch (err) {
    console.error('[Bank Data] Error synchronizing master bank data:', err);
  }
}

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (dirErr) {
  console.warn('[Storage] Notice: Filesystem may be readonly in serverless runtime:', dirErr);
}

// Initialize Master Bank Data immediately on startup
setTimeout(() => {
  try {
    syncMasterBankData('boot_startup');
  } catch {}
}, 500);

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
    syncMasterBankData('bookings_changed');
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

  const creatorUser = (req.body._user as any) || {};
  const actorId = creatorUser.username || creatorUser.id || newBooking.createdById || newBooking.bookerUsername || newBooking.department || 'user';
  const actorName = creatorUser.name || newBooking.createdByName || newBooking.bookerName || 'Pengguna';
  const actorDept = creatorUser.department || newBooking.createdByDepartment || newBooking.department || '-';
  const actorRole = creatorUser.role || newBooking.createdByRole || 'USER';
  const nowIso = new Date().toISOString();

  newBooking.createdById = newBooking.createdById || actorId;
  newBooking.createdByName = newBooking.createdByName || actorName;
  newBooking.createdByDepartment = newBooking.createdByDepartment || actorDept;
  newBooking.createdByRole = newBooking.createdByRole || actorRole;

  newBooking.lastModifiedById = actorId;
  newBooking.lastModifiedByName = actorName;
  newBooking.lastModifiedByDepartment = actorDept;
  newBooking.lastModifiedByRole = actorRole;
  newBooking.lastModifiedAt = nowIso;
  newBooking.lastAction = 'DIBUAT';

  if (!Array.isArray(newBooking.history)) {
    newBooking.history = [];
  }
  if (newBooking.history.length === 0) {
    newBooking.history.push({
      timestamp: nowIso,
      action: 'DIBUAT',
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      userDepartment: actorDept,
      notes: `Pengajuan booking ${newBooking.bookingNumber}`
    });
  }
  delete newBooking._user;

  const current = readBookings();
  // Put new booking at the top
  const updated = [newBooking, ...current.filter((b) => b.id !== newBooking.id)];
  writeBookings(updated);

  // Record audit log to central bank data
  try {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowIso,
      userId: actorId,
      userName: actorName,
      userDepartment: actorDept,
      userRole: actorRole,
      action: 'BOOKING_CREATE',
      details: `Pengajuan booking rapat baru oleh ${actorName} (${actorId}): ${newBooking.bookingNumber} - "${newBooking.meetingTitle}" (${newBooking.meetingLocation}, ${newBooking.meetingDate} ${newBooking.startTime}-${newBooking.endTime})`,
      targetId: newBooking.bookingNumber,
      metadata: {
        bookingId: newBooking.id,
        bookingNumber: newBooking.bookingNumber,
        department: newBooking.department,
        participantCount: newBooking.participantCount,
        makanSiang: newBooking.makanSiang,
        snackRingan: newBooking.snackRingan,
        snackBerat: newBooking.snackBerat
      }
    };
    const currentLogs = readActivityLogs();
    currentLogs.unshift(logItem);
    writeActivityLogs(currentLogs);
  } catch (err) {
    console.error('Error writing booking create audit log:', err);
  }

  // Send asynchronous notification email to admins
  const origin = `${req.protocol}://${req.get('host')}`;
  emailService.sendNewBookingAdminAlert(newBooking, origin).catch((err) => {
    console.error('[API] Gagal kirim email alert admin:', err);
  });

  res.status(201).json(newBooking);
});

// PUT update / approve booking
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const current = readBookings();
  let found = false;
  let updatedItem: any = null;
  let originalItem: any = null;

  const actor = (updates._user as any) || {};
  const actorId = actor.username || actor.id || updates.lastModifiedById || updates.approvedBy || 'admin';
  const actorName = actor.name || updates.lastModifiedByName || updates.approvedBy || 'Administrator';
  const actorDept = actor.department || updates.lastModifiedByDepartment || 'Administrasi';
  const actorRole = actor.role || updates.lastModifiedByRole || 'ADMIN';
  const nowIso = new Date().toISOString();

  let statusChanged = false;
  let notesChanged = false;

  const updated = current.map((b) => {
    if (b.id === id) {
      found = true;
      originalItem = { ...b };

      statusChanged = updates.status !== undefined && originalItem.status !== updates.status;
      notesChanged = updates.approvalNotes !== undefined && originalItem.approvalNotes !== updates.approvalNotes;

      let actionDesc = 'DIPERBARUI';
      if (statusChanged) {
        if (updates.status === 'CONFIRMED') {
          actionDesc = 'DISETUJUI (APPROVED)';
        } else if (updates.status === 'CANCELLED') {
          actionDesc = 'DIBATALKAN';
        } else if (updates.status === 'COMPLETED') {
          actionDesc = 'SELESAI';
        } else {
          actionDesc = `STATUS DIUBAH (${updates.status})`;
        }
      } else if (notesChanged) {
        actionDesc = 'CATATAN APPROVAL DIPERBARUI';
      }

      const existingHistory = Array.isArray(originalItem.history) ? [...originalItem.history] : [];
      existingHistory.push({
        timestamp: nowIso,
        action: actionDesc,
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        userDepartment: actorDept,
        notes: updates.approvalNotes || updates.notes || undefined
      });

      updatedItem = {
        ...b,
        ...updates,
        updatedAt: nowIso,
        lastModifiedById: actorId,
        lastModifiedByName: actorName,
        lastModifiedByDepartment: actorDept,
        lastModifiedByRole: actorRole,
        lastModifiedAt: nowIso,
        lastAction: actionDesc,
        history: existingHistory
      };
      delete updatedItem._user;
      return updatedItem;
    }
    return b;
  });

  if (!found || !updatedItem) {
    return res.status(404).json({ error: 'Booking tidak ditemukan' });
  }

  writeBookings(updated);

  // Record audit log to central bank data
  try {
    let actionType = 'BOOKING_UPDATE';
    let detailMsg = `Update data jadwal booking ${updatedItem.bookingNumber} ("${updatedItem.meetingTitle}") oleh ${actorName} (${actorId})`;

    if (statusChanged) {
      if (updatedItem.status === 'CONFIRMED') {
        actionType = 'BOOKING_APPROVE';
        detailMsg = `Admin ${actorName} (${actorId}) menyetujui (approve) booking ${updatedItem.bookingNumber} ("${updatedItem.meetingTitle}")`;
      } else if (updatedItem.status === 'CANCELLED') {
        actionType = 'BOOKING_CANCEL';
        detailMsg = `Permohonan booking ${updatedItem.bookingNumber} ("${updatedItem.meetingTitle}") dibatalkan oleh ${actorName} (${actorId})`;
      } else {
        detailMsg = `Status booking ${updatedItem.bookingNumber} diubah menjadi ${updatedItem.status} oleh ${actorName} (${actorId})`;
      }
    }

    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowIso,
      userId: actorId,
      userName: actorName,
      userDepartment: actorDept,
      userRole: actorRole,
      action: actionType,
      details: detailMsg,
      targetId: updatedItem.bookingNumber,
      metadata: {
        bookingId: updatedItem.id,
        status: updatedItem.status,
        approvalNotes: updatedItem.approvalNotes,
        approvedBy: updatedItem.approvedBy,
        lastModifiedById: actorId,
        lastModifiedByName: actorName
      }
    };
    const currentLogs = readActivityLogs();
    currentLogs.unshift(logItem);
    writeActivityLogs(currentLogs);
  } catch (err) {
    console.error('Error writing booking update audit log:', err);
  }

  // If status changed or approval notes were updated, send email notification to user
  if (statusChanged || notesChanged) {
    const origin = `${req.protocol}://${req.get('host')}`;
    emailService.sendBookingStatusUpdateUserAlert(updatedItem, originalItem?.status, origin).catch((err) => {
      console.error('[API] Gagal kirim email update status ke user:', err);
    });
  }

  res.json(updatedItem);
});

// GET email config (safe public view)
app.get('/api/email-config', (req, res) => {
  res.json(emailService.getPublicConfig());
});

// POST email config
app.post('/api/email-config', (req, res) => {
  const success = emailService.updateConfig(req.body);
  if (success) {
    res.json({ success: true, config: emailService.getPublicConfig() });
  } else {
    res.status(500).json({ error: 'Gagal memperbarui konfigurasi email' });
  }
});

// POST test email
app.post('/api/test-email', async (req, res) => {
  const { targetEmail } = req.body;
  if (!targetEmail) {
    return res.status(400).json({ error: 'Alamat email tujuan wajib diisi' });
  }
  const result = await emailService.sendTestEmail(targetEmail);
  res.json(result);
});

// GET email notification logs
app.get('/api/email-logs', (req, res) => {
  res.json(emailService.getLogs());
});

// DELETE booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const current = readBookings();
  const target = current.find((b) => b.id === id);
  const filtered = current.filter((b) => b.id !== id);

  writeBookings(filtered);

  if (target) {
    try {
      const logItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        userId: 'admin',
        userName: 'Administrator',
        userDepartment: 'Administrasi',
        userRole: 'ADMIN',
        action: 'BOOKING_DELETE',
        details: `Menghapus data permohonan booking ${target.bookingNumber} ("${target.meetingTitle}") dari bank data`,
        targetId: target.bookingNumber,
        metadata: {
          deletedId: id,
          bookingNumber: target.bookingNumber,
          meetingTitle: target.meetingTitle,
          department: target.department
        }
      };
      const currentLogs = readActivityLogs();
      currentLogs.unshift(logItem);
      writeActivityLogs(currentLogs);
    } catch (err) {
      console.error('Error writing booking delete audit log:', err);
    }
  }

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
    email: 'nofi.zahara@pln.co.id',
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
    email: 'resna.wati@pln.co.id',
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
    email: 'deri.tialis@pln.co.id',
    password: 'PLNip@2026',
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
    email: 'yuda.putra@pln.co.id',
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
    email: 'sdm.upkteluksirih@gmail.com',
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
    email: 'operasi.teluksirih@gmail.com',
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
    email: 'pemeliharaan.teluksirih@gmail.com',
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
    email: 'enjiniring.teluksirih@gmail.com',
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
    email: 'coalash.teluksirih@gmail.com',
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
    email: 'keuangan.teluksirih@gmail.com',
    password: 'PLNip@KU2026',
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
    email: 'k3.teluksirih@gmail.com',
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
    email: 'lingkungan.teluksirih@gmail.com',
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
    email: 'pengadaan.teluksirih@gmail.com',
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
    email: 'smt.teluksirih@gmail.com',
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
      const existing = parsed.find(p => p.id === seed.id || (p.username && p.username.toLowerCase() === seed.username.toLowerCase()));
      if (!existing) {
        parsed.unshift(seed);
        modified = true;
      } else {
        // Backfill email if missing
        if (!existing.email && seed.email) {
          existing.email = seed.email;
          modified = true;
        }
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
    notifySSE('users_changed', { users: data });
    syncMasterBankData('users_changed');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

app.get('/api/users', (req, res) => {
  res.json(readUsers());
});

app.post('/api/users/sync', (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ error: 'Array users dibutuhkan' });
  }

  const currentUsers = readUsers();
  // Safe merge: update existing without wiping passwords if incoming has empty password
  const mergedList = currentUsers.map((existing: any) => {
    const incoming = users.find((u: any) => 
      u.id === existing.id || 
      (u.username && u.username.toLowerCase() === existing.username?.toLowerCase())
    );
    if (!incoming) return existing;
    return {
      ...existing,
      email: incoming.email !== undefined ? incoming.email : existing.email,
      password: (incoming.password && String(incoming.password).trim().length >= 4) ? String(incoming.password).trim() : existing.password,
      name: incoming.name || existing.name,
      department: incoming.department || existing.department,
      role: incoming.role || existing.role
    };
  });

  // Also include any new users that were created
  users.forEach((incoming: any) => {
    if (!mergedList.some((m: any) => m.id === incoming.id || (m.username && m.username.toLowerCase() === incoming.username?.toLowerCase()))) {
      mergedList.push(incoming);
    }
  });

  writeUsers(mergedList);
  return res.json({ success: true, count: mergedList.length, users: mergedList });
});

// Single user update endpoint (Email, Password, Name, Role, Username, Department)
app.post('/api/users/update', (req, res) => {
  const { userId, email, password, name, role, username, department, _user } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId wajib diisi' });
  }

  const cleanUserId = String(userId).trim();
  const currentUsers = readUsers();
  let found = false;
  let targetUser: any = null;

  const actor = (_user as any) || {};
  const actorId = actor.username || actor.id || 'admin';
  const actorName = actor.name || 'Administrator';
  const actorRole = actor.role || 'ADMIN';
  const nowIso = new Date().toISOString();

  // If changing username, check for collision
  if (username && String(username).trim()) {
    const cleanNewUsername = String(username).trim().toLowerCase();
    const collision = currentUsers.find((u: any) => 
      u.username?.toLowerCase() === cleanNewUsername && 
      u.id !== cleanUserId && 
      u.username?.toLowerCase() !== cleanUserId.toLowerCase()
    );
    if (collision) {
      return res.status(400).json({ error: `Username "${cleanNewUsername}" sudah digunakan oleh akun lain.` });
    }
  }

  const updatedList = currentUsers.map((existing: any) => {
    if (
      existing.id === cleanUserId ||
      (existing.username && existing.username.toLowerCase() === cleanUserId.toLowerCase()) ||
      (existing.email && existing.email.toLowerCase() === cleanUserId.toLowerCase())
    ) {
      found = true;
      const result = { ...existing };
      if (email !== undefined) {
        result.email = String(email).trim() || undefined;
      }
      if (password && String(password).trim().length >= 4) {
        result.password = String(password).trim();
      }
      if (name && String(name).trim()) {
        result.name = String(name).trim();
      }
      if (role && (role === 'ADMIN' || role === 'USER') && existing.username !== 'admin') {
        result.role = role;
      }
      if (username && String(username).trim() && existing.username !== 'admin') {
        result.username = String(username).trim().toLowerCase();
      }
      if (department && String(department).trim()) {
        result.department = String(department).trim();
      }
      result.updatedAt = nowIso;
      result.updatedById = actorId;
      result.updatedByName = actorName;
      result.updatedByRole = actorRole;

      targetUser = result;
      return result;
    }
    return existing;
  });

  if (!found || !targetUser) {
    return res.status(404).json({ error: `User dengan ID/username "${cleanUserId}" tidak ditemukan` });
  }

  writeUsers(updatedList);

  // Record audit log
  try {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowIso,
      userId: actorId,
      userName: actorName,
      userDepartment: actor.department || 'Administrasi',
      userRole: actorRole,
      action: 'USER_UPDATE',
      details: `${actorName} (${actorId}) memperbarui data akun: ${targetUser.name} (${targetUser.username}) [Role: ${targetUser.role}]`,
      targetId: targetUser.id
    };
    const currentLogs = readActivityLogs();
    currentLogs.unshift(logItem);
    writeActivityLogs(currentLogs);
  } catch {}

  res.json({ success: true, user: targetUser, users: updatedList, message: 'Data akun berhasil diperbarui di server pusat' });
});

app.post('/api/users/batch-update', (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ error: 'Array users dibutuhkan' });
  }

  const currentUsers = readUsers();
  let updateCount = 0;
  const updatedList = currentUsers.map((existing: any) => {
    const incoming = users.find((u: any) => 
      u.id === existing.id || 
      (u.username && u.username.toLowerCase() === existing.username?.toLowerCase())
    );
    if (!incoming) return existing;

    updateCount++;
    const result = { ...existing };
    if (incoming.email !== undefined) {
      const cleanEmail = String(incoming.email || '').trim();
      result.email = cleanEmail || undefined;
    }
    if (incoming.password && String(incoming.password).trim().length >= 4) {
      result.password = String(incoming.password).trim();
    }
    if (incoming.name && String(incoming.name).trim()) {
      result.name = String(incoming.name).trim();
    }
    if (incoming.role && (incoming.role === 'ADMIN' || incoming.role === 'USER')) {
      if (existing.username !== 'admin') {
        result.role = incoming.role;
      }
    }
    return result;
  });

  writeUsers(updatedList);

  try {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: 'admin',
      userName: 'Administrator',
      userDepartment: 'Keuangan & Umum',
      userRole: 'ADMIN',
      action: 'PASSWORD_RESET',
      details: `Batch update: Memperbarui password dan email untuk ${updateCount} akun user`,
      targetId: 'all-users'
    };
    const currentLogs = readActivityLogs();
    currentLogs.unshift(logItem);
    writeActivityLogs(currentLogs);
  } catch {}

  res.json({ success: true, count: updateCount, users: updatedList, message: 'Seluruh akun berhasil diperbarui di server' });
});

app.post('/api/users/reset-password', (req, res) => {
  const { userId, newPassword, _user } = req.body;
  if (!userId || !newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'User ID dan password baru (minimal 4 karakter) wajib diisi' });
  }

  const cleanUserId = String(userId).trim();
  const cleanPass = newPassword.trim();
  const actor = (_user as any) || {};
  const actorId = actor.username || actor.id || 'admin';
  const actorName = actor.name || 'Administrator';
  const actorRole = actor.role || 'ADMIN';
  const nowIso = new Date().toISOString();

  const users = readUsers();
  let found = false;
  let targetUser: any = null;

  const updated = users.map((u: any) => {
    if (
      u.id === cleanUserId || 
      (u.username && u.username.toLowerCase() === cleanUserId.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === cleanUserId.toLowerCase())
    ) {
      found = true;
      targetUser = {
        ...u,
        password: cleanPass,
        updatedAt: nowIso,
        updatedById: actorId,
        updatedByName: actorName,
        updatedByRole: actorRole
      };
      return targetUser;
    }
    return u;
  });

  if (!found || !targetUser) {
    return res.status(404).json({ error: `User dengan ID/username/email "${cleanUserId}" tidak ditemukan` });
  }

  writeUsers(updated);

  // Record audit log for password update
  try {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowIso,
      userId: actorId,
      userName: actorName,
      userDepartment: actor.department || 'Administrasi',
      userRole: actorRole,
      action: 'PASSWORD_RESET',
      details: `${actorName} (${actorRole}) berhasil mereset password akun ${targetUser.name} (${targetUser.username})`,
      targetId: targetUser.id
    };
    const currentLogs = readActivityLogs();
    currentLogs.unshift(logItem);
    writeActivityLogs(currentLogs);
  } catch (err) {
    console.error('Error logging password reset:', err);
  }

  res.json({ success: true, user: targetUser, users: updated, message: 'Password berhasil diperbarui di server' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'User ID dan Kata Sandi wajib diisi.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  // Comprehensive alias mapping for all 14 official accounts and divisions
  const aliasMap: Record<string, string> = {
    // Admin 1 - Nofi Zahara
    'admin.nofi': 'nofi',
    'admin1': 'nofi',
    'nofizahara': 'nofi',
    'nofi zahara': 'nofi',
    // Admin 2 - Resna Wati
    'admin.resna': 'resna',
    'admin2': 'resna',
    'resnawati': 'resna',
    'resna wati': 'resna',
    // Admin 3 - Deri Tialis Peristiawan
    'admin.deri': 'deri',
    'admin3': 'deri',
    'deritialis': 'deri',
    'deri tialis': 'deri',
    'deri tialis peristiawan': 'deri',
    // Admin 4 - Yuda Putra Utama
    'admin.yuda': 'yuda',
    'admin4': 'yuda',
    'yudaputra': 'yuda',
    'yuda putra': 'yuda',
    'yuda putra utama': 'yuda',
    // Master Administrator / SDM Teluk Sirih
    'admin': 'admin',
    'administrator': 'admin',
    'master': 'admin',
    'master admin': 'admin',
    'admin master': 'admin',
    'admin utama': 'admin',
    'sdm': 'admin',
    'sdm upk': 'admin',
    'sdm upk teluk sirih': 'admin',
    'sdm teluk sirih': 'admin',
    // PIC Keuangan & Umum
    'keuangan & umum': 'keuangan',
    'keuangan dan umum': 'keuangan',
    'keuangan': 'keuangan',
    'ku': 'keuangan',
    'k&u': 'keuangan',
    // PIC Operasi
    'operasi': 'operasi',
    'opr': 'operasi',
    'ops': 'operasi',
    // PIC Pemeliharaan
    'pemeliharaan': 'pemeliharaan',
    'har': 'pemeliharaan',
    // PIC Enjiniring
    'enjiniring': 'enjiniring',
    'enj': 'enjiniring',
    'engineering': 'enjiniring',
    // PIC Coal & Ash Handling
    'coal_ash': 'coal_ash',
    'coal ash': 'coal_ash',
    'coal & ash': 'coal_ash',
    'coal and ash': 'coal_ash',
    'coal & ash handling': 'coal_ash',
    'coal and ash handling': 'coal_ash',
    'cah': 'coal_ash',
    // PIC K3 & Keamanan
    'k3_keamanan': 'k3_keamanan',
    'k3': 'k3_keamanan',
    'k3 keamanan': 'k3_keamanan',
    'k3 & keamanan': 'k3_keamanan',
    'k3 dan keamanan': 'k3_keamanan',
    'keamanan': 'k3_keamanan',
    'keselamatan': 'k3_keamanan',
    // PIC Lingkungan Hidup
    'lingkungan': 'lingkungan',
    'lingkungan hidup': 'lingkungan',
    'lh': 'lingkungan',
    'lin': 'lingkungan',
    // PIC Pengadaan
    'pengadaan': 'pengadaan',
    'proc': 'pengadaan',
    'procurement': 'pengadaan',
    'dan': 'pengadaan',
    // PIC Sistem Manajemen Terintegrasi
    'sm_terintegrasi': 'sm_terintegrasi',
    'smt': 'sm_terintegrasi',
    'sm terintegrasi': 'sm_terintegrasi',
    'sistem manajemen terintegrasi': 'sm_terintegrasi'
  };

  const targetUsername = aliasMap[cleanUsername] || cleanUsername;
  const users = readUsers();

  // Multi-tier user lookup (Username, ID, Email, Full Name, Department)
  let user = users.find((u: any) => 
    (u.username && u.username.toLowerCase() === targetUsername) ||
    (u.id && u.id.toLowerCase() === targetUsername) ||
    (u.email && u.email.toLowerCase() === cleanUsername) ||
    (u.email && u.email.toLowerCase() === targetUsername)
  );

  // Fallback match by exact full name or department name
  if (!user) {
    user = users.find((u: any) => 
      (u.name && u.name.toLowerCase() === cleanUsername) ||
      (u.department && u.department.toLowerCase() === cleanUsername)
    );
  }

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: `User ID atau Email "${username}" tidak ditemukan. Pastikan Anda menggunakan User ID bagian (contoh: keuangan, operasi, admin) atau alamat email terdaftar.` 
    });
  }

  if (user.password !== cleanPassword) {
    // Check if failure is due to case sensitivity / caps lock
    if (user.password.toLowerCase() === cleanPassword.toLowerCase()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Kata Sandi salah karena perbedaan huruf besar/kecil (Caps Lock aktif). Mohon perhatikan penulisan huruf kapital dan huruf kecil sesuai yang diatur admin.' 
      });
    }

    return res.status(401).json({ 
      success: false, 
      error: `Kata Sandi yang dimasukkan untuk akun "${user.username}" salah. Jika admin baru saja mengubah kata sandi Anda, pastikan memasukkan kata sandi terbaru.` 
    });
  }

  const updatedUser = {
    ...user,
    lastLogin: new Date().toISOString()
  };

  const updatedUsers = users.map((u: any) => u.id === user.id ? updatedUser : u);
  writeUsers(updatedUsers);

  try {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: updatedUser.username,
      userName: updatedUser.name,
      userDepartment: updatedUser.department,
      userRole: updatedUser.role,
      action: 'LOGIN',
      details: `User ${updatedUser.name} (${updatedUser.department}) berhasil login ke sistem`,
      targetId: updatedUser.username
    };
    const currentLogs = readActivityLogs();
    currentLogs.unshift(logItem);
    writeActivityLogs(currentLogs);
  } catch {}

  res.json({ success: true, user: updatedUser });
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
    syncMasterBankData('activity_logged');
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
// CENTRAL SOURCE BANK DATA ENDPOINTS
// ==========================================

// GET master bank data overview & stats
app.get('/api/bank-data', (req, res) => {
  try {
    if (!fs.existsSync(BANK_DATA_FILE)) {
      syncMasterBankData('initial_read');
    }
    const raw = fs.readFileSync(BANK_DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    // Fallback generate dynamically
    const users = readUsers();
    const bookings = readBookings();
    const logs = readActivityLogs();
    res.json({
      system: 'SI APIN - PT PLN Indonesia Power UBP Teluk Sirih',
      schemaVersion: '2.0-unified',
      lastUpdated: new Date().toISOString(),
      meta: {
        totalAccounts: users.length,
        totalBookings: bookings.length,
        totalActivityLogs: logs.length,
        activeBookings: bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'BOOKED').length,
      },
      accounts: users,
      bookings: bookings,
      activityLogs: logs
    });
  }
});

// GET export master bank data as downloadable JSON attachment
app.get('/api/bank-data/export', (req, res) => {
  try {
    syncMasterBankData('manual_export');
    const raw = fs.readFileSync(BANK_DATA_FILE, 'utf-8');
    const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.setHeader('Content-Disposition', `attachment; filename="BANK_DATA_SI_APIN_PLTU_TELUK_SIRIH_${now}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat file ekspor bank data' });
  }
});

// POST force trigger resync of master bank data
app.post('/api/bank-data/sync', (req, res) => {
  try {
    syncMasterBankData('manual_reconcile');
    const raw = fs.readFileSync(BANK_DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    res.json({ success: true, message: 'Bank data berhasil dikonsolidasi & disinkronkan', meta: data.meta });
  } catch (err) {
    res.status(500).json({ error: 'Gagal sinkronisasi bank data' });
  }
});

// POST restore or import master bank data
app.post('/api/bank-data/restore', (req, res) => {
  const { backup } = req.body;
  if (!backup || typeof backup !== 'object') {
    return res.status(400).json({ error: 'Data backup bank data tidak valid' });
  }

  try {
    let restoredUsers = false;
    let restoredBookings = false;
    let restoredLogs = false;

    if (Array.isArray(backup.accounts) && backup.accounts.length > 0) {
      writeUsers(backup.accounts);
      restoredUsers = true;
    }
    if (Array.isArray(backup.bookings) && backup.bookings.length > 0) {
      writeBookings(backup.bookings);
      restoredBookings = true;
    }
    if (Array.isArray(backup.activityLogs) && backup.activityLogs.length > 0) {
      writeActivityLogs(backup.activityLogs);
      restoredLogs = true;
    }

    syncMasterBankData('restore_from_backup');
    res.json({
      success: true,
      message: 'Bank data berhasil dipulihkan dari cadangan',
      restored: { users: restoredUsers, bookings: restoredBookings, logs: restoredLogs }
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memulihkan cadangan bank data' });
  }
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

// Only listen directly when not executed by Vercel serverless functions
if (!process.env.VERCEL) {
  startServer();
}

export default app;

