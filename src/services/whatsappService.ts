import { Booking, BookingStatus } from '../types';
import { formatDateIndo, formatDuration } from '../utils/timeUtils';

export interface AdminContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  isPrimary?: boolean;
}

const ADMIN_CONTACTS_KEY = 'siapin_admin_wa_contacts_v1';

const DEFAULT_ADMIN_CONTACTS: AdminContact[] = [
  {
    id: 'adm-1',
    name: 'Admin Si APIN (UPK Teluk Sirih)',
    phone: '081267890123',
    role: 'Pengelola Ruang Rapat & Fasilitas',
    isPrimary: true
  },
  {
    id: 'adm-2',
    name: 'PIC Konsumsi & Snack (Keuangan & Umum)',
    phone: '081374567890',
    role: 'Koordinator Konsumsi & Layanan Rapat'
  }
];

export const whatsappService = {
  // Get all registered GA Admin contacts
  getAdminContacts(): AdminContact[] {
    try {
      const stored = localStorage.getItem(ADMIN_CONTACTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ADMIN_CONTACTS;
  },

  // Save GA Admin contacts
  saveAdminContacts(contacts: AdminContact[]): void {
    try {
      localStorage.setItem(ADMIN_CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save WA admin contacts:', e);
    }
  },

  // Sanitize Indonesian phone numbers for wa.me URL
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert 08xxx to 628xxx
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    } else if (cleaned.startsWith('+62')) {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  },

  // Generate Message for New Booking (To Booker or Admin GA)
  generateNewBookingMessage(booking: Booking, target: 'PEMESAN' | 'ADMIN'): string {
    const isForPemesan = target === 'PEMESAN';

    const snackRinganText = booking.snackRingan !== 'Tidak Ada' ? booking.snackRingan : '- (Tidak Ada)';
    const snackBeratText = booking.snackBerat !== 'Tidak Ada' ? booking.snackBerat : '- (Tidak Ada)';
    const makanSiangText = booking.makanSiang === 'Iya' ? 'Iya (Disediakan)' : 'Tidak Disediakan';

    const header = isForPemesan
      ? `*KONFIRMASI RESERVASI - SI APIN*\n*PLN UPK TELUK SIRIH*`
      : `*NOTIFIKASI PERMOHONAN RUANG RAPAT BARU*\n*SI APIN - PLN UPK TELUK SIRIH*`;

    const greeting = isForPemesan
      ? `Halo Yth. *${booking.bookerName}* (${booking.department}),\nBerikut adalah ringkasan reservasi ruang rapat dan konsumsi yang telah diajukan:`
      : `Pemberitahuan untuk *Admin GA / Tim Konsumsi*,\nTelah masuk permohonan booking ruang rapat baru dengan rincian berikut:`;

    const lines = [
      header,
      `----------------------------------------`,
      greeting,
      ``,
      `*No. Tiket*           : ${booking.bookingNumber}`,
      `*Status*                : MENUNGGU PERSETUJUAN (BOOKED)`,
      `*Kegiatan*            : ${booking.meetingTitle}`,
      `*Ruangan*            : ${booking.meetingLocation}`,
      `*Hari/Tanggal*     : ${formatDateIndo(booking.meetingDate)}`,
      `*Waktu*                 : ${booking.startTime} - ${booking.endTime} WIB (${formatDuration(booking.durationHours)})`,
      `*Jumlah Peserta*: ${booking.participantCount} Orang`,
      ``,
      `*Layanan Konsumsi:*`,
      `  - Snack Ringan : ${snackRinganText}`,
      `  - Snack Berat    : ${snackBeratText}`,
      `  - Makan Siang  : ${makanSiangText}`,
      ``,
      `*Data Pemohon (PIC):*`,
      `  - Nama           : ${booking.bookerName}`,
      `  - Bagian/Unit : ${booking.department}`,
      `  - No. WA         : ${booking.whatsapp}`,
    ];

    if (booking.organizationOrGuests) {
      lines.push(`  - Tamu/Mitra : ${booking.organizationOrGuests}`);
    }

    if (booking.notes) {
      lines.push(`  - Catatan        : "${booking.notes}"`);
    }

    lines.push(
      `----------------------------------------`,
      isForPemesan
        ? `_Mohon tunggu verifikasi dan persetujuan dari Admin Si-APIN. Anda akan menerima notifikasi WhatsApp saat status telah diupdate._`
        : `_Mohon segera ditinjau dan diverifikasi melalui Panel Admin SI APIN._`,
      `_Sistem Terpadu Pemesanan Ruang & Konsumsi - UPK Teluk Sirih_`
    );

    return lines.join('\n');
  },

  // Generate Message when Status is Updated (CONFIRMED, COMPLETED, CANCELLED)
  generateStatusUpdateMessage(
    booking: Booking,
    newStatus: BookingStatus,
    adminNotes?: string,
    adminName?: string
  ): string {
    const approver = adminName || 'Admin GA UPK Teluk Sirih';

    let statusHeader = '';
    let statusDescription = '';

    switch (newStatus) {
      case 'CONFIRMED':
        statusHeader = '[DISETUJUI & DIKONFIRMASI]';
        statusDescription = `Permohonan reservasi ruang rapat Anda telah *DISETUJUI* oleh Admin GA. Fasilitas ruangan dan pesanan konsumsi sedang disiapkan sesuai jadwal.`;
        break;
      case 'COMPLETED':
        statusHeader = '[SELESAI / COMPLETED]';
        statusDescription = `Kegiatan pertemuan/rapat telah *SELESAI*. Terima kasih telah menggunakan fasilitas ruang rapat SI APIN dan menjaga kebersihan ruangan.`;
        break;
      case 'CANCELLED':
        statusHeader = '[DIBATALKAN / DITOLAK]';
        statusDescription = `Mohon maaf, permohonan reservasi ruang rapat Anda *DIBATALKAN / TIDAK DAPAT DISETUJUI* oleh Admin.`;
        break;
      case 'BOOKED':
      default:
        statusHeader = '[MENUNGGU PERSETUJUAN]';
        statusDescription = `Permohonan reservasi ruang rapat tercatat dan sedang dalam antrean verifikasi Admin.`;
        break;
    }

    const lines = [
      `*UPDATE STATUS RESERVASI - SI APIN*`,
      `*PLN UPK TELUK SIRIH*`,
      `----------------------------------------`,
      `Halo Yth. *${booking.bookerName}* (${booking.department}),`,
      ``,
      `*STATUS TERBARU: ${statusHeader}*`,
      ``,
      `${statusDescription}`,
      ``,
      `*Rincian Booking:*`,
      `  - No. Tiket     : *${booking.bookingNumber}*`,
      `  - Kegiatan      : ${booking.meetingTitle}`,
      `  - Ruangan       : ${booking.meetingLocation}`,
      `  - Hari/Tanggal  : ${formatDateIndo(booking.meetingDate)}`,
      `  - Waktu         : ${booking.startTime} - ${booking.endTime} WIB`,
      `  - Konsumsi      : ${booking.participantCount} Pax (Makan Siang: ${booking.makanSiang})`,
    ];

    if (adminNotes && adminNotes.trim()) {
      lines.push(
        ``,
        `*Catatan Admin / Alasan:*`,
        `"${adminNotes.trim()}"`
      );
    }

    lines.push(
      ``,
      `*Diverifikasi Oleh:* ${approver}`,
      `----------------------------------------`,
      `_Pesan otomatis dikirim melalui Sistem Informasi Terpadu (SI APIN) PLN UPK Teluk Sirih._`
    );

    return lines.join('\n');
  },

  // Open Direct Chat via WhatsApp Web / Mobile
  openChat(phoneNumber: string, message: string): void {
    const cleanedNumber = this.formatPhoneNumber(phoneNumber);
    const encodedText = encodeURIComponent(message);
    const url = cleanedNumber
      ? `https://wa.me/${cleanedNumber}?text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  },

  // Open Share Dialog (User chooses contacts/groups)
  openShare(message: string): void {
    const encodedText = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
