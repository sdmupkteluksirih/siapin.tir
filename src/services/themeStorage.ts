export type BackgroundStyle = 'panorama' | 'banner' | 'gradient' | 'minimal';
export type OverlayTone = 'dark' | 'slate' | 'indigo' | 'light';

export interface BackgroundSettings {
  style: BackgroundStyle;
  opacity: number; // 10 to 90
  blur: number; // 0 to 12 (px)
  overlayTone: OverlayTone;
  showHeroBanner: boolean;
}

const STORAGE_KEY = 'pln_teluk_sirih_bg_settings_v3';

const DEFAULT_SETTINGS: BackgroundSettings = {
  style: 'panorama',
  opacity: 75,
  blur: 0,
  overlayTone: 'slate',
  showHeroBanner: true,
};

type Listener = (settings: BackgroundSettings) => void;

class ThemeStorage {
  private listeners: Listener[] = [];

  public getSettings(): BackgroundSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: Partial<BackgroundSettings>): BackgroundSettings {
    const current = this.getSettings();
    const updated: BackgroundSettings = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save bg settings', e);
    }
    this.notify(updated);
    return updated;
  }

  public resetToDefault(): BackgroundSettings {
    return this.saveSettings(DEFAULT_SETTINGS);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(settings: BackgroundSettings) {
    this.listeners.forEach((l) => l(settings));
  }
}

export const themeStorage = new ThemeStorage();
