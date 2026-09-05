import React, { useEffect } from 'react';
import { BookingFormData, SnackRingan, SnackBerat, MakanSiang } from '../../types';
import { isEligibleForMakanSiang, formatDuration, calculateEndTime, formatDateIndo } from '../../utils/timeUtils';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Cookie, 
  Utensils, 
  Soup, 
  Flame, 
  HeartPulse, 
  Ban, 
  Lock, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Users,
  Minus,
  Plus,
  FileText,
  ChefHat,
  UtensilsCrossed
} from 'lucide-react';

interface Step2KonsumsiProps {
  formData: BookingFormData;
  onChange: (field: keyof BookingFormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface SnackRinganOption {
  value: SnackRingan;
  title: string;
  description: string;
  badge: string;
  icon: React.ElementType;
}

interface SnackBeratOption {
  value: SnackBerat;
  title: string;
  description: string;
  badge: string;
  icon: React.ElementType;
}

interface MakanSiangOption {
  value: MakanSiang;
  title: string;
  description: string;
  badge: string;
}

const SNACK_RINGAN_OPTIONS: SnackRinganOption[] = [
  {
    value: 'Snack Mix Basah Kering',
    title: 'Snack Mix Basah Kering',
    description: 'Kombinasi kue basah tradisional (lemper, risoles/pastel) & kue kering gurih manis renyah.',
    badge: 'Populer & Favorit',
    icon: Cookie
  },
  {
    value: 'Snack Sehat Rebusan',
    title: 'Snack Sehat Rebusan',
    description: 'Pilihan sehat aneka rebusan: jagung manis, ubi madu, pisang rebus, dan kacang tanah.',
    badge: 'Pilihan Sehat',
    icon: HeartPulse
  }
];

const SNACK_BERAT_OPTIONS: SnackBeratOption[] = [
  {
    value: 'Baso',
    title: 'Baso Daging Sapi',
    description: 'Baso daging sapi kuah kaldu hangat lengkap dengan mie, bihun, tahu, dan pangsit goreng.',
    badge: 'Kuah Kaldu Gurih',
    icon: Soup
  },
  {
    value: 'Sate Padang',
    title: 'Sate Padang',
    description: 'Sate daging dan lidah sapi pilihan dengan siraman kuah kental kuning gurih pedas khas Padang & ketupat.',
    badge: 'Khas Minang Gurih',
    icon: Flame
  },
  {
    value: 'Soto',
    title: 'Soto Ayam Rempah',
    description: 'Soto ayam kuah bening aromatik kaya rempah, disajikan hangat dengan suwiran ayam & koya.',
    badge: 'Segar Berempah',
    icon: Utensils
  },
  {
    value: 'Siomay / Batagor',
    title: 'Siomay / Batagor',
    description: 'Kombinasi siomay kukus & batagor ikan tenggiri renyah dengan siraman bumbu kacang kental & perasan jeruk limau.',
    badge: 'Bumbu Kacang Gurih',
    icon: UtensilsCrossed
  },
  {
    value: 'Nasi Uduk',
    title: 'Nasi Uduk Komplit',
    description: 'Nasi uduk gurih harum santan disajikan komplit dengan tempe orek, bihun goreng, irisan telur dadar, & sambal.',
    badge: 'Nasi Gurih Komplit',
    icon: ChefHat
  },
  {
    value: 'Nasi Goreng',
    title: 'Nasi Goreng Spesial',
    description: 'Nasi goreng bumbu spesial disajikan dengan telur mata sapi, suwiran ayam, kerupuk, & acar segar.',
    badge: 'Menu Favorit',
    icon: Sparkles
  }
];

const MAKAN_SIANG_OPTIONS: MakanSiangOption[] = [
  {
    value: 'Iya',
    title: 'Iya, Perlu Makan Siang',
    description: 'Sediakan paket buffet / box makan siang lengkap untuk seluruh peserta meeting.',
    badge: 'Makan Siang Disiapkan'
  },
  {
    value: 'Tidak',
    title: 'Tidak Perlu Makan Siang',
    description: 'Hanya konsumsi snack saja tanpa tambahan menu makan siang utama.',
    badge: 'Tanpa Makan Siang'
  }
];

export const Step2Konsumsi: React.FC<Step2KonsumsiProps> = ({
  formData,
  onChange,
  onNext,
  onBack
}) => {
  const isSnackRinganSelected = formData.snackRingan !== 'Tidak Ada' && Boolean(formData.snackRingan);
  const isSnackBeratSelected = formData.snackBerat !== 'Tidak Ada' && Boolean(formData.snackBerat);

  // Evaluate Makan Siang Eligibility:
  // Auto-active if meeting >= 4 hours OR reaches 12:00 WIB
  const lunchEligibility = isEligibleForMakanSiang(formData.startTime, formData.durationHours);

  // Auto-adjust makan siang if criteria not met
  useEffect(() => {
    if (!lunchEligibility.isEligible && formData.makanSiang === 'Iya') {
      onChange('makanSiang', 'Tidak');
    }
  }, [lunchEligibility.isEligible, formData.makanSiang, onChange]);

  // Handlers enforcing mutual exclusivity:
  // If Snack Ringan is chosen -> Snack Berat is automatically set to 'Tidak Ada'
  const handleSelectSnackRingan = (value: SnackRingan) => {
    if (formData.snackRingan === value) {
      onChange('snackRingan', 'Tidak Ada');
    } else {
      onChange('snackRingan', value);
      onChange('snackBerat', 'Tidak Ada');
    }
  };

  // If Snack Berat is chosen -> only allowed if Snack Ringan is 'Tidak Ada', or switches directly
  const handleSelectSnackBerat = (value: SnackBerat) => {
    if (formData.snackBerat === value) {
      onChange('snackBerat', 'Tidak Ada');
    } else {
      onChange('snackRingan', 'Tidak Ada');
      onChange('snackBerat', value);
    }
  };

  const handleClearSnackRingan = () => {
    onChange('snackRingan', 'Tidak Ada');
  };

  const handleClearSnackBerat = () => {
    onChange('snackBerat', 'Tidak Ada');
  };

  const handleQuickParticipant = (val: number) => {
    onChange('participantCount', Math.max(1, Math.min(200, val)));
  };

  // Validation: participantCount > 0, snacks and makanSiang defined
  const isComplete = 
    Boolean(formData.participantCount > 0) &&
    Boolean(formData.snackRingan) && 
    Boolean(formData.snackBerat) && 
    Boolean(formData.makanSiang);

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full">
      {/* Notice Banner explaining the mutual exclusivity rule & current schedule */}
      <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs w-full max-w-full">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm text-indigo-950 space-y-1 min-w-0">
          <strong className="font-bold text-indigo-900 block">
            Jadwal Rapat: {formatDateIndo(formData.meetingDate)} ({formData.startTime} - {calculateEndTime(formData.startTime, formData.durationHours)} WIB)
          </strong>
          <p className="text-indigo-800/90 leading-relaxed">
            1. <strong>Snack:</strong> Pemesan dapat memilih salah satu antara <strong>Snack Ringan</strong> <u>atau</u> <strong>Snack Berat</strong>.
          </p>
          <p className="text-indigo-800/90 leading-relaxed">
            2. <strong>Makan Siang:</strong> Pilihan Makan Siang otomatis aktif apabila jadwal meeting <strong>melebihi 4 jam</strong> atau <strong>berlangsung hingga/melewati pukul 12:00 WIB</strong>.
          </p>
        </div>
      </div>

      {/* SECTION 0: JUMLAH PESERTA RAPAT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 w-full max-w-full">
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Jumlah Peserta Rapat <span className="text-rose-500">*</span>
              </h3>
              <p className="text-xs text-slate-500">
                Porsi snack dan makan siang akan otomatis disiapkan sejumlah peserta ini.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
            {formData.participantCount} Porsi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickParticipant(formData.participantCount - 5)}
              className="p-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer transition shadow-2xs"
              title="Kurang 5 Orang"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={1}
              max={200}
              id="input-participant-count"
              value={formData.participantCount}
              onChange={(e) => onChange('participantCount', Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 py-3 px-4 rounded-xl text-center text-lg font-bold border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
            <button
              type="button"
              onClick={() => handleQuickParticipant(formData.participantCount + 5)}
              className="p-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer transition shadow-2xs"
              title="Tambah 5 Orang"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-600 pl-1">Orang</span>
          </div>

          {/* Quick Presets */}
          <div className="sm:col-span-6 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-semibold mr-1">Preset:</span>
            {[10, 15, 20, 25, 30, 40, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickParticipant(num)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  formData.participantCount === num
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category 1: SNACK RINGAN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Kategori 1
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>SNACK RINGAN</span>
              <span className="text-xs font-normal text-slate-500">(Kue & Kudapan)</span>
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {isSnackRinganSelected && (
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Snack Ringan Terpilih</span>
              </span>
            )}
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cookie className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Pilih salah satu menu kue di bawah ini, atau pilih "Tidak Pesan Snack Ringan" untuk mengaktifkan pilihan Snack Berat.
        </p>

        {/* 2 Main Snack Ringan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-3.5 w-full">
          {SNACK_RINGAN_OPTIONS.map((item) => {
            const isSelected = formData.snackRingan === item.value;
            const Icon = item.icon;
            return (
              <div
                key={item.value}
                id={`card-snack-ringan-${item.value.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleSelectSnackRingan(item.value)}
                className={`relative p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between min-w-0 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-md inline-block mt-0.5 truncate ${
                          isSelected ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {/* Radio Indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold text-[10px] sm:text-[11px] ${isSelected ? 'text-indigo-700' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Terpilih' : 'Pilih menu'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formData.participantCount} kotak
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Option: Tidak Pesan Snack Ringan */}
        <div
          id="card-snack-ringan-none"
          onClick={handleClearSnackRingan}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
            formData.snackRingan === 'Tidak Ada'
              ? 'border-slate-400 bg-slate-100/80 text-slate-800'
              : 'border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
              <Ban className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold block">
                Tidak Pesan Snack Ringan
              </span>
              <span className="text-[11px] text-slate-500">
                Pilih opsi ini jika ingin memesan <strong>Snack Berat</strong> (Baso, Sate Padang, Soto, Siomay/Batagor, Nasi Uduk, Nasi Goreng).
              </span>
            </div>
          </div>

          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            formData.snackRingan === 'Tidak Ada' ? 'border-slate-600 bg-slate-600 text-white' : 'border-slate-300 bg-white'
          }`}>
            {formData.snackRingan === 'Tidak Ada' && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>
      </div>

      {/* Category 2: SNACK BERAT */}
      <div className={`bg-white rounded-2xl border shadow-xs p-4 sm:p-6 transition-all ${
        isSnackRinganSelected ? 'border-slate-200 opacity-70' : 'border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              Kategori 2
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>SNACK BERAT</span>
              <span className="text-xs font-normal text-slate-500">(Menu Hangat & Olahan)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {isSnackBeratSelected && (
              <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Snack Berat Terpilih</span>
              </span>
            )}
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Info when locked by Snack Ringan */}
        {isSnackRinganSelected ? (
          <div className="mb-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Snack Berat Terkunci:</strong> Anda sedang memilih <em>"{formData.snackRingan}"</em>.
              <br />
              Klik salah satu menu di bawah jika ingin beralih memesan Snack Berat.
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Pilih salah satu menu hidangan hangat atau olahan porsi sedang untuk peserta rapat.
          </p>
        )}

        {/* 6 Snack Berat Cards - Compact & Space Efficient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-3.5">
          {SNACK_BERAT_OPTIONS.map((item) => {
            const isSelected = formData.snackBerat === item.value;
            const Icon = item.icon;
            return (
              <div
                key={item.value}
                id={`card-snack-berat-${item.value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                onClick={() => handleSelectSnackBerat(item.value)}
                className={`relative p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${isSelected ? 'text-amber-950' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                          isSelected ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold text-[10px] sm:text-[11px] ${isSelected ? 'text-amber-800' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Terpilih' : 'Pilih menu'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formData.participantCount} porsi
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Option: Tidak Pesan Snack Berat */}
        <div
          id="card-snack-berat-none"
          onClick={handleClearSnackBerat}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
            formData.snackBerat === 'Tidak Ada'
              ? 'border-slate-400 bg-slate-100/80 text-slate-800'
              : 'border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
              <Ban className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold block">
                Tidak Pesan Snack Berat
              </span>
              <span className="text-[11px] text-slate-500">
                Pilih opsi ini jika hanya memesan <strong>Snack Ringan</strong>.
              </span>
            </div>
          </div>

          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            formData.snackBerat === 'Tidak Ada' ? 'border-slate-600 bg-slate-600 text-white' : 'border-slate-300 bg-white'
          }`}>
            {formData.snackBerat === 'Tidak Ada' && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>
      </div>

      {/* Category 3: MAKAN SIANG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              Kategori 3
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>MAKAN SIANG</span>
              <span className="text-xs font-normal text-slate-500">(Fasilitas Rapat &gt;4 Jam / Siang)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {formData.makanSiang === 'Iya' && (
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Makan Siang Disiapkan</span>
              </span>
            )}
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Dynamic Condition Status Box */}
        {lunchEligibility.isEligible ? (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-3 text-xs sm:text-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-emerald-900 font-bold block">
                ✓ Memenuhi Syarat Fasilitas Makan Siang:
              </strong>
              <p className="text-emerald-800 text-xs leading-relaxed">
                {lunchEligibility.reason}. Pilihan makan siang prasmanan / box siap dialokasikan untuk {formData.participantCount} porsi.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <strong className="text-slate-800 font-bold block">
                  Ketentuan Makan Siang Belum Terpenuhi:
                </strong>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Pilihan Makan Siang otomatis aktif jika meeting <strong>melebihi 4 jam</strong> atau <strong>berlangsung hingga pukul 12:00 WIB ke atas</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1.5 justify-center"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ubah Jadwal</span>
            </button>
          </div>
        )}

        {/* Makan Siang Options - Compact & Space Efficient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {MAKAN_SIANG_OPTIONS.map((item) => {
            const isEligible = lunchEligibility.isEligible;
            const isDisabled = !isEligible && item.value === 'Iya';
            const isSelected = formData.makanSiang === item.value;

            return (
              <div
                key={item.value}
                id={`card-makan-siang-${item.value.toLowerCase()}`}
                onClick={() => {
                  if (!isDisabled) {
                    onChange('makanSiang', item.value);
                  }
                }}
                className={`relative p-3 sm:p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  isDisabled
                    ? 'border-slate-200 bg-slate-50/80 opacity-50 cursor-not-allowed select-none'
                    : isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20 cursor-pointer select-none'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer select-none'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                          isDisabled 
                            ? 'text-slate-400' 
                            : isSelected 
                            ? 'text-emerald-950' 
                            : 'text-slate-900'
                        }`}>
                          {item.title}
                        </h4>
                        {isDisabled && (
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                        isDisabled
                          ? 'bg-slate-100 text-slate-400'
                          : isSelected 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isDisabled ? 'Terkunci (Jadwal < 4 Jam / < 12:00)' : item.badge}
                      </span>
                    </div>

                    <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isDisabled
                        ? 'border-slate-200 bg-slate-100 text-slate-300'
                        : isSelected 
                        ? 'border-emerald-600 bg-emerald-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && !isDisabled && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {isDisabled 
                      ? 'Opsi makan siang tidak dapat diajukan karena meeting selesai sebelum pukul 12:00 WIB dan durasi tidak mencapai 4 jam.' 
                      : item.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold text-[10px] sm:text-[11px] ${
                    isDisabled 
                      ? 'text-slate-400' 
                      : isSelected 
                      ? 'text-emerald-800' 
                      : 'text-slate-400'
                  }`}>
                    {isDisabled ? '❌ Tidak Memenuhi' : isSelected ? '✓ Terpilih' : 'Pilih opsi'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.value === 'Iya' ? `${formData.participantCount} porsi box/buffet` : 'Tanpa makan siang'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Catatan Khusus & Preferensi Diet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 w-full max-w-full">
        <label htmlFor="textarea-notes" className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Catatan Khusus Konsumsi / Preferensi Diet (Opsional)</span>
        </label>
        <textarea
          id="textarea-notes"
          rows={2}
          placeholder="Contoh: 2 porsi vegetarian / tanpa santan, mohon kopi panas disiapkan 15 menit sebelum rapat..."
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          className="w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 resize-none"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          id="btn-step2-back"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Jadwal & Ruangan</span>
        </button>

        <button
          type="button"
          id="btn-step2-next"
          onClick={onNext}
          disabled={!isComplete}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all ${
            isComplete
              ? 'bg-slate-900 hover:bg-indigo-600 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Lanjut ke Data Pemesan & Konfirmasi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
