import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Share } from 'react-native';

export type NisabStandard = 'gold' | 'silver';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  defaultGoldPricePerGram: number;
  defaultSilverPricePerGram: number;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', defaultGoldPricePerGram: 23500, defaultSilverPricePerGram: 290 },
  { code: 'USD', symbol: '$', name: 'US Dollar', defaultGoldPricePerGram: 85, defaultSilverPricePerGram: 1.05 },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', defaultGoldPricePerGram: 319, defaultSilverPricePerGram: 3.94 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', defaultGoldPricePerGram: 312, defaultSilverPricePerGram: 3.86 },
  { code: 'EUR', symbol: '€', name: 'Euro', defaultGoldPricePerGram: 78, defaultSilverPricePerGram: 0.96 },
  { code: 'GBP', symbol: '£', name: 'British Pound', defaultGoldPricePerGram: 67, defaultSilverPricePerGram: 0.83 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', defaultGoldPricePerGram: 7100, defaultSilverPricePerGram: 88 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', defaultGoldPricePerGram: 10200, defaultSilverPricePerGram: 126 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', defaultGoldPricePerGram: 375, defaultSilverPricePerGram: 4.6 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', defaultGoldPricePerGram: 115, defaultSilverPricePerGram: 1.42 },
];

export const GOLD_NISAB_GRAMS = 87.48; 
export const SILVER_NISAB_GRAMS = 612.36; 

const STORAGE_KEY = 'zakat_calculator_state_v2';

