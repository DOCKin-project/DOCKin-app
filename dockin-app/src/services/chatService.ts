import { springApi } from "@/src/api/http";
import type { ChatMessage, ChatRoom, ChatRoomPayload, SendMessagePayload } from "@/src/types";

function toPageableParams(params?: { page?: number; size?: number }) {
  return { page: params?.page ?? 0, size: params?.size ?? 20 };
}

function toChatRoom(dto: any): ChatRoom {
  return {
    roomId: dto.roomId,
    title: dto.roomName ?? "채팅방",
    lastMessage: dto.lastMessageContent ?? "",
    updatedAt: dto.lastMessageAt ?? dto.createdAt ?? new Date().toISOString(),
    unreadCount: dto.unreadCount ?? 0,
    creatorId: dto.creatorId,
    participantIds: dto.participantIds ?? [],
    isGroup: (dto.participantIds?.length ?? 0) > 2,
  };
}

function toSearchParams(params?: { page?: number; size?: number; keyword?: string; lastMessageId?: number }) {
  return {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
    ...(params?.keyword ? { keyword: params.keyword } : {}),
    ...(params?.lastMessageId ? { lastMessageId: params.lastMessageId } : {}),
  };
}

function toChatMessage(dto: any): ChatMessage {
  return {
    id: dto.messageId,
    roomId: dto.roomId,
    senderId: dto.senderId ?? "",
    senderName: dto.senderId ?? "사용자",
    message: dto.content ?? "",
    fileUrl: dto.fileUrl,
    messageType: dto.messageType ?? "TEXT",
    createdAt: dto.sentAt ?? new Date().toISOString(),
    mine: false,
  };
}

export const chatService = {
  async getRooms() {
    const response = await springApi.get("/api/chat/rooms", {
      params: toPageableParams(),
    });
    return (response.data.content ?? []).map(toChatRoom);
  },

  async createRoom(payload: ChatRoomPayload) {
    const response = await springApi.post("/api/chat/room", {
      room_name: payload.roomName,
      participantIds: payload.participantIds,
    });
    return toChatRoom(response.data);
  },

  async getMessages(roomId: number) {
    const response = await springApi.get(`/api/chat/room/${roomId}/messages`, {
      params: toSearchParams(),
    });
    return (response.data.content ?? []).map(toChatMessage);
  },

  async searchMessages(roomId: number, keyword: string) {
    const response = await springApi.get(`/api/chat/room/${roomId}/messages/search`, {
      params: toSearchParams({ keyword }),
    });
    return (response.data.content ?? []).map(toChatMessage);
  },

  async sendMessage(payload: SendMessagePayload) {
    // Swagger에 메시지 전송용 REST API가 명시되어 있지 않아 로컬 즉시 반영 형태로 처리.
    return {
      id: Date.now(),
      roomId: payload.roomId,
      senderId: "me",
      senderName: "나",
      message: payload.message,
      createdAt: new Date().toISOString(),
      mine: true,
      messageType: "TEXT",
    };
  },
};
