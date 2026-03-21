import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/src/components/common/Screen";
import { AppButton } from "@/src/components/common/AppButton";
import { theme } from "@/src/theme/theme";
import type { AuthStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <Screen useGradient contentStyle={styles.content}>
      <Pressable style={styles.languageButton}>
        <MaterialCommunityIcons name="web" size={28} color={theme.colors.text} />
      </Pressable>
      <View style={styles.hero}>
        <Text style={styles.subtitle}>
          <Text style={styles.accent}>도크</Text>에서 안전하게, 도크인
        </Text>
        <Image source={require("../../../assets/dkTitle.png")} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.footer}>
        <AppButton label="시작하기" onPress={() => navigation.navigate("Login")} style={styles.button} />
        <Text style={styles.caption}>도크인이 처음인가요?? <Text style={styles.link}>회원가입</Text></Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 80,
  },
  languageButton: {
    alignSelf: "flex-end",
  },
  hero: {
    alignItems: "center",
    gap: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
  accent: {
    color: theme.colors.accent,
  },
  logo: {
    width: 260,
    height: 112,
  },
  footer: {
    gap: 16,
    alignItems: "center",
  },
  button: {
    width: "88%",
  },
  caption: {
    color: theme.colors.subText,
  },
  link: {
    color: theme.colors.accent,
    fontWeight: "700",
  },
});
