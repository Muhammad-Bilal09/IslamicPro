import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { LoginScreenProps } from '@/types/type';

export const useLogin = ({ onGoToRegister, onGoToForgotPassword }: LoginScreenProps) => {
  const { login, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !emailRegex.test(email.trim()))
      errors.email = 'Enter a valid email address';
    if (!password || password.length < 6)
      errors.password = 'Password must be at least 6 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setApiError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setApiError(null);
    setIsGuestLoading(true);
    try {
      await continueAsGuest();
    } catch (err: any) {
      setApiError(err.message || 'Failed to continue as guest.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    isGuestLoading,
    apiError,
    setApiError,
    fieldErrors,
    setFieldErrors,
    handleLogin,
    handleContinueAsGuest,
  };
};
