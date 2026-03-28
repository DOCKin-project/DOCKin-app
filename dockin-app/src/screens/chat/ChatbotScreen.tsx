import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppButton } from "@/src/components/common/AppButton";
import { chatbotService } from "@/src/services/chatbotService";
import { createTraceId } from "@/src/utils/trace";
import { theme } from "@/src/theme/theme";
import TalkInLogo from "../../../assets/chatbot/talkin.svg";

export function ChatbotScreen() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
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
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.logoWrap}>
        <TalkInLogo width={132} height={56} />
      </View>
      <AppCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroAccent}>DOCKin 작업도우미로</Text>
            <Text style={styles.title}>작업 중 궁금증을 빠르게 해결해보세요.</Text>
          </View>
          <Image source={require("../../../assets/chatbot/support.png")} style={styles.supportImage} resizeMode="contain" />
        </View>
        <View style={styles.quickGrid}>
          {[
            { label: "규정", image: require("../../../assets/chatbot/document.png") },
            { label: "장비", image: require("../../../assets/chatbot/tool.png") },
            { label: "신박", image: require("../../../assets/chatbot/support.png") },
            { label: "복지", image: require("../../../assets/chatbot/health.png") },
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
      <AppCard style={styles.askCard}>
        <TextInput value={question} onChangeText={setQuestion} style={styles.input} placeholder="토크인에게 물어보세요!" />
        <AppButton label="질문 보내기" onPress={ask} loading={loading} />
      </AppCard>
      {loading || answer ? (
        <AppCard style={styles.answerCard}>
          <Text style={styles.answer}>{loading ? "검색 중입니다." : answer}</Text>
        </AppCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingTop: 18, paddingBottom: 48 },
  logoWrap: { alignItems: "center", marginTop: 2, marginBottom: -10 },
  heroCard: { paddingTop: 40, paddingBottom: 28 },
  askCard: { paddingTop: 30 },
  answerCard: { minHeight: 120, justifyContent: "center" },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
  },
  heroAccent: {
    color: theme.colors.accent,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "700", color: theme.colors.text, lineHeight: 28 },
  supportImage: {
    width: 56,
    height: 56,
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 22,
  },
  quickItem: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  quickImage: {
    width: 38,
    height: 38,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  input: {
    minHeight: 64,
    borderRadius: theme.radius.pill,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 22,
    marginBottom: 20,
    fontSize: 16,
  },
  answer: { color: theme.colors.text, lineHeight: 36, fontSize: 18, fontWeight: "500" },
});
