import { DailyAyah } from '@/screens/home/UseHome';
import { Surah, UnifiedAyah } from '@/types/type';
import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializingPromise: Promise<void> | null = null;
let surahListCache: Surah[] | null = null;
const surahAyahsCache: Map<string, UnifiedAyah[]> = new Map();

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('quran.db');
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  if (!isInitializingPromise) {
    isInitializingPromise = (async () => {
      const db = await getDatabase();

      try {
        const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
        const dbVersion = versionRow?.user_version || 0;
        const CURRENT_DB_VERSION = 606;

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS surahs (
            number INTEGER PRIMARY KEY,
            name TEXT,
            englishName TEXT,
            englishNameTranslation TEXT,
            revelationType TEXT,
            numberOfAyahs INTEGER
          );
          CREATE TABLE IF NOT EXISTS ayahs (
            number INTEGER PRIMARY KEY,
            surahNumber INTEGER,
            numberInSurah INTEGER,
            juzNumber INTEGER,
            pageNumber INTEGER,
            text TEXT,
            translationEn TEXT,
            translationUr TEXT,
            audio TEXT
          );
        `);

        const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM ayahs');
        const count = countResult?.count || 0;
        const needsReseed = count < 6236 || dbVersion < CURRENT_DB_VERSION;

        if (needsReseed) {
          console.log(`[quranDb] Seeding database (v${dbVersion} -> v${CURRENT_DB_VERSION}, count: ${count})...`);
          const quranData = require('../../assets/quran.json');

          await db.execAsync('DROP TABLE IF EXISTS surahs; DROP TABLE IF EXISTS ayahs;');
          await db.execAsync(`
            CREATE TABLE surahs (
              number INTEGER PRIMARY KEY,
              name TEXT,
              englishName TEXT,
              englishNameTranslation TEXT,
              revelationType TEXT,
              numberOfAyahs INTEGER
            );
            CREATE TABLE ayahs (
              number INTEGER PRIMARY KEY,
              surahNumber INTEGER,
              numberInSurah INTEGER,
              juzNumber INTEGER,
              pageNumber INTEGER,
              text TEXT,
              translationEn TEXT,
              translationUr TEXT,
              audio TEXT
            );
          `);

          await db.withTransactionAsync(async () => {
            for (const surah of quranData.surahs) {
              await db.runAsync(
                `INSERT INTO surahs (number, name, englishName, englishNameTranslation, revelationType, numberOfAyahs)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  surah.number,
                  surah.name,
                  surah.englishName,
                  surah.englishNameTranslation,
                  surah.revelationType,
                  surah.numberOfAyahs,
                ]
              );
            }

            for (const ayah of quranData.ayahs) {
              const cleanText = sanitizeArabicText(ayah.text);
              await db.runAsync(
                `INSERT INTO ayahs (number, surahNumber, numberInSurah, juzNumber, pageNumber, text, translationEn, translationUr, audio)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  ayah.number,
                  ayah.surahNumber,
                  ayah.numberInSurah,
                  ayah.juzNumber,
                  ayah.pageNumber,
                  cleanText,
                  ayah.translationEn,
                  ayah.translationUr,
                  ayah.audio,
                ]
              );
            }
          });

          await db.execAsync(`PRAGMA user_version = ${CURRENT_DB_VERSION};`);
          console.log(`[quranDb] Database seeding completed successfully for DB Version ${CURRENT_DB_VERSION}!`);
        }
      } catch (err) {
        console.error('[quranDb] Error in initDatabase:', err);
      }
    })();
  }
  return isInitializingPromise;
}

export async function checkIfQuranDownloaded(): Promise<boolean> {
  return true;
}

export async function downloadQuran(
  onProgress?: (status: string, progress: number) => void
): Promise<void> {
  if (onProgress) onProgress('Quran data is bundled locally.', 1.0);
}

export async function getSurahList(): Promise<Surah[]> {
  if (surahListCache && surahListCache.length === 114) {
    return surahListCache;
  }
  try {
    await initDatabase();
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      numberOfAyahs: number;
    }>('SELECT number, name, englishName, englishNameTranslation, numberOfAyahs FROM surahs ORDER BY number');

    if (rows && rows.length === 114) {
      surahListCache = rows.map((row) => ({
        number: row.number,
        englishName: row.englishName,
        arabicName: row.name,
        ayahCount: row.numberOfAyahs,
        englishNameTranslation: row.englishNameTranslation,
      }));
      return surahListCache;
    }
  } catch (_) { }

  try {
    const quranData = require('../../assets/quran.json');
    surahListCache = quranData.surahs.map((surah: any) => ({
      number: surah.number,
      englishName: surah.englishName,
      arabicName: surah.name,
      ayahCount: surah.numberOfAyahs,
      englishNameTranslation: surah.englishNameTranslation,
    }));
    return surahListCache || [];
  } catch (_) {
    return [];
  }
}

export function getUthmaniQuranText(v: any): string {
  if (!v) return '';
  const raw = typeof v === 'string' ? v : (v.text_indopak || v.text_qpc_hafs || v.text_uthmani || v.text_imlaei || '');
  if (!raw) return '';
  return raw
    .replace(/[\uE000-\uF8FF\uFFF0-\uFFFF\u2002\u2003\u200B\u200F\u0614]/g, '')
    .replace(/\u06E1/g, '\u0652')
    .replace(/\u06E4/g, '\u0653')
    .replace(/[\s\u00A0]*[\u0660-\u0669\u06F0-\u06F9]+$/g, '')
    .trim();
}

export function sanitizeArabicText(text: any): string {
  const raw = getUthmaniQuranText(text);
  if (!raw) return '';
  return raw
    .replace(/[\uE000-\uF8FF\uFFF0-\uFFFF\u2002\u2003\u200B\u200F\u0614]/g, '')
    .replace(/\u06E1/g, '\u0652')
    .replace(/\u06E4/g, '\u0653')
    .trim();
}

export async function getSurahAyahs(
  surahNumber: number,
  translationLang: 'en' | 'ur'
): Promise<UnifiedAyah[]> {
  const cacheKey = `${surahNumber}_${translationLang}`;
  if (surahAyahsCache.has(cacheKey)) {
    return surahAyahsCache.get(cacheKey)!;
  }

  try {
    await initDatabase();
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      number: number;
      numberInSurah: number;
      text: string;
      audio: string;
      juzNumber: number;
      pageNumber: number;
      translationEn: string;
      translationUr: string;
      surahNumber: number;
      surahArabicName: string;
      surahEnglishName: string;
      surahEnglishNameTranslation: string;
      surahRevelationType: string;
      surahNumberOfAyahs: number;
    }>(
      `SELECT 
         a.number, 
         a.numberInSurah, 
         a.text, 
         a.audio, 
         a.juzNumber,
         a.pageNumber,
         a.translationEn,
         a.translationUr,
         s.number AS surahNumber, 
         s.name AS surahArabicName, 
         s.englishName AS surahEnglishName, 
         s.englishNameTranslation AS surahEnglishNameTranslation, 
         s.revelationType AS surahRevelationType, 
         s.numberOfAyahs AS surahNumberOfAyahs
       FROM ayahs a
       INNER JOIN surahs s ON a.surahNumber = s.number
       WHERE a.surahNumber = ?
       ORDER BY a.numberInSurah`,
      [surahNumber]
    );

    if (rows && rows.length > 0) {
      console.log(`[QURAN SOURCE] Served Surah ${surahNumber} INSTANTLY from local SQLite database (${rows.length} ayahs)!`);
      const res = rows.map((row) => ({
        number: row.number,
        numberInSurah: row.numberInSurah,
        text: sanitizeArabicText(row.text),
        translation: translationLang === 'ur' ? row.translationUr : row.translationEn,
        audio: row.audio,
        surah: {
          number: row.surahNumber,
          name: row.surahArabicName,
          englishName: row.surahEnglishName,
          englishNameTranslation: row.surahEnglishNameTranslation,
          revelationType: row.surahRevelationType,
          numberOfAyahs: row.surahNumberOfAyahs,
        },
      }));
      surahAyahsCache.set(cacheKey, res);
      return res;
    }
  } catch (dbErr) {
    console.warn('[QURAN DB] Local SQLite fetch notice:', dbErr);
  }

  try {
    console.log(`[QURAN SOURCE] Serving Surah ${surahNumber} instantly from bundled offline quran.json asset...`);
    const quranData = require('../../assets/quran.json');
    const surahMeta = quranData.surahs.find((s: any) => s.number === surahNumber);
    const surahAyahs = quranData.ayahs.filter((a: any) => a.surahNumber === surahNumber);

    if (surahMeta && surahAyahs.length > 0) {
      const res = surahAyahs.map((a: any) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: sanitizeArabicText(a.text),
        translation: translationLang === 'ur' ? a.translationUr : a.translationEn,
        audio: a.audio || `https://audio.qurancdn.com/Alafasy/mp3/${String(surahNumber).padStart(3, '0')}${String(a.numberInSurah).padStart(3, '0')}.mp3`,
        surah: {
          number: surahMeta.number,
          name: surahMeta.name,
          englishName: surahMeta.englishName,
          englishNameTranslation: surahMeta.englishNameTranslation,
          revelationType: surahMeta.revelationType,
          numberOfAyahs: surahMeta.numberOfAyahs,
        },
      }));
      surahAyahsCache.set(cacheKey, res);
      return res;
    }
  } catch (assetErr) {
    console.error('[QURAN ASSET] Asset fallback error:', assetErr);
  }

  return [];
}

