import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { theme } from "@/src/theme/theme";
import { useAuthStore } from "@/src/store/authStore";
import ProfileManager from "../../../assets/profileManager.svg";
import LogoutIcon from "../../../assets/logout.svg";

export function SettingsScreen() {
  const userName = useAuthStore((state) => state.userName);
  const employeeNumber = useAuthStore((state) => state.employeeNumber);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Screen>
      <AppCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <ProfileManager width={54} height={54} />
          </View>
          <View>
            <Text style={styles.name}>{userName ?? "김철수"}</Text>
            <Text style={styles.meta}>직급: {role === "ADMIN" ? "관리자" : "근로자"}</Text>
            <Text style={styles.meta}>작업구역: 제 1 조선소</Text>
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.section}>계정 정보</Text>
        <View style={styles.lineItem}>
          <Text style={styles.item}>사원번호(아이디)</Text>
          <Text style={styles.value}>{employeeNumber ?? "-"}</Text>
        </View>
        <View style={styles.lineItem}>
          <Text style={styles.item}>비밀번호 변경</Text>
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.section}>언어</Text>
        <View style={styles.languageRow}>
          <MaterialCommunityIcons name="web" size={34} color="#767676" />
          <Text style={styles.language}>한국어</Text>
        </View>
      </AppCard>

      <AppCard style={styles.logoutCard}>
        <View style={styles.logoutRow}>
          <LogoutIcon width={28} height={28} />
          <Text onPress={logout} style={styles.logout}>로그아웃</Text>
        </View>
      </AppCard>

      <Text style={styles.version}>앱 버전 1.0.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    paddingVertical: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 28, fontWeight: "800", color: theme.colors.text },
  meta: { color: theme.colors.subText, marginTop: 6 },
  sectionCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },
  section: { fontSize: 22, fontWeight: "800", color: theme.colors.text, marginBottom: 8, paddingHorizontal: 20, paddingTop: 20 },
  lineItem: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: "#EDF1F4",
  },
  item: { fontSize: 16, color: theme.colors.text, fontWeight: "600" },
  value: { color: theme.colors.subText, marginTop: 6 },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  language: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  logoutCard: {
    borderRadius: 18,
  },
  logout: {
    color: theme.colors.danger,
    fontSize: 24,
    fontWeight: "800",
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  version: { textAlign: "center", color: theme.colors.subText, marginTop: 8, marginBottom: 8 },
});
