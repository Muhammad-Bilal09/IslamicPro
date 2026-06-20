import { CalendarDayData, CurrentAndNextPrayer, PrayerData, PrayerTimings } from '@/types/type';
import { aladhanApi } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';



export function convert24hTo12h(time24: string): string {
  if (!time24) return '';
  const cleanTime = time24.split(' ')[0];
  const parts = cleanTime.split(':');
  if (parts.length < 2) return time24;

  let hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  if (isNaN(hour) || isNaN(minute)) return time24;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;

  const minStr = minute.toString().padStart(2, '0');
  const hrStr = hour.toString().padStart(2, '0');

  return `${hrStr}:${minStr} ${ampm}`;
}


export async function fetchPrayerTimesByCity(
  city: string,
  country: string,
  method = 2,
  school = 0
): Promise<PrayerData> {
  const todayStr = getTodayDateString();

  const response = await aladhanApi.get<{ code: number; data: PrayerData }>(
    `/timingsByCity/${todayStr}`,
    {
      params: {
        city: city.trim(),
        country: country.trim(),
        method,
        school,
      },
    }
  );

  const json = response.data;
  if (json.code !== 200 || !json.data) {
    throw new Error('Failed to fetch prayer times');
  }

  return json.data;
}


export async function fetchPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  method = 2,
  school = 0
): Promise<PrayerData> {
  const timestamp = Math.floor(Date.now() / 1000);
  const response = await aladhanApi.get<{ code: number; data: PrayerData }>(
    `/timings/${timestamp}`,
    {
      params: {
        latitude,
        longitude,
        method,
        school,
      },
    }
  );

  const json = response.data;
  if (json.code !== 200 || !json.data) {
    throw new Error('Failed to fetch prayer times');
  }

  return json.data;
}


export async function fetchPrayerCalendar(
  city: string,
  country: string,
  useGps: boolean,
  lat: number | undefined,
  lng: number | undefined,
  method = 2,
  school = 0,
  year: number,
  month: number
): Promise<CalendarDayData[]> {
  let response;
  if (useGps && lat !== undefined && lng !== undefined) {
    response = await aladhanApi.get<{ code: number; data: CalendarDayData[] }>(
      `/calendar/${year}/${month}`,
      {
        params: {
          latitude: lat,
          longitude: lng,
          method,
          school,
        },
      }
    );
  } else {
    response = await aladhanApi.get<{ code: number; data: CalendarDayData[] }>(
      `/calendarByCity/${year}/${month}`,
      {
        params: {
          city: city.trim(),
          country: country.trim(),
          method,
          school,
        },
      }
    );
  }

  const json = response.data;
  if (json.code !== 200 || !json.data) {
    throw new Error(`Failed to fetch prayer calendar for ${year}/${month}`);
  }

  return json.data;
}


export async function getOrFetchPrayerCalendar(
  city: string,
  country: string,
  useGps: boolean,
  lat: number | undefined,
  lng: number | undefined,
  method = 2,
  school = 0,
  year: number,
  month: number
): Promise<CalendarDayData[]> {
  const cacheKey = useGps && lat !== undefined && lng !== undefined
    ? `prayer_cal_gps_${year}_${month}_m${method}_s${school}`
    : `prayer_cal_city_${city.toLowerCase().trim()}_${country.toLowerCase().trim()}_${year}_${month}_m${method}_s${school}`;

  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('PrayerApi Failed to read calendar from cache:', err);
  }

  console.log(`PrayerApi Cache miss for ${cacheKey}. Fetching calendar...`);
  const data = await fetchPrayerCalendar(city, country, useGps, lat, lng, method, school, year, month);

  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (err) {
    console.warn('PrayerApi Failed to write calendar to cache:', err);
  }

  return data;
}

