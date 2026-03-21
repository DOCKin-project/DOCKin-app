import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/src/components/common/Screen";
import { AppButton } from "@/src/components/common/AppButton";
import { ChatBubble } from "@/src/components/chat/ChatBubble";
import { useAsyncData } from "@/src/hooks/useAsyncData";
import { chatService } from "@/src/services/chatService";
import { theme } from "@/src/theme/theme";
import type { RootStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ChatRoom">;

export function ChatRoomScreen({ route }: Props) {
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const loadMessages = useCallback(() => chatService.getMessages(route.params.roomId), [route.params.roomId]);
  const { data, setData, reload } = useAsyncData(loadMessages);

  const handleSend = async () => {
    const message = await chatService.sendMessage({ roomId: route.params.roomId, message: text });
    setData([...(data ?? []), message]);
    setText("");
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      await reload();
      return;
    }
    const result = await chatService.searchMessages(route.params.roomId, keyword.trim());
    setData(result);
  };

  return (
    <Screen scrollable={false} contentStyle={styles.content} useGradient>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <MaterialIcons name="search" size={22} color="#8B97A6" />
          <TextInput value={keyword} onChangeText={setKeyword} style={styles.input} placeholder="채팅 내용 검색" />
        </View>
        <AppButton label="검색" onPress={handleSearch} style={styles.send} />
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputRow}>
        <Pressable style={styles.plusButton}>
          <MaterialIcons name="add" size={30} color="#6F7680" />
        </Pressable>
        <View style={styles.messageInputWrap}>
          <TextInput value={text} onChangeText={setText} style={styles.messageInput} placeholder="메시지 입력" />
          <MaterialCommunityIcons name="web" size={28} color="#3A3A3A" />
        </View>
        <Pressable style={styles.sendFab} onPress={handleSend}>
          <MaterialIcons name="arrow-upward" size={26} color="#FFFFFF" />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingBottom: 12 },
  list: { paddingBottom: 24, paddingTop: 8 },
  searchRow: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12 },
  searchInputWrap: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputRow: { flexDirection: "row", gap: 10, alignItems: "center", paddingTop: 6 },
  input: {
    flex: 1,
    color: theme.colors.text,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  messageInputWrap: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  messageInput: {
    flex: 1,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  send: { width: 82, minHeight: 52 },
  sendFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
