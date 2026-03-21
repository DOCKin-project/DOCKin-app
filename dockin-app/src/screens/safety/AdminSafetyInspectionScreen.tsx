import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
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
  const summary = useAsyncData(loadSummary);
  const workers = useAsyncData(loadWorkers);

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
});
