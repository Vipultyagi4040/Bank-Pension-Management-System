import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL
});

api.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync("pensionerToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function logout() {
  await SecureStore.deleteItemAsync("pensionerToken");
}
