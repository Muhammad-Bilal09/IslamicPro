import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type ArabicFontOption = 'Amiri-Regular' | 'DigitalKhattIndoPak' | 'ScheherazadeNew-Regular';

export const ARABIC_FONTS: Record<ArabicFontOption, string> = {
  'Amiri-Regular': 'Amiri (Standard Naskh)',
  'DigitalKhattIndoPak': 'Digital Khatt (Indo-Pak)',
  'ScheherazadeNew-Regular': 'Scheherazade (Classic)',
};

export const DEFAULT_ARABIC_FONT: ArabicFontOption = 'DigitalKhattIndoPak';

let currentFont: ArabicFontOption = DEFAULT_ARABIC_FONT;
const listeners = new Set<(font: ArabicFontOption) => void>();

export async function getStoredArabicFont(): Promise<ArabicFontOption> {
  try {
    const saved = await AsyncStorage.getItem('quran_arabic_font');
    if (saved && (saved === 'Amiri-Regular' || saved === 'DigitalKhattIndoPak' || saved === 'ScheherazadeNew-Regular')) {
      currentFont = saved as ArabicFontOption;
      return currentFont;
    }
  } catch (_) {}
  currentFont = DEFAULT_ARABIC_FONT;
  return DEFAULT_ARABIC_FONT;
}

export async function setStoredArabicFont(font: ArabicFontOption): Promise<void> {
  currentFont = font;
  try {
    await AsyncStorage.setItem('quran_arabic_font', font);
  } catch (_) {}
  listeners.forEach(fn => fn(font));
}

export function getCurrentArabicFont(): ArabicFontOption {
  return currentFont;
}

export function useArabicFont(): ArabicFontOption {
  const [font, setFont] = useState<ArabicFontOption>(currentFont);

  useEffect(() => {
    listeners.add(setFont);
    getStoredArabicFont().then((storedFont) => {
      setFont(storedFont);
    });
    return () => {
      listeners.delete(setFont);
    };
  }, []);

  return font;
}
