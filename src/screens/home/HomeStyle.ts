import { StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100, // Space for custom tab bar
  },
  prayerCard: {
    marginTop: Spacing.two,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  prayerSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  prayerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: Spacing.two,
    paddingVertical: Spacing.two,
  },
  prayerTimeEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.four,
    opacity: 0.9,
  },
  prayerEndTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextPrayerContainer: {
    borderRadius: 16,
    padding: Spacing.four,
  },
  nextPrayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  nextPrayerLabel: {
    fontSize: 13,
    opacity: 0.8,
  },
  nextPrayerName: {
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: Spacing.one,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    marginVertical: Spacing.two,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
  ayahCard: {
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  bookmarkButton: {
    padding: Spacing.one,
  },
  arabicText: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: Spacing.three,
    lineHeight: 40,
    fontFamily: 'serif',
  },
  translationText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  quickActionsRow: {
    flexDirection: 'column',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  quickActionPressable: {
    width: '100%',
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
    marginVertical: 0,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  streakCard: {
    marginVertical: Spacing.two,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  streakTasksText: {
    fontSize: 13,
    marginTop: Spacing.one,
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 40,
  },
});
