import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '@/components/card';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './MoreStyle';
import { useMore } from './UseMore';

export function MoreScreen() {
  const theme = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const { tasbihCount, target, setTarget, laps, incrementTasbih, resetTasbih } = useMore();

  const presets = [33, 99, 100, null];

  const progress = target ? tasbihCount / target : 0;

  const isSmallScreen = screenHeight < 680;
  const ringSize = isSmallScreen ? 170 : 200;
  const wrapperSize = isSmallScreen ? 190 : 220;
  const ringRadius = ringSize / 2;
  const cardPadding = isSmallScreen ? 16 : 24;
  const counterMargin = isSmallScreen ? 8 : 16;
  const digitCount = String(tasbihCount).length;
  let numberFontSize = isSmallScreen ? 44 : 56;
  if (digitCount > 3) {
    numberFontSize = isSmallScreen ? 26 : 34;
  } else if (digitCount > 2) {
    numberFontSize = isSmallScreen ? 34 : 44;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Tasbih Counter" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card variant="outlined" style={[styles.tasbihCard, { backgroundColor: theme.cardBackground, borderColor: theme.border, padding: cardPadding, marginBottom: 16 }]}>
          <View style={styles.tasbihHeader}>
            <View style={[styles.tasbihIconWrapper, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="finger-print-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.tasbihTitleContainer}>
              <ThemedText style={styles.tasbihTitle}>Digital Tasbih</ThemedText>
              <ThemedText style={styles.tasbihSubtitle} themeColor="textSecondary">
                SubhanAllah · Alhamdulillah · Allahu Akbar
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.targetLabel, { color: theme.textSecondary }]}>
            Select Target
          </ThemedText>

          <View style={styles.presetsRow}>
            {presets.map((p) => {
              const isActive = target === p;
              return (
                <Pressable
                  key={p ?? 'unlimited'}
                  onPress={() => setTarget(p)}
                  style={[
                    styles.presetChip,
                    {
                      borderColor: isActive ? theme.primary : theme.border,
                      backgroundColor: isActive ? theme.primaryLight : theme.backgroundElement,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.presetChipText,
                      { color: isActive ? theme.primary : theme.text },
                    ]}
                  >
                    {p ?? 'Free'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {target !== null && (
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
                  Progress: {tasbihCount} / {target}
                </ThemedText>
                <ThemedText style={[styles.lapsText, { color: theme.primary }]}>
                  Laps: {laps}
                </ThemedText>
              </View>
              <ProgressBar
                progress={progress}
                height={8}
                progressColor={theme.primary}
                trackColor={theme.border}
              />
            </View>
          )}

          {target === null && (
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
                  Free Counting Mode
                </ThemedText>
              </View>
            </View>
          )}

          <View style={[styles.counterWrapper, { width: wrapperSize, height: wrapperSize, marginVertical: counterMargin }]}>
            <Pressable
              onPress={incrementTasbih}
              style={({ pressed }) => [
                styles.tasbihRing,
                {
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringRadius,
                  borderColor: theme.primaryLight,
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <ThemedText
                style={[styles.tasbihNumber, { fontSize: numberFontSize, lineHeight: numberFontSize * 1.15 }]}
                themeColor="textOnPrimary"
              >
                {tasbihCount}
              </ThemedText>
              <ThemedText style={styles.tasbihTapText} themeColor="textOnPrimary">
                TAP TO COUNT
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={resetTasbih}
              style={({ pressed }) => [
                styles.resetCircle,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons name="refresh" size={18} color={theme.text} />
            </Pressable>
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default MoreScreen;
