import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { Surah, UnifiedAyah } from '@/types/type';
import { DailyAyah } from '@/screens/home/UseHome';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Gets or initializes the SQLite database instance.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('quran.db');
  return dbInstance;
}

/**
 * Creates the database schema if tables do not exist.
 */
export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
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

  try {
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM ayahs');
    const count = result?.count || 0;
    if (count < 6236) {
      console.log(`[quranDb] Database has ${count} verses. Seeding from local quran.json...`);
      const quranData = require('../../assets/quran.json');
      
      await db.execAsync('DELETE FROM surahs; DELETE FROM ayahs;');
      
      await db.withTransactionAsync(async () => {
        for (const surah of quranData.surahs) {
          await db.runAsync(
            `INSERT OR REPLACE INTO surahs (number, name, englishName, englishNameTranslation, revelationType, numberOfAyahs)
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
          await db.runAsync(
            `INSERT OR REPLACE INTO ayahs (number, surahNumber, numberInSurah, juzNumber, pageNumber, text, translationEn, translationUr, audio)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ayah.number,
              ayah.surahNumber,
              ayah.numberInSurah,
              ayah.juzNumber,
              ayah.pageNumber,
              ayah.text,
              ayah.translationEn,
              ayah.translationUr,
              ayah.audio,
            ]
          );
        }
      });
      console.log('[quranDb] Database seeding completed successfully!');
    }
  } catch (err) {
    console.error('[quranDb] Error seeding Quran database:', err);
  }
}

/**
 * Checks if all 6236 verses of the Quran are present locally in the database.
 */
export async function checkIfQuranDownloaded(): Promise<boolean> {
  try {
    await initDatabase();
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM ayahs');
    return (result?.count || 0) === 6236;
  } catch (err) {
    console.warn('[quranDb] Failed to check download status:', err);
    return false;
  }
}

/**
 * Downloads full Quran editions (Arabic text, English/Urdu translations, audio URLs)
 * and inserts them into the local SQLite database using a single fast transaction.
 */
export async function downloadQuran(
  onProgress: (status: string, progress: number) => void
): Promise<void> {
  await initDatabase();
  const db = await getDatabase();

  const API_BASE = 'https://api.alquran.cloud/v1/quran';

  onProgress('Downloading Arabic text...', 0.1);
  const arabicRes = await axios.get(`${API_BASE}/quran-simple`, { timeout: 30000 });
  if (arabicRes.status !== 200 || !arabicRes.data?.data) {
    throw new Error('Failed to download Arabic Quran text.');
  }

  onProgress('Downloading English translation...', 0.3);
  const enRes = await axios.get(`${API_BASE}/en.asad`, { timeout: 30000 });
  if (enRes.status !== 200 || !enRes.data?.data) {
    throw new Error('Failed to download English translation.');
  }

  onProgress('Downloading Urdu translation...', 0.5);
  const urRes = await axios.get(`${API_BASE}/ur.jalandhry`, { timeout: 30000 });
  if (urRes.status !== 200 || !urRes.data?.data) {
    throw new Error('Failed to download Urdu translation.');
  }

  onProgress('Downloading audio links...', 0.7);
  const audioRes = await axios.get(`${API_BASE}/ar.alafasy`, { timeout: 30000 });
  if (audioRes.status !== 200 || !audioRes.data?.data) {
    throw new Error('Failed to download audio references.');
  }

  onProgress('Processing and storing Quran data...', 0.85);

  const arabicSurahs = arabicRes.data.data.surahs;
  const enSurahs = enRes.data.data.surahs;
  const urSurahs = urRes.data.data.surahs;
  const audioSurahs = audioRes.data.data.surahs;

  if (
    arabicSurahs.length !== 114 ||
    enSurahs.length !== 114 ||
    urSurahs.length !== 114 ||
    audioSurahs.length !== 114
  ) {
    throw new Error('Incomplete data downloaded. Quran must contain 114 Surahs.');
  }

  // Clear existing records before inserting to prevent duplicates or partial states
  await db.execAsync('DELETE FROM surahs; DELETE FROM ayahs;');

  // Begin transaction
  await db.withTransactionAsync(async () => {
    for (let sIdx = 0; sIdx < 114; sIdx++) {
      const sArabic = arabicSurahs[sIdx];
      const sEn = enSurahs[sIdx];
      const sUr = urSurahs[sIdx];
      const sAudio = audioSurahs[sIdx];

      await db.runAsync(
        `INSERT OR REPLACE INTO surahs (number, name, englishName, englishNameTranslation, revelationType, numberOfAyahs)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          sArabic.number,
          sArabic.name,
          sArabic.englishName,
          sArabic.englishNameTranslation,
          sArabic.revelationType,
          sArabic.numberOfAyahs,
        ]
      );

      for (let aIdx = 0; aIdx < sArabic.ayahs.length; aIdx++) {
        const aArabic = sArabic.ayahs[aIdx];
        const aEn = sEn.ayahs[aIdx];
        const aUr = sUr.ayahs[aIdx];
        const aAudio = sAudio.ayahs[aIdx];

        await db.runAsync(
          `INSERT OR REPLACE INTO ayahs (number, surahNumber, numberInSurah, juzNumber, pageNumber, text, translationEn, translationUr, audio)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            aArabic.number,
            sArabic.number,
            aArabic.numberInSurah,
            aArabic.juz,
            aArabic.page,
            aArabic.text,
            aEn.text,
            aUr.text,
            aAudio.audio,
          ]
        );
      }
    }
  });

  onProgress('Quran download completed!', 1.0);
}

/**
 * Returns a list of all 114 Surahs from the local database.
 */
export async function getSurahList(): Promise<Surah[]> {
  await initDatabase();
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
  }>('SELECT number, name, englishName, englishNameTranslation, numberOfAyahs FROM surahs ORDER BY number');

  return rows.map((row) => ({
    number: row.number,
    englishName: row.englishName,
    arabicName: row.name,
    ayahCount: row.numberOfAyahs,
    englishNameTranslation: row.englishNameTranslation,
  }));
}

interface DBVerseRow {
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
}

/**
 * Loads ayahs for a specific Surah, joined with surah metadata.
 */
export async function getSurahAyahs(
  surahNumber: number,
  translationLang: 'en' | 'ur'
): Promise<UnifiedAyah[]> {
  await initDatabase();
  const db = await getDatabase();

  const rows = await db.getAllAsync<DBVerseRow>(
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

  return rows.map((row) => ({
    number: row.number,
    numberInSurah: row.numberInSurah,
    text: row.text,
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

/**
 * Loads ayahs for a specific Juz (Parah), joined with surah metadata.
 */
export async function getJuzAyahs(
  juzId: number,
  translationLang: 'en' | 'ur'
): Promise<UnifiedAyah[]> {
  await initDatabase();
  const db = await getDatabase();

  const rows = await db.getAllAsync<DBVerseRow>(
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

  return rows.map((row) => ({
    number: row.number,
    numberInSurah: row.numberInSurah,
    text: row.text,
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

/**
 * Returns a random daily ayah from local storage.
 */
export async function getRandomAyah(translationLang: 'en' | 'ur'): Promise<DailyAyah> {
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

  if (!row) {
    throw new Error('Ayah index out of range.');
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  return {
    text: row.text,
    translation: translationLang === 'ur' ? row.translationUr : row.translationEn,
    surahName: row.englishName,
    surahNumber: row.surahNumber,
    numberInSurah: row.numberInSurah,
    date: todayStr,
    lang: translationLang,
  };
}