export function useZakat() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(CURRENCY_OPTIONS[0]); // Default to PKR
  const [nisabStandard, setNisabStandard] = useState<NisabStandard>('gold'); 
  const [goldPricePerGram, setGoldPricePerGram] = useState<string>('');
  const [silverPricePerGram, setSilverPricePerGram] = useState<string>('');

  const [cashInHand, setCashInHand] = useState<string>('');
  const [cashInBank, setCashInBank] = useState<string>('');

  const [goldValueInput, setGoldValueInput] = useState<string>('');
  const [goldGrams, setGoldGrams] = useState<string>('');
  const [silverValueInput, setSilverValueInput] = useState<string>('');
  const [silverGrams, setSilverGrams] = useState<string>('');

  const [investments, setInvestments] = useState<string>('');
  const [businessGoods, setBusinessGoods] = useState<string>('');
  const [moneyOwed, setMoneyOwed] = useState<string>('');

  const [immediateDebts, setImmediateDebts] = useState<string>('');
  const [pendingBills, setPendingBills] = useState<string>('');
  const [otherLiabilities, setOtherLiabilities] = useState<string>('');

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSavedState() {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.currencyCode) {
            const foundCurr = CURRENCY_OPTIONS.find((c) => c.code === parsed.currencyCode);
            if (foundCurr) setSelectedCurrency(foundCurr);
          }
          if (parsed.nisabStandard) setNisabStandard(parsed.nisabStandard);
          if (parsed.goldPricePerGram !== undefined) setGoldPricePerGram(String(parsed.goldPricePerGram));
          if (parsed.silverPricePerGram !== undefined) setSilverPricePerGram(String(parsed.silverPricePerGram));
          if (parsed.cashInHand !== undefined) setCashInHand(parsed.cashInHand);
          if (parsed.cashInBank !== undefined) setCashInBank(parsed.cashInBank);
          if (parsed.goldValueInput !== undefined) setGoldValueInput(parsed.goldValueInput);
          if (parsed.goldGrams !== undefined) setGoldGrams(parsed.goldGrams);
          if (parsed.silverValueInput !== undefined) setSilverValueInput(parsed.silverValueInput);
          if (parsed.silverGrams !== undefined) setSilverGrams(parsed.silverGrams);
          if (parsed.investments !== undefined) setInvestments(parsed.investments);
          if (parsed.businessGoods !== undefined) setBusinessGoods(parsed.businessGoods);
          if (parsed.moneyOwed !== undefined) setMoneyOwed(parsed.moneyOwed);
          if (parsed.immediateDebts !== undefined) setImmediateDebts(parsed.immediateDebts);
          if (parsed.pendingBills !== undefined) setPendingBills(parsed.pendingBills);
          if (parsed.otherLiabilities !== undefined) setOtherLiabilities(parsed.otherLiabilities);
        }
      } catch (err) {
        console.error('[UseZakat] Error loading saved state:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadSavedState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    async function saveState() {
      try {
        const payload = {
          currencyCode: selectedCurrency.code,
          nisabStandard,
          goldPricePerGram,
          silverPricePerGram,
          cashInHand,
          cashInBank,
          goldValueInput,
          goldGrams,
          silverValueInput,
          silverGrams,
          investments,
          businessGoods,
          moneyOwed,
          immediateDebts,
          pendingBills,
          otherLiabilities,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.error('[UseZakat] Error saving state:', err);
      }
    }
    saveState();
  }, [
    isLoaded,
    selectedCurrency,
    nisabStandard,
    goldPricePerGram,
    silverPricePerGram,
    cashInHand,
    cashInBank,
    goldValueInput,
    goldGrams,
    silverValueInput,
    silverGrams,
    investments,
    businessGoods,
    moneyOwed,
    immediateDebts,
    pendingBills,
    otherLiabilities,
  ]);

  const handleCurrencyChange = (currency: CurrencyOption) => {
    setSelectedCurrency(currency);
  };

  const fillMarketRates = () => {
    setGoldPricePerGram(String(selectedCurrency.defaultGoldPricePerGram));
    setSilverPricePerGram(String(selectedCurrency.defaultSilverPricePerGram));
  };

  const parseNum = (val: string): number => {
    if (!val) return 0;
    const arabicUrduMap: { [key: string]: string } = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    };
    let normalized = val.replace(/[۰-۹٠-٩]/g, (w) => arabicUrduMap[w] || w);
    const cleaned = normalized.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const cashInHandVal = parseNum(cashInHand);
  const cashInBankVal = parseNum(cashInBank);
  const totalCash = cashInHandVal + cashInBankVal;

  const goldPriceVal = parseNum(goldPricePerGram);
  const silverPriceVal = parseNum(silverPricePerGram);
  const goldRateForNisab = goldPriceVal > 0 ? goldPriceVal : selectedCurrency.defaultGoldPricePerGram;
  const silverRateForNisab = silverPriceVal > 0 ? silverPriceVal : selectedCurrency.defaultSilverPricePerGram;

  const goldGramsVal = parseNum(goldGrams);
  const silverGramsVal = parseNum(silverGrams);

  const directGoldValue = parseNum(goldValueInput);
  const directSilverValue = parseNum(silverValueInput);

  const goldValue = directGoldValue > 0 ? directGoldValue : goldGramsVal * goldRateForNisab;
  const silverValue = directSilverValue > 0 ? directSilverValue : silverGramsVal * silverRateForNisab;

  const investmentsVal = parseNum(investments);
  const businessGoodsVal = parseNum(businessGoods);
  const moneyOwedVal = parseNum(moneyOwed);

  const totalAssets = totalCash + goldValue + silverValue + investmentsVal + businessGoodsVal + moneyOwedVal;

  const immediateDebtsVal = parseNum(immediateDebts);
  const pendingBillsVal = parseNum(pendingBills);
  const otherLiabilitiesVal = parseNum(otherLiabilities);

  const totalLiabilities = immediateDebtsVal + pendingBillsVal + otherLiabilitiesVal;

  const netZakatableWealth = Math.max(0, totalAssets - totalLiabilities);

  const nisabThreshold = nisabStandard === 'gold'
    ? GOLD_NISAB_GRAMS * goldRateForNisab
    : SILVER_NISAB_GRAMS * silverRateForNisab;

  const isAboveNisab = netZakatableWealth >= nisabThreshold && netZakatableWealth > 0;
  const calculatedZakat = netZakatableWealth > 0 ? netZakatableWealth * 0.025 : 0;
  const zakatDue = calculatedZakat;

  const resetAllFields = () => {
    Alert.alert(
      'Reset Calculator',
      'Are you sure you want to clear all entered values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setGoldPricePerGram('');
            setSilverPricePerGram('');
            setCashInHand('');
            setCashInBank('');
            setGoldValueInput('');
            setGoldGrams('');
            setSilverValueInput('');
            setSilverGrams('');
            setInvestments('');
            setBusinessGoods('');
            setMoneyOwed('');
            setImmediateDebts('');
            setPendingBills('');
            setOtherLiabilities('');
          },
        },
      ]
    );
  };

  const formatMoney = (amount: number): string => {
    const val = isNaN(amount) ? 0 : amount;
    const parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${selectedCurrency.symbol} ${parts.join('.')}`;
  };

  const shareSummary = async () => {
    try {
      const summaryText = `*My Zakat Calculation Summary*\n` +
        `Currency: ${selectedCurrency.code} (${selectedCurrency.symbol})\n` +
        `Nisab Standard: ${nisabStandard.toUpperCase()} (${formatMoney(nisabThreshold)})\n\n` +
        `• Total Assets: ${formatMoney(totalAssets)}\n` +
        `• Total Liabilities: ${formatMoney(totalLiabilities)}\n` +
        `• Net Zakatable Wealth: ${formatMoney(netZakatableWealth)}\n` +
        `----------------------------------------\n` +
        `*Zakat Payable (2.5%): ${formatMoney(zakatDue)}*\n\n` +
        `Calculated using IslamicPro App`;

      await Share.share({
        message: summaryText,
      });
    } catch (err) {
      console.error('[UseZakat] Error sharing summary:', err);
    }
  };

  return {
    activeStep,
    setActiveStep,
    selectedCurrency,
    setSelectedCurrency: handleCurrencyChange,
    nisabStandard,
    setNisabStandard,
    goldPricePerGram,
    setGoldPricePerGram,
    silverPricePerGram,
    setSilverPricePerGram,
    fillMarketRates,
    cashInHand,
    setCashInHand,
    cashInBank,
    setCashInBank,
    totalCash,
    goldValueInput,
    setGoldValueInput,
    goldGrams,
    setGoldGrams,
    silverValueInput,
    setSilverValueInput,
    silverGrams,
    setSilverGrams,
    goldValue,
    silverValue,
    investments,
    setInvestments,
    businessGoods,
    setBusinessGoods,
    moneyOwed,
    setMoneyOwed,
    immediateDebts,
    setImmediateDebts,
    pendingBills,
    setPendingBills,
    otherLiabilities,
    setOtherLiabilities,
    totalAssets,
    totalLiabilities,
    netZakatableWealth,
    nisabThreshold,
    isAboveNisab,
    zakatDue,
    resetAllFields,
    formatMoney,
    shareSummary,
  };
}
