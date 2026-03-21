import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppButton } from "@/src/components/common/AppButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { translationService } from "@/src/services/translationService";
import { createTraceId } from "@/src/utils/trace";
import { validateSelectedFile } from "@/src/utils/security";
import { theme } from "@/src/theme/theme";
import type { LanguageCode } from "@/src/types";

export function LiveTranslationScreen() {
  const [source, setSource] = useState<LanguageCode>("vi");
  const [target, setTarget] = useState<LanguageCode>("ko");
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [sourceText, setSourceText] = useState("Đội trưởng, tôi có thể làm việc ở khu A-8 phía Dock được không?");
  const [translatedText, setTranslatedText] = useState("반장님, 도크쪽 A-8구역에서 작업하면 되나요?");
  const [loading, setLoading] = useState(false);
  const nextPair = useMemo<{ source: LanguageCode; target: LanguageCode }>(
    () => ({
      source: source === "vi" ? "ko" : "vi",
      target: target === "ko" ? "vi" : "ko",
    }),
    [source, target],
  );

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["audio/*"] });
    if (!result.canceled) {
      validateSelectedFile({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType,
        size: result.assets[0].size,
        kind: "audio",
      });
      setAudioUri(result.assets[0].uri);
    }
  };

  const handleTranslate = async () => {
    if (!audioUri) return;
    setLoading(true);
    try {
      const result = await translationService.realtimeTranslate({
        audioUri,
        source,
        target,
        traceId: createTraceId("rt"),
      });
      setSourceText(result.originalText || sourceText);
      setTranslatedText(result.translatedText || translatedText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.langRow}>
        <Pressable style={[styles.pill, styles.pillActive]} onPress={() => setSource(nextPair.source)}>
          <Text style={styles.pillActiveText}>{source === "vi" ? "베트남어" : source === "ko" ? "한국어" : source}</Text>
        </Pressable>
        <Text style={styles.arrow}>↔</Text>
        <Pressable style={styles.pill} onPress={() => setTarget(nextPair.target)}>
          <Text style={styles.pillText}>{target === "ko" ? "한국어" : target === "vi" ? "베트남어" : target}</Text>
        </Pressable>
      </View>
      <AppCard style={styles.noticeCard}>
        <Text style={styles.notice}>말하기 버튼을 길게 누른 채로 대화하세요. 자동 언어 감지가 활성화되어 있습니다.</Text>
      </AppCard>
      <AppCard style={styles.messageCard}>
        <Text style={styles.label}>내 언어</Text>
        <Text style={styles.languageHint}>{source === "vi" ? "베트남어" : "한국어"}</Text>
        <Text style={styles.message}>{sourceText}</Text>
      </AppCard>
      <AppCard style={styles.translateCard}>
        <Text style={styles.label}>번역</Text>
        <Text style={styles.languageHint}>{target === "ko" ? "한국어" : "베트남어"}</Text>
        <Text style={styles.message}>{translatedText}</Text>
      </AppCard>
      <View style={styles.actions}>
        <AppButton label={audioUri ? "음성 선택 완료" : "음성 선택"} variant="secondary" onPress={pickAudio} style={styles.uploadButton} />
        <Pressable style={styles.speakButton} onPress={handleTranslate}>
          <MaterialCommunityIcons name="microphone-outline" size={30} color="#FFFFFF" />
          <Text style={styles.speakText}>{loading ? "번역중..." : "말하기"}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center" },
  pill: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radius.pill,
    ...theme.shadow.card,
  },
  pillActive: {
    backgroundColor: theme.colors.accent,
  },
  pillText: {
    color: "#5E5E5E",
    fontWeight: "700",
  },
  pillActiveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  arrow: { fontSize: 18, color: theme.colors.subText },
  noticeCard: { borderRadius: 20 },
  notice: { color: theme.colors.subText, lineHeight: 24 },
  label: { color: theme.colors.subText, marginBottom: 10, fontWeight: "700" },
  languageHint: {
    position: "absolute",
    top: 16,
    right: 16,
    color: theme.colors.accent,
    fontWeight: "800",
  },
  message: { color: theme.colors.text, fontSize: 22, lineHeight: 30 },
  messageCard: { minHeight: 140 },
  translateCard: { borderWidth: 1.5, borderColor: theme.colors.accent, minHeight: 150 },
  actions: { gap: 12 },
  uploadButton: { backgroundColor: "#EEF2F8" },
  speakButton: {
    minHeight: 58,
    backgroundColor: theme.colors.accent,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  speakText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 22,
  },
});
