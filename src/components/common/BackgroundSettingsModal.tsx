import React, { useState, useEffect } from 'react';
import { themeStorage, BackgroundSettings, BackgroundStyle, OverlayTone } from '../../services/themeStorage';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Image as ImageIcon, 
  Eye, 
  RotateCcw, 
  Check, 
  Layers, 
  SunMedium, 
  Moon, 
  Compass,
  Monitor
} from 'lucide-react';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<BackgroundSettings>(() => themeStorage.getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(themeStorage.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = <K extends keyof BackgroundSettings>(key: K, value: BackgroundSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    themeStorage.saveSettings(updated);
  };

  const handleReset = () => {
    const def = themeStorage.resetToDefault();
    setSettings(def);
  };

  const styles: { id: BackgroundStyle; title: string; desc: string; icon: React.ElementType }[] = [
    {
      id: 'panorama',
      title: 'Panorama Penuh Teluk Sirih',
      desc: 'Foto udara lanskap PLTU Teluk Sirih sebagai latar belakang dinamis di seluruh halaman.',
      icon: ImageIcon
    },
    {
      id: 'banner',
      title: 'Hero Banner Atas Saja',
      desc: 'Menampilkan foto megah PLTU Teluk Sirih sebagai header sambutan dengan latar konten bersih.',
      icon: Layers
    },
    {
      id: 'gradient',
      title: 'Ocean & Energy Gradient',
      desc: 'Gradasi modern biru laut & emerald terinspirasi dari kawasan pesisir Teluk Sirih.',
      icon: Sparkles
    },
    {
      id: 'minimal',
      title: 'Corporate Clean Light',
      desc: 'Tampilan minimalis klasik profesional dengan latar abu-abu netral.',
      icon: Monitor
    }
  ];

  const tones: { id: OverlayTone; name: string; classColor: string }[] = [
    { id: 'slate', name: 'Slate Cool (Default)', classColor: 'bg-slate-900' },
    { id: 'dark', name: 'Deep Midnight', classColor: 'bg-black' },
    { id: 'indigo', name: 'Ocean Indigo', classColor: 'bg-indigo-950' },
    { id: 'light', name: 'Frosted Glass Light', classColor: 'bg-white' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Pengaturan Background & Tampilan</h3>
              <p className="text-xs text-slate-300">Kustomisasi visual lanskap PLTU Teluk Sirih</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Photo Live Thumbnail */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-32 bg-slate-900 flex items-end p-4 group">
            <img 
              src="/bg-teluk-sirih.jpg" 
              alt="PLTU Teluk Sirih" 
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <div className="relative z-10 text-white flex items-center justify-between w-full">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/80 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                  Foto Resmi Terpasang
                </span>
                <h4 className="text-sm font-black drop-shadow-sm">PLTU Teluk Sirih (2x112 MW)</h4>
                <p className="text-[11px] text-slate-200 drop-shadow-xs">Teluk Kabung Tengah, Kota Padang, Sumatera Barat</p>
              </div>

              <span className="text-xs bg-white/20 backdrop-blur-md border border-white/30 text-white px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>HD Aerial 4K</span>
              </span>
            </div>
          </div>

          {/* Opacity / Transparansi Control (Primary Focus) */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  <SunMedium className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Tingkat Transparansi / Opasitas Foto Latar
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Atur seberapa jelas foto asli PLTU Teluk Sirih tampak di layar
                  </p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-xl font-mono">
                {settings.opacity}%
              </span>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={settings.opacity}
              onChange={(e) => handleChange('opacity', Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { val: 15, label: '15% Tipis' },
                { val: 30, label: '30% Soft' },
                { val: 50, label: '50% Sedang' },
                { val: 75, label: '75% Jelas' },
                { val: 100, label: '100% Asli' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handleChange('opacity', p.val)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                    settings.opacity === p.val
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Style Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Gaya Tampilan Background
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {styles.map((item) => {
                const Icon = item.icon;
                const isSelected = settings.style === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleChange('style', item.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conditional Blur & Tone Controls */}
          {(settings.style === 'panorama' || settings.style === 'banner') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Blur Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span>Efek Kelembutan / Blur Latar:</span>
                  </span>
                  <span className="text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md font-mono">
                    {settings.blur}px {settings.blur === 0 ? '(Foto Tajam Asli)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={settings.blur}
                  onChange={(e) => handleChange('blur', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0px (Foto Asli Tajam)</span>
                  <span>3px (Halus)</span>
                  <span>10px (Frosted Glass)</span>
                </div>
              </div>

              {/* Tone selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Nuansa Warna Latar Belakang
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleChange('overlayTone', t.id)}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                        settings.overlayTone === t.id
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${t.classColor} border border-slate-300 shrink-0`} />
                      <span className="truncate text-[11px]">{t.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Toggle Hero Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">
                Tampilkan Hero Banner Sambutan di Atas Form
              </span>
              <span className="text-[11px] text-slate-500 block">
                Menyajikan informasi identitas unit & kapasitas PLTU Teluk Sirih.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showHeroBanner}
                onChange={(e) => handleChange('showHeroBanner', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
