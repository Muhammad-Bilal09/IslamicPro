import React, { createContext, useContext, useState } from 'react';
import { Modal, StyleSheet, View, Pressable, Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setConfig({ title, message, buttons });
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const handleButtonPress = (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      // Delay execution slightly to allow modal closing animation to complete smoothly
      setTimeout(() => {
        btn.onPress?.();
      }, 100);
    }
  };

  const buttons = config?.buttons || [{ text: 'OK' }];
  const isRowLayout = buttons.length === 2;

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.overlay}>
          <View style={[styles.alertBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <ThemedText style={styles.title} themeColor="text">
              {config?.title}
            </ThemedText>
            {config?.message && (
              <ThemedText style={styles.message} themeColor="textSecondary">
                {config.message}
              </ThemedText>
            )}
            <View style={[styles.buttonContainer, isRowLayout && styles.buttonContainerRow]}>
              {buttons.map((btn, idx) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                let btnColor: string = theme.primary;
                if (isDestructive) btnColor = '#DC2626';
                if (isCancel) btnColor = theme.textSecondary;

                return (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [
                      styles.button,
                      { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                      isRowLayout && styles.buttonFlex,
                    ]}
                    onPress={() => handleButtonPress(btn)}
                  >
                    <Text style={[styles.buttonText, { color: btnColor }]}>
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  buttonContainerRow: {
    flexDirection: 'row',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
