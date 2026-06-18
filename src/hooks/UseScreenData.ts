import { CountdownItem, HomeJourneyItem, HomeQuickActionItem, MoreDuaItem, PrayerTimeConfigItem, ProfileActivityItem, ProfileStatItem } from '@/types/type';
import { useTheme } from './use-theme';



export const useScreenData = () => {
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
  ];

  const journeyItems: HomeJourneyItem[] = [
    {
      title: 'Reading Progress',
      subtitle: 'Surah Al-Baqarah',
      progressValue: '65%',
      type: 'progress',
      route: '/quran',
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
