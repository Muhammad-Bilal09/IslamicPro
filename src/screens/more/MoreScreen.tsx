import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Card from '@/components/card';
import Header from '@/components/header';
import SectionHeader from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import { useMore } from './UseMore';
import { styles } from './MoreStyle';

export function MoreScreen() {
  const theme = useTheme();
  const { tasbihCount, incrementTasbih, resetTasbih } = useMore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Islamic" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Digital Tasbih Counter Card */}
        <Card variant="outlined" style={[styles.tasbihCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
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

          <View style={styles.counterWrapper}>
            {/* Tappable Counter Ring */}
            <Pressable
              onPress={incrementTasbih}
              style={({ pressed }) => [
                styles.tasbihRing,
                {
                  borderColor: theme.primaryLight,
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <ThemedText style={styles.tasbihNumber} themeColor="textOnPrimary">
                {tasbihCount}
              </ThemedText>
              <ThemedText style={styles.tasbihTapText} themeColor="textOnPrimary">
                TAP TO COUNT
              </ThemedText>
            </Pressable>

            {/* Reset Button */}
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

        {/* Daily Duas Section */}
        <SectionHeader title="Daily Duas" rightLabel="View All" onRightPress={() => { }} />

        <View style={styles.duasContainer}>
          <View style={styles.duasGridRow}>
            {/* Morning Duas */}
            <Card variant="outlined" style={[styles.duaCard, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
              <View style={[styles.duaIconCircle, { backgroundColor: '#FDE047' }]}>
                <Ionicons name="sunny" size={20} color="#854D0E" />
              </View>
              <ThemedText style={styles.duaTitle}>Morning</ThemedText>
              <ThemedText style={styles.duaSub} themeColor="textSecondary">
                24 Supplications
              </ThemedText>
            </Card>

            {/* Evening Duas */}
            <Card variant="outlined" style={[styles.duaCard, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
              <View style={[styles.duaIconCircle, { backgroundColor: '#1E293B' }]}>
                <Ionicons name="moon" size={20} color="#F8FAFC" />
              </View>
              <ThemedText style={styles.duaTitle}>Evening</ThemedText>
              <ThemedText style={styles.duaSub} themeColor="textSecondary">
                18 Supplications
              </ThemedText>
            </Card>
          </View>

          {/* Travel & Safety Duas (wider) */}
          <Card variant="outlined" style={[styles.duaCardWide, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
            <View style={styles.duaWideContent}>
              <View style={styles.duaWideText}>
                <View style={[styles.duaIconCircle, { backgroundColor: theme.cardBackground }]}>
                  <Ionicons name="airplane" size={20} color={theme.primary} />
                </View>
                <View style={styles.duaWideLabels}>
                  <ThemedText style={styles.duaTitle}>Travel & Safety</ThemedText>
                  <ThemedText style={styles.duaSub} themeColor="textSecondary">
                    Protect your journey
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="globe-outline" size={48} color={theme.primary + '25'} />
            </View>
          </Card>
        </View>

        {/* Nearby Mosques Section */}
        <SectionHeader
          title="Nearby Mosques"
          rightLabel="📍 Nearby"
          onRightPress={() => { }}
        />

        <Card variant="outlined" style={styles.mosqueCard}>
          {/* Mosque Banner Graphic */}
          <View style={[styles.mosqueBanner, { backgroundColor: theme.primary }]}>
            <View style={styles.mosqueBannerOverlay}>
              <Ionicons name="location-sharp" size={36} color="#FFFFFF" style={{ opacity: 0.95 }} />
              <ThemedText style={styles.mosqueBannerTitle} themeColor="textOnPrimary">
                FIND NEARBY MOSQUES
              </ThemedText>
              <ThemedText style={styles.mosqueBannerSub} themeColor="textOnPrimary">
                Locate places for congregational prayers
              </ThemedText>
            </View>
          </View>

          <View style={styles.mosqueInfo}>
            <ThemedText style={styles.mosqueName}>Al-Hidayah Center</ThemedText>
            <ThemedText style={styles.mosqueDistance} themeColor="textSecondary">
              1.2 km away • 15 min by car
            </ThemedText>

            <View style={styles.mosqueActionRow}>
              <Pressable style={[styles.mosqueButton, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.mosqueButtonTextPrimary}>Directions</ThemedText>
              </Pressable>

              <Pressable style={[styles.mosqueButtonOutline, { borderColor: theme.border }]}>
                <ThemedText style={styles.mosqueButtonTextSecondary}>Details</ThemedText>
              </Pressable>
            </View>
          </View>
        </Card>

        {/* Community Duas Section */}
        <SectionHeader title="Community Duas" />

        <Card variant="outlined" style={styles.communityDuaCard}>
          <View style={styles.communityHeader}>
            <View style={styles.userInfoRow}>
              <View style={[styles.userAvatar, { backgroundColor: '#FFEDD5' }]}>
                <ThemedText style={styles.avatarLetter}>A</ThemedText>
              </View>
              <View style={styles.userMeta}>
                <ThemedText style={styles.userName}>Ahmed S.</ThemedText>
                <ThemedText style={styles.userTime} themeColor="textSecondary">
                  2 hours ago
                </ThemedText>
              </View>
            </View>
            <Badge text="HEALTH" variant="success" />
          </View>

          <ThemedText style={styles.duaRequestText}>
            "Please pray for my mother's surgery tomorrow morning. May Allah grant her a swift recovery."
          </ThemedText>

          <View style={[styles.communityDuaDivider, { backgroundColor: theme.border }]} />

          <View style={styles.communityActionRow}>
            {/* React Avatars */}
            <View style={styles.reactAvatars}>
              <View style={[styles.miniAvatar, { backgroundColor: '#DBEAFE', zIndex: 3 }]}><ThemedText style={styles.miniAvatarText}>ML</ThemedText></View>
              <View style={[styles.miniAvatar, { backgroundColor: '#FEE2E2', marginLeft: -8, zIndex: 2 }]}><ThemedText style={styles.miniAvatarText}>RY</ThemedText></View>
              <View style={[styles.miniAvatar, { backgroundColor: '#E2E8F0', marginLeft: -8, zIndex: 1 }]}><ThemedText style={styles.miniAvatarText}>+14</ThemedText></View>
            </View>

            {/* Prayed Button */}
            <Pressable style={styles.prayButton}>
              <Ionicons name="heart-outline" size={16} color={theme.textSecondary} />
              <ThemedText style={styles.prayButtonText} themeColor="textSecondary">
                I prayed for this
              </ThemedText>
            </Pressable>
          </View>
        </Card>

        {/* Spacer for navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default MoreScreen;
