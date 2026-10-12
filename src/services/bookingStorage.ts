import { Booking, BookingFormData, BookingStatus, RekapHarian } from '../types';
import { calculateEndTime, generateDepartmentBookingNumber, getTodayDateString } from '../utils/timeUtils';
import { activityLogger } from './activityLogger';
import { authStorage } from './authStorage';
import { sseClient } from './sseClient';

const STORAGE_KEY = 'meeting_snack_bookings_v4';
const LISTEN_EVENT = 'meeting_bookings_changed';

// Initial booking list defaults to empty (clean state for fresh production deployment)
const INITIAL_BOOKINGS: Booking[] = [];

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

    // 1. Gather ALL local bookings currently known (both in-memory cache and localStorage)
    const localMap = new Map<string, Booking>();
    if (Array.isArray(cachedBookings)) {
      cachedBookings.forEach(b => { if (b && b.id) localMap.set(b.id, b); });
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((b: Booking) => { if (b && b.id) localMap.set(b.id, b); });
        }
      }
    } catch {
      // Ignore JSON error
    }
    // Purge deprecated test IDs from local memory and storage
    const badIds = new Set(['test-curl-1', 'test-speed-1', 'test-123', 'test-att-1']);
    badIds.forEach(id => {
      localMap.delete(id);
    });

    const localItems = Array.from(localMap.values()).filter(b => !badIds.has(b.id));

    // 2. Identify only genuinely offline-created bookings pending server sync
    const serverIds = new Set(serverBookings.map(b => b.id));
    const localPendingSync = localItems.filter(b => !serverIds.has(b.id) && (b as any)._pendingSync === true);

    // 3. Setup unified map starting with authoritative server bookings
    const mergedMap = new Map<string, Booking>();
    serverBookings.filter(b => !badIds.has(b.id)).forEach(b => mergedMap.set(b.id, b));

    // 4. If there are pending offline bookings, push them to the server
    if (localPendingSync.length > 0) {
      try {
        const syncRes = await fetch('/api/bookings/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookings: localPendingSync })
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.bookings && Array.isArray(syncData.bookings)) {
            syncData.bookings.filter((b: Booking) => !badIds.has(b.id)).forEach((b: Booking) => mergedMap.set(b.id, b));
          }
        }
      } catch {
        // Fallback to local inclusion while remaining offline
        localPendingSync.forEach(b => mergedMap.set(b.id, b));
      }
    }

    // 5. For overlapping bookings, keep the newest version
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

  // 2. Setup Server-Sent Events (SSE) via unified sseClient
  sseClient.subscribe('bookings_changed', () => {
    fetchBookingsFromServer(false);
  });

  // 3. Fallback periodic polling every 1.5 seconds to guarantee interlock consistency
  setInterval(() => {
    fetchBookingsFromServer(false);
  }, 1500);

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
    if (typeof window === 'undefined') return [];

    // Return cached bookings if already loaded
    if (cachedBookings && Array.isArray(cachedBookings)) {
      return cachedBookings;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      cachedBookings = [];
      return [];
    }
    try {
      const parsed: Booking[] = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        cachedBookings = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      cachedBookings = [];
      return [];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      cachedBookings = [];
      return [];
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
      (b.bookingNumber || '').toLowerCase().includes(q) ||
      (b.bookerName || '').toLowerCase().includes(q) ||
      (b.department || '').toLowerCase().includes(q) ||
      (b.meetingTitle || '').toLowerCase().includes(q) ||
      (b.whatsapp || '').includes(q) ||
      (b.meetingLocation || '').toLowerCase().includes(q)
    );
  },

  create(formData: BookingFormData): Booking {
    const all = this.getAll();
    const endTime = calculateEndTime(formData.startTime, formData.durationHours);
    const currentUser = authStorage.getCurrentUser();
    const actorId = currentUser?.username || currentUser?.id || formData.department || 'user';
    const actorName = currentUser?.name || formData.bookerName || 'Pengguna';
    const actorDept = currentUser?.department || formData.department || '-';
    const actorRole = currentUser?.role || 'USER';
    const nowIso = new Date().toISOString();

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
      email: formData.email?.trim() || undefined,
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
      createdAt: nowIso,
      createdById: actorId,
      createdByName: actorName,
      createdByDepartment: actorDept,
      createdByRole: actorRole,
      lastModifiedById: actorId,
      lastModifiedByName: actorName,
      lastModifiedByDepartment: actorDept,
      lastModifiedByRole: actorRole,
      lastModifiedAt: nowIso,
      lastAction: 'DIBUAT',
      history: [
        {
          timestamp: nowIso,
          action: 'DIBUAT',
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          userDepartment: actorDept,
          notes: `Pengajuan booking awal`
        }
      ]
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
      body: JSON.stringify({
        ...newBooking,
        _user: currentUser ? {
          username: currentUser.username,
          name: currentUser.name,
          department: currentUser.department,
          role: currentUser.role
        } : undefined
      })
    }).catch((err) => {
      console.warn('[SI APIN] Gagal sync booking ke server:', err);
    });

    try {
      activityLogger.log(
        'BOOKING_CREATE',
        `Pengajuan booking baru oleh ${actorName} (${actorId}): ${newBooking.bookingNumber} - "${newBooking.meetingTitle}" (${newBooking.meetingLocation}, ${newBooking.meetingDate})`,
        newBooking.bookingNumber,
        { bookingId: newBooking.id, department: newBooking.department, bookerName: newBooking.bookerName }
      );
    } catch {}

    return newBooking;
  },

  /**
   * Authoritative Async Booking Creation with Real-Time Server Confirmation & Auto-Interlock
   */
  async createAsync(formData: BookingFormData): Promise<Booking> {
    const all = this.getAll();
    const endTime = calculateEndTime(formData.startTime, formData.durationHours);
    const currentUser = authStorage.getCurrentUser();
    const actorId = currentUser?.username || currentUser?.id || formData.department || 'user';
    const actorName = currentUser?.name || formData.bookerName || 'Pengguna';
    const actorDept = currentUser?.department || formData.department || '-';
    const actorRole = currentUser?.role || 'USER';
    const nowIso = new Date().toISOString();

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
      email: formData.email?.trim() || undefined,
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
      createdAt: nowIso,
      createdById: actorId,
      createdByName: actorName,
      createdByDepartment: actorDept,
      createdByRole: actorRole,
      lastModifiedById: actorId,
      lastModifiedByName: actorName,
      lastModifiedByDepartment: actorDept,
      lastModifiedByRole: actorRole,
      lastModifiedAt: nowIso,
      lastAction: 'DIBUAT',
      history: [
        {
          timestamp: nowIso,
          action: 'DIBUAT',
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          userDepartment: actorDept,
          notes: `Pengajuan booking awal ${formData.meetingLocation}`
        }
      ]
    };

    // 1. Client-Side Auto-Interlock Conflict Validation (Fast Pre-check)
    const normLocation = (newBooking.meetingLocation || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const isNoRoom = !normLocation || normLocation === 'tidak menggunakan ruang meeting';
    if (!isNoRoom && newBooking.meetingDate && newBooking.startTime && newBooking.endTime) {
      const toMin = (t: string) => {
        const [h, m] = (t || '00:00').split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      const newStart = toMin(newBooking.startTime);
      const newEnd = toMin(newBooking.endTime);

      const conflict = all.find((b: Booking) => {
        if (!b || b.status === 'CANCELLED' || b.id === newBooking.id) return false;
        if (b.meetingDate !== newBooking.meetingDate) return false;
        const bLoc = (b.meetingLocation || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (bLoc !== normLocation) return false;

        const bStart = toMin(b.startTime);
        const bEnd = toMin(b.endTime);
        return newStart < bEnd && newEnd > bStart;
      });

      if (conflict) {
        throw new Error(
          `Auto-Interlock Aktif: Ruangan "${newBooking.meetingLocation}" sudah terisi agenda "${conflict.meetingTitle}" (${conflict.startTime} - ${conflict.endTime} WIB) pada tanggal ${newBooking.meetingDate} oleh ${conflict.bookerName || conflict.department}. Jadwal bentrok, silakan pilih jam atau ruangan lain.`
        );
      }
    }

    // 2. Prepare payload for server
    const payload = JSON.stringify({
      ...newBooking,
      _user: currentUser ? {
        username: currentUser.username,
        name: currentUser.name,
        department: currentUser.department,
        role: currentUser.role
      } : undefined
    });

    // 3. Attempt direct server save with automatic fallback to local offline-first storage
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      if (res.status === 409) {
        // Server-Side Auto-Interlock Conflict detected!
        const errJson = await res.json().catch(() => ({}));
        await fetchBookingsFromServer(false);
        throw new Error(errJson.error || 'Ruangan ini sudah dipesan untuk agenda lain pada jam tersebut (Auto-Interlock Aktif).');
      }

      if (res.ok) {
        const savedBooking: Booking = await res.json();
        
        // Update memory & local storage with server-confirmed booking
        const curList = cachedBookings || all;
        const updated = [savedBooking, ...curList.filter(b => b.id !== savedBooking.id)];
        cachedBookings = updated;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        notifySubscribers();

        // Instantly notify other listeners & tabs
        try {
          sseClient.notifyLocal('bookings_changed', savedBooking);
        } catch {}

        try {
          activityLogger.log(
            'BOOKING_CREATE',
            `Pengajuan booking rapat baru oleh ${actorName} (${actorId}): ${savedBooking.bookingNumber} - "${savedBooking.meetingTitle}" (${savedBooking.meetingLocation}, ${savedBooking.meetingDate} ${savedBooking.startTime}-${savedBooking.endTime})`,
            savedBooking.bookingNumber
          );
        } catch {}

        return savedBooking;
      }
    } catch (netErr: any) {
      // If error is Auto-Interlock conflict, re-throw immediately to inform user
      if (netErr?.message && (netErr.message.includes('Auto-Interlock') || netErr.message.includes('bentrok') || netErr.message.includes('sudah terisi'))) {
        throw netErr;
      }
      console.warn('[SI APIN] Server POST tertunda, menyimpan lokal & sinkronisasi otomatis:', netErr);
    }

    // 4. Fallback: Save immediately locally with pending sync so booking submission ALWAYS succeeds!
    (newBooking as any)._pendingSync = true;
    const curList = cachedBookings || all;
    const updated = [newBooking, ...curList.filter(b => b.id !== newBooking.id)];
    cachedBookings = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    notifySubscribers();

    try {
      sseClient.notifyLocal('bookings_changed', newBooking);
    } catch {}

    try {
      activityLogger.log(
        'BOOKING_CREATE',
        `Pengajuan booking rapat baru oleh ${actorName} (${actorId}): ${newBooking.bookingNumber} - "${newBooking.meetingTitle}" (${newBooking.meetingLocation}, ${newBooking.meetingDate} ${newBooking.startTime}-${newBooking.endTime})`,
        newBooking.bookingNumber
      );
    } catch {}

    // Trigger asynchronous background server sync so database gets updated automatically
    setTimeout(() => {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      })
        .then(async (r) => {
          if (r.ok) {
            delete (newBooking as any)._pendingSync;
            await fetchBookingsFromServer(false);
          }
        })
        .catch((err) => {
          console.warn('[SI APIN] Sync server latar belakang:', err);
        });
    }, 1000);

    return newBooking;
  },

  updateStatus(id: string, newStatus: BookingStatus, notes?: string, approvedBy?: string): Booking | undefined {
    const all = this.getAll();
    let updatedBooking: Booking | undefined;
    const currentUser = authStorage.getCurrentUser();
    const actorId = currentUser?.username || currentUser?.id || approvedBy || 'admin';
    const actorName = currentUser?.name || approvedBy || 'Administrator';
    const actorDept = currentUser?.department || 'Administrasi';
    const actorRole = currentUser?.role || 'ADMIN';
    const nowIso = new Date().toISOString();

    const actionDesc = newStatus === 'CONFIRMED' 
      ? 'DISETUJUI (APPROVED)' 
      : (newStatus === 'CANCELLED' ? 'DIBATALKAN' : (newStatus === 'COMPLETED' ? 'SELESAI' : `STATUS: ${newStatus}`));

    const updated = all.map(b => {
      if (b.id === id) {
        const existingHistory = Array.isArray(b.history) ? [...b.history] : [];
        existingHistory.push({
          timestamp: nowIso,
          action: actionDesc,
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          userDepartment: actorDept,
          notes: notes || undefined
        });

        updatedBooking = {
          ...b,
          status: newStatus,
          approvalNotes: notes !== undefined ? notes : b.approvalNotes,
          approvedBy: approvedBy !== undefined ? approvedBy : (newStatus === 'CONFIRMED' ? (b.approvedBy || actorName) : b.approvedBy),
          approvedAt: newStatus === 'CONFIRMED' ? nowIso : b.approvedAt,
          updatedAt: nowIso,
          lastModifiedById: actorId,
          lastModifiedByName: actorName,
          lastModifiedByDepartment: actorDept,
          lastModifiedByRole: actorRole,
          lastModifiedAt: nowIso,
          lastAction: actionDesc,
          history: existingHistory
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
        body: JSON.stringify({
          ...updatedBooking,
          _user: currentUser ? {
            username: currentUser.username,
            name: currentUser.name,
            department: currentUser.department,
            role: currentUser.role
          } : undefined
        })
      }).catch((err) => {
        console.warn('[SI APIN] Gagal sync status ke server:', err);
      });

      try {
        const action = newStatus === 'CONFIRMED' ? 'BOOKING_APPROVE' : (newStatus === 'CANCELLED' ? 'BOOKING_CANCEL' : 'BOOKING_UPDATE');
        const statusLabel = newStatus === 'CONFIRMED' ? 'menyetujui (approve)' : (newStatus === 'CANCELLED' ? 'membatalkan' : `mengubah status menjadi ${newStatus}`);
        activityLogger.log(
          action,
          `${actorName} (${actorId}) ${statusLabel} booking ${updatedBooking.bookingNumber} ("${updatedBooking.meetingTitle}")`,
          updatedBooking.bookingNumber,
          { status: newStatus, notes, approvedBy: actorName }
        );
      } catch {}
    }

    return updatedBooking;
  },

  approveWithEdits(id: string, edits: Partial<Booking>, approvedBy: string = 'Admin Utama', approvalNotes?: string): Booking | undefined {
    const all = this.getAll();
    let updatedBooking: Booking | undefined;
    const currentUser = authStorage.getCurrentUser();
    const actorId = currentUser?.username || currentUser?.id || 'admin';
    const actorName = currentUser?.name || approvedBy || 'Administrator';
    const actorDept = currentUser?.department || 'Administrasi';
    const actorRole = currentUser?.role || 'ADMIN';
    const nowIso = new Date().toISOString();
    const actionDesc = 'DISETUJUI DENGAN PERUBAHAN JADWAL';

    const updated = all.map(b => {
      if (b.id === id) {
        const startTime = edits.startTime ?? b.startTime;
        const durationHours = edits.durationHours ?? b.durationHours;
        const endTime = calculateEndTime(startTime, durationHours);

        const existingHistory = Array.isArray(b.history) ? [...b.history] : [];
        existingHistory.push({
          timestamp: nowIso,
          action: actionDesc,
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          userDepartment: actorDept,
          notes: approvalNotes ?? edits.approvalNotes ?? b.approvalNotes
        });

        updatedBooking = {
          ...b,
          ...edits,
          status: 'CONFIRMED' as BookingStatus,
          endTime,
          approvedBy: actorName,
          approvalNotes: approvalNotes ?? edits.approvalNotes ?? b.approvalNotes,
          approvedAt: nowIso,
          updatedAt: nowIso,
          lastModifiedById: actorId,
          lastModifiedByName: actorName,
          lastModifiedByDepartment: actorDept,
          lastModifiedByRole: actorRole,
          lastModifiedAt: nowIso,
          lastAction: actionDesc,
          history: existingHistory
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
        body: JSON.stringify({
          ...updatedBooking,
          _user: currentUser ? {
            username: currentUser.username,
            name: currentUser.name,
            department: currentUser.department,
            role: currentUser.role
          } : undefined
        })
      }).catch((err) => {
        console.warn('[SI APIN] Gagal sync edit persetujuan ke server:', err);
      });

      try {
        activityLogger.log(
          'BOOKING_APPROVE',
          `${actorName} (${actorId}) menyetujui booking ${updatedBooking.bookingNumber} ("${updatedBooking.meetingTitle}") dengan penyesuaian jadwal (${updatedBooking.meetingDate} ${updatedBooking.startTime} - ${updatedBooking.endTime}, ${updatedBooking.meetingLocation})`,
          updatedBooking.bookingNumber,
          { approvedBy: actorName, approvalNotes }
        );
      } catch {}
    }

    return updatedBooking;
  },

  update(id: string, updates: Partial<Booking>): Booking | undefined {
    const all = this.getAll();
    let updatedBooking: Booking | undefined;
    const currentUser = authStorage.getCurrentUser();
    const actorId = currentUser?.username || currentUser?.id || 'admin';
    const actorName = currentUser?.name || 'Administrator';
    const actorDept = currentUser?.department || 'Administrasi';
    const actorRole = currentUser?.role || 'ADMIN';
    const nowIso = new Date().toISOString();

    const updated = all.map(b => {
      if (b.id === id) {
        const endTime = (updates.startTime || updates.durationHours)
          ? calculateEndTime(updates.startTime || b.startTime, updates.durationHours ?? b.durationHours)
          : b.endTime;

        const existingHistory = Array.isArray(b.history) ? [...b.history] : [];
        existingHistory.push({
          timestamp: nowIso,
          action: updates.lastAction || 'DATA DIPERBARUI',
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          userDepartment: actorDept,
          notes: updates.notes || updates.approvalNotes || undefined
        });

        updatedBooking = {
          ...b,
          ...updates,
          endTime,
          updatedAt: nowIso,
          lastModifiedById: actorId,
          lastModifiedByName: actorName,
          lastModifiedByDepartment: actorDept,
          lastModifiedByRole: actorRole,
          lastModifiedAt: nowIso,
          lastAction: updates.lastAction || 'DATA DIPERBARUI',
          history: existingHistory
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
        body: JSON.stringify({
          ...updatedBooking,
          _user: currentUser ? {
            username: currentUser.username,
            name: currentUser.name,
            department: currentUser.department,
            role: currentUser.role
          } : undefined
        })
      }).catch((err) => {
        console.warn('[SI APIN] Gagal sync update ke server:', err);
      });
    }

    return updatedBooking;
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const target = all.find(b => b.id === id);
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

      try {
        if (target) {
          activityLogger.log(
            'BOOKING_DELETE',
            `Menghapus data permohonan booking ${target.bookingNumber} ("${target.meetingTitle}")`,
            target.bookingNumber
          );
        }
      } catch {}

      return true;
    }
    return false;
  },

  reset(): void {
    cachedBookings = [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      // Ignore quota errors
    }
    notifySubscribers();

    // Reset on central server cleanly
    fetch('/api/bookings/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'clean' })
    }).catch((err) => {
      console.warn('[SI APIN] Gagal reset di server:', err);
    });
  },

  async clearAllBookingsAsync(): Promise<void> {
    cachedBookings = [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
    notifySubscribers();

    await fetch('/api/bookings/clear-all', {
      method: 'POST'
    }).catch((err) => {
      console.warn('[SI APIN] Gagal clear-all di server:', err);
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
