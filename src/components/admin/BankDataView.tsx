import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Sparkles,
  Server,
  Layers,
  AlertCircle
} from 'lucide-react';
import { bankDataService, MasterBankData } from '../../services/bankDataService';

export const BankDataView: React.FC = () => {
  const [bankData, setBankData] = useState<MasterBankData | null>(bankDataService.getCached());
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'accounts' | 'bookings' | 'logs'>('overview');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsub = bankDataService.subscribe(() => {
      setBankData(bankDataService.getCached());
    });
    // fetch initial fresh data
    setIsLoading(true);
    bankDataService.refresh().then((data) => {
      if (data) setBankData(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleManualReconcile = async () => {
    setIsLoading(true);
    const result = await bankDataService.forceReconcile();
    setIsLoading(false);
    if (result.success) {
      setActionNotice({
        type: 'success',
        message: 'Bank Data berhasil direkonsiliasi. Seluruh 14 akun, jadwal booking, dan rekam audit log terpadu!'
      });
      setTimeout(() => setActionNotice(null), 5000);
    } else {
      setActionNotice({
        type: 'error',
        message: 'Gagal melakukan sinkronisasi ulang bank data.'
      });
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = bankDataService.exportUrl();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.accounts && !parsed.bookings && !parsed.activityLogs) {
          setActionNotice({
            type: 'error',
            message: 'Format file cadangan tidak valid (wajib memuat accounts, bookings, atau activityLogs).'
          });
          return;
        }

        setIsLoading(true);
        const res = await bankDataService.restore(parsed);
        setIsLoading(false);

        if (res.success) {
          setActionNotice({
            type: 'success',
            message: res.message || 'Bank Data berhasil dipulihkan dari cadangan master!'
          });
        } else {
          setActionNotice({
            type: 'error',
            message: res.error || 'Gagal memulihkan cadangan bank data.'
          });
        }
        setTimeout(() => setActionNotice(null), 6000);
      } catch (err: any) {
        setActionNotice({
          type: 'error',
          message: `Gagal membaca file JSON: ${err.message}`
        });
        setTimeout(() => setActionNotice(null), 5000);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const accounts = bankData?.accounts || [];
  const bookings = bankData?.bookings || [];
  const activityLogs = bankData?.activityLogs || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Single Source of Truth (Bank Data Terpadu)
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                master_bank_data.json
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Database className="w-7 h-7 text-indigo-400" />
              <span>Bank Data Terpadu SI APIN</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Semua aktivitas dari <strong>14 akun pengguna</strong> (login, logout, permohonan booking fasilitas, approval admin, konsumsi, dan audit trail) bermuara langsung ke satu bank data sentral ini secara utuh dan terpadu tanpa terpisah-pisah.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              id="btn-reconcile-bank-data"
              onClick={handleManualReconcile}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 border border-white/15"
              title="Sinkronisasi Ulang Bank Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Sinkronkan Sekarang</span>
            </button>

            <button
              type="button"
              id="btn-download-master-bank"
              onClick={handleDownloadBackup}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              title="Unduh Cadangan Master Bank Data"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Master JSON</span>
            </button>

            <label
              htmlFor="upload-master-bank-input"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
              title="Pulihkan dari File Cadangan"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Pulihkan Data</span>
              <input
                id="upload-master-bank-input"
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border animate-fadeIn ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 14 Akun Pengguna */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Akun Terdaftar</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{accounts.length}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Lengkap (14 Akun)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            4 Akun Administrator & 10 Akun Divisi Bidang
          </p>
        </div>

        {/* Card 2: Total Booking */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Booking Fasilitas</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{bookings.length}</span>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {bankData?.meta?.activeBookings ?? bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'BOOKED').length} Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Riwayat jadwal rapat & layanan konsumsi
          </p>
        </div>

        {/* Card 3: Aktivitas Log */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Rekam Jejak Aktivitas</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activityLogs.length}</span>
            <span className="text-xs font-medium text-slate-500">
              rekaman
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Audit trail otomatis setiap pergerakan akun
          </p>
        </div>

        {/* Card 4: Waktu Sinkronisasi Terakhir */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Sinkronisasi Bank Data</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block truncate">
              {bankData?.lastUpdated ? new Date(bankData.lastUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB' : 'Baru saja'}
            </span>
            <span className="text-[11px] text-slate-400">
              {bankData?.lastUpdated ? new Date(bankData.lastUpdated).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Real-time SSE Auto-Sync
          </p>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Arsitektur & Struktur Data</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'accounts'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>14 Akun Pengguna ({accounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('bookings')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Data Booking ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log Terpadu ({activityLogs.length})</span>
        </button>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>Bagaimana 1 Source Bank Data Ini Bekerja?</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center mb-2">
                  1
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Pintu Masuk Terpadu</h3>
                <p className="text-slate-500 text-xs">
                  Setiap login dari 14 akun, pengajuan jadwal booking ruangan rapat, pesanan konsumsi, hingga keputusan approve admin langsung dicatat ke endpoint server pusat.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center mb-2">
                  2
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Konsolidasi Otomatis (Master Bank)</h3>
                <p className="text-slate-500 text-xs">
                  Server secara otomatis menggabungkan seluruh tabel (<code className="text-indigo-600 font-mono">users</code>, <code className="text-indigo-600 font-mono">bookings</code>, dan <code className="text-indigo-600 font-mono">activity_logs</code>) ke dalam satu file otoritatif: <strong className="font-semibold text-slate-700">master_bank_data.json</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center mb-2">
                  3
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Real-time Push & Reconcile</h3>
                <p className="text-slate-500 text-xs">
                  Melalui Server-Sent Events (SSE) dan BroadcastChannel, setiap perubahan dari salah satu akun langsung terlihat seketika oleh akun lainnya tanpa data terpecah atau hilang.
                </p>
              </div>
            </div>
          </div>

          {/* Master Bank Data JSON Schema Preview */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Pratinjau Struktur Master Bank Data (JSON)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                /data/master_bank_data.json
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
              <pre className="text-indigo-300">
                {JSON.stringify(
                  {
                    system: bankData?.system || 'SI APIN - PT PLN Indonesia Power UBP Teluk Sirih',
                    schemaVersion: bankData?.schemaVersion || '2.0-unified',
                    lastUpdated: bankData?.lastUpdated,
                    meta: bankData?.meta,
                    sampleAccount: accounts[0] || null,
                    sampleBooking: bookings[0] || null,
                    sampleLog: activityLogs[0] || null
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab Accounts */}
      {activeSubTab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Daftar 14 Akun di Bank Data</h2>
              <p className="text-xs text-slate-500">Semua aktivitas dari 14 akun ini saling terhubung ke database utama</p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              {accounts.length} Akun
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">User ID</th>
                  <th className="p-3.5">Nama Lengkap</th>
                  <th className="p-3.5">Divisi / Bidang</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status Sandi</th>
                  <th className="p-3.5">Pengubah Terakhir</th>
                  <th className="p-3.5">Login Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{u.username}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{u.name}</td>
                    <td className="p-3.5 text-slate-600">{u.department}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-slate-400">
                      {u.password ? '•••••••• (Tersimpan)' : '-'}
                    </td>
                    <td className="p-3.5 text-slate-600 text-xs">
                      {u.updatedById ? (
                        <div>
                          <span className="font-semibold text-slate-800">{u.updatedByName || u.updatedById}</span>
                          <span className="font-mono text-indigo-600 text-[11px] ml-1">({u.updatedById})</span>
                          <div className="text-[10px] text-slate-400">
                            {u.updatedAt ? new Date(u.updatedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Sistem / Default</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 text-xs">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })
                        : 'Belum pernah'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab Bookings */}
      {activeSubTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Daftar Jadwal Booking di Bank Data</h2>
              <p className="text-xs text-slate-500">Semua permohonan yang diajukan dan diperbarui oleh seluruh pengguna tersimpan terpusat lengkap dengan identitas pengubah</p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
              {bookings.length} Permohonan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">No. Booking</th>
                  <th className="p-3.5">Agenda / Kegiatan</th>
                  <th className="p-3.5">Divisi & Pembuat</th>
                  <th className="p-3.5">Lokasi & Tanggal</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">ID & Nama Pengubah Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{b.bookingNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{b.meetingTitle}</td>
                    <td className="p-3.5 text-slate-600">
                      <div>{b.department}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {b.createdByName || b.bookerName}
                        <span className="font-mono text-indigo-600 ml-1">
                          ({b.createdById || b.department})
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div>{b.meetingLocation}</div>
                      <div className="text-[11px] text-slate-400">{b.meetingDate} ({b.startTime}-{b.endTime})</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'BOOKED'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {b.status === 'CONFIRMED'
                          ? 'DISETUJUI'
                          : b.status === 'BOOKED'
                          ? 'MENUNGGU'
                          : b.status === 'CANCELLED'
                          ? 'DIBATALKAN'
                          : b.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span>{b.lastModifiedByName || b.approvedBy || b.createdByName || 'Administrator'}</span>
                          <span className="font-mono text-indigo-700 text-xs font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                            {b.lastModifiedById || 'admin'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
                            {b.lastModifiedByRole || 'ADMIN'}
                          </span>
                          <span className="text-slate-500">{b.lastAction || 'DIPERBARUI'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {b.lastModifiedAt 
                            ? new Date(b.lastModifiedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
                            : (b.updatedAt ? new Date(b.updatedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-')}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Audit Trail di Bank Data</h2>
              <p className="text-xs text-slate-500">Merekam riwayat seluruh aksi dari 14 akun secara kronologis</p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
              {activityLogs.length} Rekaman
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {activityLogs.slice(0, 100).map((l) => (
              <div key={l.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{l.userName}</span>
                    <span className="text-xs text-slate-400 font-mono">({l.userId})</span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {l.userDepartment}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      {l.action}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">{l.details}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(l.timestamp).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
