import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { formatDateIndo, formatDuration } from '../../utils/timeUtils';
import { StatusBadge } from '../common/StatusBadge';
import { BookingEditApprovalModal } from './BookingEditApprovalModal';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UtensilsCrossed, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  CheckCheck, 
  Trash2, 
  Eye,
  ArrowUpDown,
  FileSpreadsheet,
  Edit3,
  FileCheck,
  MessageSquare
} from 'lucide-react';

interface BookingManagementProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onNewBookingClick: () => void;
}

export const BookingManagement: React.FC<BookingManagementProps> = ({
  bookings,
  onSelectBooking,
  onNewBookingClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedForStatusChange, setSelectedForStatusChange] = useState<Booking | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<Booking | null>(null);
  const [selectedForEditApproval, setSelectedForEditApproval] = useState<Booking | null>(null);
  const [selectedForWaModal, setSelectedForWaModal] = useState<{ booking: Booking; newStatus?: BookingStatus } | null>(null);

  // Filtered list
  const filteredBookings = bookings.filter((item) => {
    const matchesSearch = 
      item.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meetingLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesDate = !dateFilter || item.meetingDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleQuickStatusChange = (booking: Booking, newStatus: BookingStatus) => {
    bookingStorage.updateStatus(booking.id, newStatus);
    setSelectedForStatusChange(null);
    // Open WhatsApp modal to inform booker of this status update
    setSelectedForWaModal({ booking, newStatus });
  };

  const handleDeleteConfirm = (bookingId: string) => {
    bookingStorage.delete(bookingId);
    setSelectedForDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Daftar Seluruh Booking & Approval
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola persetujuan (approval), edit jadwal atau konsumsi, dan pantau seluruh permohonan ruang rapat.
          </p>
        </div>

        <button
          type="button"
          id="btn-admin-add-booking"
          onClick={onNewBookingClick}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Booking Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              id="admin-search-input"
              placeholder="Cari nomor booking, judul rapat, PIC, divisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="ALL">Semua Status</option>
              <option value="BOOKED">BOOKED (Menunggu Persetujuan)</option>
              <option value="CONFIRMED">CONFIRMED (Disetujui / Terkonfirmasi)</option>
              <option value="COMPLETED">COMPLETED (Selesai)</option>
              <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <input
              type="date"
              id="admin-date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-xs text-rose-600 font-bold px-2 py-1 hover:underline whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick status count badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Filter cepat:</span>
          {(['ALL', 'BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((st) => {
            const count = st === 'ALL' 
              ? bookings.length 
              : bookings.filter(b => b.status === st).length;
            const isActive = statusFilter === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st === 'BOOKED' ? 'Menunggu Approval' : st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Nomor & Tanggal</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Nama Meeting & PIC</th>
                <th className="py-3.5 px-4">Lokasi</th>
                <th className="py-3.5 px-4 text-center">Peserta</th>
                <th className="py-3.5 px-4">Konsumsi</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Approval & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada booking yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Booking Number & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-indigo-900 text-xs">
                        {item.bookingNumber}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {formatDateIndo(item.meetingDate, false)}
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDuration(item.durationHours)}
                      </div>
                    </td>

                    {/* Title & Booker */}
                    <td className="py-3.5 px-4">
                      <div 
                        onClick={() => onSelectBooking(item)}
                        className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1"
                      >
                        {item.meetingTitle}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>{item.bookerName} • <span className="text-slate-400">{item.department}</span></span>
                        {item.organizationOrGuests && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded" title={`Tamu: ${item.organizationOrGuests}`}>
                            👥 {item.organizationOrGuests}
                          </span>
                        )}
                        {item.invitationLetter && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100" title={`Surat: ${item.invitationLetter.name}`}>
                            📎 Surat Terlampir
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Room */}
                    <td className="py-3.5 px-4 text-xs font-medium">
                      {item.meetingLocation === 'Tidak menggunakan ruang meeting' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Tanpa Ruangan (Hanya Konsumsi)
                        </span>
                      ) : (
                        <span className="text-slate-800">{item.meetingLocation}</span>
                      )}
                    </td>

                    {/* Participants */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {item.participantCount}
                    </td>

                    {/* Snacks */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-800 font-medium">
                        {item.snackRingan !== 'Tidak Ada' && item.snackBerat !== 'Tidak Ada'
                          ? `${item.snackRingan.replace('Snack ', '')} + ${item.snackBerat}`
                          : item.snackRingan !== 'Tidak Ada'
                          ? item.snackRingan
                          : item.snackBerat !== 'Tidak Ada'
                          ? item.snackBerat
                          : 'Tanpa Snack'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Makan Siang: <strong className={item.makanSiang === 'Iya' ? 'text-emerald-700' : 'text-slate-400'}>{item.makanSiang}</strong>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Edit & Approval Action */}
                        <button
                          type="button"
                          onClick={() => setSelectedForEditApproval(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit dan Setujui Permohonan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{item.status === 'BOOKED' ? 'Edit & Setujui' : 'Edit'}</span>
                        </button>

                        {/* WhatsApp Notification Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedForWaModal({ booking: item, newStatus: item.status })}
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Kirim Notifikasi WhatsApp ke Pemesan"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectBooking(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedForStatusChange(item)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Ubah Status Cepat"
                        >
                          Status
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedForDelete(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit & Approval Modal Trigger */}
      {selectedForEditApproval && (
        <BookingEditApprovalModal
          booking={selectedForEditApproval}
          onClose={() => setSelectedForEditApproval(null)}
          onSuccess={() => {
            setSelectedForEditApproval(null);
          }}
        />
      )}

      {/* Quick Status Change Modal */}
      {selectedForStatusChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Ubah Status Booking
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              {selectedForStatusChange.bookingNumber} • {selectedForStatusChange.meetingTitle}
            </p>

            <div className="space-y-2 mb-6">
              {(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map((status) => {
                const isCurrent = selectedForStatusChange.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedForStatusChange, status)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <StatusBadge status={status} size="md" />
                    {isCurrent && <span className="text-xs text-indigo-700 font-bold">Saat Ini</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedForStatusChange(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Notification Modal */}
      {selectedForWaModal && (
        <WhatsAppNotificationModal
          isOpen={!!selectedForWaModal}
          onClose={() => setSelectedForWaModal(null)}
          booking={selectedForWaModal.booking}
          type="STATUS_UPDATE"
          newStatus={selectedForWaModal.newStatus || selectedForWaModal.booking.status}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Hapus Data Booking?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Apakah Anda yakin ingin menghapus data booking <strong>{selectedForDelete.bookingNumber}</strong> ({selectedForDelete.meetingTitle})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedForDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(selectedForDelete.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

