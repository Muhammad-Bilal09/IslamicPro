import { Ionicons } from "@expo/vector-icons";

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
    // type: 'MECCAN' | 'MEDINAN';
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
    icon: React.ComponentProps<typeof Ionicons>['name'];
    toggle?: boolean;
    value?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
    detail?: string;
    isLast?: boolean;
}