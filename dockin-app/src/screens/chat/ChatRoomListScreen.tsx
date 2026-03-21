import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppInput } from "@/src/components/common/AppInput";
import { AppButton } from "@/src/components/common/AppButton";
import { EmptyState } from "@/src/components/common/EmptyState";
import { LoadingState } from "@/src/components/common/LoadingState";
import { StatusBadge } from "@/src/components/common/StatusBadge";
import { useAsyncData } from "@/src/hooks/useAsyncData";
import { chatService } from "@/src/services/chatService";
import { theme } from "@/src/theme/theme";
import type { ChatRoom } from "@/src/types";

export function ChatRoomListScreen({ navigation }: any) {
  const loadRooms = useCallback(() => chatService.getRooms(), []);
  const { data, loading, error, reload } = useAsyncData(loadRooms);
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredRooms = useMemo(
    () => (data ?? []).filter((room: ChatRoom) => room.title.toLowerCase().includes(searchKeyword.trim().toLowerCase())),
    [data, searchKeyword],
  );

  const handleCreateRoom = async () => {
    const participantIds = participants.split(",").map((item) => item.trim()).filter(Boolean);
    if (!roomName.trim() || participantIds.length === 0) {
      return;
    }
    setSubmitting(true);
    try {
      await chatService.createRoom({ roomName: roomName.trim(), participantIds });
      setRoomName("");
      setParticipants("");
      await reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>채팅방 목록</Text>
        <Pressable onPress={() => navigation.navigate("Settings")}>
          <MaterialIcons name="person-outline" size={28} color={theme.colors.text} />
        </Pressable>
      </View>
      <AppCard style={styles.toolbar}>
        <Pressable style={styles.toolbarButton} onPress={() => setSearchOpen((prev) => !prev)}>
          <MaterialIcons name="search" size={24} color={theme.colors.primary} />
          <Text style={styles.search}>채팅방 이름 검색</Text>
        </Pressable>
        <Pressable onPress={() => setCreateOpen((prev) => !prev)}>
          <MaterialIcons name="add-circle-outline" size={32} color={theme.colors.primary} />
        </Pressable>
      </AppCard>
      {searchOpen ? (
        <AppCard style={styles.formCard}>
          <AppInput label="채팅방 이름 검색" value={searchKeyword} onChangeText={setSearchKeyword} placeholder="채팅방 이름 입력" />
          <View style={styles.inlineButtons}>
            <AppButton label="검색" onPress={() => {}} style={styles.inlineButton} />
            <AppButton label="초기화" variant="secondary" onPress={() => setSearchKeyword("")} style={styles.inlineButton} />
          </View>
        </AppCard>
      ) : null}
      {createOpen ? (
        <AppCard style={styles.formCard}>
          <AppInput label="채팅방 생성" value={roomName} onChangeText={setRoomName} placeholder="채팅방 이름" />
          <AppInput label="참여자 사원번호" value={participants} onChangeText={setParticipants} placeholder="1001,1002,1003" />
          <AppButton label="채팅방 만들기" onPress={handleCreateRoom} loading={submitting} />
        </AppCard>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <LoadingState /> : null}
      {!loading && !filteredRooms.length ? <EmptyState title={searchKeyword ? "검색 결과가 없습니다." : "채팅방이 없습니다."} /> : null}
      {filteredRooms.map((room: ChatRoom) => (
        <Pressable key={room.roomId} onPress={() => navigation.navigate("ChatRoom", { roomId: room.roomId, title: room.title })}>
          <AppCard style={styles.roomCard}>
            <View style={styles.roomHeader}>
              <View style={styles.roomIdentity}>
                <View style={styles.avatar} />
                <Text style={styles.roomTitle}>{room.title}</Text>
              </View>
              <StatusBadge label={room.isOnline ? "접속중" : "오프라인"} tone={room.isOnline ? "green" : "gray"} />
            </View>
            <Text numberOfLines={1} style={styles.lastMessage}>{room.lastMessage}</Text>
          </AppCard>
        </Pressable>
      ))}
      <AppCard>
        <Pressable onPress={() => navigation.navigate("Chatbot")}>
          <Text style={styles.chatbot}>토크인 챗봇 열기</Text>
        </Pressable>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700", color: theme.colors.subText },
  toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toolbarButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  formCard: { gap: 12 },
  inlineButtons: { flexDirection: "row", gap: 10 },
  inlineButton: { flex: 1 },
  search: { color: theme.colors.primary, fontWeight: "700", fontSize: 18 },
  roomCard: { gap: 10, paddingVertical: 14 },
  roomHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomIdentity: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#C8D6E6" },
  roomTitle: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  lastMessage: { color: theme.colors.subText, fontSize: 16, backgroundColor: "#E6F0FA", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginLeft: 64 },
  chatbot: { fontSize: 18, fontWeight: "800", color: theme.colors.primary, textAlign: "center" },
  error: { color: theme.colors.danger },
});
