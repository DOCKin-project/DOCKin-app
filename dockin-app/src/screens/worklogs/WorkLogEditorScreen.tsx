import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppInput } from "@/src/components/common/AppInput";
import { AppButton } from "@/src/components/common/AppButton";
import { workLogService } from "@/src/services/workLogService";
import { toErrorMessage } from "@/src/utils/error";
import { sanitizeTextInput, validateSelectedFile } from "@/src/utils/security";
import { theme } from "@/src/theme/theme";
import { useAuthStore } from "@/src/store/authStore";
import type { RootStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "WorkLogEditor">;

export function WorkLogEditorScreen({ navigation, route }: Props) {
  const userName = useAuthStore((state) => state.userName);
  const [mode, setMode] = useState<"text" | "stt">("text");
  const [title, setTitle] = useState("");
  const [logText, setLogText] = useState("");
  const [equipmentId, setEquipmentId] = useState("2");
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params.mode === "edit" && route.params.logId) {
      workLogService.getWorkLogDetail(route.params.logId).then((data) => {
        setTitle(data.title);
        setLogText(data.logText);
        setEquipmentId(String(data.equipmentId));
        setImageUri(data.imageUrl);
        setAudioUri(data.audioFileUrl);
      });
    }
  }, [route.params.logId, route.params.mode]);

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

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) {
      validateSelectedFile({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType,
        size: result.assets[0].fileSize,
        kind: "image",
      });
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const safeTitle = sanitizeTextInput(title, 120);
      const safeLogText = sanitizeTextInput(logText, 4000);
      const safeEquipmentId = Number.parseInt(equipmentId, 10);
      if (!safeTitle || !safeLogText || !Number.isFinite(safeEquipmentId) || safeEquipmentId <= 0) {
        throw new Error("제목, 작업 내용, 설비 ID를 올바르게 입력해주세요.");
      }

      if (mode === "stt" && audioUri) {
        await workLogService.createSttWorkLog({
          audioUri,
          title: safeTitle,
          logText: safeLogText,
          equipmentId: safeEquipmentId,
          imageUrl: imageUri,
          audioFileUrl: audioUri,
        });
      } else if (route.params.mode === "edit" && route.params.logId) {
        await workLogService.updateWorkLog(route.params.logId, {
          title: safeTitle,
          logText: safeLogText,
          equipmentId: safeEquipmentId,
          imageUrl: imageUri,
          audioFileUrl: audioUri,
        });
      } else {
        await workLogService.createWorkLog({
          title: safeTitle,
          logText: safeLogText,
          equipmentId: safeEquipmentId,
          imageUrl: imageUri,
          audioFileUrl: audioUri,
        });
      }
      Alert.alert("저장 완료", "작업일지가 저장되었습니다.", [{ text: "확인", onPress: () => navigation.goBack() }]);
    } catch (error) {
      setError(toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.switchRow}>
        {["text", "stt"].map((item) => (
          <Pressable key={item} onPress={() => setMode(item as "text" | "stt")} style={[styles.switch, mode === item && styles.switchActive]}>
            <Text style={[styles.switchText, mode === item && styles.switchTextActive]}>{item === "text" ? "작성" : "번역/STT"}</Text>
          </Pressable>
        ))}
      </View>

      <AppCard style={styles.card}>
        <View style={styles.fieldSection}>
          <Text style={styles.sectionLabel}>설비 / 작업 구역</Text>
          <View style={styles.grayField}><Text style={styles.grayFieldText}>제 {equipmentId} 조선소</Text></View>
        </View>
        <View style={styles.voiceBox}>
          <Text style={styles.sectionLabel}>음성입력</Text>
          <View style={styles.voiceCircle}>
            <Text style={styles.voiceIcon}>●</Text>
          </View>
          <Text style={styles.voiceText}>{mode === "stt" ? "녹음 준비됨" : "키보드 입력 모드"}</Text>
          <AppInput
            label="작업 내용"
            value={logText}
            onChangeText={setLogText}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            style={styles.textArea}
            placeholder="작업 내용을 입력하세요"
          />
        </View>
        <AppInput label="제목" value={title} onChangeText={setTitle} placeholder="작업일지 제목" />
        <Text style={styles.author}>작성자: {userName ?? "김철수"}</Text>
        <View style={styles.attachRow}>
          <AppButton label={audioUri ? "음성 선택 완료" : "음성 첨부"} variant="secondary" onPress={pickAudio} style={styles.attachButton} />
          <AppButton label={imageUri ? "이미지 선택 완료" : "이미지 첨부"} variant="secondary" onPress={pickImage} style={styles.attachButton} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.submitRow}>
          <AppButton label="번역 보기" variant="secondary" onPress={() => navigation.navigate("WorkLogTranslation", {})} style={styles.half} />
          <AppButton label="제출하기" onPress={handleSubmit} loading={loading} style={styles.half} />
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 14,
    paddingBottom: 40,
  },
  switchRow: {
    flexDirection: "row",
    backgroundColor: "#EEF1F5",
    borderRadius: theme.radius.pill,
    padding: 4,
  },
  switch: {
    flex: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: 12,
    alignItems: "center",
  },
  switchActive: {
    backgroundColor: "#FFFFFF",
  },
  switchText: {
    fontWeight: "700",
    color: theme.colors.subText,
  },
  switchTextActive: {
    color: theme.colors.text,
  },
  card: {
    gap: 16,
    borderRadius: 24,
  },
  fieldSection: {
    gap: 10,
  },
  sectionLabel: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  grayField: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#F3F4FA",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  grayFieldText: {
    color: "#7C8390",
    fontSize: 16,
  },
  voiceBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 8,
    gap: 12,
    alignItems: "center",
  },
  voiceCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FF1F1F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A7A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  voiceIcon: {
    color: "#FFFFFF",
    fontSize: 30,
  },
  voiceText: {
    color: "#E03131",
    fontWeight: "800",
    fontSize: 18,
  },
  textArea: {
    minHeight: 160,
    paddingTop: 18,
    width: "100%",
  },
  author: {
    color: theme.colors.subText,
    fontWeight: "600",
  },
  attachRow: {
    flexDirection: "row",
    gap: 12,
  },
  attachButton: {
    flex: 1,
  },
  submitRow: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  error: {
    color: theme.colors.danger,
  },
});
