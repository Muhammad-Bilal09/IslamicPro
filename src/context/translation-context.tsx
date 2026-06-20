import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TranslationContextType {
  translationLang: 'ur' | 'en';
  toggleTranslation: () => Promise<void>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [translationLang, setTranslationLang] = useState<'ur' | 'en'>('ur');

  useEffect(() => {
    const loadLang = async () => {
      try {
        const stored = await AsyncStorage.getItem('quran_translation_lang');
        if (stored === 'ur' || stored === 'en') {
          setTranslationLang(stored);
        }
      } catch (err) {
        console.error('Failed to load translation lang:', err);
      }
    };
    loadLang();
  }, []);

  const toggleTranslation = async () => {
    const nextLang = translationLang === 'ur' ? 'en' : 'ur';
    setTranslationLang(nextLang);
    try {
      await AsyncStorage.setItem('quran_translation_lang', nextLang);
    } catch (err) {
      console.error('Failed to save translation lang:', err);
    }
  };

  return (
    <TranslationContext.Provider value={{ translationLang, toggleTranslation }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
