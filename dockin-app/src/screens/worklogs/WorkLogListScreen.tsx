import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen } from "@/src/components/common/Screen";
import { LoadingState } from "@/src/components/common/LoadingState";
import { EmptyState } from "@/src/components/common/EmptyState";
import { WorkLogCard } from "@/src/components/worklog/WorkLogCard";
import { useAsyncData } from "@/src/hooks/useAsyncData";
import { workLogService } from "@/src/services/workLogService";
import { theme } from "@/src/theme/theme";
import type { WorkLog } from "@/src/types";

export function WorkLogListScreen({ navigation }: any) {
  const loadLogs = useCallback(() => workLogService.getWorkLogs(), []);
  const { data, loading, error, reload } = useAsyncData(loadLogs);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>같은 구역 근무일지</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate("WorkLogTranslation")}>
            <MaterialIcons name="translate" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("WorkLogEditor", { mode: "create" })}>
            <MaterialIcons name="edit-note" size={30} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <LoadingState /> : null}
      {!loading && !data?.length ? <EmptyState title="등록된 작업일지가 없습니다." /> : null}
      {data?.map((item: WorkLog) => (
        <WorkLogCard
          key={item.logId}
          item={item}
          onPress={() => navigation.navigate("WorkLogDetail", { logId: item.logId })}
        />
      ))}
      <TouchableOpacity onPress={reload}>
        <Text style={styles.reload}>새로고침</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  reload: {
    textAlign: "center",
    color: theme.colors.primary,
    fontWeight: "700",
    marginVertical: 16,
  },
  error: {
    color: theme.colors.danger,
  },
});
