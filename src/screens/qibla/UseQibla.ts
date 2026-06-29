import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

export const useQibla = () => {
  const [city, setCity] = useState('London, UK');
  const [qiblaBearing, setQiblaBearing] = useState(145);
  const [distance, setDistance] = useState(4281);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [heading, setHeading] = useState(0);
  const [headingVector, setHeadingVector] = useState({ x: 0, y: -1 });
  const [hasMagnetometer, setHasMagnetometer] = useState(false);

  const calculateQiblaDirection = (lat: number, lng: number) => {
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;

    const phi1 = (lat * Math.PI) / 180;
    const lambda1 = (lng * Math.PI) / 180;
    const phi2 = (KAABA_LAT * Math.PI) / 180;
    const lambda2 = (KAABA_LNG * Math.PI) / 180;

    const dLng = lambda2 - lambda1;
    const y = Math.sin(dLng);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLng);

    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    const R = 6371;
    const dLat = phi2 - phi1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    setQiblaBearing(Math.round(bearing));
    setDistance(Math.round(dist));
  };

  const getCardinalDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const smoothHeadingUpdate = (headingVal: number) => {
    const rad = (headingVal * Math.PI) / 180;
    const newX = Math.cos(rad);
    const newY = Math.sin(rad);

    setHeadingVector((prev) => {
      const smoothedX = prev.x * 0.85 + newX * 0.15;
      const smoothedY = prev.y * 0.85 + newY * 0.15;
      let smoothedAngle = Math.atan2(smoothedY, smoothedX) * (180 / Math.PI);
      smoothedAngle = (smoothedAngle + 360) % 360;

      setHeading(Math.round(smoothedAngle));
      return { x: smoothedX, y: smoothedY };
    });
  };

  const calibrateLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const storedLat = await AsyncStorage.getItem('prayer_lat');
      const storedLng = await AsyncStorage.getItem('prayer_lng');
      const storedCity = await AsyncStorage.getItem('prayer_city');
      const storedCountry = await AsyncStorage.getItem('prayer_country');

      if (storedLat && storedLng) {
        const lat = parseFloat(storedLat);
        const lng = parseFloat(storedLng);
        const displayName = storedCountry ? `${storedCity}, ${storedCountry}` : `${storedCity}`;
        setCity(displayName);
        calculateQiblaDirection(lat, lng);
        setIsLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Defaulting to London coordinates.');
        setCity('London, UK');
        calculateQiblaDirection(51.5074, -0.1278);
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      let detectedCity = 'Current Location';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          const item = geocode[0];
          detectedCity = item.city || item.subregion || item.district || 'Current Location';
          if (item.country) {
            detectedCity += `, ${item.country}`;
          }
        }
      } catch (geoErr) {
        console.warn('QiblaScreen Reverse geocoding failed:', geoErr);
      }

      setCity(detectedCity);
      calculateQiblaDirection(lat, lng);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to detect location coordinates.');
      setCity('London, UK');
      calculateQiblaDirection(51.5074, -0.1278);
    } finally {
      setIsLoading(false);
    }
  };

  const forceRecalibrate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied.');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      let detectedCity = 'Current Location';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          const item = geocode[0];
          detectedCity = item.city || item.subregion || item.district || 'Current Location';
          if (item.country) {
            detectedCity += `, ${item.country}`;
          }
        }
      } catch (geoErr) {
        console.warn(geoErr);
      }

      setCity(detectedCity);
      calculateQiblaDirection(lat, lng);

      await AsyncStorage.setItem('prayer_city', geocodeCityOnly(detectedCity));
      await AsyncStorage.setItem('prayer_country', geocodeCountryOnly(detectedCity));
      await AsyncStorage.setItem('prayer_lat', lat.toString());
      await AsyncStorage.setItem('prayer_lng', lng.toString());
      await AsyncStorage.setItem('prayer_use_gps', 'true');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to recalibrate GPS coordinates.');
    } finally {
      setIsLoading(false);
    }
  };

  const geocodeCityOnly = (str: string) => str.split(',')[0].trim();
  const geocodeCountryOnly = (str: string) => {
    const parts = str.split(',');
    return parts.length > 1 ? parts[1].trim() : '';
  };

  useEffect(() => {
    calibrateLocation();

    let headingSubscription: any = null;
    let magnetometerSubscription: any = null;

    const startWatchingHeading = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          headingSubscription = await Location.watchHeadingAsync((data) => {
            const headingVal = (typeof data.trueHeading === 'number' && data.trueHeading >= 0)
              ? data.trueHeading
              : data.magHeading;
            smoothHeadingUpdate(headingVal);
            setHasMagnetometer(true);
          });
          return;
        }
      } catch (err) {
        console.warn('QiblaScreen watchHeadingAsync failed, falling back to Magnetometer:', err);
      }

      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (isAvailable) {
          Magnetometer.setUpdateInterval(100);
          magnetometerSubscription = Magnetometer.addListener((data) => {
            let { x, y } = data;

            let angle = Math.atan2(-x, y) * (180 / Math.PI);
            angle = (angle + 360) % 360;

            smoothHeadingUpdate(angle);
            setHasMagnetometer(true);
          });
        } else {
          setHasMagnetometer(false);
        }
      } catch (err) {
        console.warn('QiblaScreen Magnetometer fallback failed:', err);
        setHasMagnetometer(false);
      }
    };

    startWatchingHeading();

    return () => {
      if (headingSubscription) {
        headingSubscription.remove();
      }
      if (magnetometerSubscription) {
        magnetometerSubscription.remove();
      }
    };
  }, []);

  const dialRotation = hasMagnetometer ? `${360 - heading}deg` : '0deg';
  const needleRotation = `${qiblaBearing}deg`;

  const relativeAngle = (qiblaBearing - heading + 360) % 360;
  const isAligned = hasMagnetometer && (relativeAngle <= 6 || relativeAngle >= 354);

  let guidanceText = 'Loading...';
  let guidanceAction: 'left' | 'right' | 'aligned' = 'aligned';

  if (!hasMagnetometer) {
    guidanceText = 'Place phone flat & align Top to North';
    guidanceAction = 'aligned';
  } else if (isAligned) {
    guidanceText = 'You are facing the Qibla! 🕌';
    guidanceAction = 'aligned';
  } else if (relativeAngle > 6 && relativeAngle <= 180) {
    guidanceText = `Turn Right ↻ (${Math.round(relativeAngle)}°)`;
    guidanceAction = 'right';
  } else {
    guidanceText = `Turn Left ↺ (${Math.round(360 - relativeAngle)}°)`;
    guidanceAction = 'left';
  }

  return {
    city,
    qiblaBearing,
    distance,
    isLoading,
    errorMsg,
    heading,
    hasMagnetometer,
    getCardinalDirection,
    forceRecalibrate,
    dialRotation,
    needleRotation,
    isAligned,
    guidanceText,
    guidanceAction,
    relativeAngle,
  };
};
