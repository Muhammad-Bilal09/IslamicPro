import { Dimensions, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
export const COMPASS_SIZE = Math.min(SCREEN_WIDTH - 80, 280);

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    gap: 4,
    paddingHorizontal: Spacing.two,
  },
  mainTitle: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.two,
  },
  loaderText: {
    fontSize: 13,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    padding: Spacing.three,
    marginVertical: Spacing.two,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    flex: 1,
  },

  /* Compass */
  compassWrapper: {
    alignItems: 'center',
    marginVertical: Spacing.four,
    paddingBottom: Spacing.two,
  },
  outerDial: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dirLabel: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  north: { top: 14 },
  east: { right: 18 },
  south: { bottom: 14 },
  west: { left: 18 },
  innerDial: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    position: 'absolute',
    width: 16,
    height: '75%',
    alignItems: 'center',
  },
  needleTop: {
    width: 14,
    height: '50%',
    backgroundColor: '#854D0E',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  needleBottom: {
    width: 8,
    height: '50%',
    backgroundColor: '#C4A882',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  centerDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    zIndex: 10,
  },
  headingBadge: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  deviceHeadingLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },

  /* Info Card */
  infoCard: {
    width: '100%',
    padding: Spacing.four,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  infoIconRow: {
    marginBottom: Spacing.one,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.three,
  },

  /* Buttons */
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
    marginTop: Spacing.four,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  sensorWarningCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  warningText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
