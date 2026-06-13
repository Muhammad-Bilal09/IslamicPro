import { Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 120,
    gap: Spacing.three,
  },

  heroCard: {
    padding: 0,
    overflow: 'hidden',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  locationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextWrap: {
    flex: 1,
  },
  locationCity: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  hijriText: {
    fontSize: 11,
    opacity: 0.75,
    marginVertical: 1,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  editChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    marginHorizontal: Spacing.four,
  },
  heroLoader: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  heroLoaderText: {
    fontSize: 13,
    opacity: 0.8,
  },
  heroBody: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.7,
    marginBottom: 2,
    paddingBottom: 20,
  },
  nextPrayerName: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
    padding: 5,
  },
  countdownTimer: {
    fontSize: 50,
    fontWeight: '900',
    letterSpacing: 3,
    paddingVertical: 12,
    marginVertical: Spacing.one,
  },
  nextAt: {
    fontSize: 13,
    opacity: 0.75,
    marginBottom: Spacing.three,
  },
  progressSubCard: {
    width: '100%',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 11,
    opacity: 0.8,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 11,
    opacity: 0.65,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
  },

  configCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  configTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 14,
    gap: Spacing.two,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 14,
  },

  // ── Error ──
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    flex: 1,
  },

  // ── Calendar ──
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  calendarRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  dayPill: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    gap: 2,
  },
  dayName: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dayNum: {
    fontSize: 17,
    fontWeight: '800',
  },

  // ── Prayer List ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 14,
  },

  // ── Ayat Footer ──
  ayatCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  ayatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  ayatText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    paddingHorizontal: Spacing.two,
  },
  ayatRefLine: {
    width: 40,
    height: 1,
    marginVertical: Spacing.one,
  },
  ayatRef: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.8,
  },
  bottomSpacer: { height: 20 },
});
