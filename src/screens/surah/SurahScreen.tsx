import React from 'react';
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

import { useSurah } from './UseSurah';
import { styles } from './SurahStyle';

export function SurahScreen() {
  const theme = useTheme();
  const {
    router,
    surahId,
    surahInfo,
    ayahs,
    isLoading,
    errorMsg,
    currentAyahIndex,
    isLoadingAudio,
    autoAdvance,
    setAutoAdvance,
    isPlaying,
    flatListRef,
    fetchSurahData,
    playAyah,
    togglePlayPause,
    handleNext,
    handlePrev,
    stopAudio,
    onScrollToIndexFailed,
  } = useSurah();

  // ── Ayah card renderer ─────────────────────────────────────────────────────
  const renderAyahItem = ({ item, index }: { item: UnifiedAyah; index: number }) => {
    const isActive = index === currentAyahIndex;
    return (
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
          {/* Verse number circle */}
          <View style={[styles.numberContainer, { backgroundColor: isActive ? theme.primary : theme.backgroundElement }]}>
            <ThemedText style={[styles.ayahNumber, { color: isActive ? theme.textOnPrimary : theme.text }]}>
              {item.numberInSurah}
            </ThemedText>
          </View>

          {/* Per-ayah play button */}
          <Pressable
            style={[styles.playButtonCircle, { backgroundColor: isActive && isPlaying ? theme.accent : theme.primary }]}
            onPress={() => playAyah(index)}
          >
            {isActive && isLoadingAudio ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name={isActive && isPlaying ? 'pause' : 'play'} size={14} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {/* Arabic text */}
        <ThemedText style={styles.arabicText}>{item.text}</ThemedText>

        {/* Translation */}
        <ThemedText style={styles.translationText} themeColor="textSecondary">
          {item.translation}
        </ThemedText>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        {surahInfo ? (
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>{surahInfo.englishName}</ThemedText>
            <ThemedText style={styles.headerSubtitle} themeColor="textSecondary">
              {surahInfo.englishNameTranslation} • {surahInfo.numberOfAyahs} Ayahs
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={styles.headerTitle}>Loading...</ThemedText>
        )}

        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loaderText} themeColor="textSecondary">
            Loading recitations...
          </ThemedText>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.accent} />
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          <Pressable style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchSurahData}>
            <ThemedText style={styles.retryText} themeColor="textOnPrimary">Retry</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={ayahs}
            renderItem={renderAyahItem}
            keyExtractor={(item) => item.number.toString()}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: currentAyahIndex !== null ? 150 : 40 },
            ]}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={onScrollToIndexFailed}
            ListHeaderComponent={
              surahId !== 9 && surahId !== 1 ? (
                <Card variant="outlined" style={styles.bismillahCard}>
                  <ThemedText style={styles.bismillahText}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </ThemedText>
                </Card>
              ) : null
            }
          />

          {/* ── Floating Audio Player Panel ───────────────────────────────── */}
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
              {/* Now-playing info */}
              <View style={styles.playerInfoRow}>
                <View style={styles.playerTextContainer}>
                  <ThemedText style={styles.playerSurahName}>
                    {surahInfo?.englishName} • Ayah {currentAyahIndex + 1}
                  </ThemedText>
                  <ThemedText style={styles.playerReciter} themeColor="textSecondary">
                    Qari Mishary Rashid Alafasy
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

              {/* Controls */}
              <View style={styles.playerControlsRow}>
                {/* Auto-advance toggle */}
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

                {/* Previous */}
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

                {/* Play/Pause main */}
                <Pressable style={[styles.mainPlayBtn, { backgroundColor: theme.primary }]} onPress={togglePlayPause}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#FFFFFF"
                    style={{ marginLeft: isPlaying ? 0 : 3 }}
                  />
                </Pressable>

                {/* Next */}
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

                {/* Close */}
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

export default SurahScreen;
