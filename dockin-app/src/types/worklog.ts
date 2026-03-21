import type { LanguageCode, WorkStatus } from "./enums";

export type WorkLog = {
  logId: number;
  userId: string;
  equipmentId: number;
  title: string;
  logText: string;
  imageUrls?: string[];
  imageUrl?: string;
  audioFileUrl?: string;
  authorName?: string;
  authorRole?: string;
  createdAt: string;
  updatedAt: string;
  status?: WorkStatus;
  managerComment?: string;
};

export type WorkLogComment = {
  commentId: number;
  logId: number;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkLogPayload = {
  title: string;
  logText: string;
  equipmentId: number;
  imageUrls?: string[];
  imageUrl?: string;
  audioFileUrl?: string;
};

export type WorkLogQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  targetUserId?: string;
};

export type WorkLogTranslateRequest = {
  source: LanguageCode;
  target: LanguageCode;
  traceId: string;
};

export type WorkLogTranslateResponse = {
  title: string;
  translated: string;
  model: string;
  traceId: string;
};

export type RealtimeTranslateRequest = {
  source: LanguageCode;
  target: LanguageCode;
  traceId: string;
  audioUri?: string;
};

export type RealtimeTranslateResponse = {
  originalText: string;
  translatedText: string;
  detectedLanguage?: LanguageCode;
  traceId: string;
};
