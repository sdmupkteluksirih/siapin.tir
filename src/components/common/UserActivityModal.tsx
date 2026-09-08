import React, { useState, useEffect, useMemo } from 'react';
import { ActivityLog } from '../../types';
import { activityLogger } from '../../services/activityLogger';
import { authStorage } from '../../services/authStorage';
import { 
  History, 
  X, 
  LogIn, 
  LogOut, 
  CalendarPlus, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Clock, 
  Building2, 
  User, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserActivityModal: React.FC<UserActivityModalProps> = ({ isOpen, onClose }) => {
  const currentUser = authStorage.getCurrentUser();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'BOOKINGS' | 'LOGINS'>('ALL');

  useEffect(() => {
    if (!isOpen) return;

    const loadData = () => {
      if (!currentUser) return;
      // Get logs for current user or their department
      const all = activityLogger.getAll();
      const userDept = (currentUser.department || '').toLowerCase();
      const username = (currentUser.username || '').toLowerCase();
      const name = (currentUser.name || '').toLowerCase();

      const userLogs = all.filter(l => {
        const matchUser = l.userId?.toLowerCase() === username;
        const matchDept = userDept && l.userDepartment?.toLowerCase() === userDept;
        const matchName = name && l.userName?.toLowerCase().includes(name);
        return matchUser || matchDept || matchName;
      });

      setLogs(userLogs);
    };

    loadData();
    const unsub = activityLogger.subscribe(loadData);
    return () => unsub();
  }, [isOpen, currentUser]);

  const filteredLogs = useMemo(() => {
    if (filterType === 'BOOKINGS') {
      return logs.filter(l => l.action.startsWith('BOOKING_'));
    }
    if (filterType === 'LOGINS') {
      return logs.filter(l => l.action === 'LOGIN' || l.action === 'LOGOUT');
    }
    return logs;
  }, [logs, filterType]);

  if (!isOpen) return null;

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' });
    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
    return { dateStr, timeStr };
  };

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return { label: 'Sesi Login', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: LogIn };
      case 'LOGOUT':
        return { label: 'Sesi Logout', color: 'text-slate-700 bg-slate-100 border-slate-200', icon: LogOut };
      case 'BOOKING_CREATE':
        return { label: 'Pengajuan Jadwal', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: CalendarPlus };
      case 'BOOKING_APPROVE':
        return { label: 'Disetujui Admin', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: CheckCircle2 };
      case 'BOOKING_CANCEL':
        return { label: 'Dibatalkan', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: AlertTriangle };
      case 'BOOKING_DELETE':
        return { label: 'Dihapus', color: 'text-rose-700 bg-rose-50 border-rose-200', icon: Trash2 };
      default:
        return { label: action, color: 'text-slate-700 bg-slate-50 border-slate-200', icon: History };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Riwayat Aktivitas Akun
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                  {currentUser?.department || 'User'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Jejak riwayat login dan pengajuan booking yang tercatat untuk akun Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-white flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('BOOKINGS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'BOOKINGS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Booking & Persetujuan
            </button>
            <button
              type="button"
              onClick={() => setFilterType('LOGINS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'LOGINS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sesi Login
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            Terhubung Real-Time
          </span>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Belum ada riwayat aktivitas</h4>
              <p className="text-xs text-slate-500 mt-1">
                Aktivitas Anda saat mengajukan booking atau login akan otomatis tersimpan di sini.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const { label, color, icon: Icon } = getActionInfo(log.action);
              const { dateStr, timeStr } = formatTime(log.timestamp);

              return (
                <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${color}`}>
                        {label}
                      </span>
                      {log.targetId && (
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                          {log.targetId}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium break-words">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-normal">
                      <Clock className="w-3 h-3" />
                      <span>{dateStr} • {timeStr} WIB</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Tercatat di Audit Log SI APIN
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
