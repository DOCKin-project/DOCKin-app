import { Platform } from "react-native";
import { isSafeApiBaseUrl, normalizeBaseUrl } from "@/src/utils/security";

const rawBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Platform.OS === "web" ? "/proxy" : "http://3.34.181.59:8080");
const springBaseUrl = normalizeBaseUrl(rawBaseUrl);

if (!isSafeApiBaseUrl(springBaseUrl)) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL must use HTTPS unless it is an approved deployment host.");
}

export const env = {
  appName: "DOCKin",
  springBaseUrl,
};
