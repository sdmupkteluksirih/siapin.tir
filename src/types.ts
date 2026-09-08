export type BookingStatus = 'BOOKED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type SnackRingan = 'Snack Mix Basah Kering' | 'Snack Sehat Rebusan' | 'Tidak Ada';
export type SnackBerat = 
  | 'Baso' 
  | 'Sate Padang' 
  | 'Soto' 
  | 'Siomay / Batagor' 
  | 'Nasi Uduk' 
  | 'Nasi Goreng' 
  | 'Tidak Ada'
  | 'Sate'; // legacy compatibility
export type MakanSiang = 'Iya' | 'Tidak';

export interface AttachedDocument {
  id?: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // base64 representation for preview or download
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'USER';
  department: string;
  password: string;
  avatarText?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. "MTG-20260820-001"
  meetingDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  durationHours: number; // e.g. 1, 1.5, 2, 3, etc.
  endTime: string; // HH:MM (calculated)
  snackRingan: SnackRingan;
  snackBerat: SnackBerat;
  makanSiang: MakanSiang;
  bookerName: string;
  department: string;
  whatsapp: string;
  meetingTitle: string;
  meetingLocation: string;
  participantCount: number;
  organizationOrGuests?: string; // Nama Organisasi / Tamu yang hadir
  invitationLetter?: AttachedDocument | null; // Surat Undangan / Izin dari eksternal (legacy / file pertama)
  attachments?: AttachedDocument[]; // Dokumen / File Pendukung (bisa lebih dari 1 file)
  notes?: string;
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  status: BookingStatus;
  createdAt: string; // ISO string
  updatedAt?: string;
}

export interface BookingFormData {
  meetingDate: string;
  startTime: string;
  durationHours: number;
  snackRingan: SnackRingan;
  snackBerat: SnackBerat;
  makanSiang: MakanSiang;
  bookerName: string;
  department: string;
  whatsapp: string;
  meetingTitle: string;
  meetingLocation: string;
  participantCount: number;
  organizationOrGuests: string;
  invitationLetter: AttachedDocument | null;
  attachments?: AttachedDocument[]; // Dokumen / File Pendukung (bisa lebih dari 1 file)
  notes: string;
}

export interface RekapHarian {
  date: string;
  totalMeeting: number;
  totalPeserta: number;
  snackRingan: {
    'Snack Mix Basah Kering': number;
    'Snack Sehat Rebusan': number;
  };
  snackBerat: {
    'Baso': number;
    'Sate Padang': number;
    'Soto': number;
    'Siomay / Batagor': number;
    'Nasi Uduk': number;
    'Nasi Goreng': number;
    [key: string]: number;
  };
  makanSiang: {
    'Iya': number;
    'Tidak': number;
  };
  bookings: Booking[];
}

export type AdminTab = 'dashboard' | 'booking' | 'kalender' | 'rekap' | 'users' | 'logs' | 'pengaturan';
export type MainView = 'booking' | 'search' | 'admin' | 'login';

export type ActivityAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'BOOKING_CREATE' 
  | 'BOOKING_APPROVE' 
  | 'BOOKING_UPDATE' 
  | 'BOOKING_CANCEL' 
  | 'BOOKING_DELETE' 
  | 'USER_CREATE' 
  | 'USER_UPDATE' 
  | 'PASSWORD_RESET' 
  | 'SETTINGS_CHANGE';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userDepartment: string;
  userRole: 'ADMIN' | 'USER';
  action: ActivityAction;
  details: string;
  targetId?: string; // e.g. booking number / user id
  metadata?: Record<string, any>;
}

