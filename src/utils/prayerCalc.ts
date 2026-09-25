import { PrayerTimings } from '@/types/type';
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';


export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
export function getAdhanParameters(methodId: number) {
  switch (methodId) {
    case 1:
      return CalculationMethod.Karachi();
    case 2:
      return CalculationMethod.NorthAmerica();
    case 3:
      return CalculationMethod.MuslimWorldLeague();
    case 4:
      return CalculationMethod.UmmAlQura();
    case 5:
      return CalculationMethod.Egyptian();
    case 8:
      return CalculationMethod.Dubai();
    case 11:
      return CalculationMethod.Singapore();
    case 13:
      return CalculationMethod.Turkey();
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}


export function getPrayerTimesForDate(
  date: Date,
  latitude: number,
  longitude: number,
  methodId = 1,
  schoolId = 1
): PrayerTimings {
  const cleanDate = new Date(date);
  cleanDate.setHours(0, 0, 0, 0);

  const coords = new Coordinates(latitude, longitude);
  const params = getAdhanParameters(methodId);

  if (schoolId === 1) {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  const pTimes = new PrayerTimes(coords, cleanDate, params);

  return {
    Fajr: formatTime(pTimes.fajr),
    Sunrise: formatTime(pTimes.sunrise),
    Dhuhr: formatTime(pTimes.dhuhr),
    Asr: formatTime(pTimes.asr),
    Maghrib: formatTime(pTimes.maghrib),
    Isha: formatTime(pTimes.isha),
  };
}

export function getHijriDateLocal(date: Date, country?: string, city?: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const formatParts = (d: Date) => {
      const parts = formatter.formatToParts(d);
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';
      return `${day.padStart(2, '0')} ${month} ${year} AH`;
    };

    const countryLower = (country || '').toLowerCase();
    const cityLower = (city || '').toLowerCase();
    const needsAdjustment =
      countryLower.includes('pakistan') ||
      countryLower.includes('india') ||
      countryLower.includes('bangladesh') ||
      cityLower.includes('karachi') ||
      cityLower.includes('mumbai') ||
      cityLower.includes('dhaka') ||
      cityLower === 'karachi';

    if (needsAdjustment) {
      const adjustedDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
      return formatParts(adjustedDate);
    }

    return formatParts(date);
  } catch (err) {
    console.warn('Native Hijri date calculation error, using fallback:', err);
    return '18 Muharram 1448 AH';
  }
}
