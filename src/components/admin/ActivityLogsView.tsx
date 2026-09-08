import React, { useState, useEffect, useMemo } from 'react';
import { ActivityAction, ActivityLog } from '../../types';
import { activityLogger } from '../../services/activityLogger';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Trash2, 
  LogIn, 
  LogOut, 
  CalendarPlus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  UserCheck,
  KeyRound,
  FileText,
  Clock,
  User,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(() => activityLogger.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Subscribe to real-time logs updates
  useEffect(() => {
    const unsub = activityLogger.subscribe(() => {
      setLogs(activityLogger.getAll());
    });
    return () => unsub();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLogs(activityLogger.getAll());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClearLogs = async () => {
    await activityLogger.clearLogs();
    setLogs(activityLogger.getAll());
    setShowClearConfirm(false);
  };

  // Distinct users for filter dropdown
  const distinctUsers = useMemo(() => {
    const map = new Map<string, { username: string; name: string; dept: string }>();
    logs.forEach(l => {
      if (l.userId && !map.has(l.userId)) {
        map.set(l.userId, {
          username: l.userId,
          name: l.userName || l.userId,
          dept: l.userDepartment || '-'
        });
      }
    });
    return Array.from(map.values());
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = (
          (log.userName || '') +
          ' ' +
          (log.userId || '') +
          ' ' +
          (log.details || '') +
          ' ' +
          (log.targetId || '') +
          ' ' +
          (log.userDepartment || '')
        ).toLowerCase();
        if (!matchText.includes(q)) return false;
      }

      // Action Filter
      if (actionFilter !== 'ALL') {
        if (actionFilter === 'BOOKINGS_ALL') {
          if (!log.action.startsWith('BOOKING_')) return false;
        } else if (actionFilter === 'AUTH_ALL') {
          if (log.action !== 'LOGIN' && log.action !== 'LOGOUT' && log.action !== 'PASSWORD_RESET') return false;
        } else if (log.action !== actionFilter) {
          return false;
        }
      }

      // User Filter
      if (userFilter !== 'ALL') {
        if (log.userId !== userFilter) return false;
      }

      // Time Filter
      if (timeFilter !== 'ALL') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (timeFilter === 'TODAY') {
          const isToday = 
            logDate.getDate() === now.getDate() &&
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (timeFilter === 'WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < sevenDaysAgo) return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, actionFilter, userFilter, timeFilter]);

  // Statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const stats = useMemo(() => {
    const total = logs.length;
    const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr)).length;
    const approvals = logs.filter(l => l.action === 'BOOKING_APPROVE').length;
    const logins = logs.filter(l => l.action === 'LOGIN').length;
    return { total, todayLogs, approvals, logins };
  }, [logs, todayStr]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu (WIB)', 'User ID', 'Nama Pengguna', 'Divisi', 'Role', 'Kategori Aksi', 'Detail Aktivitas', 'Referensi ID'];
    const rows = filteredLogs.map(l => {
      const date = new Date(l.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      return [
        `"${l.id}"`,
        `"${date}"`,
        `"${l.userId}"`,
        `"${l.userName.replace(/"/g, '""')}"`,
        `"${l.userDepartment}"`,
        `"${l.userRole}"`,
        `"${l.action}"`,
        `"${l.details.replace(/"/g, '""')}"`,
        `"${l.targetId || '-'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SI_APIN_Activity_Logs_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for Action Badge
  const getActionBadge = (action: ActivityAction) => {
    switch (action) {
      case 'LOGIN':
        return {
          label: 'Login',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: LogIn
        };
      case 'LOGOUT':
        return {
          label: 'Logout',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: LogOut
        };
      case 'BOOKING_CREATE':
        return {
          label: 'Pengajuan Booking',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: CalendarPlus
        };
      case 'BOOKING_APPROVE':
        return {
          label: 'Approval / Setuju',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: CheckCircle2
        };
      case 'BOOKING_CANCEL':
        return {
          label: 'Pembatalan',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle
        };
      case 'BOOKING_DELETE':
        return {
          label: 'Hapus Booking',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: Trash2
        };
      case 'BOOKING_UPDATE':
        return {
          label: 'Update Jadwal',
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          icon: FileText
        };
      case 'USER_CREATE':
        return {
          label: 'Buat User',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: UserCheck
        };
      case 'PASSWORD_RESET':
        return {
          label: 'Reset Password',
          bg: 'bg-violet-50 text-violet-700 border-violet-200',
          icon: KeyRound
        };
      default:
        return {
          label: action,
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          icon: FileText
        };
    }
  };

  // Format relative time
  const formatTimeInfo = (isoString: string) => {
    const date = new Date(isoString);
    const timeFormatted = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' });
    const dateFormatted = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' });

    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    let relative = '';
    if (diffSec < 60) relative = 'Baru saja';
    else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)} mnt lalu`;
    else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)} jam lalu`;
    else relative = `${Math.floor(diffSec / 86400)} hari lalu`;

    return { timeFormatted, dateFormatted, relative };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Audit Trail & Log Aktivitas Sistem
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                Real-Time SSE Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Log Aktivitas Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Rekam jejak digital terpadu untuk monitoring login, logout, pengajuan booking oleh user, persetujuan admin, serta pengelolaan data fasilitas PLTU Teluk Sirih.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              id="btn-refresh-logs"
              onClick={handleRefresh}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 border border-white/10"
              title="Refresh Log"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>

            <button
              type="button"
              id="btn-export-logs"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>

            <button
              type="button"
              id="btn-clear-logs"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-rose-400/20"
              title="Reset Log ke Default"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Log Sistem</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-400 ml-2">rekaman</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aktivitas Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.todayLogs}</span>
            <span className="text-xs text-slate-400 ml-2">hari ini</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Approval Admin</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-blue-600">{stats.approvals}</span>
            <span className="text-xs text-slate-400 ml-2">disetujui</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Akses & Login</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-violet-600">{stats.logins}</span>
            <span className="text-xs text-slate-400 ml-2">sesi login</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-logs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari user, no. booking, atau detail aktivitas..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div className="md:col-span-3">
            <select
              id="select-action-filter"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">Semua Jenis Aktivitas</option>
              <option value="BOOKINGS_ALL">Semua Aktivitas Booking</option>
              <option value="BOOKING_CREATE">➕ Pengajuan Booking Baru</option>
              <option value="BOOKING_APPROVE">✅ Approval / Persetujuan</option>
              <option value="BOOKING_CANCEL">⚠️ Pembatalan Booking</option>
              <option value="BOOKING_DELETE">🗑️ Penghapusan Booking</option>
              <option value="AUTH_ALL">🔐 Akses & Keamanan Akun</option>
              <option value="LOGIN">🔑 Sesi Login User</option>
              <option value="LOGOUT">🚪 Sesi Logout</option>
              <option value="PASSWORD_RESET">🔄 Reset Password</option>
              <option value="USER_CREATE">👤 Penambahan User</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="md:col-span-2">
            <select
              id="select-user-filter"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">Semua Pengguna</option>
              {distinctUsers.map(u => (
                <option key={u.username} value={u.username}>
                  {u.name} ({u.dept})
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTimeFilter('ALL')}
                className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                  timeFilter === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('TODAY')}
                className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                  timeFilter === 'TODAY' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('WEEK')}
                className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                  timeFilter === 'WEEK' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong>{filteredLogs.length}</strong> dari total {logs.length} riwayat aktivitas
          </span>
          {(searchQuery || actionFilter !== 'ALL' || userFilter !== 'ALL' || timeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActionFilter('ALL');
                setUserFilter('ALL');
                setTimeFilter('ALL');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Logs Feed / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada log aktivitas ditemukan</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada aktivitas yang sesuai dengan kriteria filter pencarian Anda. Coba sesuaikan kata kunci atau filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const BadgeIcon = badge.icon;
              const { timeFormatted, dateFormatted, relative } = formatTimeInfo(log.timestamp);

              return (
                <div 
                  key={log.id} 
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  {/* Left: User & Action */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {log.userName ? log.userName.substring(0, 2).toUpperCase() : 'US'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* User Name */}
                        <span className="font-bold text-sm text-slate-900">
                          {log.userName}
                        </span>

                        {/* Department Badge */}
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {log.userDepartment}
                        </span>

                        {/* Role Badge */}
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          log.userRole === 'ADMIN' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {log.userRole}
                        </span>

                        {/* Action Badge */}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      {/* Log Description */}
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 font-normal break-words">
                        {log.details}
                      </p>

                      {/* Target Reference if present */}
                      {log.targetId && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">Ref / ID:</span>
                          <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                            {log.targetId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Timestamp */}
                  <div className="sm:text-right shrink-0 pl-13 sm:pl-0">
                    <div className="text-xs font-bold text-slate-700">
                      {dateFormatted}
                    </div>
                    <div className="text-[11px] text-slate-400 flex sm:justify-end items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{timeFormatted} WIB</span>
                      <span className="text-indigo-600 font-semibold ml-1">({relative})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Resetting Logs */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Reset Log Aktivitas?</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Tindakan ini akan mengembalikan data log sistem ke riwayat bawaan. Riwayat audit aktivitas sebelumnya akan dibersihkan.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
              >
                Ya, Reset Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
