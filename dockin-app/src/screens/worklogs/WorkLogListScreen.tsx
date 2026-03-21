import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen } from "@/src/components/common/Screen";
import { LoadingState } from "@/src/components/common/LoadingState";
import { EmptyState } from "@/src/components/common/EmptyState";
import { AppInput } from "@/src/components/common/AppInput";
import { AppButton } from "@/src/components/common/AppButton";
import { WorkLogCard } from "@/src/components/worklog/WorkLogCard";
import { workLogService } from "@/src/services/workLogService";
import { theme } from "@/src/theme/theme";
import type { WorkLog } from "@/src/types";

export function WorkLogListScreen({ navigation }: any) {
  const [keyword, setKeyword] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [data, setData] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await workLogService.getWorkLogs());
    } catch (error: any) {
      setError(error?.message ?? "작업일지를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadByKeyword = async () => {
    if (!keyword.trim()) {
      await loadAll();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await workLogService.searchWorkLogs({ keyword: keyword.trim() }));
    } catch (error: any) {
      setError(error?.message ?? "검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadByWorker = async () => {
    if (!targetUserId.trim()) {
      await loadAll();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await workLogService.getWorkerWorkLogs(targetUserId.trim()));
    } catch (error: any) {
      setError(error?.message ?? "작업자 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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
      <View style={styles.filters}>
        <AppInput label="키워드 검색" value={keyword} onChangeText={setKeyword} placeholder="제목 또는 내용 검색" />
        <View style={styles.buttonRow}>
          <AppButton label="검색" onPress={loadByKeyword} style={styles.filterButton} />
          <AppButton label="전체" variant="secondary" onPress={loadAll} style={styles.filterButton} />
        </View>
        <AppInput label="특정 작업자 조회" value={targetUserId} onChangeText={setTargetUserId} placeholder="사원번호 입력" />
        <AppButton label="작업자 작업일지 조회" variant="secondary" onPress={loadByWorker} />
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
      <TouchableOpacity onPress={loadAll}>
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
  filters: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flex: 1,
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
