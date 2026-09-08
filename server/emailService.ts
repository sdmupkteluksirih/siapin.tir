import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface EmailConfig {
  enabled: boolean;
  senderEmail: string;
  senderName: string;
  appPassword?: string;
  adminRecipients: string[]; // List of admin emails to receive new booking alerts
  sendOnNewBooking: boolean; // Alert to admins
  sendOnStatusChange: boolean; // Alert to user
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  type: 'NEW_BOOKING_ADMIN_ALERT' | 'STATUS_UPDATE_USER_ALERT' | 'TEST_EMAIL';
  to: string[];
  subject: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  message: string;
  bookingNumber?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'email_config.json');
const LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');

const DEFAULT_CONFIG: EmailConfig = {
  enabled: true,
  senderEmail: process.env.GMAIL_USER || 'sdm.upkteluksirih@gmail.com',
  senderName: 'SI APIN - PLN UPK Teluk Sirih',
  appPassword: process.env.GMAIL_APP_PASSWORD || 'qgsm znlv lqed tmgt',
  adminRecipients: (process.env.ADMIN_NOTIFICATION_EMAILS || 'sdm.upkteluksirih@gmail.com')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean),
  sendOnNewBooking: true,
  sendOnStatusChange: true
};

export class EmailService {
  private config: EmailConfig = DEFAULT_CONFIG;
  private logs: EmailLogEntry[] = [];

