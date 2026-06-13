import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWindowDimensions } from 'react-native';
import { Para, Surah } from '@/types/type';
import { quranApi } from '@/utils/api';

export const PARAS: Para[] = [
  { number: 1, name: 'Alif Lam Mim', arabicName: 'الم', startSurah: 1, startAyah: 1 },
  { number: 2, name: 'Sayaqool', arabicName: 'سَيَقُولُ', startSurah: 2, startAyah: 142 },
  { number: 3, name: 'Tilkal Rusul', arabicName: 'تِلْكَ الرُّسُلُ', startSurah: 2, startAyah: 253 },
  { number: 4, name: 'Lan Tanaloo', arabicName: 'لَن تَنَالُوا', startSurah: 3, startAyah: 93 },
  { number: 5, name: 'Wal Mohsanat', arabicName: 'وَالْمُحْصَنَاتُ', startSurah: 4, startAyah: 24 },
  { number: 6, name: 'La Yuhibbullah', arabicName: 'لَا يُحِبُّ اللَّهُ', startSurah: 4, startAyah: 148 },
  { number: 7, name: 'Wa Iza Samiu', arabicName: 'وَإِذَا سَمِعُوا', startSurah: 5, startAyah: 82 },
  { number: 8, name: 'Wa Lau Annana', arabicName: 'وَلَوْ أَنَّنَا', startSurah: 6, startAyah: 111 },
  { number: 9, name: 'Qalal Malao', arabicName: 'قَالَ الْمَلَأُ', startSurah: 7, startAyah: 88 },
  { number: 10, name: "Wa A'lamu", arabicName: 'وَاعْلَمُوا', startSurah: 8, startAyah: 41 },
  { number: 11, name: 'Yatazeroon', arabicName: 'يَعْتَذِرُونَ', startSurah: 9, startAyah: 93 },
  { number: 12, name: 'Wa Ma Min Dabbah', arabicName: 'وَمَا مِن دَابَّةٍ', startSurah: 11, startAyah: 6 },
  { number: 13, name: 'Wa Ma Ubriyo', arabicName: 'وَمَا أُبَرِّئُ', startSurah: 12, startAyah: 53 },
  { number: 14, name: 'Rubama', arabicName: 'رُّبَمَا', startSurah: 15, startAyah: 1 },
  { number: 15, name: 'Subhanallazi', arabicName: 'سُبْحَانَ الَّذِي', startSurah: 17, startAyah: 1 },
  { number: 16, name: 'Qal Alam', arabicName: 'قَالَ أَلَمْ', startSurah: 18, startAyah: 75 },
  { number: 17, name: 'Iqtaraba', arabicName: 'اقْتَرَبَ', startSurah: 21, startAyah: 1 },
  { number: 18, name: 'Qad Aflaha', arabicName: 'قَدْ أَفْلَحَ', startSurah: 23, startAyah: 1 },
  { number: 19, name: 'Wa Qalallazina', arabicName: 'وَقَالَ الَّذِينَ', startSurah: 25, startAyah: 21 },
  { number: 20, name: 'Amman Khalaq', arabicName: 'أَمَّنْ خَلَقَ', startSurah: 27, startAyah: 56 },
  { number: 21, name: 'Utlu Ma Oohi', arabicName: 'اتْلُ مَا أُوحِيَ', startSurah: 29, startAyah: 46 },
  { number: 22, name: 'Wa Man Yaqnut', arabicName: 'وَمَن يَقْنُتْ', startSurah: 33, startAyah: 31 },
  { number: 23, name: 'Wa Mali', arabicName: 'وَمَالِيَ', startSurah: 36, startAyah: 28 },
  { number: 24, name: 'Faman Azlam', arabicName: 'فَمَنْ أَظْلَمُ', startSurah: 39, startAyah: 32 },
  { number: 25, name: 'Elahe Yuraddo', arabicName: 'إِلَيْهِ يُرَدُّ', startSurah: 41, startAyah: 47 },
  { number: 26, name: 'Ha Meem', arabicName: 'حم', startSurah: 46, startAyah: 1 },
  { number: 27, name: 'Qala Fama Khatbukum', arabicName: 'قَالَ فَمَا خَطْبُكُم', startSurah: 51, startAyah: 31 },
  { number: 28, name: 'Qad Sami Allah', arabicName: 'قَدْ سَمِعَ اللَّهُ', startSurah: 58, startAyah: 1 },
  { number: 29, name: 'Tabarakallazi', arabicName: 'تَبَارَكَ الَّذِي', startSurah: 67, startAyah: 1 },
  { number: 30, name: 'Amma', arabicName: 'عَمَّ', startSurah: 78, startAyah: 1 },
];

export const PARA_COLORS = [
  '#1B4332', '#155E75', '#1E3A5F', '#4A1D96', '#713F12',
  '#7F1D1D', '#064E3B', '#0C4A6E', '#14532D', '#1E40AF',
];

export const useQuran = () => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;
  const paraColumns = width >= 768 ? 2 : 1;

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Para');
  const [lastReadSurah, setLastReadSurah] = useState<{
    number: number;
    name: string;
    ayah: number;
  } | null>(null);

  const filterTabs = ['Para', 'All Surahs'];

  const loadSurahs = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await quranApi.get<{ code: number; data: any[] }>('/surah');
      const json = response.data;
      if (json.code !== 200 || !json.data) {
        throw new Error('API returned unsuccessful response.');
      }
      const mapped: Surah[] = json.data.map((item: any) => ({
        number: item.number,
        englishName: item.englishName,
        arabicName: item.name,
        ayahCount: item.numberOfAyahs,
        englishNameTranslation: item.englishNameTranslation,
      }));
      setSurahs(mapped);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while fetching the Quran list.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastRead = async () => {
    try {
      const stored = await AsyncStorage.getItem('quran_last_read');
      if (stored) setLastReadSurah(JSON.parse(stored));
    } catch (_) { }
  };

  useEffect(() => {
    loadSurahs();
    loadLastRead();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadLastRead, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredSurahs = surahs.filter((surah) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      surah.englishName.toLowerCase().includes(q) ||
      surah.englishNameTranslation.toLowerCase().includes(q) ||
      surah.number.toString() === searchQuery;
    return matchesSearch;
  });

  const getSurahName = (surahNumber: number) => {
    const s = surahs.find((sr) => sr.number === surahNumber);
    return s ? s.englishName : `Surah ${surahNumber}`;
  };

  return {
    isWide,
    numColumns,
    paraColumns,
    surahs,
    isLoading,
    errorMsg,
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    lastReadSurah,
    filterTabs,
    filteredSurahs,
    getSurahName,
    loadSurahs,
  };
};
