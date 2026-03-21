import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Screen } from "@/src/components/common/Screen";
import { AppButton } from "@/src/components/common/AppButton";
import { AppCard } from "@/src/components/common/AppCard";
import { LoadingState } from "@/src/components/common/LoadingState";
import { useAsyncData } from "@/src/hooks/useAsyncData";
import { attendanceService } from "@/src/services/attendanceService";
import { theme } from "@/src/theme/theme";
import { useAuthStore } from "@/src/store/authStore";

export function WorkerHomeScreen({ navigation }: BottomTabScreenProps<any>) {
  const userName = useAuthStore((state) => state.userName);
  const loadAttendance = useCallback(() => attendanceService.getTodayAttendance(), []);
  const { data, loading, error, reload, setData } = useAsyncData(loadAttendance);

  const handleAction = async () => {
    const next = data?.state === "WORKING" ? await attendanceService.checkOut() : await attendanceService.checkIn();
    setData(next);
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.name}>근로자 {userName ?? "박철수"}</Text>
        </View>
        <View style={styles.headerIcons}>
          <MaterialIcons name="search" size={24} color={theme.colors.text} />
          <MaterialIcons name="public" size={24} color={theme.colors.text} />
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <MaterialIcons name="person-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pillRow}>
        <View style={styles.sitePill}><Text style={styles.sitePillText}>제 8 조선소</Text></View>
        <View style={[styles.statusPill, data?.state === "WORKING" ? styles.statusWorking : styles.statusBefore]}>
          <Text style={styles.statusPillText}>{data?.state === "WORKING" ? "출근중" : "출근전"}</Text>
        </View>
      </View>

      <AppCard style={styles.weatherCard}>
        <Text style={styles.weatherTitle}>울산 미포조선</Text>
        <Text style={styles.weatherLine}>흐림 · 27°C · 습도 78% · 풍속 6m/s · 강수확률 70%</Text>
        <Text style={styles.weatherWarn}>젖은 철판 및 발판 위 이동 시 주의하세요.</Text>
      </AppCard>

      <AppButton
        label={data?.state === "WORKING" ? "퇴근하기" : "출근하기"}
        onPress={handleAction}
        style={{ backgroundColor: data?.state === "WORKING" ? theme.colors.primary : theme.colors.accent }}
      />

      <AppCard>
        <Text style={styles.sectionTitle}>오늘의 근태 현황</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statsLabel}>출근</Text>
            <Text style={styles.statsValue}>{data?.checkInTime ?? "-"}</Text>
          </View>
          <View>
            <Text style={styles.statsLabel}>퇴근</Text>
            <Text style={styles.statsValue}>{data?.checkOutTime ?? "-"}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statsLabel}>휴가</Text>
            <Text style={styles.statsValue}>{data?.leaveDays ?? 0}일</Text>
          </View>
          <View>
            <Text style={styles.statsLabel}>병결</Text>
            <Text style={styles.statsValue}>{data?.absentDays ?? 0}일</Text>
          </View>
        </View>
        <TouchableOpacity onPress={reload}>
          <Text style={styles.refresh}>다시 불러오기</Text>
        </TouchableOpacity>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.text,
  },
  pillRow: {
    flexDirection: "row",
    gap: 12,
  },
  sitePill: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...theme.shadow.card,
  },
  sitePillText: {
    color: theme.colors.accent,
    fontWeight: "800",
    fontSize: 18,
  },
  statusPill: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusBefore: {
    backgroundColor: "#FF4A62",
  },
  statusWorking: {
    backgroundColor: "#16C25F",
  },
  statusPillText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.subText,
    marginTop: 6,
  },
  weatherCard: {
    backgroundColor: "#59B3F7",
  },
  weatherTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 22,
    marginBottom: 10,
  },
  weatherLine: {
    color: "#EAF5FF",
    lineHeight: 24,
  },
  weatherWarn: {
    color: "#FFFFFF",
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statsLabel: {
    color: theme.colors.subText,
  },
  statsValue: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 6,
  },
  refresh: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  error: {
    color: theme.colors.danger,
    marginBottom: 12,
  },
});
