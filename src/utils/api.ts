import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// const BASE_URL = "http://192.168.0.180:5000/api";
const BASE_URL = "https://islamic-pro-server.vercel.app/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let _onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  _onSessionExpired = handler;
};

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["authToken", "userData"]);
      if (_onSessionExpired) {
        _onSessionExpired();
      }
    }
    return Promise.reject(error);
  },
);

// Quran API Client (alquran.cloud)
export const quranApi = axios.create({
  baseURL: "https://api.alquran.cloud/v1",
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

quranApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      "Failed to connect to the Quran service. Please check your internet connection.";
    return Promise.reject(new Error(errorMsg));
  },
);

// Prayer Times API Client (aladhan.com)
export const aladhanApi = axios.create({
  baseURL: "https://api.aladhan.com/v1",
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

aladhanApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.data ||
      error.response?.data?.message ||
      "Failed to fetch prayer timings. Please check your network connection.";
    return Promise.reject(new Error(errorMsg));
  },
);

export default apiClient;
