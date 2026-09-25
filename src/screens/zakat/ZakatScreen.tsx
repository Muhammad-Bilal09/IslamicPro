import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '@/components/card';
import Header from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import {
  CURRENCY_OPTIONS,
  GOLD_NISAB_GRAMS,
  SILVER_NISAB_GRAMS,
  useZakat
} from './UseZakat';
import { styles } from './ZakatStyle';

export function ZakatScreen() {
  const theme = useTheme();
  const zakat = useZakat();

  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [isRatesExpanded, setIsRatesExpanded] = useState(false);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <Header title="Amin" showAvatar={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.titleText}>Zakat Calculator</ThemedText>
          <ThemedText style={[styles.subtitleText, { color: theme.textSecondary }]}>
            Calculate your Zakat accurately and fulfill your obligation.
          </ThemedText>
        </View>

        <View style={styles.stepperContainer}>
          <Pressable style={styles.stepItem} onPress={() => zakat.setActiveStep(1)}>
            <View style={styles.stepCircleRow}>
              <View
                style={[
                  styles.stepCircle,
                  zakat.activeStep === 1 && styles.stepCircleActive,
                  zakat.activeStep > 1 && styles.stepCircleCompleted,
                ]}
              >
                {zakat.activeStep > 1 ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <ThemedText
                    style={[
                      styles.stepNumberText,
                      zakat.activeStep === 1 && styles.stepNumberTextActive,
                    ]}
                  >
                    1
                  </ThemedText>
                )}
              </View>
            </View>
            <ThemedText
              style={[
                styles.stepTitleText,
                zakat.activeStep === 1 && styles.stepTitleTextActive,
              ]}
            >
              Assets
            </ThemedText>
          </Pressable>

          <View
            style={[
              styles.stepLineContainer,
              zakat.activeStep >= 2 && styles.stepLineActive,
            ]}
          />

          <Pressable style={styles.stepItem} onPress={() => zakat.setActiveStep(2)}>
            <View style={styles.stepCircleRow}>
              <View
                style={[
                  styles.stepCircle,
                  zakat.activeStep === 2 && styles.stepCircleActive,
                  zakat.activeStep > 2 && styles.stepCircleCompleted,
                ]}
              >
                {zakat.activeStep > 2 ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <ThemedText
                    style={[
                      styles.stepNumberText,
                      zakat.activeStep === 2 && styles.stepNumberTextActive,
                    ]}
                  >
                    2
                  </ThemedText>
                )}
              </View>
            </View>
            <ThemedText
              style={[
                styles.stepTitleText,
                zakat.activeStep === 2 && styles.stepTitleTextActive,
              ]}
            >
              Liabilities
            </ThemedText>
          </Pressable>

          <View
            style={[
              styles.stepLineContainer,
              zakat.activeStep === 3 && styles.stepLineActive,
            ]}
          />

          <Pressable style={styles.stepItem} onPress={() => zakat.setActiveStep(3)}>
            <View style={styles.stepCircleRow}>
              <View
                style={[
                  styles.stepCircle,
                  zakat.activeStep === 3 && styles.stepCircleActive,
                ]}
              >
                <ThemedText
                  style={[
                    styles.stepNumberText,
                    zakat.activeStep === 3 && styles.stepNumberTextActive,
                  ]}
                >
                  3
                </ThemedText>
              </View>
            </View>
            <ThemedText
              style={[
                styles.stepTitleText,
                zakat.activeStep === 3 && styles.stepTitleTextActive,
              ]}
            >
              Summary
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.topControlsRow}>
          <Pressable
            onPress={() => setIsCurrencyModalVisible(true)}
            style={[
              styles.currencyBtn,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
          >
            <ThemedText style={[styles.currencyBtnText, { color: theme.text }]}>
              {zakat.selectedCurrency.code} ({zakat.selectedCurrency.symbol})
            </ThemedText>
            <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
          </Pressable>
        </View>

        {zakat.activeStep === 1 && (
          <View>
            <Card
              variant="outlined"
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="wallet-outline" size={22} color="#10B981" />
                </View>
                <View>
                  <ThemedText style={styles.cardTitle}>Cash & Savings</ThemedText>
                  <ThemedText style={styles.cardSubtitle} themeColor="textSecondary">
                    Cash in hand, bank deposits & savings accounts
                  </ThemedText>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Cash in Hand
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.cashInHand}
                    onChangeText={zakat.setCashInHand}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Cash in Bank Accounts
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.cashInBank}
                    onChangeText={zakat.setCashInBank}
                  />
                </View>
              </View>
            </Card>

            <Card
              variant="outlined"
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="diamond-outline" size={22} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.cardTitle}>Gold & Silver</ThemedText>
                  <ThemedText style={styles.cardSubtitle} themeColor="textSecondary">
                    Enter value directly or calculate by weight
                  </ThemedText>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Gold Value
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.goldValueInput}
                    onChangeText={zakat.setGoldValueInput}
                  />
                </View>
                {!zakat.goldValueInput && (
                  <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>
                      Or Grams:
                    </ThemedText>
                    <TextInput
                      style={{
                        height: 32,
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 6,
                        paddingTop: 4,
                        paddingHorizontal: 8,
                        fontSize: 12,
                        color: theme.text,
                        width: 80,
                        backgroundColor: theme.background,
                      }}
                      keyboardType="numeric"
                      placeholder="0.0 g"
                      placeholderTextColor={theme.textSecondary}
                      value={zakat.goldGrams}
                      onChangeText={zakat.setGoldGrams}
                    />
                    {zakat.goldValue > 0 && (
                      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                        = {zakat.formatMoney(zakat.goldValue)}
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Silver Value
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.silverValueInput}
                    onChangeText={zakat.setSilverValueInput}
                  />
                </View>
                {!zakat.silverValueInput && (
                  <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>
                      Or Grams:
                    </ThemedText>
                    <TextInput
                      style={{
                        height: 32,
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 6,
                        paddingTop: 4,
                        paddingHorizontal: 8,
                        fontSize: 12,
                        color: theme.text,
                        width: 80,
                        backgroundColor: theme.background,
                      }}
                      keyboardType="numeric"
                      placeholder="0.0 g"
                      placeholderTextColor={theme.textSecondary}
                      value={zakat.silverGrams}
                      onChangeText={zakat.setSilverGrams}
                    />
                    {zakat.silverValue > 0 && (
                      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                        = {zakat.formatMoney(zakat.silverValue)}
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            </Card>

            <Card
              variant="outlined"
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="trending-up-outline" size={22} color="#0284C7" />
                </View>
                <View>
                  <ThemedText style={styles.cardTitle}>Investments & Merchandise</ThemedText>
                  <ThemedText style={styles.cardSubtitle} themeColor="textSecondary">
                    Stocks, business inventory & money owed to you
                  </ThemedText>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Stocks & Investments
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.investments}
                    onChangeText={zakat.setInvestments}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Business Merchandise / Inventory
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.businessGoods}
                    onChangeText={zakat.setBusinessGoods}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Money Owed to You (Receivables)
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.moneyOwed}
                    onChangeText={zakat.setMoneyOwed}
                  />
                </View>
              </View>
            </Card>

            <View style={styles.stepNavRow}>
              <Pressable
                style={styles.primaryPillBtn}
                onPress={() => zakat.setActiveStep(2)}
              >
                <ThemedText style={styles.primaryPillBtnText}>
                  Next: Liabilities
                </ThemedText>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            <Card
              variant="elevated"
              style={[
                styles.liveSummaryCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <ThemedText style={[styles.liveSummaryTitle, { color: theme.textSecondary }]}>
                Live Summary
              </ThemedText>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Assets
                </ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {zakat.formatMoney(zakat.totalAssets)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Liabilities
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#EF4444' }]}>
                  -{zakat.formatMoney(zakat.totalLiabilities)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Net Zakatable
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.text }]}>
                  {zakat.formatMoney(zakat.netZakatableWealth)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Nisab Threshold ({zakat.nisabStandard === 'gold' ? 'Gold' : 'Silver'})
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.textSecondary }]}>
                  {zakat.formatMoney(zakat.nisabThreshold)}
                </ThemedText>
              </View>

              <View style={[styles.zakatHighlightBox, { backgroundColor: '#ECFDF5' }]}>
                <ThemedText style={[styles.zakatDueLabel, { color: '#047857' }]}>
                  ZAKAT DUE (2.5%)
                </ThemedText>
                <ThemedText style={[styles.zakatDueAmount, { color: '#065F46' }]}>
                  {zakat.formatMoney(zakat.zakatDue)}
                </ThemedText>
              </View>

              <View style={{ marginTop: Spacing.three }}>
                <Pressable
                  style={styles.primaryPillBtn}
                  onPress={() => zakat.setActiveStep(3)}
                >
                  <ThemedText style={styles.primaryPillBtnText}>
                    Proceed to Summary
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </Card>
          </View>
        )}

        {zakat.activeStep === 2 && (
          <View>
            <Card
              variant="outlined"
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="card-outline" size={22} color="#EF4444" />
                </View>
                <View>
                  <ThemedText style={styles.cardTitle}>Immediate Debts & Liabilities</ThemedText>
                  <ThemedText style={styles.cardSubtitle} themeColor="textSecondary">
                    Loans or bills due immediately or within current Hawl
                  </ThemedText>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Immediate Debts & Loans Owed
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: '#EF4444' }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.immediateDebts}
                    onChangeText={zakat.setImmediateDebts}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Unpaid Utility Bills & Household Expenses
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: '#EF4444' }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.pendingBills}
                    onChangeText={zakat.setPendingBills}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
                  Other Short-term Liabilities
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: '#EF4444' }]}>
                    {zakat.selectedCurrency.symbol}
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    value={zakat.otherLiabilities}
                    onChangeText={zakat.setOtherLiabilities}
                  />
                </View>
              </View>
            </Card>

            <View style={styles.stepNavRow}>
              <Pressable
                style={[styles.secondaryPillBtn, { borderColor: theme.border }]}
                onPress={() => zakat.setActiveStep(1)}
              >
                <Ionicons name="arrow-back" size={18} color={theme.text} />
                <ThemedText style={[styles.secondaryPillBtnText, { color: theme.text }]}>
                  Back: Assets
                </ThemedText>
              </Pressable>

              <Pressable
                style={styles.primaryPillBtn}
                onPress={() => zakat.setActiveStep(3)}
              >
                <ThemedText style={styles.primaryPillBtnText}>
                  Next: Summary
                </ThemedText>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            <Card
              variant="elevated"
              style={[
                styles.liveSummaryCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <ThemedText style={[styles.liveSummaryTitle, { color: theme.textSecondary }]}>
                Live Summary
              </ThemedText>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Assets
                </ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {zakat.formatMoney(zakat.totalAssets)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Liabilities
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#EF4444' }]}>
                  -{zakat.formatMoney(zakat.totalLiabilities)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Net Zakatable
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.text }]}>
                  {zakat.formatMoney(zakat.netZakatableWealth)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Nisab Threshold ({zakat.nisabStandard === 'gold' ? 'Gold' : 'Silver'})
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.textSecondary }]}>
                  {zakat.formatMoney(zakat.nisabThreshold)}
                </ThemedText>
              </View>

              <View style={[styles.zakatHighlightBox, { backgroundColor: '#ECFDF5' }]}>
                <ThemedText style={[styles.zakatDueLabel, { color: '#047857' }]}>
                  ZAKAT DUE (2.5%)
                </ThemedText>
                <ThemedText style={[styles.zakatDueAmount, { color: '#065F46' }]}>
                  {zakat.formatMoney(zakat.zakatDue)}
                </ThemedText>
              </View>

              <View style={{ marginTop: Spacing.three }}>
                <Pressable
                  style={styles.primaryPillBtn}
                  onPress={() => zakat.setActiveStep(3)}
                >
                  <ThemedText style={styles.primaryPillBtnText}>
                    Proceed to Summary
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </Card>
          </View>
        )}

        {zakat.activeStep === 3 && (
          <View>
            <Card
              variant="outlined"
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <View style={styles.nisabToggleContainer}>
                <ThemedText style={[styles.nisabLabel, { color: theme.textSecondary }]}>
                  Nisab Threshold Standard
                </ThemedText>
                <View
                  style={[
                    styles.nisabSegmentRow,
                    { backgroundColor: theme.backgroundElement },
                  ]}
                >
                  <Pressable
                    onPress={() => zakat.setNisabStandard('gold')}
                    style={[
                      styles.segmentBtn,
                      zakat.nisabStandard === 'gold' && {
                        backgroundColor: theme.primary,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.segmentText,
                        {
                          color:
                            zakat.nisabStandard === 'gold'
                              ? theme.textOnPrimary
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      Gold ({GOLD_NISAB_GRAMS}g)
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    onPress={() => zakat.setNisabStandard('silver')}
                    style={[
                      styles.segmentBtn,
                      zakat.nisabStandard === 'silver' && {
                        backgroundColor: theme.primary,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.segmentText,
                        {
                          color:
                            zakat.nisabStandard === 'silver'
                              ? theme.textOnPrimary
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      Silver ({SILVER_NISAB_GRAMS}g)
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </Card>

            <Card
              variant="elevated"
              style={[
                styles.liveSummaryCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three }}>
                <ThemedText style={{ fontSize: 18, fontWeight: '800' }}>
                  Zakat Summary
                </ThemedText>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: zakat.isAboveNisab
                        ? '#ECFDF5'
                        : '#F1F5F9',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statusBadgeText,
                      { color: zakat.isAboveNisab ? '#10B981' : theme.textSecondary },
                    ]}
                  >
                    {zakat.isAboveNisab ? 'ABOVE NISAB' : 'BELOW NISAB'}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Cash & Savings Total
                </ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {zakat.formatMoney(zakat.totalCash)}
                </ThemedText>
              </View>

              {(zakat.goldValue > 0) && (
                <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Gold Value
                  </ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {zakat.formatMoney(zakat.goldValue)}
                  </ThemedText>
                </View>
              )}

              {(zakat.silverValue > 0) && (
                <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Silver Value
                  </ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {zakat.formatMoney(zakat.silverValue)}
                  </ThemedText>
                </View>
              )}

              <View style={[styles.summaryRow, { borderBottomColor: theme.border, paddingTop: 10 }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.text, fontWeight: '700' }]}>
                  Total Zakatable Assets
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { fontWeight: '800', color: theme.primary }]}>
                  {zakat.formatMoney(zakat.totalAssets)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Deductible Liabilities (-)
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#EF4444' }]}>
                  -{zakat.formatMoney(zakat.totalLiabilities)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border, paddingTop: 10 }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.text, fontWeight: '800', fontSize: 15 }]}>
                  Net Zakatable Wealth
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.primary, fontWeight: '800', fontSize: 15 }]}>
                  {zakat.formatMoney(zakat.netZakatableWealth)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Nisab Threshold ({zakat.nisabStandard.toUpperCase()})
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.textSecondary }]}>
                  {zakat.formatMoney(zakat.nisabThreshold)}
                </ThemedText>
              </View>

              <View style={[styles.zakatHighlightBox, { backgroundColor: '#094C3A', paddingVertical: Spacing.four }]}>
                <ThemedText style={[styles.zakatDueLabel, { color: '#E6F4EA' }]}>
                  NET ZAKAT PAYABLE (2.5%)
                </ThemedText>
                <ThemedText style={[styles.zakatDueAmount, { color: '#FFFFFF' }]}>
                  {zakat.formatMoney(zakat.zakatDue)}
                </ThemedText>
                <ThemedText style={{ fontSize: 11, color: '#E6F4EA', textAlign: 'center', marginTop: 4 }}>
                  {zakat.isAboveNisab
                    ? 'Zakat is obligatory on your net wealth'
                    : `Net wealth is below the Nisab limit of ${zakat.formatMoney(zakat.nisabThreshold)}. Calculated 2.5% amount is shown.`}
                </ThemedText>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={zakat.shareSummary}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                  ]}
                >
                  <Ionicons name="share-social-outline" size={18} color={theme.primary} />
                  <ThemedText style={[styles.actionBtnText, { color: theme.primary }]}>
                    Share Summary
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={zakat.resetAllFields}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}
                >
                  <Ionicons name="refresh" size={16} color={theme.text} />
                  <ThemedText style={[styles.actionBtnText, { color: theme.text }]}>
                    Reset
                  </ThemedText>
                </Pressable>
              </View>

              <View style={{ marginTop: Spacing.two }}>
                <Pressable
                  style={[styles.secondaryPillBtn, { borderColor: theme.border }]}
                  onPress={() => zakat.setActiveStep(1)}
                >
                  <Ionicons name="pencil" size={16} color={theme.text} />
                  <ThemedText style={[styles.secondaryPillBtnText, { color: theme.text }]}>
                    Edit Asset / Liability Inputs
                  </ThemedText>
                </Pressable>
              </View>
            </Card>
          </View>
        )}

        <Card
          variant="outlined"
          style={[
            styles.guideCard,
            { backgroundColor: theme.cardBackground, borderColor: theme.border },
          ]}
        >
          <Pressable
            onPress={() => setIsGuideExpanded(!isGuideExpanded)}
            style={styles.guideHeader}
          >
            <View style={styles.guideTitleRow}>
              <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
              <ThemedText style={styles.guideTitle}>Zakat Guidelines & Rules</ThemedText>
            </View>
            <Ionicons
              name={isGuideExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>

          {isGuideExpanded && (
            <View style={[styles.guideContent, { borderTopColor: theme.border }]}>
              <ThemedText style={[styles.guideText, { color: theme.textSecondary }]}>
                • <ThemedText style={{ fontWeight: '700', color: theme.text }}>Hawl (1 Lunar Year):</ThemedText> Zakat is obligatory when your net zakatable wealth remains at or above the Nisab threshold for a full lunar year (354 days).
              </ThemedText>

              <ThemedText style={[styles.guideText, { color: theme.textSecondary }]}>
                • <ThemedText style={{ fontWeight: '700', color: theme.text }}>Rate of Zakat:</ThemedText> The mandatory rate is 2.5% (1/40th) of your total net zakatable assets after deducting immediate liabilities.
              </ThemedText>

              <ThemedText style={[styles.guideText, { color: theme.textSecondary }]}>
                • <ThemedText style={{ fontWeight: '700', color: theme.text }}>Gold & Silver Nisab:</ThemedText> Gold Nisab is 87.48 grams (~7.5 Tolas) and Silver Nisab is 612.36 grams (~52.5 Tolas).
              </ThemedText>

              <ThemedText style={[styles.guideText, { color: theme.textSecondary }]}>
                • <ThemedText style={{ fontWeight: '700', color: theme.text }}>Personal Exemption:</ThemedText> Your primary residence, daily clothing, vehicle, and personal tools are exempt from Zakat.
              </ThemedText>
            </View>
          )}
        </Card>
      </ScrollView>

      <Modal
        visible={isCurrencyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCurrencyModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCurrencyModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Currency</ThemedText>
              <Pressable onPress={() => setIsCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <FlatList
              data={CURRENCY_OPTIONS}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isSelected = item.code === zakat.selectedCurrency.code;
                return (
                  <Pressable
                    onPress={() => {
                      zakat.setSelectedCurrency(item);
                      setIsCurrencyModalVisible(false);
                    }}
                    style={[
                      styles.currencyOption,
                      isSelected && { backgroundColor: theme.primaryLight },
                    ]}
                  >
                    <View>
                      <ThemedText
                        style={[
                          styles.currencyOptionText,
                          { color: isSelected ? theme.primary : theme.text },
                        ]}
                      >
                        {item.code} - {item.name} ({item.symbol})
                      </ThemedText>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

export default ZakatScreen;
