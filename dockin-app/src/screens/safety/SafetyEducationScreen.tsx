import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { EmptyState } from "@/src/components/common/EmptyState";
import { LoadingState } from "@/src/components/common/LoadingState";
import { StatusBadge } from "@/src/components/common/StatusBadge";
import { useAsyncData } from "@/src/hooks/useAsyncData";
import { safetyService } from "@/src/services/safetyService";
import { theme } from "@/src/theme/theme";
import type { SafetyEducation } from "@/src/types";

export function SafetyEducationScreen() {
  const loadEducations = useCallback(() => safetyService.getEducationList(), []);
  const loadUncompleted = useCallback(() => safetyService.getUncompletedVideos(), []);
  const { data, loading, error, reload, setData } = useAsyncData<SafetyEducation[]>(loadEducations);
  const uncompleted = useAsyncData<SafetyEducation[]>(loadUncompleted);
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<SafetyEducation | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!selected && data?.length) {
      setSelected(data[0]);
    }
  }, [data, selected]);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      await reload();
      return;
    }
    const result = await safetyService.searchEducationList(keyword.trim(), false);
    setData(result);
    setSelected(result[0] ?? null);
  };

  const handleOpenVideo = async () => {
    if (!selected?.videoUrl) {
      Alert.alert("영상 없음", "등록된 영상 주소가 없습니다.");
      return;
    }
    await Linking.openURL(selected.videoUrl);
  };

  const handleComplete = async () => {
    if (!selected) return;
    setCompleting(true);
    try {
      await safetyService.completeEducation(selected.id);
      await reload();
      await uncompleted.reload();
      setSelected((prev) => (prev ? { ...prev, completed: true, progressRate: 100, status: "WATCHED" } : prev));
      Alert.alert("처리 완료", "영상 조회완료로 반영되었습니다.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <Screen>
      <AppCard style={styles.hero}>
        <Text style={styles.heroText}>이수 현황</Text>
        <Text style={styles.heroCount}>{data?.filter((item: SafetyEducation) => item.completed).length ?? 0} / {data?.length ?? 0}</Text>
      </AppCard>
      <AppCard style={styles.searchCard}>
        <AppInput label="교육 검색" value={keyword} onChangeText={setKeyword} placeholder="제목 또는 내용 검색" />
        <View style={styles.buttonRow}>
          <AppButton label="검색" onPress={handleSearch} style={styles.halfButton} />
          <AppButton label="전체" variant="secondary" onPress={async () => { setKeyword(""); await reload(); }} style={styles.halfButton} />
        </View>
      </AppCard>
      <AppCard>
        <Text style={styles.sectionTitle}>미이수 영상</Text>
        {uncompleted.loading ? <LoadingState /> : null}
        {!uncompleted.loading && !uncompleted.data?.length ? <EmptyState title="미이수 영상이 없습니다." /> : null}
        {uncompleted.data?.map((item: SafetyEducation) => (
          <TouchableOpacity key={item.id} style={styles.uncompletedItem} onPress={() => setSelected(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.durationMinutes}분 · {item.status === "WATCHING" ? "시청중" : "미시청"}</Text>
            </View>
            <StatusBadge label={item.status === "WATCHING" ? "시청중" : "미이수"} tone={item.status === "WATCHING" ? "orange" : "red"} />
          </TouchableOpacity>
        ))}
      </AppCard>
      {selected ? (
        <AppCard style={styles.detailCard}>
          <Text style={styles.sectionTitle}>교육 상세조회</Text>
          <Text style={styles.detailTitle}>{selected.title}</Text>
          <Text style={styles.detailText}>{selected.description || "상세 설명이 없습니다."}</Text>
          <Text style={styles.meta}>영상 주소: {selected.videoUrl || "-"}</Text>
          <Text style={styles.meta}>자료 주소: {selected.materialUrl || "-"}</Text>
          <Text style={styles.meta}>교육 시간: {selected.durationMinutes}분</Text>
          <Text style={styles.meta}>상태: {selected.completed ? "이수완료" : selected.status === "WATCHING" ? "시청중" : "미이수"}</Text>
          <View style={styles.buttonColumn}>
            <AppButton label="영상 조회" variant="secondary" onPress={handleOpenVideo} />
            {!selected.completed ? <AppButton label="영상 조회완료" onPress={handleComplete} loading={completing} /> : null}
          </View>
        </AppCard>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <LoadingState /> : null}
      {!loading && !data?.length ? <EmptyState title="교육 목록이 없습니다." /> : null}
      {data?.map((item: SafetyEducation) => (
        <TouchableOpacity key={item.id} onPress={() => setSelected(item)}>
        <AppCard>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.durationMinutes}분 · 마감 {item.deadline}</Text>
            </View>
            <StatusBadge label={item.completed ? "이수완료" : "진행중"} tone={item.completed ? "green" : "orange"} />
          </View>
          {!item.completed ? <AppButton label="상세보기" variant="secondary" onPress={() => setSelected(item)} /> : null}
        </AppCard>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.colors.primary },
  heroText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  heroCount: { color: "#FFFFFF", fontSize: 36, fontWeight: "900", marginTop: 10 },
  searchCard: { gap: 12 },
  buttonRow: { flexDirection: "row", gap: 12 },
  halfButton: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.text, marginBottom: 10 },
  uncompletedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  detailCard: { gap: 10 },
  detailTitle: { fontSize: 22, fontWeight: "800", color: theme.colors.text },
  detailText: { color: theme.colors.text, lineHeight: 24 },
  buttonColumn: { gap: 10, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 },
  itemTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  meta: { color: theme.colors.subText, marginTop: 4 },
  error: { color: theme.colors.danger },
});
