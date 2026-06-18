import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { UnifiedAyah } from '@/types/type';

import { styles } from './ParahStyle';
import { useParah } from './UseParah';

export function ParahScreen() {
  const theme = useTheme();
  const {
    router,
    juzId,
    ayahs,
    isLoading,
    errorMsg,
    juzTitle,
    currentAyahIndex,
    isLoadingAudio,
    autoAdvance,
    setAutoAdvance,
    isPlaying,
    flatListRef,
    fetchJuzData,
    playAyah,
    togglePlayPause,
    handleNext,
    handlePrev,
    stopAudio,
    onScrollToIndexFailed,
  } = useParah();

  const renderAyahItem = ({ item, index }: { item: UnifiedAyah; index: number }) => {
    const isActive = index === currentAyahIndex;
    const isNewSurah = index === 0 || item.surah.number !== ayahs[index - 1].surah.number;

    return (
      <View>
        {isNewSurah && (
          <View style={styles.surahHeaderContainer}>
            <Card
              variant="outlined"
              style={[
                styles.surahHeaderCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.surahHeaderRow}>
                <View style={[styles.surahNumberBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.surahNumberText}>{item.surah.number}</ThemedText>
                </View>

                <View style={styles.surahHeaderTitles}>
                  <ThemedText style={styles.surahHeaderName}>{item.surah.englishName}</ThemedText>
                  <ThemedText style={styles.surahHeaderTranslation} themeColor="textSecondary">
                    {item.surah.englishNameTranslation} • {item.surah.numberOfAyahs} Ayahs
                  </ThemedText>
                </View>

                <View style={styles.surahHeaderRight}>
                  <ThemedText style={styles.surahHeaderArabic}>{item.surah.name}</ThemedText>
                  <Badge text={item.surah.revelationType} variant="light" />
                </View>
              </View>
            </Card>

            {item.surah.number !== 9 && (item.surah.number !== 1 || item.numberInSurah !== 1) && item.numberInSurah === 1 && (
              <Card variant="outlined" style={styles.bismillahCard}>
                <ThemedText style={styles.bismillahText}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </ThemedText>
              </Card>
            )}
          </View>
        )}

        <Card
          variant={isActive ? 'default' : 'outlined'}
          style={[
            styles.ayahCard,
            {
              borderColor: isActive ? theme.primary : theme.border,
              borderWidth: isActive ? 2 : 1,
              backgroundColor: isActive ? theme.primaryLight : theme.cardBackground,
            },
          ]}
        >
          <View style={styles.ayahHeader}>
            <View
              style={[
                styles.numberContainer,
                { backgroundColor: isActive ? theme.primary : theme.backgroundElement },
              ]}
            >
              <ThemedText style={[styles.ayahNumber, { color: isActive ? theme.textOnPrimary : theme.text }]}>
                {item.numberInSurah}
              </ThemedText>
            </View>

            <View style={styles.ayahHeaderRightActions}>
              <ThemedText style={styles.surahNameTag} themeColor="textSecondary">
                {item.surah.englishName}
              </ThemedText>
              <Pressable
                style={[
                  styles.playButtonCircle,
                  { backgroundColor: isActive && isPlaying ? theme.accent : theme.primary },
                ]}
                onPress={() => playAyah(index)}
              >
                {isActive && isLoadingAudio ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name={isActive && isPlaying ? 'pause' : 'play'} size={14} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>

          <ThemedText style={styles.arabicText}>{item.text}</ThemedText>
          <ThemedText style={styles.translationText} themeColor="textSecondary">
            {item.translation}
          </ThemedText>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Para {juzId}</ThemedText>
          <ThemedText style={styles.headerSubtitle} themeColor="textSecondary" numberOfLines={1}>
            {isLoading ? 'Loading Para content...' : juzTitle}
          </ThemedText>
        </View>

        <View style={styles.backButtonPlaceholder} />
      </View>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loaderText} themeColor="textSecondary">
            Retrieving Para {juzId} verses...
          </ThemedText>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.accent} />
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          <Pressable style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchJuzData}>
            <ThemedText style={styles.retryText} themeColor="textOnPrimary">Retry</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={ayahs}
            renderItem={renderAyahItem}
            keyExtractor={(item) => `juz-${juzId}-ayah-${item.number}`}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: currentAyahIndex !== null ? 150 : 40 },
            ]}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={onScrollToIndexFailed}
          />

          {currentAyahIndex !== null && (
            <Card
              style={[
                styles.playerPanel,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                  shadowColor: '#000',
                },
              ]}
            >
              <View style={styles.playerInfoRow}>
                <View style={styles.playerTextContainer}>
                  <ThemedText style={styles.playerSurahName} numberOfLines={1}>
                    {ayahs[currentAyahIndex]?.surah.englishName} • Ayah {ayahs[currentAyahIndex]?.numberInSurah}
                  </ThemedText>
                  <ThemedText style={styles.playerReciter} themeColor="textSecondary">
                    Para {juzId} • Mishary Rashid Alafasy
                  </ThemedText>
                </View>
                {isLoadingAudio ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Badge
                    text={isPlaying ? 'Playing' : 'Paused'}
                    variant={isPlaying ? 'success' : 'light'}
                  />
                )}
              </View>

              <View style={styles.playerControlsRow}>
                <Pressable
                  style={[styles.utilityBtn, { backgroundColor: autoAdvance ? theme.primaryLight : 'transparent' }]}
                  onPress={() => setAutoAdvance(!autoAdvance)}
                >
                  <Ionicons
                    name="repeat"
                    size={20}
                    color={autoAdvance ? theme.primary : theme.textSecondary}
                  />
                </Pressable>

                <Pressable
                  style={[styles.navBtn, { borderColor: theme.border }]}
                  onPress={handlePrev}
                  disabled={currentAyahIndex === 0}
                >
                  <Ionicons
                    name="play-skip-back"
                    size={18}
                    color={currentAyahIndex === 0 ? theme.border : theme.text}
                  />
                </Pressable>

                <Pressable style={[styles.mainPlayBtn, { backgroundColor: theme.primary }]} onPress={togglePlayPause}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#FFFFFF"
                    style={{ marginLeft: isPlaying ? 0 : 3 }}
                  />
                </Pressable>

                <Pressable
                  style={[styles.navBtn, { borderColor: theme.border }]}
                  onPress={handleNext}
                  disabled={currentAyahIndex === ayahs.length - 1}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={18}
                    color={currentAyahIndex === ayahs.length - 1 ? theme.border : theme.text}
                  />
                </Pressable>

                <Pressable style={styles.utilityBtn} onPress={stopAudio}>
                  <Ionicons name="close" size={22} color={theme.textSecondary} />
                </Pressable>
              </View>
            </Card>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

export default ParahScreen;
