const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_INSECURE_REMOTE_HOSTS = new Set(["3.34.181.59"]);

export function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function isSafeApiBaseUrl(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    const isLocalhost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "10.0.2.2" ||
      url.hostname.startsWith("192.168.") ||
      url.hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

    if (isLocalhost) {
      return url.protocol === "http:" || url.protocol === "https:";
    }

    if (url.protocol === "https:") {
      return true;
    }

    return url.protocol === "http:" && ALLOWED_INSECURE_REMOTE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function sanitizeTextInput(value: string, maxLength = 2000) {
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

export function validateSelectedFile(params: {
  uri: string;
  mimeType?: string | null;
  size?: number | null;
  kind: "audio" | "image";
}) {
  const { uri, mimeType, size, kind } = params;
  const limit = kind === "audio" ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
  const allowedMime =
    kind === "audio"
      ? ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp4", "audio/aac", "audio/*"]
      : ["image/jpeg", "image/png", "image/webp", "image/heic"];

  if (!uri) {
    throw new Error("선택된 파일 경로를 확인할 수 없습니다.");
  }

  if (size && size > limit) {
    throw new Error(kind === "audio" ? "음성 파일은 15MB 이하만 업로드할 수 있습니다." : "이미지 파일은 10MB 이하만 업로드할 수 있습니다.");
  }

  if (mimeType && !allowedMime.includes(mimeType) && !allowedMime.includes(`${kind}/*`)) {
    throw new Error(kind === "audio" ? "지원하지 않는 음성 형식입니다." : "지원하지 않는 이미지 형식입니다.");
  }
}

export function shouldRetryWithFallback(status?: number) {
  return status === 404 || status === 405 || status === 501;
}
