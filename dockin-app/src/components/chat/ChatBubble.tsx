import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/src/theme/theme";
import type { ChatMessage } from "@/src/types";

export function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <View style={[styles.wrap, message.mine ? styles.mineWrap : styles.otherWrap]}>
      {!message.mine ? <Text style={styles.sender}>{message.senderName}</Text> : null}
      <View style={[styles.bubble, message.mine ? styles.mine : styles.other]}>
        <Text style={styles.message}>{message.message}</Text>
        {message.translatedMessage ? <Text style={styles.translated}>{message.translatedMessage}</Text> : null}
      </View>
      <Text style={styles.time}>{new Date(message.createdAt).toLocaleTimeString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
    maxWidth: "88%",
  },
  mineWrap: {
    alignSelf: "flex-end",
  },
  otherWrap: {
    alignSelf: "flex-start",
  },
  sender: {
    color: theme.colors.subText,
    marginBottom: 6,
    fontWeight: "600",
    fontSize: 13,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  mine: {
    backgroundColor: "#FFFFFF",
  },
  other: {
    backgroundColor: "#FFFFFF",
  },
  message: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
  },
  translated: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    marginTop: 8,
  },
  time: {
    marginTop: 6,
    fontSize: 11,
    color: "#98A2B3",
  },
});
