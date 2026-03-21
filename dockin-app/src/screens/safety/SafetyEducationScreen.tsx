import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppButton } from "@/src/components/common/AppButton";
import { EmptyState } from "@/src/components/common/EmptyState";
import { LoadingState } from "@/src/components/common/LoadingState";
import { StatusBadge } from "@/src/components/common/StatusBadge";
import { useAsyncData } from "@/src/hooks/useAsyncData";
import { safetyService } from "@/src/services/safetyService";
import { theme } from "@/src/theme/theme";
import type { SafetyEducation } from "@/src/types";

export function SafetyEducationScreen() {
  const loadEducations = useCallback(() => safetyService.getEducationList(), []);
  const { data, loading, error } = useAsyncData(loadEducations);

  return (
    <Screen>
      <AppCard style={styles.hero}>
        <Text style={styles.heroText}>이수 현황</Text>
        <Text style={styles.heroCount}>{data?.filter((item: SafetyEducation) => item.completed).length ?? 0} / {data?.length ?? 0}</Text>
      </AppCard>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <LoadingState /> : null}
      {!loading && !data?.length ? <EmptyState title="교육 목록이 없습니다." /> : null}
      {data?.map((item: SafetyEducation) => (
        <AppCard key={item.id}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.durationMinutes}분 · 마감 {item.deadline}</Text>
            </View>
            <StatusBadge label={item.completed ? "이수완료" : "진행중"} tone={item.completed ? "green" : "orange"} />
          </View>
          {!item.completed ? <AppButton label="학습시작" variant="secondary" onPress={() => {}} /> : null}
        </AppCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.colors.primary },
  heroText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  heroCount: { color: "#FFFFFF", fontSize: 36, fontWeight: "900", marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 },
  itemTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  meta: { color: theme.colors.subText, marginTop: 4 },
  error: { color: theme.colors.danger },
});
