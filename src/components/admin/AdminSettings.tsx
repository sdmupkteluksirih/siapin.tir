import React, { useState, useEffect } from 'react';
import { bookingStorage } from '../../services/bookingStorage';
import { authStorage } from '../../services/authStorage';
import { themeStorage, BackgroundSettings, BackgroundStyle, OverlayTone } from '../../services/themeStorage';
import { whatsappService, AdminContact } from '../../services/whatsappService';
import { 
  Building2, 
  RotateCcw, 
  CheckCircle2, 
  Shield, 
  Utensils, 
  MapPin, 
  Users, 
  Info,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  SunMedium,
  Check,
  MessageSquare,
  Plus,
  Trash2,
  Phone,
  Send,
  Edit2,
  ArrowUp,
  ArrowDown,
  Pencil,
  X
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>(() => themeStorage.getSettings());
  const [bgSavedSuccess, setBgSavedSuccess] = useState(false);

  // WhatsApp Admin Contacts state
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>(() => whatsappService.getAdminContacts());
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [contactSavedSuccess, setContactSavedSuccess] = useState(false);
  const [contactToastMsg, setContactToastMsg] = useState('Kontak Tersimpan');

  // Inline editing state
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactRole, setEditContactRole] = useState('');

  useEffect(() => {
    const unsub = themeStorage.subscribe((updated) => {
      setBgSettings(updated);
    });
    return () => unsub();
  }, []);

  const handleBgChange = <K extends keyof BackgroundSettings>(key: K, value: BackgroundSettings[K]) => {
    const updated = { ...bgSettings, [key]: value };
    setBgSettings(updated);
    themeStorage.saveSettings(updated);
    setBgSavedSuccess(true);
    setTimeout(() => setBgSavedSuccess(false), 2000);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: AdminContact = {
      id: `adm-${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      role: newContactRole.trim() || 'PIC GA & Ruangan'
    };

    const updated = [...adminContacts, newContact];
    setAdminContacts(updated);
    whatsappService.saveAdminContacts(updated);

    setNewContactName('');
    setNewContactPhone('');
    setNewContactRole('');
    setContactToastMsg('Kontak Admin berhasil ditambahkan');
    setContactSavedSuccess(true);
    setTimeout(() => setContactSavedSuccess(false), 2500);
  };

  const handleMoveContact = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= adminContacts.length) return;

    const updated = [...adminContacts];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setAdminContacts(updated);
    whatsappService.saveAdminContacts(updated);
    setContactToastMsg('Urutan nomor kontak berhasil diubah');
    setContactSavedSuccess(true);
    setTimeout(() => setContactSavedSuccess(false), 2000);
  };

  const handleStartEdit = (contact: AdminContact) => {
    setEditingContactId(contact.id);
    setEditContactName(contact.name);
    setEditContactPhone(contact.phone);
    setEditContactRole(contact.role);
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setEditContactName('');
    setEditContactPhone('');
    setEditContactRole('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editContactName.trim() || !editContactPhone.trim()) {
      alert('Nama dan nomor WhatsApp tidak boleh kosong.');
      return;
    }

    const updated = adminContacts.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          name: editContactName.trim(),
          phone: editContactPhone.trim(),
          role: editContactRole.trim() || 'PIC GA & Ruangan'
        };
      }
      return c;
    });

    setAdminContacts(updated);
    whatsappService.saveAdminContacts(updated);
    setEditingContactId(null);
    setContactToastMsg('Kontak Admin berhasil diperbarui');
    setContactSavedSuccess(true);
    setTimeout(() => setContactSavedSuccess(false), 2500);
  };

  const handleDeleteContact = (id: string) => {
    if (adminContacts.length <= 1) {
      alert('Minimal harus ada 1 kontak Admin GA yang terdaftar.');
      return;
    }
    const updated = adminContacts.filter(c => c.id !== id);
    setAdminContacts(updated);
    whatsappService.saveAdminContacts(updated);
  };

  const handleTestWhatsApp = (phone: string, name: string) => {
    const testMsg = `*TES NOTIFIKASI WHATSAPP - SI APIN PLN UPK TELUK SIRIH*\n\nHalo ${name},\nKoneksi notifikasi WhatsApp Sistem Terpadu Pemesanan Ruang Rapat & Konsumsi SI APIN berfungsi dengan baik! [TERHUBUNG]`;
    whatsappService.openChat(phone, testMsg);
  };

  const handleResetData = () => {
    if (window.confirm('Reset seluruh data ke data simulasi awal perusahaan (termasuk meeting hari ini 20 Agustus 2026)?')) {
      bookingStorage.reset();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Pengaturan Sistem & Master Data
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Konfigurasi internal ruang meeting, katalog konsumsi, dan pemeliharaan data.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Data simulasi awal berhasil dimuat ulang!</span>
        </div>
      )}

      {/* Card 0: Background & Visual Landscape PLTU Teluk Sirih */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tema & Background Visual PLTU Teluk Sirih
              </h3>
              <p className="text-xs text-slate-500">
                Pengaturan tampilan lanskap latar belakang aplikasi & banner sambutan.
              </p>
            </div>
          </div>

          {bgSavedSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Tersimpan Otomatis</span>
            </span>
          )}
        </div>

        {/* Thumbnail Preview */}
        <div className="relative rounded-2xl overflow-hidden h-28 border border-slate-200 group">
          <img
            src="/bg-teluk-sirih.jpg"
            alt="PLTU Teluk Sirih"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent flex items-center p-4">
            <div className="text-white">
              <span className="text-[10px] font-bold uppercase bg-cyan-500 text-slate-950 px-2 py-0.5 rounded">
                Foto Udara PLTU Teluk Sirih
              </span>
              <h4 className="text-sm font-black mt-1">PT PLN Indonesia Power UPK Teluk Sirih</h4>
              <p className="text-[11px] text-slate-200">Pembangkit Listrik Tenaga Uap (2 x 112 MW) - Kota Padang</p>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[
            { id: 'panorama' as BackgroundStyle, label: 'Panorama Penuh' },
            { id: 'banner' as BackgroundStyle, label: 'Hero Banner Atas' },
            { id: 'gradient' as BackgroundStyle, label: 'Gradasi Ocean' },
            { id: 'minimal' as BackgroundStyle, label: 'Clean Light' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleBgChange('style', m.id)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                bgSettings.style === m.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Sliders for Opacity and Blur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Transparansi Latar:</span>
              <span className="text-indigo-600 font-mono">{bgSettings.opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={bgSettings.opacity}
              onChange={(e) => handleBgChange('opacity', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Kelembutan Blur (Glass):</span>
              <span className="text-indigo-600 font-mono">{bgSettings.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={bgSettings.blur}
              onChange={(e) => handleBgChange('blur', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Card 1: Master Ruangan & Fasilitas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Daftar Ruang Pertemuan Aktif
            </h3>
            <p className="text-xs text-slate-500">
              Ruang rapat yang tersedia untuk dipesan di form customer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { name: 'War room lt. 3', floor: 'Lt. 3', cap: '35 Orang', desc: 'Layar Monitoring, Konferensi Terintegrasi, Dispenser, Stage dan Mimbar' },
            { name: 'Ruang integritas lt. 2', floor: 'Lt. 2', cap: '10 Orang', desc: 'Smart Display, Meja Rapat, Whiteboard, Dispenser' },
            { name: 'Room meeting KU lt. 1', floor: 'Lt. 1', cap: '15 Orang', desc: 'Smart Display, Meja Rapat, Whiteboard, Dispenser' },
            { name: 'Room meeting Har', floor: 'Gedung Har', cap: '25 Orang', desc: 'Smart Display, Meja Rapat, Whiteboard, Dispenser' },
            { name: 'Tidak menggunakan ruang meeting', floor: 'Non-Ruangan', cap: 'Fleksibel', desc: 'Hanya pemesanan konsumsi / Rapat di area unit luar / Hybrid' }
          ].map((room, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-start">
              <div>
                <strong className="text-slate-900 text-xs sm:text-sm block">{room.name}</strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">{room.desc}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] whitespace-nowrap">
                {room.cap}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 1.5: Master Departemen & Divisi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Daftar Departemen / Divisi
            </h3>
            <p className="text-xs text-slate-500">
              Unit kerja internal yang terdaftar dalam formulir permohonan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            'Operasi',
            'Pemeliharaan',
            'Enjiniring',
            'Coal & Ash Handling',
            'Keuangan & Umum',
            'K3 & Keamanan',
            'Lingkungan',
            'Pengadaan'
          ].map((dept, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="truncate">{dept}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Katalog Menu Konsumsi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Katalog Konsumsi Internal
            </h3>
            <p className="text-xs text-slate-500">
              Menu baku yang disediakan oleh divisi logistik/GA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <strong className="text-indigo-900 font-bold text-xs uppercase block">Snack Ringan</strong>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-center gap-1.5">• <span>Snack Mix Basah Kering</span></li>
              <li className="flex items-center gap-1.5">• <span>Snack Sehat Rebusan</span></li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <strong className="text-amber-900 font-bold text-xs uppercase block">Snack Berat</strong>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-center gap-1.5">• <span>Baso</span></li>
              <li className="flex items-center gap-1.5">• <span>Sate Padang</span></li>
              <li className="flex items-center gap-1.5">• <span>Soto</span></li>
              <li className="flex items-center gap-1.5">• <span>Siomay / Batagor</span></li>
              <li className="flex items-center gap-1.5">• <span>Nasi Uduk</span></li>
              <li className="flex items-center gap-1.5">• <span>Nasi Goreng</span></li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <strong className="text-emerald-900 font-bold text-xs uppercase block">Makan Siang</strong>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-center gap-1.5">• <span>Iya (Paket Lengkap)</span></li>
              <li className="flex items-center gap-1.5">• <span>Tidak (Hanya Snack)</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Card 2.5: Manajemen Akun Pengguna & Reset Password */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Manajemen Akun Bagian (8 Akun User & 1 Admin)
              </h3>
              <p className="text-xs text-slate-500">
                Kelola hak akses, cek username, dan reset kata sandi akun bagian.
              </p>
            </div>
          </div>
          <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200">
            9 Akun Aktif
          </span>
        </div>

        <div className="space-y-2">
          {authStorage.getAllUsers().map((user) => (
            <div 
              key={user.id} 
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  user.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {user.avatarText || user.department.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{user.name}</strong>
                    {user.role === 'ADMIN' && (
                      <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                        Admin GA
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Bagian: <strong>{user.department}</strong> &bull; Username: <code className="font-mono text-indigo-700 font-bold">{user.username}</code>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                  Pass: <strong>{user.password}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newPass = window.prompt(`Masukkan kata sandi baru untuk ${user.name} (${user.username}):`, 'user123');
                    if (newPass && newPass.trim()) {
                      authStorage.resetPassword(user.id, newPass.trim());
                      alert(`Kata sandi untuk ${user.username} berhasil diubah.`);
                      window.location.reload();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Reset Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Manajemen Kontak WhatsApp Admin GA / PIC Logistik */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Kontak Notifikasi WhatsApp (Admin Si APIN & PIC Konsumsi)
              </h3>
              <p className="text-xs text-slate-500">
                Daftar nomor WhatsApp Admin GA yang dapat menerima penerusan reservasi baru atau mengupdate status ke pemesan.
              </p>
            </div>
          </div>

          {contactSavedSuccess && (
            <span className="text-xs text-emerald-700 bg-emerald-50 font-bold px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {contactToastMsg}
            </span>
          )}
        </div>

        {/* Existing Admin Contacts List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Daftar Admin GA / PIC Aktif ({adminContacts.length})</span>
            <span className="text-[11px] font-normal normal-case text-slate-500">
              Gunakan tanda panah untuk mengubah urutan prioritas
            </span>
          </div>
          {adminContacts.map((contact, idx) => {
            const isEditing = editingContactId === contact.id;

            if (isEditing) {
              return (
                <div
                  key={contact.id}
                  id={`edit-contact-card-${contact.id}`}
                  className="p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50/40 shadow-xs space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                      Edit Data Kontak #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white transition cursor-pointer"
                      title="Batal Edit"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nama Petugas / PIC <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editContactName}
                        onChange={(e) => setEditContactName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-900 shadow-2xs"
                        placeholder="Nama Admin / PIC"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nomor WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={editContactPhone}
                        onChange={(e) => setEditContactPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-mono font-medium text-slate-900 shadow-2xs"
                        placeholder="08123456789 atau 62812..."
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Jabatan / Bagian
                      </label>
                      <input
                        type="text"
                        value={editContactRole}
                        onChange={(e) => setEditContactRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 shadow-2xs"
                        placeholder="Contoh: PIC Ruang Rapat"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(contact.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={contact.id}
                id={`contact-item-${contact.id}`}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-3 flex-wrap transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Reorder Buttons & Number Badge */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveContact(idx, 'up')}
                        className={`p-1 rounded border transition-colors ${
                          idx === 0
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
                            : 'text-slate-600 border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 cursor-pointer shadow-2xs'
                        }`}
                        title="Geser Naik (Prioritas Lebih Tinggi)"
                        aria-label="Geser Naik"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === adminContacts.length - 1}
                        onClick={() => handleMoveContact(idx, 'down')}
                        className={`p-1 rounded border transition-colors ${
                          idx === adminContacts.length - 1
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
                            : 'text-slate-600 border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 cursor-pointer shadow-2xs'
                        }`}
                        title="Geser Turun (Prioritas Lebih Rendah)"
                        aria-label="Geser Turun"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {idx + 1}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900 block">{contact.name}</strong>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                          Utama / Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-slate-600 font-medium">{contact.role}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        {contact.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(contact)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Edit Kontak Tanpa Hapus"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestWhatsApp(contact.phone, contact.name)}
                    className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Kirim Tes Chat"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Tes WA</span>
                  </button>

                  {adminContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Kontak"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Admin GA Contact Form */}
        <form onSubmit={handleAddContact} className="pt-3 border-t border-slate-100 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tambah Nomor Admin GA Baru</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nama Petugas / PIC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Contoh: Admin GA Teluk Sirih"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Jabatan / Bagian
              </label>
              <input
                type="text"
                value={newContactRole}
                onChange={(e) => setNewContactRole(e.target.value)}
                placeholder="Contoh: PIC Konsumsi Rapat"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="081234567890"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Card 4: Pemeliharaan Data Simulasi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Reset & Muat Data Simulasi
            </h3>
            <p className="text-xs text-slate-500">
              Kembalikan ke data default contoh perusahaan untuk keperluan audit dan demonstrasi.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Tombol ini akan mereset penyimpanan lokal ke sampel rapat resmi (Meeting Finance, Meeting HR, IT Townhall, Kickoff Marketing, dll.) lengkap dengan data rekap konsumsi harian hari ini 20 Agustus 2026.
        </p>

        <button
          type="button"
          id="btn-reset-demo-data"
          onClick={handleResetData}
          className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset ke Data Demo Awal</span>
        </button>
      </div>
    </div>
  );
};