export async function getJuzAyahs(
  juzId: number,
  translationLang: 'en' | 'ur'
): Promise<UnifiedAyah[]> {
  try {
    await initDatabase();
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
      number: number;
      numberInSurah: number;
      text: string;
      audio: string;
      juzNumber: number;
      pageNumber: number;
      translationEn: string;
      translationUr: string;
      surahNumber: number;
      surahArabicName: string;
      surahEnglishName: string;
      surahEnglishNameTranslation: string;
      surahRevelationType: string;
      surahNumberOfAyahs: number;
    }>(
      `SELECT 
         a.number, 
         a.numberInSurah, 
         a.text, 
         a.audio, 
         a.juzNumber,
         a.pageNumber,
         a.translationEn,
         a.translationUr,
         s.number AS surahNumber, 
         s.name AS surahArabicName, 
         s.englishName AS surahEnglishName, 
         s.englishNameTranslation AS surahEnglishNameTranslation, 
         s.revelationType AS surahRevelationType, 
         s.numberOfAyahs AS surahNumberOfAyahs
       FROM ayahs a
       INNER JOIN surahs s ON a.surahNumber = s.number
       WHERE a.juzNumber = ?
       ORDER BY a.number`,
      [juzId]
    );

    if (rows && rows.length > 0) {
      console.log(`[QURAN SOURCE] Served Juz ${juzId} INSTANTLY from local SQLite database (${rows.length} ayahs)!`);
      return rows.map((row) => ({
        number: row.number,
        numberInSurah: row.numberInSurah,
        text: sanitizeArabicText(row.text),
        translation: translationLang === 'ur' ? row.translationUr : row.translationEn,
        audio: row.audio,
        surah: {
          number: row.surahNumber,
          name: row.surahArabicName,
          englishName: row.surahEnglishName,
          englishNameTranslation: row.surahEnglishNameTranslation,
          revelationType: row.surahRevelationType,
          numberOfAyahs: row.surahNumberOfAyahs,
        },
      }));
    }
  } catch (dbErr) {
    console.warn('[QURAN DB] Local SQLite Juz fetch notice:', dbErr);
  }

  try {
    console.log(`[QURAN SOURCE] Serving Juz ${juzId} instantly from bundled offline quran.json asset...`);
    const quranData = require('../../assets/quran.json');
    const surahMap = new Map<number, any>();
    quranData.surahs.forEach((s: any) => surahMap.set(s.number, s));

    const juzAyahs = quranData.ayahs.filter((a: any) => a.juzNumber === juzId);

    if (juzAyahs.length > 0) {
      return juzAyahs.map((a: any) => {
        const sMeta = surahMap.get(a.surahNumber) || {
          number: a.surahNumber,
          name: `Surah ${a.surahNumber}`,
          englishName: `Surah ${a.surahNumber}`,
          englishNameTranslation: `Surah ${a.surahNumber}`,
          revelationType: 'Meccan',
          numberOfAyahs: 100,
        };

        return {
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: sanitizeArabicText(a.text),
          translation: translationLang === 'ur' ? a.translationUr : a.translationEn,
          audio: a.audio || `https://audio.qurancdn.com/Alafasy/mp3/${String(a.surahNumber).padStart(3, '0')}${String(a.numberInSurah).padStart(3, '0')}.mp3`,
          surah: {
            number: sMeta.number,
            name: sMeta.name,
            englishName: sMeta.englishName,
            englishNameTranslation: sMeta.englishNameTranslation,
            revelationType: sMeta.revelationType,
            numberOfAyahs: sMeta.numberOfAyahs,
          },
        };
      });
    }
  } catch (assetErr) {
    console.error('[QURAN ASSET] Juz asset fallback error:', assetErr);
  }

  return [];
}

