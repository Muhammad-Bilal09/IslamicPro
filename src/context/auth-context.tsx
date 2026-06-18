import { apiClient } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  gender?: string;
}

export interface UserLocation {
  city: string;
  country: string;
  useGps: boolean;
  lat?: number;
  lng?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  location: UserLocation | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLocation: (locationData: UserLocation) => Promise<void>;
  updateProfile: (name: string, gender: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [
          storedToken,
          storedUserJson,
          storedCity,
          storedCountry,
          storedUseGps,
          storedLat,
          storedLng,
        ] = await AsyncStorage.multiGet([
          'authToken',
          'userData',
          'prayer_city',
          'prayer_country',
          'prayer_use_gps',
          'prayer_lat',
          'prayer_lng',
        ]);

        const city = storedCity[1];
        if (city) {
          setLocation({
            city,
            country: storedCountry[1] || '',
            useGps: storedUseGps[1] === 'true',
            lat: storedLat[1] ? parseFloat(storedLat[1]) : undefined,
            lng: storedLng[1] ? parseFloat(storedLng[1]) : undefined,
          });
        }

        const savedToken = storedToken[1];
        const savedUserJson = storedUserJson[1];

        if (savedToken && savedUserJson) {
          setToken(savedToken);
          setUser(JSON.parse(savedUserJson));

          if (savedToken !== 'guest') {
            try {
              const { data } = await apiClient.get<{ success: boolean; data: UserProfile }>('/auth/profile');
              if (data.success) {
                setUser(data.data);
                await AsyncStorage.setItem('userData', JSON.stringify(data.data));
              }
            } catch {
              await clearSession();
            }
          }
        }
      } catch (err) {
        console.error('[AuthContext] Init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);


  const clearSession = async () => {
    setUser(null);
    setToken(null);
    setLocation(null);
    await AsyncStorage.multiRemove([
      'authToken',
      'userData',
      'prayer_city',
      'prayer_country',
      'prayer_use_gps',
      'prayer_lat',
      'prayer_lng',
    ]);
  };

  const persistSession = async (userProfile: UserProfile, userToken: string) => {
    setUser(userProfile);
    setToken(userToken);
    await AsyncStorage.setItem('authToken', userToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userProfile));
  };


  const register = async (name: string, email: string, password: string) => {
    await apiClient.post('/auth/register', { name, email, password });
  };

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: UserProfile & { token: string };
    }>('/auth/login', { email, password });

    const { token: userToken, ...userProfile } = data.data;
    await persistSession(userProfile, userToken);
  };

  const logout = async () => {
    await clearSession();
  };

  const continueAsGuest = async () => {
    const guestUser: UserProfile = {
      _id: 'guest_id',
      name: 'Guest User',
      email: 'guest@ameen.app',
    };
    setUser(guestUser);
    setToken('guest');
    await AsyncStorage.multiSet([
      ['authToken', 'guest'],
      ['userData', JSON.stringify(guestUser)],
    ]);
  };

  const updateProfile = async (name: string, gender: string) => {
    if (token === 'guest') {
      const updatedUser = { ...user!, name, gender };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      return;
    }

    const { data } = await apiClient.put<{
      success: boolean;
      data: UserProfile;
    }>('/auth/profile', { name, gender });

    setUser(data.data);
    await AsyncStorage.setItem('userData', JSON.stringify(data.data));
  };

  const updateLocation = async (locationData: UserLocation) => {
    const { city, country, useGps, lat, lng } = locationData;

    const pairs: [string, string][] = [
      ['prayer_city', city],
      ['prayer_country', country],
      ['prayer_use_gps', useGps ? 'true' : 'false'],
    ];

    if (lat !== undefined && lng !== undefined) {
      pairs.push(['prayer_lat', lat.toString()]);
      pairs.push(['prayer_lng', lng.toString()]);
    }

    await AsyncStorage.multiSet(pairs);
    setLocation(locationData);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, location, isLoading, register, login, logout, updateLocation, updateProfile, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
