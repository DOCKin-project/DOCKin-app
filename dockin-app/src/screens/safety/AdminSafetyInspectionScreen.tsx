import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import type { SafetyWorkerProgress } from "@/src/types";

export function AdminSafetyInspectionScreen() {
  const loadSummary = useCallback(() => safetyService.getInspectionSummary("2025-11"), []);
  const loadWorkers = useCallback(() => safetyService.getWorkerProgress("2025-11"), []);
  const loadCourses = useCallback(() => safetyService.getAdminEducationList(), []);
  const summary = useAsyncData(loadSummary);
  const workers = useAsyncData(loadWorkers);
  const courses = useAsyncData(loadCourses);
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("15");

  const handleSelect = (item: SafetyWorkerProgress | any) => {
    if ("title" in item) {
      setSelectedId(item.id);
      setTitle(item.title);
      setDescription(item.description ?? "");
      setVideoUrl(item.videoUrl ?? "");
      setMaterialUrl(item.materialUrl ?? "");
      setDurationMinutes(String(item.durationMinutes ?? 15));
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setMaterialUrl("");
    setDurationMinutes("15");
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      await courses.reload();
      return;
    }
    const found = await safetyService.searchEducationList(keyword.trim(), true);
    courses.setData(found);
  };

  const handleSave = async () => {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      materialUrl: materialUrl.trim() || undefined,
      durationMinutes: Number.parseInt(durationMinutes, 10) || 0,
    };
    if (selectedId) {
      await safetyService.updateEducation(selectedId, payload);
    } else {
      await safetyService.createEducation(payload);
    }
    resetForm();
    await courses.reload();
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    await safetyService.deleteEducation(selectedId);
    resetForm();
    await courses.reload();
  };

  return (
    <Screen>
      {summary.loading ? <LoadingState /> : null}
      {summary.data ? (
        <>
          <View style={styles.grid}>
            <AppCard style={styles.tile}><Text style={styles.tileLabel}>전체 근무자</Text><Text style={styles.tileValue}>{summary.data.totalWorkers}명</Text></AppCard>
            <AppCard style={styles.tile}><Text style={styles.tileLabel}>이수완료</Text><Text style={styles.tileValue}>{summary.data.completedWorkers}명</Text></AppCard>
            <AppCard style={styles.tile}><Text style={styles.tileLabel}>미이수</Text><Text style={styles.tileValue}>{summary.data.incompleteWorkers}명</Text></AppCard>
            <AppCard style={styles.tile}><Text style={styles.tileLabel}>미서명</Text><Text style={styles.tileValue}>{summary.data.unsignedWorkers}명</Text></AppCard>
          </View>
          <AppCard>
            <Text style={styles.section}>근로자 이수현황</Text>
            {workers.data?.map((item: SafetyWorkerProgress) => (
              <View key={item.workerId} style={styles.workerRow}>
                <View>
                  <Text style={styles.workerName}>{item.workerName}</Text>
                  <Text style={styles.workerTeam}>{item.teamName}</Text>
                </View>
                <StatusBadge label={item.completed ? "완료" : "미이수"} tone={item.completed ? "green" : "red"} />
              </View>
            ))}
            {!workers.data?.length ? <EmptyState title="근로자 현황이 없습니다." /> : null}
          </AppCard>
          <AppCard style={styles.manageCard}>
            <Text style={styles.section}>교육자료 관리</Text>
            <AppInput label="교육자료 검색" value={keyword} onChangeText={setKeyword} placeholder="제목 또는 내용 검색" />
            <View style={styles.rowButtons}>
              <AppButton label="검색" onPress={handleSearch} style={styles.halfButton} />
              <AppButton label="초기화" variant="secondary" onPress={async () => { setKeyword(""); resetForm(); await courses.reload(); }} style={styles.halfButton} />
            </View>
            <AppInput label="제목" value={title} onChangeText={setTitle} placeholder="교육 제목" />
            <AppInput label="설명" value={description} onChangeText={setDescription} placeholder="교육 상세 설명" multiline />
            <AppInput label="영상 URL" value={videoUrl} onChangeText={setVideoUrl} placeholder="https://..." />
            <AppInput label="자료 URL" value={materialUrl} onChangeText={setMaterialUrl} placeholder="선택 입력" />
            <AppInput label="교육 시간(분)" value={durationMinutes} onChangeText={setDurationMinutes} placeholder="30" keyboardType="numeric" />
            <View style={styles.rowButtons}>
              <AppButton label={selectedId ? "수정 저장" : "등록"} onPress={handleSave} style={styles.thirdButton} />
              <AppButton label="삭제" variant="danger" onPress={handleDelete} style={styles.thirdButton} />
              <AppButton label="새로 작성" variant="secondary" onPress={resetForm} style={styles.thirdButton} />
            </View>
            {courses.loading ? <LoadingState /> : null}
            {courses.data?.map((item) => (
              <TouchableOpacity key={item.id} style={styles.courseItem} onPress={() => handleSelect(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workerName}>{item.title}</Text>
                  <Text style={styles.workerTeam}>{item.description || "설명 없음"}</Text>
                  <Text style={styles.workerTeam}>{item.durationMinutes}분</Text>
                </View>
                <StatusBadge label={selectedId === item.id ? "선택됨" : "상세보기"} tone={selectedId === item.id ? "orange" : "gray"} />
              </TouchableOpacity>
            ))}
            {!courses.loading && !courses.data?.length ? <EmptyState title="교육자료가 없습니다." /> : null}
          </AppCard>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47%" },
  tileLabel: { color: theme.colors.subText, marginBottom: 10 },
  tileValue: { fontSize: 34, fontWeight: "800", color: theme.colors.text },
  section: { fontSize: 20, fontWeight: "800", color: theme.colors.text, marginBottom: 16 },
  workerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  workerName: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  workerTeam: { color: theme.colors.subText, marginTop: 2 },
  manageCard: { gap: 12 },
  rowButtons: { flexDirection: "row", gap: 10 },
  halfButton: { flex: 1 },
  thirdButton: { flex: 1 },
  courseItem: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: "#F7FAFE",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
