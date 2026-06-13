import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAlert } from '@/context/alert-context';

export const useProfile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { showAlert } = useAlert();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');

  const [isUpdating, setIsUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
  }>({});

  const resetErrorStates = () => {
    setFieldErrors({});
  };

  const openEditModal = () => {
    setName(user?.name ?? '');
    setGender(user?.gender ?? '');
    resetErrorStates();
    setIsEditModalVisible(true);
  };

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validate()) return;
    setIsUpdating(true);
    try {
      await updateProfile(name.trim(), gender);
      setIsEditModalVisible(false);
      showAlert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      showAlert('Error', msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return {
    user,
    isEditModalVisible,
    setIsEditModalVisible,
    name,
    setName,
    gender,
    setGender,
    isUpdating,
    fieldErrors,
    setFieldErrors,
    openEditModal,
    handleUpdateProfile,
    handleLogout,
    initials,
  };
};
