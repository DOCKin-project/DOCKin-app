import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/src/components/common/Screen";
import { AppInput } from "@/src/components/common/AppInput";
import { AppButton } from "@/src/components/common/AppButton";
import { theme } from "@/src/theme/theme";
import { UserRole } from "@/src/types";
import { useAuthStore } from "@/src/store/authStore";
import { toErrorMessage } from "@/src/utils/error";
import { sanitizeTextInput } from "@/src/utils/security";
import type { AuthStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const signup = useAuthStore((state) => state.signup);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.WORKER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      await signup({
        employeeNumber: sanitizeTextInput(employeeNumber, 40),
        name: sanitizeTextInput(name, 60),
        password: sanitizeTextInput(password, 120),
        role,
      });
      navigation.navigate("Login");
    } catch (error) {
      setError(toErrorMessage(error, "회원가입에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen useGradient contentStyle={styles.content}>
      <Pressable style={styles.languageButton}>
        <MaterialCommunityIcons name="web" size={28} color={theme.colors.text} />
      </Pressable>
      <Image source={require("../../../assets/dkTitle.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>회원가입</Text>
      <Text style={styles.description}>필요한 정보만 간단히 입력하세요.</Text>
      <AppInput label="사원번호(아이디)" value={employeeNumber} onChangeText={setEmployeeNumber} placeholder="사원번호를 입력하세요" autoCapitalize="none" autoCorrect={false} />
      <AppInput label="이름" value={name} onChangeText={setName} placeholder="이름을 입력하세요" autoCorrect={false} />
      <AppInput label="비밀번호" value={password} onChangeText={setPassword} placeholder="비밀번호를 입력하세요" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword" />
      <View style={styles.roleRow}>
        {[
          { label: "근로자", value: UserRole.WORKER },
          { label: "관리자", value: UserRole.ADMIN },
        ].map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setRole(item.value)}
            style={[styles.roleButton, role === item.value && styles.roleButtonActive]}
          >
            <Text style={[styles.roleLabel, role === item.value && styles.roleLabelActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton label="회원가입 완료" onPress={handleSignup} loading={loading} />
      <Text onPress={() => navigation.navigate("Login")} style={styles.link}>
        이미 계정이 있나요? 로그인
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  languageButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  logo: {
    width: 210,
    height: 88,
    alignSelf: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: theme.colors.text,
  },
  description: {
    color: theme.colors.subText,
    marginTop: -6,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: "#F4F5F7",
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  roleButtonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: "#FFF8EE",
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  roleLabelActive: {
    color: theme.colors.accent,
  },
  error: {
    color: theme.colors.danger,
  },
  link: {
    textAlign: "center",
    color: theme.colors.accent,
    fontWeight: "700",
  },
});
