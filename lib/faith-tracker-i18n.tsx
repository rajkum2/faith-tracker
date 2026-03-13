'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────

export type FaithTrackerLocale = 'en' | 'hi' | 'kn' | 'te';

export const LOCALE_LABELS: Record<FaithTrackerLocale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  te: 'తెలుగు',
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type TranslationData = Record<string, any>;

interface I18nContextType {
  locale: FaithTrackerLocale;
  setLocale: (locale: FaithTrackerLocale) => void;
  t: (key: string, fallback?: string) => string;
  translations: TranslationData;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────

const translationCache: Record<string, TranslationData> = {};

export function FaithTrackerI18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<FaithTrackerLocale>('en');
  const [translations, setTranslations] = useState<TranslationData>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = useCallback(async (lang: FaithTrackerLocale) => {
    if (translationCache[lang]) {
      setTranslations(translationCache[lang]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/data/faith-tracker/locales/${lang}.json`);
      const data = await res.json();
      translationCache[lang] = data;
      setTranslations(data);
    } catch {
      // Fallback to English
      if (lang !== 'en' && translationCache['en']) {
        setTranslations(translationCache['en']);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = typeof window !== 'undefined' ? localStorage.getItem('faith-tracker-locale') : null;
    if (saved && ['en', 'hi', 'kn', 'te'].includes(saved)) {
      setLocaleState(saved as FaithTrackerLocale);
      loadTranslations(saved as FaithTrackerLocale);
    } else {
      loadTranslations('en');
    }
  }, [loadTranslations]);

  const setLocale = useCallback((newLocale: FaithTrackerLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('faith-tracker-locale', newLocale);
    }
    loadTranslations(newLocale);
  }, [loadTranslations]);

  // Dot-notation key resolver: t("listing.price") → translations.listing.price
  const t = useCallback((key: string, fallback?: string): string => {
    const parts = key.split('.');
    let value: any = translations;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return fallback || key;
      }
    }
    return typeof value === 'string' ? value : (fallback || key);
  }, [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, translations, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return a pass-through when used outside provider (non-Faith Tracker pages)
    return {
      locale: 'en' as FaithTrackerLocale,
      setLocale: () => {},
      t: (key: string, fallback?: string) => fallback || key,
      translations: {} as TranslationData,
      isLoading: false,
    };
  }
  return context;
}
