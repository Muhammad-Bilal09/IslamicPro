import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/card";
import FilterTabs from "@/components/filter-tabs";
import Header from "@/components/header";
import SearchBar from "@/components/search-bar";
import SurahListItem from "@/components/surah-list-item";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useArabicFont } from "@/utils/fontHelper";

import { sanitizeArabicText } from "@/utils/quranDb";
import { styles } from "./QuranStyle";
import { useQuran } from "./UseQuran";

export function QuranScreen() {
  const theme = useTheme();
  const arabicFont = useArabicFont();
  const {
    isWide,
    numColumns,
    isLoading,
    errorMsg,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    selectedTab,
    setSelectedTab,
    lastReadSurah,
    filterTabs,
    filteredSurahs,
    loadSurahs,
    bookmarks,
    isLoggedIn,
  } = useQuran();

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
              <ThemedText
                style={[styles.continueButtonText, { color: theme.primary }]}
              >
                Continue
              </ThemedText>
              <Ionicons name="arrow-forward" size={14} color={theme.primary} />
            </Pressable>
          </View>
        </Card>
      )}
    </View>
  );

  const renderSurahFooter = () => (
    <View
      style={[styles.footerContainer, isWide ? styles.footerContainerWide : {}]}
    >
      {/* <Card variant="default" style={[styles.ayahCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', borderWidth: 1 }, isWide ? { flex: 1 } : {}]}>
        <ThemedText style={[styles.remembranceText, { color: '#4338CA' }]}>
          "Verily, in the remembrance of Allah do hearts find rest."
        </ThemedText>
        <ThemedText style={[styles.remembranceRef, { color: '#6366F1' }]}>
          AR-RA'D : 28
        </ThemedText>
      </Card> */}
      {/* <Card variant="outlined" style={[styles.inspirationCard, isWide ? { flex: 1 } : {}]}>
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
      </Card> */}
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
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadSurahs}
          >
            <ThemedText style={styles.retryText} themeColor="textOnPrimary">
              Retry
            </ThemedText>
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

  if (selectedTab === "Bookmarks") {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <Header title="Quran Majeed" showSearch={false} />
        <View style={styles.contentWrapper}>
          <FlatList
            data={bookmarks}
            keyExtractor={(item) =>
              `bookmark-${item.surahNumber}-${item.numberInSurah}`
            }
            contentContainerStyle={[
              styles.listContent,
              { maxWidth: 900, alignSelf: "center", width: "100%" },
            ]}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/surah/${item.surahNumber}`)}
              >
                <Card
                  variant="outlined"
                  style={{
                    marginVertical: Spacing.one,
                    padding: Spacing.three,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: Spacing.two,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: Spacing.two,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: theme.primary,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ThemedText
                          style={{
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: "bold",
                          }}
                        >
                          {item.numberInSurah}
                        </ThemedText>
                      </View>
                      <ThemedText style={{ fontWeight: "bold", fontSize: 15 }}>
                        {item.surahName}
                      </ThemedText>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.textSecondary}
                    />
                  </View>
                  <ThemedText
                    style={{
                      fontSize: 24,
                      fontWeight: "normal",
                      textAlign: "right",
                      fontFamily: arabicFont,
                      marginBottom: Spacing.two,
                      color: theme.primary,
                    }}
                  >
                    {sanitizeArabicText(item.text)}
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 13, color: theme.textSecondary }}
                  >
                    {item.translation}
                  </ThemedText>
                </Card>
              </Pressable>
            )}
            ListHeaderComponent={() => (
              <View style={styles.headerContainer}>
                <View style={styles.paddedItem}>
                  <FilterTabs
                    tabs={filterTabs}
                    selectedTab={selectedTab}
                    onSelectTab={(tab) => {
                      setSelectedTab(tab);
                      setSearchQuery("");
                    }}
                  />
                </View>
                {bookmarks.length === 0 && (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 60,
                    }}
                  >
                    <Ionicons
                      name="bookmark-outline"
                      size={48}
                      color={theme.textSecondary}
                    />
                    <ThemedText
                      style={{
                        marginTop: 12,
                        color: theme.textSecondary,
                        fontSize: 14,
                      }}
                    >
                      No bookmarks saved yet.
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <Header title="Quran Majeed" showSearch={true} />
      <View style={styles.contentWrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.paddedItem}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search Surah by name, number"
            />
          </View>
          {isLoggedIn && filterTabs.length > 1 && (
            <View style={styles.paddedItem}>
              <FilterTabs
                tabs={filterTabs}
                selectedTab={selectedTab}
                onSelectTab={(tab) => {
                  setSelectedTab(tab);
                  setSearchQuery("");
                }}
              />
            </View>
          )}
        </View>
        <FlatList
          key={`surah-${numColumns}`}
          data={isLoading ? [] : filteredSurahs}
          numColumns={numColumns}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={[
            styles.listContent,
            { maxWidth: 1200, alignSelf: "center", width: "100%" },
          ]}
          columnWrapperStyle={
            numColumns > 1 ? styles.gridColumnWrapper : undefined
          }
          renderItem={({ item }) => (
            <View
              style={
                numColumns > 1
                  ? { flex: 1, paddingHorizontal: Spacing.one }
                  : undefined
              }
            >
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
