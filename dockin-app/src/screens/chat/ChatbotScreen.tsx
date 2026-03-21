import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppButton } from "@/src/components/common/AppButton";
import { chatbotService } from "@/src/services/chatbotService";
import { createTraceId } from "@/src/utils/trace";
import { theme } from "@/src/theme/theme";
import TalkInLogo from "../../../assets/chatbot/talkIn.svg";

export function ChatbotScreen() {
  const [question, setQuestion] = useState("연차 규정 좀 검색해줘");
  const [answer, setAnswer] = useState("현장 최신 규정 반영하여 검색 중 입니다.");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    try {
      const result = await chatbotService.ask({
        traceId: createTraceId("chatbot"),
        messages: [{ role: "user", content: question }],
      });
      setAnswer(result.reply);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.logoWrap}>
        <TalkInLogo width={120} height={52} />
      </View>
      <AppCard>
        <Text style={styles.title}>DOCKin 작업도우미로 작업 중 궁금증을 빠르게 해결해보세요.</Text>
        <View style={styles.quickGrid}>
          {[
            { label: "규정", image: require("../../../assets/chatbot/Document.png") },
            { label: "장비", image: require("../../../assets/chatbot/tool.png") },
            { label: "신박", image: require("../../../assets/chatbot/support.png") },
            { label: "복지", image: require("../../../assets/chatbot/Health.png") },
            { label: "급여", image: require("../../../assets/chatbot/money.png") },
            { label: "FAQ", image: require("../../../assets/chatbot/chat.png") },
          ].map((item) => (
            <View key={item.label} style={styles.quickItem}>
              <Image source={item.image} style={styles.quickImage} resizeMode="contain" />
              <Text style={styles.quickLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </AppCard>
      <AppCard>
        <TextInput value={question} onChangeText={setQuestion} style={styles.input} placeholder="토크인에게 물어보세요!" />
        <AppButton label="질문 보내기" onPress={ask} loading={loading} />
      </AppCard>
      <AppCard>
        <Text style={styles.answer}>{answer}</Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoWrap: { alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.text, lineHeight: 30 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  quickItem: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    paddingVertical: 12,
    alignItems: "center",
    gap: 8,
  },
  quickImage: {
    width: 34,
    height: 34,
  },
  quickLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  input: {
    minHeight: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  answer: { color: theme.colors.text, lineHeight: 24, fontSize: 16 },
});