  constructor() {
    this.ensureDataDir();
    this.loadConfig();
    this.loadLogs();
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.error('[EmailService] Failed to create data dir:', err);
    }
  }

  public getConfig(): EmailConfig {
    return { ...this.config };
  }

  // Returns safe public config for the UI (masking password)
  public getPublicConfig(): Omit<EmailConfig, 'appPassword'> & { hasPassword: boolean; appPasswordPreview: string } {
    const hasPassword = Boolean(this.config.appPassword && this.config.appPassword.trim().length > 0);
    let appPasswordPreview = '';
    if (hasPassword && this.config.appPassword) {
      const trimmed = this.config.appPassword.replace(/\s+/g, '');
      appPasswordPreview = trimmed.length > 4 ? `•••• •••• •••• ${trimmed.slice(-4)}` : '•••• ••••';
    }

    return {
      enabled: this.config.enabled,
      senderEmail: this.config.senderEmail,
      senderName: this.config.senderName,
      adminRecipients: this.config.adminRecipients,
      sendOnNewBooking: this.config.sendOnNewBooking,
      sendOnStatusChange: this.config.sendOnStatusChange,
      hasPassword,
      appPasswordPreview
    };
  }

  public updateConfig(newConfig: Partial<EmailConfig>): boolean {
    try {
      this.config = {
        ...this.config,
        ...newConfig,
        // Only update password if a non-masked string was provided
        appPassword: (newConfig.appPassword !== undefined && !newConfig.appPassword.includes('••••'))
          ? newConfig.appPassword.trim()
          : this.config.appPassword
      };

      try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      } catch (fileErr) {
        console.warn('[EmailService] Notice: Filesystem may be readonly in serverless runtime, config kept in-memory:', fileErr);
      }
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to save email config:', err);
      return true; // Still keep in-memory configuration active
    }
  }

  private loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          // Environment variables or DEFAULT_CONFIG take precedence if set and config is empty
          appPassword: parsed.appPassword || process.env.GMAIL_APP_PASSWORD || DEFAULT_CONFIG.appPassword || ''
        };
      } else {
        this.config = { ...DEFAULT_CONFIG };
        try {
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
        } catch {}
      }
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  private loadLogs() {
    try {
      if (fs.existsSync(LOGS_FILE)) {
        const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.logs = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      this.logs = [];
    }
  }

  private recordLog(entry: Omit<EmailLogEntry, 'id' | 'timestamp'>) {
    const newEntry: EmailLogEntry = {
      id: `elog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.logs.unshift(newEntry);
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
    try {
      fs.writeFileSync(LOGS_FILE, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (err) {
      console.error('[EmailService] Failed to write logs:', err);
    }
  }

  public getLogs(): EmailLogEntry[] {
    return this.logs;
  }

  private getTransporter() {
    const sender = this.config.senderEmail || process.env.GMAIL_USER || 'sdm.upkteluksirih@gmail.com';
    const rawPass = (this.config.appPassword || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    if (!rawPass) {
      return null;
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: sender,
        pass: rawPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // 1. Send Alert to Admin on New Booking Submission
  public async sendNewBookingAdminAlert(booking: any, appUrl?: string): Promise<{ success: boolean; message: string }> {
    if (!this.config.enabled || !this.config.sendOnNewBooking) {
      this.recordLog({
        type: 'NEW_BOOKING_ADMIN_ALERT',
        to: this.config.adminRecipients,
        subject: `[SI APIN] Booking Baru: ${booking.bookingNumber}`,
        status: 'SKIPPED',
        message: 'Notifikasi email dinonaktifkan di pengaturan.',
        bookingNumber: booking.bookingNumber
      });
      return { success: false, message: 'Email notification is disabled.' };
    }

    const recipients = this.config.adminRecipients.filter(e => Boolean(e && e.includes('@')));
    if (recipients.length === 0) {
      this.recordLog({
        type: 'NEW_BOOKING_ADMIN_ALERT',
        to: [],
        subject: `[SI APIN] Booking Baru: ${booking.bookingNumber}`,
        status: 'SKIPPED',
        message: 'Tidak ada alamat email admin yang dikonfigurasi.',
        bookingNumber: booking.bookingNumber
      });
      return { success: false, message: 'No admin recipient emails configured.' };
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      const warnMsg = 'Google App Password belum diisi. Masukkan 16 karakter App Password di tab Pengaturan Admin untuk mengaktifkan pengiriman email otomatis.';
      console.warn(`[EmailService] ${warnMsg}`);
      this.recordLog({
        type: 'NEW_BOOKING_ADMIN_ALERT',
        to: recipients,
        subject: `[NOTIFIKASI SI APIN] Booking Baru Menunggu Approval: ${booking.bookingNumber}`,
        status: 'FAILED',
        message: warnMsg,
        bookingNumber: booking.bookingNumber
      });
      return { success: false, message: warnMsg };
    }

    const subject = `[NOTIFIKASI SI APIN] Booking Baru Menunggu Approval: ${booking.bookingNumber} - ${booking.meetingTitle}`;
    const baseUrl = appUrl || process.env.APP_URL || 'https://ais-dev-5mgkxqe6hyrms662ktugb5-684465154523.asia-east1.run.app';

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%); padding: 24px; color: #ffffff; }
    .header-tag { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
    .badge-alert { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; margin: 20px 24px 0 24px; display: flex; align-items: center; }
    .content { padding: 20px 24px 28px 24px; }
    .table-details { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    .table-details tr { border-bottom: 1px solid #f1f5f9; }
    .table-details td { padding: 9px 4px; vertical-align: top; }
    .table-details .label { color: #64748b; width: 38%; font-weight: 600; }
    .table-details .value { color: #0f172a; font-weight: 700; }
    .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    .btn-action { display: block; text-align: center; background: #0284c7; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 20px; border-radius: 10px; text-decoration: none; margin-top: 24px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 11px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="header-tag">SI APIN - SISTEM INFORMASI RUANG RAPAT & KONSUMSI</span>
      <h1>Pemberitahuan Pengajuan Booking Baru</h1>
      <p>PT PLN (Persero) UPK Teluk Sirih</p>
    </div>

    <div class="badge-alert">
      🔔 Menunggu Persetujuan (Approval) Tim Administrator
    </div>

    <div class="content">
      <p style="font-size: 13px; margin: 0 0 12px 0;">Halo Tim Administrator SI APIN,</p>
      <p style="font-size: 13px; margin: 0; line-height: 1.5;">Terdapat pengajuan peminjaman ruang rapat & konsumsi baru dengan rincian sebagai berikut:</p>

      <div class="section-title">Data Pengajuan & Pemohon</div>
      <table class="table-details">
        <tr>
          <td class="label">No. Registrasi / Booking</td>
          <td class="value"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${booking.bookingNumber}</span></td>
        </tr>
        <tr>
          <td class="label">Nama Pemohon (PIC)</td>
          <td class="value">${booking.bookerName}</td>
        </tr>
        <tr>
          <td class="label">Departemen / Divisi</td>
          <td class="value">${booking.department}</td>
        </tr>
        <tr>
          <td class="label">Nomor WhatsApp</td>
          <td class="value">${booking.whatsapp}</td>
        </tr>
        ${booking.email ? `<tr><td class="label">Email Pemohon</td><td class="value">${booking.email}</td></tr>` : ''}
      </table>

      <div class="section-title">Jadwal & Ruang Rapat</div>
      <table class="table-details">
        <tr>
          <td class="label">Nama Kegiatan / Agenda</td>
          <td class="value">${booking.meetingTitle}</td>
        </tr>
        <tr>
          <td class="label">Lokasi / Ruangan</td>
          <td class="value" style="color: #0369a1;">${booking.meetingLocation}</td>
        </tr>
        <tr>
          <td class="label">Tanggal Rapat</td>
          <td class="value">${booking.meetingDate}</td>
        </tr>
        <tr>
          <td class="label">Waktu Pelaksanaan</td>
          <td class="value">${booking.startTime} - ${booking.endTime} WIB (${booking.durationHours} Jam)</td>
        </tr>
        <tr>
          <td class="label">Jumlah Peserta</td>
          <td class="value">${booking.participantCount} Orang</td>
        </tr>
        ${booking.organizationOrGuests ? `<tr><td class="label">Tamu / Instansi</td><td class="value">${booking.organizationOrGuests}</td></tr>` : ''}
      </table>

      <div class="section-title">Logistik Konsumsi & Catatan</div>
      <table class="table-details">
        <tr>
          <td class="label">Snack Ringan</td>
          <td class="value">${booking.snackRingan}</td>
        </tr>
        <tr>
          <td class="label">Snack Berat</td>
          <td class="value">${booking.snackBerat}</td>
        </tr>
        <tr>
          <td class="label">Makan Siang</td>
          <td class="value">${booking.makanSiang === 'Iya' ? '<span style="color:#059669; font-weight:800;">✅ Ya (Sesuai Ketentuan)</span>' : '❌ Tidak'}</td>
        </tr>
        ${booking.notes ? `<tr><td class="label">Catatan Tambahan</td><td class="value" style="font-style: italic; color: #475569;">"${booking.notes}"</td></tr>` : ''}
      </table>

      <a href="${baseUrl}" class="btn-action">
        Buka Dashboard SI APIN untuk Proses Approval &rarr;
      </a>
    </div>

    <div class="footer">
      Email ini dikirim secara otomatis oleh sistem <strong>SI APIN (PLN UPK Teluk Sirih)</strong> melalui akun <code>${this.config.senderEmail}</code>. Mohon tidak membalas email ini secara manual jika tidak diperlukan.
    </div>
  </div>
</body>
</html>
    `;

    try {
      await transporter.sendMail({
        from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
        to: recipients.join(', '),
        subject,
        html: htmlContent
      });

      this.recordLog({
        type: 'NEW_BOOKING_ADMIN_ALERT',
        to: recipients,
        subject,
        status: 'SUCCESS',
        message: `Alert berhasil dikirim ke ${recipients.join(', ')}`,
        bookingNumber: booking.bookingNumber
      });

      return { success: true, message: `Alert sent to ${recipients.join(', ')}` };
    } catch (err: any) {
      const errMsg = err?.message || 'Error sending email';
      console.error('[EmailService] Failed to send admin alert:', err);

      this.recordLog({
        type: 'NEW_BOOKING_ADMIN_ALERT',
        to: recipients,
        subject,
        status: 'FAILED',
        message: errMsg,
        bookingNumber: booking.bookingNumber
      });

      return { success: false, message: errMsg };
    }
  }

  // 2. Send Status Update Notification to User (Approved / Rejected / Cancelled / Modified)
  public async sendBookingStatusUpdateUserAlert(
    booking: any, 
    previousStatus?: string,
    appUrl?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.config.enabled || !this.config.sendOnStatusChange) {
      return { success: false, message: 'Status change email notification is disabled.' };
    }

    const userEmail = (booking.email || '').trim();
    if (!userEmail || !userEmail.includes('@')) {
      this.recordLog({
        type: 'STATUS_UPDATE_USER_ALERT',
        to: [],
        subject: `[SI APIN] Status Booking: ${booking.bookingNumber}`,
        status: 'SKIPPED',
        message: `Pemohon (${booking.bookerName}) tidak mencantumkan alamat email.`,
        bookingNumber: booking.bookingNumber
      });
      return { success: false, message: 'No user email found on booking.' };
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      const warnMsg = 'Google App Password belum diisi di Pengaturan.';
      this.recordLog({
        type: 'STATUS_UPDATE_USER_ALERT',
        to: [userEmail],
        subject: `[SI APIN] Pembaruan Status Booking: ${booking.bookingNumber}`,
        status: 'FAILED',
        message: warnMsg,
        bookingNumber: booking.bookingNumber
      });
      return { success: false, message: warnMsg };
    }

    const isConfirmed = booking.status === 'CONFIRMED';
    const isCancelled = booking.status === 'CANCELLED';
    const isCompleted = booking.status === 'COMPLETED';

    let statusText = 'DIPERBARUI';
    let statusBg = '#f1f5f9';
    let statusColor = '#334155';
    let statusEmoji = '📝';

    if (isConfirmed) {
      statusText = 'DISETUJUI / DIKONFIRMASI';
      statusBg = '#dcfce7';
      statusColor = '#166534';
      statusEmoji = '✅';
    } else if (isCancelled) {
      statusText = 'DITOLAK / DIBATALKAN';
      statusBg = '#ffe4e6';
      statusColor = '#9f1239';
      statusEmoji = '❌';
    } else if (isCompleted) {
      statusText = 'SELESAI';
      statusBg = '#e0f2fe';
      statusColor = '#0369a1';
      statusEmoji = '🎉';
    }

    const subject = `[SI APIN TELUK SIRIH] Status Booking ${statusText}: ${booking.bookingNumber} - ${booking.meetingTitle}`;
    const baseUrl = appUrl || process.env.APP_URL || 'https://ais-dev-5mgkxqe6hyrms662ktugb5-684465154523.asia-east1.run.app';

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%); padding: 24px; color: #ffffff; }
    .header-tag { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
    .status-banner { background: ${statusBg}; color: ${statusColor}; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 800; margin: 20px 24px 0 24px; border: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; }
    .content { padding: 20px 24px 28px 24px; }
    .table-details { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    .table-details tr { border-bottom: 1px solid #f1f5f9; }
    .table-details td { padding: 9px 4px; vertical-align: top; }
    .table-details .label { color: #64748b; width: 38%; font-weight: 600; }
    .table-details .value { color: #0f172a; font-weight: 700; }
    .notes-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 16px; font-size: 13px; color: #334155; }
    .btn-action { display: block; text-align: center; background: #0284c7; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 20px; border-radius: 10px; text-decoration: none; margin-top: 24px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 11px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="header-tag">SI APIN - SISTEM INFORMASI RUANG RAPAT & KONSUMSI</span>
      <h1>Status Pengajuan Booking Ruang Rapat</h1>
      <p>PT PLN (Persero) UPK Teluk Sirih</p>
    </div>

    <div class="status-banner">
      ${statusEmoji} Status Pengajuan: ${statusText}
    </div>

    <div class="content">
      <p style="font-size: 14px; margin: 0 0 10px 0;">Yth. <strong>${booking.bookerName}</strong> (${booking.department}),</p>
      <p style="font-size: 13px; margin: 0; line-height: 1.5;">
        ${isConfirmed 
          ? 'Kabar baik! Pengajuan peminjaman ruang rapat dan kebutuhan konsumsi Anda telah disetujui oleh tim administrator.' 
          : (isCancelled 
              ? 'Mohon maaf, pengajuan peminjaman ruang rapat Anda belum dapat disetujui / telah dibatalkan oleh tim administrator.' 
              : 'Terdapat pembaruan informasi pada jadwal peminjaman ruang rapat Anda.')
        }
      </p>

      <table class="table-details">
        <tr>
          <td class="label">No. Registrasi</td>
          <td class="value"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${booking.bookingNumber}</span></td>
        </tr>
        <tr>
          <td class="label">Nama Kegiatan</td>
          <td class="value">${booking.meetingTitle}</td>
        </tr>
        <tr>
          <td class="label">Ruang Rapat</td>
          <td class="value" style="color: #0369a1;">${booking.meetingLocation}</td>
        </tr>
        <tr>
          <td class="label">Hari & Tanggal</td>
          <td class="value">${booking.meetingDate}</td>
        </tr>
        <tr>
          <td class="label">Jam Pelaksanaan</td>
          <td class="value">${booking.startTime} - ${booking.endTime} WIB</td>
        </tr>
        <tr>
          <td class="label">Peserta</td>
          <td class="value">${booking.participantCount} Orang</td>
        </tr>
        <tr>
          <td class="label">Snack & Konsumsi</td>
          <td class="value">${booking.snackRingan} | ${booking.snackBerat} | Makan Siang: ${booking.makanSiang}</td>
        </tr>
        ${booking.approvedBy ? `<tr><td class="label">Diverifikasi Oleh</td><td class="value">${booking.approvedBy}</td></tr>` : ''}
      </table>

      ${booking.approvalNotes ? `
        <div class="notes-box">
          <strong>Catatan Petugas / Admin:</strong><br/>
          <em>"${booking.approvalNotes}"</em>
        </div>
      ` : ''}

      <a href="${baseUrl}" class="btn-action">
        Lihat Rincian Jadwal di SI APIN &rarr;
      </a>
    </div>

    <div class="footer">
      Email konfirmasi resmi ini dikirim dari <strong>${this.config.senderEmail}</strong> (Sistem Informasi SI APIN PT PLN UPK Teluk Sirih).
    </div>
  </div>
</body>
</html>
    `;

    try {
      await transporter.sendMail({
        from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
        to: userEmail,
        subject,
        html: htmlContent
      });

      this.recordLog({
        type: 'STATUS_UPDATE_USER_ALERT',
        to: [userEmail],
        subject,
        status: 'SUCCESS',
        message: `Notifikasi status [${booking.status}] berhasil dikirim ke pemohon (${userEmail}).`,
        bookingNumber: booking.bookingNumber
      });

      return { success: true, message: `Notification sent to ${userEmail}` };
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to send email';
      console.error('[EmailService] Failed to send status update to user:', err);

      this.recordLog({
        type: 'STATUS_UPDATE_USER_ALERT',
        to: [userEmail],
        subject,
        status: 'FAILED',
        message: errMsg,
        bookingNumber: booking.bookingNumber
      });

      return { success: false, message: errMsg };
    }
  }

  // 3. Send Test Email
  public async sendTestEmail(targetEmail: string): Promise<{ success: boolean; message: string }> {
    const transporter = this.getTransporter();
    if (!transporter) {
      const warn = 'Google App Password belum diisi atau kosong.';
      this.recordLog({
        type: 'TEST_EMAIL',
        to: [targetEmail],
        subject: '[SI APIN] Uji Koneksi Email Notifikasi',
        status: 'FAILED',
        message: warn
      });
      return { success: false, message: warn };
    }

    const subject = `[UJI KONEKSI SI APIN] Pengiriman Email Berhasil - ${new Date().toLocaleTimeString('id-ID')}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0284c7; margin-top: 0;">🎉 Koneksi Email SI APIN Sukses!</h2>
        <p style="font-size: 14px; color: #334155;">
          Email ini adalah pengujian otomatis dari <strong>SI APIN (PLN UPK Teluk Sirih)</strong>.
        </p>
        <p style="font-size: 13px; color: #64748b;">
          Pengirim: <code>${this.config.senderEmail}</code><br/>
          Penerima: <code>${targetEmail}</code><br/>
          Waktu: ${new Date().toLocaleString('id-ID')}
        </p>
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 10px 14px; font-size: 13px; color: #166534; margin-top: 16px;">
          Sistem notifikasi email siap mengirimkan alert otomatis saat booking baru diajukan dan saat status pemesanan diperbarui!
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
        to: targetEmail,
        subject,
        html
      });

      this.recordLog({
        type: 'TEST_EMAIL',
        to: [targetEmail],
        subject,
        status: 'SUCCESS',
        message: `Uji coba email berhasil dikirim ke ${targetEmail}`
      });

      return { success: true, message: `Email uji coba berhasil dikirim ke ${targetEmail}` };
    } catch (err: any) {
      let errMsg = err?.message || 'Gagal mengirim email';
      if (errMsg.includes('Invalid login') || errMsg.includes('535-5.7.8') || errMsg.includes('Username and Password not accepted')) {
        errMsg = 'Google menolak sandi (Invalid Login 535): Pastikan Verifikasi 2 Langkah akun Gmail aktif dan 16 karakter Sandi Aplikasi dibuat khusus untuk akun sdm.upkteluksirih@gmail.com di myaccount.google.com/apppasswords.';
      } else if (errMsg.includes('ETIMEDOUT') || errMsg.includes('ECONNREFUSED')) {
        errMsg = 'Gagal terhubung ke server Gmail (Koneksi Timeout). Coba ulangi beberapa saat lagi.';
      }
      this.recordLog({
        type: 'TEST_EMAIL',
        to: [targetEmail],
        subject,
        status: 'FAILED',
        message: errMsg
      });
      return { success: false, message: errMsg };
    }
  }
}

export const emailService = new EmailService();