export function getCurrentAndNextPrayer(timings: PrayerTimings): CurrentAndNextPrayer {
  const now = new Date();

  const parseTimeToDate = (timeStr: string, dateOffset = 0) => {
    const cleanTime = timeStr.split(' ')[0];
    const [h, m] = cleanTime.split(':').map(Number);
    const d = new Date(now);
    d.setDate(d.getDate() + dateOffset);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const prayers = [
    { name: 'Fajr', date: parseTimeToDate(timings.Fajr) },
    { name: 'Sunrise', date: parseTimeToDate(timings.Sunrise) },
    { name: 'Dhuhr', date: parseTimeToDate(timings.Dhuhr) },
    { name: 'Asr', date: parseTimeToDate(timings.Asr) },
    { name: 'Maghrib', date: parseTimeToDate(timings.Maghrib) },
    { name: 'Isha', date: parseTimeToDate(timings.Isha) },
  ];

  const currentTime = now.getTime();

  if (currentTime < prayers[0].date.getTime()) {
    const tomorrowFajr = parseTimeToDate(timings.Fajr);
    const yesterdayIsha = parseTimeToDate(timings.Isha, -1);
    const totalWait = (tomorrowFajr.getTime() - yesterdayIsha.getTime()) / 1000;
    const left = (tomorrowFajr.getTime() - currentTime) / 1000;

    return {
      current: 'Isha',
      next: 'Fajr',
      nextTime: convert24hTo12h(timings.Fajr),
      secondsLeft: Math.max(0, Math.floor(left)),
      totalWaitSeconds: Math.floor(totalWait),
      progress: Math.min(1, Math.max(0, 1 - (left / totalWait))),
    };
  }

  let currentIdx = -1;
  let nextIdx = -1;

  for (let i = 0; i < prayers.length - 1; i++) {
    const start = prayers[i].date.getTime();
    const end = prayers[i + 1].date.getTime();
    if (currentTime >= start && currentTime < end) {
      currentIdx = i;
      nextIdx = i + 1;
      break;
    }
  }

  if (currentIdx !== -1) {
    const currentPrayer = prayers[currentIdx];
    const nextPrayer = prayers[nextIdx];
    const totalWait = (nextPrayer.date.getTime() - currentPrayer.date.getTime()) / 1000;
    const left = (nextPrayer.date.getTime() - currentTime) / 1000;
    const nextTimeStr = timings[nextPrayer.name];

    return {
      current: currentPrayer.name,
      next: nextPrayer.name,
      nextTime: convert24hTo12h(nextTimeStr),
      secondsLeft: Math.max(0, Math.floor(left)),
      totalWaitSeconds: Math.floor(totalWait),
      progress: Math.min(1, Math.max(0, 1 - (left / totalWait))),
    };
  } else {
    const todayIsha = prayers[prayers.length - 1].date;
    const tomorrowFajr = parseTimeToDate(timings.Fajr, 1);
    const totalWait = (tomorrowFajr.getTime() - todayIsha.getTime()) / 1000;
    const left = (tomorrowFajr.getTime() - currentTime) / 1000;

    return {
      current: 'Isha',
      next: 'Fajr',
      nextTime: convert24hTo12h(timings.Fajr),
      secondsLeft: Math.max(0, Math.floor(left)),
      totalWaitSeconds: Math.floor(totalWait),
      progress: Math.min(1, Math.max(0, 1 - (left / totalWait))),
    };
  }
}

function getTodayDateString(): string {
  const d = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getAdjustedHijriDate(hijri: any, country: string, city: string): string {
  if (!hijri) return 'Loading Date...';

  let day = parseInt(hijri.day, 10);
  let monthNum = parseInt(hijri.month.number, 10);
  let year = parseInt(hijri.year, 10);
  let monthEn = hijri.month.en;

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
    day -= 1;
    if (day === 0) {
      monthNum -= 1;
      if (monthNum === 0) {
        monthNum = 12;
        year -= 1;
      }

      const monthLengths: Record<number, number> = {
        1: 30, 2: 29, 3: 30, 4: 29, 5: 30, 6: 29,
        7: 30, 8: 29, 9: 30, 10: 29, 11: 30, 12: 29
      };
      day = monthLengths[monthNum] || 30;

      const hijriMonthNamesEn: Record<number, string> = {
        1: 'Muharram', 2: 'Safar', 3: "Rabi' al-awwal", 4: "Rabi' ath-thani",
        5: 'Jumada al-ula', 6: 'Jumada al-akhirah', 7: 'Rajab', 8: "Sha'ban",
        9: 'Ramadan', 10: 'Shawwal', 11: "Dhu al-Qi'dah", 12: 'Dhu al-Hijjah'
      };
      monthEn = hijriMonthNamesEn[monthNum] || monthEn;
    }
  }

  const dayStr = day.toString().padStart(2, '0');
  return `${dayStr} ${monthEn} ${year} AH`;
}

