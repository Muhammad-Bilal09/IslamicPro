import { PrayerTimings } from '@/types/type';
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

export class PrayerTimeService {
  static formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  static getAdhanParameters(methodId: number) {
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

  static getPrayerTimesForDate(
    date: Date,
    latitude: number,
    longitude: number,
    methodId = 1,
    schoolId = 1
  ): PrayerTimings {
    const cleanDate = new Date(date);
    cleanDate.setHours(0, 0, 0, 0);

    const coords = new Coordinates(latitude, longitude);
    const params = this.getAdhanParameters(methodId);

    if (schoolId === 1) {
      params.madhab = Madhab.Hanafi;
    } else {
      params.madhab = Madhab.Shafi;
    }

    const pTimes = new PrayerTimes(coords, cleanDate, params);

    return {
      Fajr: this.formatTime(pTimes.fajr),
      Sunrise: this.formatTime(pTimes.sunrise),
      Dhuhr: this.formatTime(pTimes.dhuhr),
      Asr: this.formatTime(pTimes.asr),
      Maghrib: this.formatTime(pTimes.maghrib),
      Isha: this.formatTime(pTimes.isha),
    };
  }
}
