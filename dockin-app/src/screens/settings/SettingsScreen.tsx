import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { theme } from "@/src/theme/theme";
import { useAuthStore } from "@/src/store/authStore";
import { UserAvatar } from "@/src/components/common/UserAvatar";

export function SettingsScreen() {
  const userName = useAuthStore((state) => state.userName);
  const employeeNumber = useAuthStore((state) => state.employeeNumber);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const [openSection, setOpenSection] = useState<string | null>("privacy");

  const legalSections = [
    {
      key: "privacy",
      title: "개인정보 처리방침",
      content: [
        "도크인은 회원 식별, 근태 관리, 작업일지 작성, 채팅 및 번역 기능 제공을 위해 사원번호, 이름, 비밀번호, 역할, 언어설정, 작업기록, 채팅기록, 첨부파일 정보를 처리합니다.",
        "개인정보는 서비스 제공 및 법령상 보관 의무 이행 목적 범위에서만 처리하며, 보유기간이 종료되거나 처리 목적이 달성되면 지체 없이 파기합니다.",
        "회사는 법령상 근거가 있거나 정보주체의 동의가 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.",
        "정보주체는 개인정보 열람, 정정, 삭제, 처리정지 요청을 할 수 있으며 관련 문의는 privacy@dockin.app로 접수할 수 있습니다.",
        "본 방침은 대한민국 개인정보 보호법 제30조에 따른 공개 항목을 반영하여 작성되었습니다.",
      ],
    },
    {
      key: "terms",
      title: "서비스 이용약관",
      content: [
        "이용자는 회사가 부여한 계정을 본인 업무 목적에 한하여 사용해야 하며, 타인에게 계정을 공유하거나 양도할 수 없습니다.",
        "서비스 내 번역, 채팅, 작업일지 기능은 현장 업무 지원을 위한 도구이며, 이용자는 입력하는 정보의 적법성과 정확성에 대한 책임을 부담합니다.",
        "회사는 시스템 점검, 장애 대응, 보안상 필요에 따라 서비스 일부를 변경하거나 중단할 수 있습니다.",
        "법령 위반, 무단 접근 시도, 타인의 개인정보 침해, 악성 파일 업로드 등은 금지되며 위반 시 이용 제한이 있을 수 있습니다.",
      ],
    },
    {
      key: "permissions",
      title: "앱 권한 안내",
      content: [
        "마이크 권한: 실시간 번역 및 음성 기반 작업일지 작성 기능 제공을 위해 사용됩니다.",
        "사진/파일 접근 권한: 작업일지 이미지 및 음성 첨부 기능 제공을 위해 사용됩니다.",
        "네트워크 접근: 로그인, 채팅, 번역, 안전교육, 작업일지 저장 등 서버 연동 기능 제공을 위해 사용됩니다.",
      ],
    },
    {
      key: "license",
      title: "오픈소스 고지",
      content: [
        "본 앱은 React Native, Expo, React Navigation, Zustand, Axios 등 오픈소스 소프트웨어를 사용합니다.",
        "각 라이브러리는 해당 라이선스 조건(MIT, Apache-2.0 등)에 따라 사용되며, 저작권과 라이선스 고지는 각 프로젝트 배포 정책을 따릅니다.",
      ],
    },
  ] as const;

  return (
    <Screen>
      <AppCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <UserAvatar size={72} />
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
        <Pressable style={styles.logoutRow} onPress={logout}>
          <MaterialCommunityIcons name="logout-variant" size={28} color={theme.colors.danger} />
          <Text onPress={logout} style={styles.logout}>로그아웃</Text>
        </Pressable>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.section}>정책 및 안내</Text>
        {legalSections.map((item, index) => {
          const opened = openSection === item.key;
          return (
            <View key={item.key} style={[styles.policyItem, index > 0 && styles.policyBorder]}>
              <Pressable style={styles.policyHeader} onPress={() => setOpenSection(opened ? null : item.key)}>
                <Text style={styles.policyTitle}>{item.title}</Text>
                <MaterialCommunityIcons name={opened ? "chevron-up" : "chevron-down"} size={24} color="#7B838E" />
              </Pressable>
              {opened ? (
                <View style={styles.policyBody}>
                  {item.content.map((line) => (
                    <Text key={line} style={styles.policyText}>{line}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
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
    overflow: "hidden",
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
  policyItem: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  policyBorder: {
    borderTopWidth: 1,
    borderTopColor: "#EDF1F4",
  },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  policyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  policyBody: {
    marginTop: 12,
    gap: 10,
  },
  policyText: {
    color: theme.colors.subText,
    lineHeight: 22,
    fontSize: 14,
  },
  version: { textAlign: "center", color: theme.colors.subText, marginTop: 8, marginBottom: 8 },
});
