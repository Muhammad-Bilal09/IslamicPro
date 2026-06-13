import { FormInput } from '@/components/auth/form-input';
import ProgressBar from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './ProfileStyle';
import { useProfile } from './UseProfile';

export function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    user,
    isEditModalVisible,
    setIsEditModalVisible,
    name,
    setName,
    gender,
    setGender,
    isUpdating,
    fieldErrors,
    setFieldErrors,
    openEditModal,
    handleUpdateProfile,
    handleLogout,
    initials,
  } = useProfile();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
        <Pressable onPress={openEditModal} hitSlop={10}>
          <Ionicons name="create-outline" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
            <ThemedText style={[styles.initials, { color: theme.primary }]}>
              {initials}
            </ThemedText>
          </View>
          <ThemedText style={styles.name}>{user?.name ?? 'User'}</ThemedText>
          <ThemedText style={styles.email} themeColor="textSecondary">
            {user?.email ?? ''}{user?.gender ? `  •  ${user.gender}` : ''}
          </ThemedText>
        </View>
        <View style={[styles.statsRow, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.stat}>
            <ThemedText style={[styles.statValue, { color: theme.primary }]}>65%</ThemedText>
            <ThemedText style={styles.statLabel} themeColor="textSecondary">Quran</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>1,250</ThemedText>
            <ThemedText style={styles.statLabel} themeColor="textSecondary">Tasbih</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <ThemedText style={[styles.statValue, { color: theme.success }]}>12</ThemedText>
            <ThemedText style={styles.statLabel} themeColor="textSecondary">Streak</ThemedText>
          </View>
        </View>

        {/* Reading Progress */}
        <ThemedText style={styles.sectionLabel} themeColor="textSecondary">
          Reading Progress
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.progressRow}>
            <ThemedText style={styles.progressTitle}>Al-Baqarah</ThemedText>
            <ThemedText style={[styles.progressPct, { color: theme.primary }]}>64%</ThemedText>
          </View>
          <ThemedText style={styles.progressSub} themeColor="textSecondary">
            Ayah 183 of 286
          </ThemedText>
          <ProgressBar progress={0.64} height={6} progressColor={theme.primary} style={styles.bar} />
        </View>

        {/* Recent Activity */}
        <ThemedText style={styles.sectionLabel} themeColor="textSecondary">
          Recent Activity
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {[
            { icon: 'book-outline' as const, text: 'Read Al-Baqarah', time: '2h ago' },
            { icon: 'radio-button-on-outline' as const, text: 'Completed 99 Tasbih', time: '5h ago' },
            { icon: 'calendar-outline' as const, text: 'All 5 Prayers done', time: 'Yesterday' },
            { icon: 'heart-outline' as const, text: 'Weekly Sadaqah', time: '2d ago' },
          ].map((item, i, arr) => (
            <View
              key={item.text}
              style={[
                styles.activityRow,
                { borderBottomColor: theme.border },
                i === arr.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.activityIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name={item.icon} size={16} color={theme.primary} />
              </View>
              <ThemedText style={styles.activityText}>{item.text}</ThemedText>
              <ThemedText style={styles.activityTime} themeColor="textSecondary">
                {item.time}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Edit & Logout */}
        <Pressable
          style={[styles.editBtn, { backgroundColor: theme.primary }]}
          onPress={openEditModal}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <ThemedText style={styles.editBtnText}>Edit Profile</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.logoutBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
                <Pressable onPress={() => setIsEditModalVisible(false)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </Pressable>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {/* Inputs */}
                <FormInput
                  label="Full Name"
                  iconName="person-outline"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={(t) => { setName(t); setFieldErrors((e) => ({ ...e, name: undefined })); }}
                  editable={!isUpdating}
                  error={fieldErrors.name}
                />

                <ThemedText style={styles.inputLabel} themeColor="textSecondary">Gender</ThemedText>
                <View style={styles.genderContainer}>
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => {
                    const isSelected = gender === g;
                    return (
                      <Pressable
                        key={g}
                        style={[
                          styles.genderOption,
                          { borderColor: isSelected ? theme.primary : theme.border },
                          isSelected && { backgroundColor: theme.primaryLight },
                        ]}
                        onPress={() => setGender(g)}
                        disabled={isUpdating}
                      >
                        <ThemedText
                          style={[
                            styles.genderText,
                            { color: isSelected ? theme.primary : theme.text },
                          ]}
                        >
                          {g}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Save & Cancel buttons */}
                <View style={styles.modalActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalCancelBtn,
                      { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => setIsEditModalVisible(false)}
                    disabled={isUpdating}
                  >
                    <ThemedText style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</ThemedText>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.modalSaveBtn,
                      { backgroundColor: theme.primary, opacity: pressed || isUpdating ? 0.85 : 1 },
                    ]}
                    onPress={handleUpdateProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <ThemedText style={styles.modalSaveText} themeColor="textOnPrimary">Save Changes</ThemedText>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default ProfileScreen;
