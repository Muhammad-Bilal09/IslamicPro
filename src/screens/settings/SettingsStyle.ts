import { Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  content: { padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two, flexGrow: 1 },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    marginLeft: Spacing.one,
  },
  group: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, flexShrink: 1 },
  rowIcon: { width: 24 },
  rowLabel: { fontSize: 15 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexShrink: 1, marginLeft: Spacing.two },
  rowDetail: { fontSize: 14, flexShrink: 1 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    marginBottom: 36,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#DC2626' },
});
