import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { formatDateIndo, formatDuration } from '../../utils/timeUtils';
import { StatusBadge } from '../common/StatusBadge';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UtensilsCrossed, 
  Printer, 
  XCircle, 
  Phone, 
  Building2, 
  FileText,
  AlertCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface SearchBookingProps {
  initialSearchQuery?: string;
  onNewBooking: () => void;
}

export const SearchBooking: React.FC<SearchBookingProps> = ({
  initialSearchQuery = '',
  onNewBooking
}) => {
  const [query, setQuery] = useState(initialSearchQuery);
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      const found = bookingStorage.search(query);
      setResults(found);
      if (found.length === 1) {
        setSelectedBooking(found[0]);
      }
    } else {
      setResults(bookingStorage.getAll().slice(0, 5));
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = bookingStorage.search(query);
    setResults(found);
    if (found.length > 0) {
      setSelectedBooking(found[0]);
    } else {
      setSelectedBooking(null);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    bookingStorage.updateStatus(bookingId, 'CANCELLED');
    setShowCancelModal(false);
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(bookingStorage.getById(bookingId) || null);
    }
    setResults(bookingStorage.search(query));
    setIsWaModalOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-8 w-full max-w-full">
        <div className="max-w-xl mx-auto text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Cek Status Booking Meeting
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Masukkan Nomor Booking (misal: OPR-20260825-0001, HAR-20260825-0001), Nama Pemesan, atau Nomor WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              id="input-search-booking"
              placeholder="Cari Nomor Booking, Nama, atau WhatsApp..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            id="btn-search-submit"
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-indigo-600 text-white shadow-xs transition-colors cursor-pointer w-full sm:w-auto text-center justify-center"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Results & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of found bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Booking ({results.length})
            </span>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-indigo-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Tidak ditemukan data booking dengan kata kunci tersebut.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {results.map((item) => {
                const isSelected = selectedBooking?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBooking(item)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-indigo-900">
                        {item.bookingNumber}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.meetingTitle}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span>{formatDateIndo(item.meetingDate, false)}</span>
                      <span>{item.startTime} WIB</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Booking Full Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 lg:col-span-2 space-y-6">
          {selectedBooking ? (
            <>
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                    {selectedBooking.bookingNumber}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedBooking.meetingTitle}
                  </h3>
                </div>
                <StatusBadge status={selectedBooking.status} size="lg" />
              </div>

              {/* Grid detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Jadwal Ruangan</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Tanggal:</span>
                    <strong className="text-slate-900">{formatDateIndo(selectedBooking.meetingDate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Waktu:</span>
                    <strong className="text-slate-900">
                      {selectedBooking.startTime} - {selectedBooking.endTime} WIB ({formatDuration(selectedBooking.durationHours)})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Lokasi:</span>
                    <span className="text-slate-800 font-semibold">{selectedBooking.meetingLocation}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-xs font-bold uppercase text-amber-600 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Paket Konsumsi ({selectedBooking.participantCount} Pax)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Snack Ringan:</span>
                    <strong className={selectedBooking.snackRingan !== 'Tidak Ada' ? 'text-slate-900' : 'text-slate-400'}>
                      {selectedBooking.snackRingan !== 'Tidak Ada' ? selectedBooking.snackRingan : '- (Tidak Pesan)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Snack Berat:</span>
                    <strong className={selectedBooking.snackBerat !== 'Tidak Ada' ? 'text-slate-900' : 'text-slate-400'}>
                      {selectedBooking.snackBerat !== 'Tidak Ada' ? selectedBooking.snackBerat : '- (Tidak Pesan)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Makan Siang:</span>
                    <span className={`font-semibold ${selectedBooking.makanSiang === 'Iya' ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {selectedBooking.makanSiang === 'Iya' ? 'Iya (Disediakan)' : 'Tidak Disediakan'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pemesan details */}
              <div className="p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                <div className="text-xs font-bold uppercase text-slate-500">
                  Data Penanggung Jawab
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-xs">Nama:</span>
                    <strong className="text-slate-900">{selectedBooking.bookerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Departemen:</span>
                    <span className="text-slate-800 font-medium">{selectedBooking.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">WhatsApp:</span>
                    <span className="text-slate-800 font-medium">{selectedBooking.whatsapp}</span>
                  </div>
                </div>

                {selectedBooking.organizationOrGuests && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 block">Organisasi / Tamu yang Hadir:</span>
                    <span className="text-slate-900 font-semibold">{selectedBooking.organizationOrGuests}</span>
                  </div>
                )}

                {selectedBooking.invitationLetter && (
                  <div className="pt-2 border-t border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block">Surat Undangan / Izin Eksternal:</span>
                      <span className="text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                        {selectedBooking.invitationLetter.name}
                      </span>
                    </div>
                    {selectedBooking.invitationLetter.dataUrl && (
                      <a
                        href={selectedBooking.invitationLetter.dataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors"
                      >
                        Buka Dokumen
                      </a>
                    )}
                  </div>
                )}

                {selectedBooking.notes && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 block">Catatan:</span>
                    <span className="text-slate-600 italic">"{selectedBooking.notes}"</span>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs sm:text-sm text-slate-700 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Bukti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWaModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Kirim via WA</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedBooking.status === 'BOOKED' && (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Batalkan Booking</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onNewBooking}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    Buat Booking Baru
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Building2 className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-medium">
                Pilih salah satu booking di samping atau masukkan kata kunci pencarian.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Batalkan Booking Meeting?
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Apakah Anda yakin ingin membatalkan booking <strong>{selectedBooking.bookingNumber}</strong> ({selectedBooking.meetingTitle})?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={() => handleCancelBooking(selectedBooking.id)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Ya, Batalkan Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Notification Modal */}
      {isWaModalOpen && selectedBooking && (
        <WhatsAppNotificationModal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          booking={selectedBooking}
          type="STATUS_UPDATE"
          newStatus={selectedBooking.status}
        />
      )}
    </div>
  );
};
