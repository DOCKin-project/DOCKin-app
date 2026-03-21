import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/src/components/common/Screen";
import { AppInput } from "@/src/components/common/AppInput";
import { AppButton } from "@/src/components/common/AppButton";
import { theme } from "@/src/theme/theme";
import { useAuthStore } from "@/src/store/authStore";
import { toErrorMessage } from "@/src/utils/error";
import { sanitizeTextInput } from "@/src/utils/security";
import type { AuthStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((state) => state.login);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login({
        employeeNumber: sanitizeTextInput(employeeNumber, 40),
        password: sanitizeTextInput(password, 120),
      });
    } catch (error) {
      setError(toErrorMessage(error, "로그인에 실패했습니다."));
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
      <View style={styles.form}>
        <Text style={styles.title}>로그인</Text>
        <AppInput label="사원번호(아이디)" value={employeeNumber} onChangeText={setEmployeeNumber} placeholder="사원번호를 입력하세요" autoCapitalize="none" autoCorrect={false} />
        <AppInput label="비밀번호" value={password} onChangeText={setPassword} placeholder="비밀번호를 입력하세요" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label="로그인" onPress={handleLogin} loading={loading} />
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "flex-start",
    gap: 28,
    paddingTop: 32,
  },
  languageButton: {
    alignSelf: "flex-end",
  },
  logo: {
    width: 240,
    height: 100,
    alignSelf: "center",
  },
  form: {
    gap: 18,
    marginTop: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: theme.colors.text,
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
