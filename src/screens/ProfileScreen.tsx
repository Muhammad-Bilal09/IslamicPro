import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Alert, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import ProgressBar from '@/components/progress-bar';
import { FormInput } from '@/components/auth/form-input';
import { useAuth } from '@/context/auth-context';

export function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();

  // State for Edit Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');

  const [isUpdating, setIsUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
  }>({});

  const resetErrorStates = () => {
    setFieldErrors({});
  };

  const openEditModal = () => {
    setName(user?.name ?? '');
    setGender(user?.gender ?? '');
    resetErrorStates();
    setIsEditModalVisible(true);
  };

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validate()) return;
    setIsUpdating(true);
    try {
      await updateProfile(name.trim(), gender);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      Alert.alert('Error', msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // Derive initials for avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

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
          {/* Streak Badge */}
          <View style={[styles.streakBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="flame" size={14} color="#FCD34D" />
            <ThemedText style={styles.streakText}>12 Day Streak</ThemedText>
          </View>
        </View>

        {/* Stats */}
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

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: Spacing.four, gap: Spacing.two },

  /* Avatar */
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.four, gap: Spacing.two },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700' },
  email: { fontSize: 14 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginVertical: Spacing.two,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth },

  /* Cards */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Spacing.three,
    marginLeft: Spacing.one,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { fontSize: 15, fontWeight: '600' },
  progressPct: { fontSize: 15, fontWeight: '700' },
  progressSub: { fontSize: 12 },
  bar: { marginTop: Spacing.one },

  /* Activity */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: { flex: 1, fontSize: 14 },
  activityTime: { fontSize: 12 },

  /* Buttons */
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    paddingVertical: 14,
    borderRadius: 16,
  },
  editBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#DC2626' },
  
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.five,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.four,
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1.5,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.one,
    marginLeft: Spacing.one,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.four,
    marginTop: Spacing.one,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
