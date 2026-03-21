import React, { useRef, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppButton } from "@/src/components/common/AppButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { translationService } from "@/src/services/translationService";
import { createTraceId } from "@/src/utils/trace";
import { validateSelectedFile } from "@/src/utils/security";
import { theme } from "@/src/theme/theme";
import type { LanguageCode } from "@/src/types";

const languageOptions: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "영어" },
  { code: "ko", label: "한국어" },
  { code: "vi", label: "베트남어" },
  { code: "zh", label: "중국어" },
  { code: "th", label: "태국어" },
];

function languageLabel(code: LanguageCode) {
  return languageOptions.find((item) => item.code === code)?.label ?? code;
}

export function LiveTranslationScreen() {
  const [source, setSource] = useState<LanguageCode>("vi");
  const [target, setTarget] = useState<LanguageCode>("ko");
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [sourceText, setSourceText] = useState("Đội trưởng, tôi có thể làm việc ở khu A-8 phía Dock được không?");
  const [translatedText, setTranslatedText] = useState("반장님, 도크쪽 A-8구역에서 작업하면 되나요?");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"source" | "target" | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
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

  const startRecording = async () => {
    if (Platform.OS === "web") {
      Alert.alert("웹 미지원", "웹에서는 브라우저 녹음 대신 음성 파일 선택을 사용해주세요.");
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("마이크 권한 필요", "실시간 번역을 위해 마이크 접근 권한을 허용해주세요.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const nextRecording = new Audio.Recording();
    await nextRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await nextRecording.startAsync();
    recordingRef.current = nextRecording;
    setRecording(true);
  };

  const stopRecordingAndTranslate = async () => {
    if (!recordingRef.current) {
      return;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const recordedUri = recordingRef.current.getURI() ?? undefined;
      recordingRef.current = null;
      setRecording(false);

      if (!recordedUri) {
        Alert.alert("녹음 실패", "음성 파일을 만들지 못했습니다.");
        return;
      }

      setAudioUri(recordedUri);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setLoading(true);
      const result = await translationService.realtimeTranslate({
        audioUri: recordedUri,
        source,
        target,
        traceId: createTraceId("rt"),
      });
      setSourceText(result.originalText || sourceText);
      setTranslatedText(result.translatedText || translatedText);
    } catch {
      Alert.alert("녹음 오류", "녹음 또는 번역 요청 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
      setRecording(false);
    }
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.langRow}>
        <Pressable style={[styles.pill, styles.pillActive]} onPress={() => setPickerTarget(pickerTarget === "source" ? null : "source")}>
          <Text style={styles.pillActiveText}>{languageLabel(source)}</Text>
        </Pressable>
        <Text style={styles.arrow}>↔</Text>
        <Pressable style={styles.pill} onPress={() => setPickerTarget(pickerTarget === "target" ? null : "target")}>
          <Text style={styles.pillText}>{languageLabel(target)}</Text>
        </Pressable>
      </View>
      {pickerTarget ? (
        <AppCard style={styles.languagePickerCard}>
          <Text style={styles.pickerTitle}>{pickerTarget === "source" ? "원문 언어 선택" : "번역 언어 선택"}</Text>
          <View style={styles.languageTabs}>
            {languageOptions.map((item) => {
              const selected = (pickerTarget === "source" ? source : target) === item.code;
              return (
                <Pressable
                  key={item.code}
                  style={[styles.languageTab, selected && styles.languageTabActive]}
                  onPress={() => {
                    if (pickerTarget === "source") {
                      setSource(item.code);
                    } else {
                      setTarget(item.code);
                    }
                    setPickerTarget(null);
                  }}
                >
                  <Text style={[styles.languageTabText, selected && styles.languageTabTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </AppCard>
      ) : null}
      <AppCard style={styles.noticeCard}>
        <Text style={styles.notice}>말하기 버튼을 길게 누른 채로 대화하세요. 자동 언어 감지가 활성화되어 있습니다.</Text>
      </AppCard>
      <AppCard style={styles.messageCard}>
        <Text style={styles.label}>내 언어</Text>
        <Text style={styles.languageHint}>{languageLabel(source)}</Text>
        <Text style={styles.message}>{sourceText}</Text>
      </AppCard>
      <AppCard style={styles.translateCard}>
        <Text style={styles.label}>번역</Text>
        <Text style={styles.languageHint}>{languageLabel(target)}</Text>
        <Text style={styles.message}>{translatedText}</Text>
      </AppCard>
      <View style={styles.actions}>
        <AppButton label={audioUri ? "음성 파일 번역" : "음성 파일 선택"} variant="secondary" onPress={audioUri ? handleTranslate : pickAudio} style={styles.uploadButton} />
        <Pressable
          style={[styles.speakButton, recording && styles.speakButtonRecording]}
          onPressIn={startRecording}
          onPressOut={stopRecordingAndTranslate}
        >
          <MaterialCommunityIcons name="microphone-outline" size={30} color="#FFFFFF" />
          <Text style={styles.speakText}>
            {recording ? "녹음중..." : loading ? "번역중..." : "말하기"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 14,
    paddingBottom: 40,
  },
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
  languagePickerCard: {
    gap: 14,
    borderRadius: 22,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  languageTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  languageTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: "#F2F4F8",
  },
  languageTabActive: {
    backgroundColor: theme.colors.primary,
  },
  languageTabText: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  languageTabTextActive: {
    color: "#FFFFFF",
  },
  noticeCard: { borderRadius: 20 },
  notice: { color: theme.colors.subText, lineHeight: 24, fontSize: 15 },
  label: { color: theme.colors.subText, marginBottom: 10, fontWeight: "700" },
  languageHint: {
    position: "absolute",
    top: 16,
    right: 16,
    color: theme.colors.accent,
    fontWeight: "800",
  },
  message: { color: theme.colors.text, fontSize: 20, lineHeight: 30, marginTop: 12 },
  messageCard: { minHeight: 140, borderRadius: 24 },
  translateCard: { borderWidth: 1.5, borderColor: theme.colors.accent, minHeight: 150, borderRadius: 24 },
  actions: { gap: 12 },
  uploadButton: { backgroundColor: "#EEF2F8", minHeight: 52 },
  speakButton: {
    minHeight: 62,
    backgroundColor: theme.colors.accent,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  speakButtonRecording: {
    backgroundColor: "#FF5A5A",
  },
  speakText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 21,
  },
});
