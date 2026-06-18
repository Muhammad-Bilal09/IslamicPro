import { useAlert } from '@/context/alert-context';
import { useAuth } from '@/context/auth-context';
import * as Location from 'expo-location';
import { useState } from 'react';

export const useLocationSetup = () => {
  const { updateLocation, user } = useAuth();
  const { showAlert } = useAlert();

  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [cityError, setCityError] = useState<string | null>(null);

  const handleUseGPS = async () => {
    setGpsError(null);
    setIsGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsError('Location permission denied. Please set your city manually below.');
        setIsGpsLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lng } = position.coords;

      let detectedCity = 'Current Location';
      let detectedCountry = '';

      try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (results.length > 0) {
          detectedCity =
            results[0].city ||
            results[0].subregion ||
            results[0].district ||
            'Current Location';
          detectedCountry = results[0].country || '';
        }
      } catch {
      }

      await updateLocation({
        city: detectedCity,
        country: detectedCountry,
        useGps: true,
        lat,
        lng,
      });
    } catch (err: any) {
      setGpsError(err.message || 'Failed to get location. Please set it manually.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleManualSave = async () => {
    setCityError(null);
    if (!city.trim()) {
      setCityError('City name is required');
      return;
    }

    setIsSavingManual(true);
    try {
      await updateLocation({
        city: city.trim(),
        country: country.trim() || 'Global',
        useGps: false,
      });
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to save location');
    } finally {
      setIsSavingManual(false);
    }
  };

  const isAnyLoading = isGpsLoading || isSavingManual;

  return {
    user,
    isGpsLoading,
    isSavingManual,
    gpsError,
    setGpsError,
    city,
    setCity,
    country,
    setCountry,
    cityError,
    setCityError,
    handleUseGPS,
    handleManualSave,
    isAnyLoading,
  };
};
