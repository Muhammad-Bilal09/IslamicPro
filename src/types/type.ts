import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type ForgotPasswordScreenProps = {
    onGoToLogin: () => void;
}
export type LoginScreenProps = {
    onGoToRegister: () => void;
    onGoToForgotPassword: () => void;
}

export interface SurahInfo {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
}

export interface UnifiedAyah {
    number: number;
    numberInSurah: number;
    text: string;
    translation: string;
    audio: string;
    surah: SurahInfo;
}
export type DayItem = {
    dayName: string;
    dayNum: number;
}

export type Surah = {
    number: number;
    englishName: string;
    arabicName: string;
    ayahCount: number;
    englishNameTranslation: string;
}

export type Para = {
    number: number;
    name: string;
    arabicName: string;
    startSurah: number;
    startAyah: number;
}

export type RegisterScreenProps = {
    onGoToLogin: () => void;
}

export type RowProps = {
    label: string;
    icon: IconName;
    toggle?: boolean;
    value?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
    detail?: string;
    isLast?: boolean;
}


export type ProfileStatItem = {
    label: string;
    value: string;
    color: string;
};

export type ProfileActivityItem = {
    icon: IconName;
    text: string;
    time: string;
};

export type MoreDuaItem = {
    id: string;
    title: string;
    sub: string;
    icon: IconName;
    iconColor: string;
    iconBg: string;
    isWide?: boolean;
};

export type HomeQuickActionItem = {
    title: string;
    subtitle: string;
    icon: IconName;
    iconColor: string;
    bgColor: string;
    route: string;
};

export type HomeJourneyItem = {
    title: string;
    subtitle: string;
    progressValue: string;
    type: 'progress' | 'count';
    route?: string;
};

export type PrayerTimeConfigItem = {
    name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
    type: 'MANDATORY' | 'NON-OBLIGATORY';
    iconName: IconName;
};

export type CountdownItem = {
    value: number;
    label: 'DAYS' | 'HRS' | 'MINS' | 'SECS';
};



export type PrayerTimings = {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export type CalendarDayData = {
    timings: PrayerTimings;
    date: {
        readable: string;
        timestamp: string;
        gregorian: {
            date: string;
            day: string;
            month: { number: number; en: string };
            year: string;
        };
        hijri: {
            day: string;
            month: { en: string; ar: string };
            year: string;
        };
    };
}

export type PrayerData = {
    timings: PrayerTimings;
    date: {
        readable: string;
        hijri: {
            day: string;
            month: { en: string; ar: string };
            year: string;
            designation: { abbreviated: string };
        };
        gregorian: {
            weekday: { en: string };
        };
    };
    meta: {
        timezone: string;
        method: { name: string };
    };
}

export type CurrentAndNextPrayer = {
    current: string;
    next: string;
    nextTime: string;
    secondsLeft: number;
    totalWaitSeconds: number;
    progress: number;
}