export async function getRandomAyah(translationLang: 'en' | 'ur'): Promise<DailyAyah> {
  try {
    await initDatabase();
    const db = await getDatabase();

    const randomIdx = Math.floor(Math.random() * 6236) + 1;
    const row = await db.getFirstAsync<{
      number: number;
      numberInSurah: number;
      text: string;
      translationEn: string;
      translationUr: string;
      englishName: string;
      surahNumber: number;
    }>(
      `SELECT 
         a.number, 
         a.numberInSurah, 
         a.text, 
         a.translationEn,
         a.translationUr,
         s.englishName,
         s.number AS surahNumber
       FROM ayahs a
       INNER JOIN surahs s ON a.surahNumber = s.number
       WHERE a.number = ?`,
      [randomIdx]
    );

    if (row) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return {
        text: sanitizeArabicText(row.text),
        translation: translationLang === 'ur' ? row.translationUr : row.translationEn,
        surahName: row.englishName,
        surahNumber: row.surahNumber,
        numberInSurah: row.numberInSurah,
        date: todayStr,
        lang: translationLang,
      };
    }
  } catch (_) { }

  const quranData = require('../../assets/quran.json');
  const randomIdx = Math.floor(Math.random() * quranData.ayahs.length);
  const randomAyah = quranData.ayahs[randomIdx];
  const surahMeta = quranData.surahs.find((s: any) => s.number === randomAyah.surahNumber);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return {
    text: sanitizeArabicText(randomAyah.text),
    translation: translationLang === 'ur' ? randomAyah.translationUr : randomAyah.translationEn,
    surahName: surahMeta?.englishName || 'Al-Fatiha',
    surahNumber: randomAyah.surahNumber,
    numberInSurah: randomAyah.numberInSurah,
    date: todayStr,
    lang: translationLang,
  };
}
