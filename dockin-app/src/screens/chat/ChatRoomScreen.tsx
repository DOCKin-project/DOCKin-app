import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
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
    <Screen scrollable={false} contentStyle={styles.content}>
      <View style={styles.searchRow}>
        <TextInput value={keyword} onChangeText={setKeyword} style={styles.input} placeholder="채팅 내용 검색" />
        <AppButton label="검색" onPress={handleSearch} style={styles.send} />
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputRow}>
        <TextInput value={text} onChangeText={setText} style={styles.input} placeholder="메시지 입력" />
        <AppButton label="전송" onPress={handleSend} style={styles.send} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingBottom: 16 },
  list: { paddingBottom: 24 },
  searchRow: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12 },
  inputRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  input: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
  },
  send: { width: 96 },
});
