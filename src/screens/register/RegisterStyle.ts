import { Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four },

  header: { alignItems: 'center', marginBottom: Spacing.five },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  appName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  tagline: { fontSize: 13.5, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.four },

  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.four },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.three,
  },
  errorBannerText: { fontSize: 13, color: '#DC2626', flex: 1 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
    marginTop: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: { fontSize: 15.5, fontWeight: '700' },

  divider: { borderTopWidth: 1, marginVertical: Spacing.four },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  switchLabel: { fontSize: 13.5 },
  switchLink: { fontSize: 13.5, fontWeight: '700' },
});
