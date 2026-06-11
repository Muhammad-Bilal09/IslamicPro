import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '@/components/card';
import FilterTabs from '@/components/filter-tabs';
import Header from '@/components/header';
import SearchBar from '@/components/search-bar';
import SurahListItem from '@/components/surah-list-item';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { quranApi } from '@/utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Surah {
  number: number;
  englishName: string;
  arabicName: string;
  // type: 'MECCAN' | 'MEDINAN';
  ayahCount: number;
  englishNameTranslation: string;
}

interface Para {
  number: number;
  name: string;
  arabicName: string;
  startSurah: number;
  startAyah: number;
}

// ─── 30 Paras (Juz) data ──────────────────────────────────────────────────────
const PARAS: Para[] = [
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

const PARA_COLORS = [
  '#1B4332', '#155E75', '#1E3A5F', '#4A1D96', '#713F12',
  '#7F1D1D', '#064E3B', '#0C4A6E', '#14532D', '#1E40AF',
];

// ─── Component ────────────────────────────────────────────────────────────────
export function QuranScreen() {
  const theme = useTheme();
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

  // ─── Data loading ──────────────────────────────────────────────────────────
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

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const filteredSurahs = surahs.filter((surah) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      surah.englishName.toLowerCase().includes(q) ||
      surah.englishNameTranslation.toLowerCase().includes(q) ||
      surah.number.toString() === searchQuery;
    // if (selectedTab === 'Meccan') return matchesSearch && surah.type === 'MECCAN';
    // if (selectedTab === 'Medinan') return matchesSearch && surah.type === 'MEDINAN';
    return matchesSearch;
  });

  // Get surah name for a Para's startSurah
  const getSurahName = (surahNumber: number) => {
    const s = surahs.find((sr) => sr.number === surahNumber);
    return s ? s.englishName : `Surah ${surahNumber}`;
  };

  // ─── Para card renderer ────────────────────────────────────────────────────
  const renderParaCard = ({ item }: { item: Para }) => {
    const bgColor = PARA_COLORS[(item.number - 1) % PARA_COLORS.length];
    const surahName = getSurahName(item.startSurah);

    return (
      <Pressable
        style={[styles.paraCardOuter, paraColumns > 1 && { flex: 1 }]}
        onPress={() => router.push(`/parah/${item.number}` as any)}
        android_ripple={{ color: bgColor + '30', borderless: false }}
      >
        <View style={[styles.paraCard, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
          {/* Left number badge */}
          <View style={[styles.paraNumberBadge, { backgroundColor: bgColor }]}>
            <ThemedText style={styles.paraNumberText}>{item.number}</ThemedText>
            <ThemedText style={styles.paraParaLabel}>Para</ThemedText>
          </View>

          {/* Center info */}
          <View style={styles.paraInfo}>
            <ThemedText style={styles.paraName} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText
              style={[styles.paraArabic, { fontFamily: Platform.OS === 'ios' ? 'ui-serif' : 'serif' }]}
              numberOfLines={1}
            >
              {item.arabicName}
            </ThemedText>
            <View style={styles.paraSubRow}>
              <Ionicons name="book-outline" size={11} color={theme.textSecondary} />
              <ThemedText style={styles.paraSurahLabel} themeColor="textSecondary">
                {surahName} · Ayah {item.startAyah}
              </ThemedText>
            </View>
          </View>

          {/* Right chevron */}
          <View style={[styles.paraChevronWrapper, { backgroundColor: bgColor + '15' }]}>
            <Ionicons name="chevron-forward" size={18} color={bgColor} />
          </View>
        </View>
      </Pressable>
    );
  };

  // ─── Surah list header (search + filters + last read) ─────────────────────
  const renderSurahListHeader = () => (
    <View style={styles.headerContainer}>
      {lastReadSurah && (
        <Card variant="primary" style={styles.lastReadCard}>
          <View style={styles.lastReadHeader}>
            <Ionicons name="book" size={16} color={theme.textOnPrimary} />
            <ThemedText style={styles.lastReadLabel} themeColor="textOnPrimary">
              LAST READ
            </ThemedText>
          </View>
          <View style={styles.lastReadBody}>
            <View style={styles.surahInfo}>
              <ThemedText style={styles.surahName} themeColor="textOnPrimary">
                {lastReadSurah.name}
              </ThemedText>
              <ThemedText style={styles.ayahNumber} themeColor="textOnPrimary">
                Ayah No: {lastReadSurah.ayah}
              </ThemedText>
            </View>
            <Pressable
              style={styles.continueButton}
              onPress={() => router.push(`/surah/${lastReadSurah.number}`)}
            >
              <ThemedText style={[styles.continueButtonText, { color: theme.primary }]}>
                Continue
              </ThemedText>
              <Ionicons name="arrow-forward" size={14} color={theme.primary} />
            </Pressable>
          </View>
        </Card>
      )}
      <View style={styles.paddedItem}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Surah, number..."
        />
      </View>
      <View style={styles.paddedItem}>
        <FilterTabs
          tabs={filterTabs}
          selectedTab={selectedTab}
          onSelectTab={(tab) => {
            setSelectedTab(tab);
            setSearchQuery('');
          }}
        />
      </View>
    </View>
  );

  // ─── Para list header (just filter tabs) ──────────────────────────────────
  const renderParaListHeader = () => (
    <View style={styles.headerContainer}>
      {lastReadSurah && (
        <Card variant="primary" style={styles.lastReadCard}>
          <View style={styles.lastReadHeader}>
            <Ionicons name="book" size={16} color={theme.textOnPrimary} />
            <ThemedText style={styles.lastReadLabel} themeColor="textOnPrimary">
              LAST READ
            </ThemedText>
          </View>
          <View style={styles.lastReadBody}>
            <View style={styles.surahInfo}>
              <ThemedText style={styles.surahName} themeColor="textOnPrimary">
                {lastReadSurah.name}
              </ThemedText>
              <ThemedText style={styles.ayahNumber} themeColor="textOnPrimary">
                Ayah No: {lastReadSurah.ayah}
              </ThemedText>
            </View>
            <Pressable
              style={styles.continueButton}
              onPress={() => router.push(`/surah/${lastReadSurah.number}`)}
            >
              <ThemedText style={[styles.continueButtonText, { color: theme.primary }]}>
                Continue
              </ThemedText>
              <Ionicons name="arrow-forward" size={14} color={theme.primary} />
            </Pressable>
          </View>
        </Card>
      )}
      <View style={styles.paddedItem}>
        <FilterTabs
          tabs={filterTabs}
          selectedTab={selectedTab}
          onSelectTab={(tab) => {
            setSelectedTab(tab);
            setSearchQuery('');
          }}
        />
      </View>
      {/* Para count summary */}
      <View style={styles.paraHeaderSummary}>
        <View style={[styles.paraSummaryBadge, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="layers-outline" size={16} color={theme.primary} />
          <ThemedText style={[styles.paraSummaryText, { color: theme.primary }]}>
            30 Paras · Full Quran
          </ThemedText>
        </View>
        <ThemedText style={styles.paraSummaryHint} themeColor="textSecondary">
          Tap any Para to start reading
        </ThemedText>
      </View>
    </View>
  );

  const renderSurahFooter = () => (
    <View style={[styles.footerContainer, isWide ? styles.footerContainerWide : {}]}>
      <Card variant="default" style={[styles.ayahCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', borderWidth: 1 }, isWide ? { flex: 1 } : {}]}>
        <ThemedText style={[styles.remembranceText, { color: '#4338CA' }]}>
          "Verily, in the remembrance of Allah do hearts find rest."
        </ThemedText>
        <ThemedText style={[styles.remembranceRef, { color: '#6366F1' }]}>
          AR-RA'D : 28
        </ThemedText>
      </Card>
      <Card variant="outlined" style={[styles.inspirationCard, isWide ? { flex: 1 } : {}]}>
        <View style={styles.inspirationContent}>
          <View style={styles.inspirationInfo}>
            <ThemedText style={styles.inspirationLabel} themeColor="textSecondary">
              Daily Inspiration
            </ThemedText>
            <ThemedText style={styles.inspirationTitle}>Morning Reflection</ThemedText>
          </View>
          <View style={[styles.inspirationIconWrapper, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="sunny" size={32} color={theme.primary} />
          </View>
        </View>
      </Card>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loaderText} themeColor="textSecondary">
            Loading the Book of Allah...
          </ThemedText>
        </View>
      );
    }
    if (errorMsg) {
      return (
        <Card variant="outlined" style={styles.errorCard}>
          <Ionicons name="warning-outline" size={24} color={theme.accent} />
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          <Pressable style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={loadSurahs}>
            <ThemedText style={styles.retryText} themeColor="textOnPrimary">Retry</ThemedText>
          </Pressable>
        </Card>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText} themeColor="textSecondary">
          No surahs found.
        </ThemedText>
      </View>
    );
  };

  // ─── Para view ─────────────────────────────────────────────────────────────
  if (selectedTab === 'Para') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <Header title="Noor" showSearch={false} />
        <View style={styles.contentWrapper}>
          <FlatList
            key={`para-${paraColumns}`}
            data={PARAS}
            numColumns={paraColumns}
            keyExtractor={(item) => `para-${item.number}`}
            contentContainerStyle={[styles.listContent, { maxWidth: 900, alignSelf: 'center', width: '100%' }]}
            columnWrapperStyle={paraColumns > 1 ? styles.paraColumnWrapper : undefined}
            renderItem={renderParaCard}
            ListHeaderComponent={renderParaListHeader}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Surah view ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Noor" showSearch={true} />
      <View style={styles.contentWrapper}>
        <FlatList
          key={`surah-${numColumns}`}
          data={isLoading ? [] : filteredSurahs}
          numColumns={numColumns}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={[styles.listContent, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}
          columnWrapperStyle={numColumns > 1 ? styles.gridColumnWrapper : undefined}
          renderItem={({ item }) => (
            <View style={numColumns > 1 ? { flex: 1, paddingHorizontal: Spacing.one } : undefined}>
              <SurahListItem
                number={item.number}
                englishName={item.englishName}
                arabicName={item.arabicName}
                ayahCount={item.ayahCount}
                onPress={() => router.push(`/surah/${item.number}`)}
              />
            </View>
          )}
          ListHeaderComponent={renderSurahListHeader}
          ListFooterComponent={isLoading ? null : renderSurahFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

export default QuranScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  contentWrapper: { flex: 1, paddingHorizontal: Spacing.two },
  listContent: { paddingBottom: 110 },

  // ── Shared header ──
  headerContainer: { width: '100%' },
  paddedItem: { paddingHorizontal: Spacing.two, marginBottom: Spacing.two },

  // ── Last Read ──
  lastReadCard: { marginHorizontal: Spacing.two, marginTop: Spacing.two, marginBottom: Spacing.three },
  lastReadHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.three },
  lastReadLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  lastReadBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  surahInfo: { gap: 4 },
  surahName: { fontSize: 22, fontWeight: 'bold' },
  ayahNumber: { fontSize: 13, opacity: 0.9 },
  continueButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 24,
    gap: Spacing.one,
  },
  continueButtonText: { fontSize: 12, fontWeight: 'bold' },

  // ── Para cards ──
  paraHeaderSummary: { paddingHorizontal: Spacing.two, marginBottom: Spacing.three, gap: Spacing.two },
  paraSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  paraSummaryText: { fontSize: 13, fontWeight: '700' },
  paraSummaryHint: { fontSize: 12, marginLeft: 2 },
  paraColumnWrapper: { justifyContent: 'space-between', paddingHorizontal: Spacing.one },
  paraCardOuter: { marginHorizontal: Spacing.one, marginBottom: Spacing.two },
  paraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingRight: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  paraNumberBadge: {
    width: 64,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderTopLeftRadius: 17,
    borderBottomLeftRadius: 17,
    gap: 2,
  },
  paraNumberText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  paraParaLabel: { fontSize: 10, fontWeight: '600', color: '#FFFFFF', opacity: 0.8, letterSpacing: 0.5 },
  paraInfo: { flex: 1, gap: 3 },
  paraName: { fontSize: 15, fontWeight: '700' },
  paraArabic: { fontSize: 18, fontWeight: '500', textAlign: 'right' },
  paraSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paraSurahLabel: { fontSize: 12 },
  paraChevronWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Surah grid ──
  gridColumnWrapper: { justifyContent: 'space-between', paddingHorizontal: Spacing.one },

  // ── Loader / Error / Empty ──
  loaderContainer: { paddingVertical: 48, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  loaderText: { fontSize: 14, fontWeight: '500' },
  errorCard: { marginHorizontal: Spacing.two, marginVertical: Spacing.four, padding: Spacing.four, alignItems: 'center', gap: Spacing.two },
  errorText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryButton: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: 8, marginTop: Spacing.two },
  retryText: { fontSize: 13, fontWeight: 'bold' },
  emptyContainer: { paddingVertical: 48, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },

  // ── Footer ──
  footerContainer: { width: '100%', gap: Spacing.three, marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  footerContainerWide: { flexDirection: 'row' },
  ayahCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.four, marginHorizontal: 0 },
  remembranceText: { fontSize: 15, fontStyle: 'italic', textAlign: 'center', fontWeight: '600', lineHeight: 22 },
  remembranceRef: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginTop: Spacing.two },
  inspirationCard: { overflow: 'hidden', padding: Spacing.four, marginHorizontal: 0 },
  inspirationContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inspirationInfo: { gap: 4 },
  inspirationLabel: { fontSize: 12, fontWeight: 'bold' },
  inspirationTitle: { fontSize: 18, fontWeight: 'bold' },
  inspirationIconWrapper: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
});
