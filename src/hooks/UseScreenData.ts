import { CountdownItem, HomeJourneyItem, HomeQuickActionItem, PrayerTimeConfigItem } from '@/types/type';
import { useTheme } from './use-theme';



export interface LastReadProgress {
  number: number;
  name: string;
  ayah: number;
  totalAyahs?: number;
}

export const useScreenData = (lastRead?: LastReadProgress | null, isLoggedIn?: boolean) => {
  const theme = useTheme();

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

  const quickActions: HomeQuickActionItem[] = [
    {
      title: 'Qibla',
      subtitle: 'Find the direction towards Kaaba',
      icon: 'compass-outline',
      iconColor: '#EF4444',
      bgColor: '#FDF2F2',
      route: '/qibla',
    },
    {
      title: 'Quran Audio',
      subtitle: 'Listen to recitations and read ayahs',
      icon: 'book-outline',
      iconColor: '#10B981',
      bgColor: '#ECFDF5',
      route: '/quran',
    },
    {
      title: 'Zakat Calculator',
      subtitle: 'Calculate your yearly Zakat (2.5%)',
      icon: 'calculator-outline',
      iconColor: '#8B5CF6',
      bgColor: '#F5F3FF',
      route: '/zakat',
    },
  ];

  const progressPercent = isLoggedIn && lastRead && lastRead.totalAyahs && lastRead.totalAyahs > 0
    ? `${Math.round((lastRead.ayah / lastRead.totalAyahs) * 100)}%`
    : '0%';

  const journeyItems: HomeJourneyItem[] = [
    {
      title: 'Reading Progress',
      subtitle: isLoggedIn
        ? (lastRead ? `${lastRead.name} (Ayah ${lastRead.ayah})` : 'No reading history yet')
        : 'Login to track progress',
      progressValue: isLoggedIn ? progressPercent : '0%',
      type: 'progress',
      route: isLoggedIn && lastRead ? `/surah/${lastRead.number}` : '/quran',
    },
  ];

  const prayerTimesConfig: PrayerTimeConfigItem[] = [
    { name: 'Fajr', type: 'MANDATORY', iconName: 'cloudy-night-outline' },
    { name: 'Sunrise', type: 'NON-OBLIGATORY', iconName: 'sunny-outline' },
    { name: 'Dhuhr', type: 'MANDATORY', iconName: 'sunny' },
    { name: 'Asr', type: 'MANDATORY', iconName: 'partly-sunny-outline' },
    { name: 'Maghrib', type: 'MANDATORY', iconName: 'moon-outline' },
    { name: 'Isha', type: 'MANDATORY', iconName: 'moon' },
  ];

  const getRamadanCountdownItems = (countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }): CountdownItem[] => [
      { value: countdown.days, label: 'DAYS' },
      { value: countdown.hours, label: 'HRS' },
      { value: countdown.minutes, label: 'MINS' },
      { value: countdown.seconds, label: 'SECS' },
    ];

  return {
    genderOptions,
    quickActions,
    journeyItems,
    prayerTimesConfig,
    getRamadanCountdownItems,
  };
};
