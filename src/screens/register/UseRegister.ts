import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAlert } from '@/context/alert-context';
import { RegisterScreenProps } from '@/types/type';

export const useRegister = ({ onGoToLogin }: RegisterScreenProps) => {
  const { register } = useAuth();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim() || !emailRegex.test(email.trim()))
      errors.email = 'Enter a valid email address';
    if (!password || password.length < 6)
      errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setApiError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      showAlert(
        'Account Created',
        'Your account has been successfully created. Please sign in with your email and password.',
        [{ text: 'OK', onPress: () => onGoToLogin() }]
      );
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    apiError,
    setApiError,
    fieldErrors,
    setFieldErrors,
    handleRegister,
  };
};
