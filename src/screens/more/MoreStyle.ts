import { StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 110,
    gap: Spacing.three,
  },
  // ── Tasbih Widget Card ──
  tasbihCard: {
    padding: Spacing.four,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: Spacing.one,
    borderWidth: 1,
  },
  tasbihHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  tasbihIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasbihTitleContainer: {
    flex: 1,
    gap: 2,
  },
  tasbihTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tasbihSubtitle: {
    fontSize: 12,
  },
  counterWrapper: {
    position: 'relative',
    marginVertical: Spacing.two,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasbihRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  tasbihNumber: {
    fontSize: 44,
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  tasbihTapText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: Spacing.two,
  },
  resetCircle: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // ── Duas Container ──
  duasContainer: {
    gap: Spacing.two,
  },
  duasGridRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  duaCard: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.two,
    marginVertical: 0,
  },
  duaIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  duaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  duaSub: {
    fontSize: 12,
  },
  duaCardWide: {
    padding: Spacing.four,
    marginVertical: 0,
  },
  duaWideContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duaWideText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  duaWideLabels: {
    gap: 2,
  },
  // ── Mosque Card ──
  mosqueCard: {
    padding: 0,
    overflow: 'hidden',
    marginVertical: 0,
  },
  mosqueBanner: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosqueBannerOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    padding: Spacing.four,
    gap: 6,
  },
  mosqueBannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  mosqueBannerSub: {
    fontSize: 11,
    opacity: 0.9,
    textAlign: 'center',
  },
  mosqueInfo: {
    padding: Spacing.four,
    gap: 4,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mosqueDistance: {
    fontSize: 13,
  },
  mosqueActionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  mosqueButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosqueButtonOutline: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosqueButtonTextPrimary: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mosqueButtonTextSecondary: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  // ── Community Dua Card ──
  communityDuaCard: {
    padding: Spacing.four,
    gap: Spacing.three,
    marginVertical: 0,
  },
  communityDuaDivider: {
    height: 1,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  userMeta: {
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userTime: {
    fontSize: 11,
  },
  duaRequestText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  communityActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  prayButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
