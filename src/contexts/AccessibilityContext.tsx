import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ContrastMode = 'default' | 'high' | 'low';

interface AccessibilitySettings {
  fontSize: FontSize;
  contrastMode: ContrastMode;
  captionsEnabled: boolean;
  reduceMotion: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setCaptionsEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  contrastMode: 'default',
  captionsEnabled: false,
  reduceMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'sai-accessibility-settings';

// Font size scale mapping
const fontSizeScale: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Apply settings to document
  useEffect(() => {
    // Font size
    document.documentElement.style.fontSize = fontSizeScale[settings.fontSize];
    
    // Contrast mode
    document.documentElement.classList.remove('contrast-high', 'contrast-low');
    if (settings.contrastMode === 'high') {
      document.documentElement.classList.add('contrast-high');
    } else if (settings.contrastMode === 'low') {
      document.documentElement.classList.add('contrast-low');
    }

    // Reduce motion
    if (settings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [settings]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setFontSize = (fontSize: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const setContrastMode = (contrastMode: ContrastMode) => {
    setSettings(prev => ({ ...prev, contrastMode }));
  };

  const setCaptionsEnabled = (captionsEnabled: boolean) => {
    setSettings(prev => ({ ...prev, captionsEnabled }));
  };

  const setReduceMotion = (reduceMotion: boolean) => {
    setSettings(prev => ({ ...prev, reduceMotion }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        setFontSize,
        setContrastMode,
        setCaptionsEnabled,
        setReduceMotion,
        resetToDefaults,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
