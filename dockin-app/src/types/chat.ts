import type { LanguageCode } from "./enums";

export type ChatRoom = {
  roomId: number;
  title: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  creatorId?: string;
  participantIds?: string[];
  isOnline?: boolean;
  isGroup?: boolean;
};

export type ChatRoomPayload = {
  roomName: string;
  participantIds: string[];
};

export type ChatMessage = {
  id: number;
  roomId?: number;
  senderId: string;
  senderName: string;
  message: string;
  fileUrl?: string;
  messageType?: "TEXT" | "IMAGE" | "FILE";
  translatedMessage?: string;
  createdAt: string;
  mine: boolean;
};

export type ChatbotMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatbotRequest = {
  messages: ChatbotMessage[];
  traceId: string;
};

export type ChatbotResponse = {
  reply: string;
  model: string;
  traceId: string;
};

export type SendMessagePayload = {
  roomId: number;
  message: string;
  targetLanguage?: LanguageCode;
};
