import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import { Para } from '@/types/type';

import { fontFamily, styles } from './QuranStyle';
import { PARAS, PARA_COLORS, useQuran } from './UseQuran';

export function QuranScreen() {
  const theme = useTheme();
  const {
    isWide,
    numColumns,
    paraColumns,
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
  } = useQuran();

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
          <View style={[styles.paraNumberBadge, { backgroundColor: bgColor }]}>
            <ThemedText style={styles.paraNumberText}>{item.number}</ThemedText>
            <ThemedText style={styles.paraParaLabel}>Para</ThemedText>
          </View>
          <View style={styles.paraInfo}>
            <ThemedText style={styles.paraName} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText
              style={[styles.paraArabic, { fontFamily }]}
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

          <View style={[styles.paraChevronWrapper, { backgroundColor: bgColor + '15' }]}>
            <Ionicons name="chevron-forward" size={18} color={bgColor} />
          </View>
        </View>
      </Pressable>
    );
  };

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

  if (selectedTab === 'Para') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <Header title="Quran Majeed" showSearch={false} />
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Quran Majeed" showSearch={true} />
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
