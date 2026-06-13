import { useAlert } from '@/context/alert-context';
import { ForgotPasswordScreenProps } from '@/types/type';
import { apiClient } from '@/utils/api';
import { useState } from 'react';

type ForgotStep = 'send-otp' | 'verify-otp' | 'reset-password';

export const useForgotPassword = ({
    onGoToLogin,
}: ForgotPasswordScreenProps) => {
    const { showAlert } = useAlert();

    const [step, setStep] = useState<ForgotStep>('send-otp');

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [apiError, setApiError] = useState<string | null>(null);

    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        otp?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const resetErrorStates = () => {
        setApiError(null);
        setFieldErrors({});
    };

    const handleSendOtp = async () => {
        resetErrorStates();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim() || !emailRegex.test(email.trim())) {
            setFieldErrors({
                email: 'Enter a valid email address',
            });
            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/forgot-password', {
                email: email.trim().toLowerCase(),
            });

            showAlert(
                'OTP Sent',
                'A 6-digit verification code has been sent to your email address.',
                [{ text: 'OK' }]
            );

            setStep('verify-otp');
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Failed to send OTP. Please try again.';

            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        resetErrorStates();

        if (!otp || otp.trim().length !== 6) {
            setFieldErrors({
                otp: 'Enter the 6-digit verification code',
            });

            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/verify-otp', {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
            });

            setStep('reset-password');
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Verification failed. Please try again.';

            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        resetErrorStates();

        const errors: typeof fieldErrors = {};

        if (!password || password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/reset-password', {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
                password,
            });

            showAlert(
                'Success',
                'Your password has been successfully reset. Please log in with your new credentials.',
                [
                    {
                        text: 'Log In Now',
                        onPress: () => onGoToLogin(),
                    },
                ]
            );
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Password reset failed. Please try again.';

            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        step,
        setStep,

        email,
        setEmail,

        otp,
        setOtp,

        password,
        setPassword,

        confirmPassword,
        setConfirmPassword,

        isLoading,
        apiError,
        fieldErrors,

        resetErrorStates,

        handleSendOtp,
        handleVerifyOtp,
        handleResetPassword,
    };
};