import { StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.four, paddingTop: Spacing.six },

  /* Header */
  header: { alignItems: 'center', marginBottom: Spacing.five },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: { fontSize: 22, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: Spacing.two },

  /* Cards */
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.three },

  /* Error */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: Spacing.three,
  },
  errorBannerText: { fontSize: 12.5, color: '#DC2626', flex: 1 },

  /* GPS Button */
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsBtnText: { fontSize: 15, fontWeight: '700' },

  /* OR divider */
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: Spacing.two },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  /* Manual Button */
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: Spacing.one,
  },
  manualBtnText: { fontSize: 15, fontWeight: '700' },

  /* Skip note */
  skipNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.two,
    marginTop: Spacing.one,
  },
  skipText: { fontSize: 12, flex: 1, lineHeight: 18 },
});
