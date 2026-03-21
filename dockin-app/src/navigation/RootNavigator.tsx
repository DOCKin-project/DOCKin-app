import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/src/theme/theme";
import { useAuthStore } from "@/src/store/authStore";
import { OnboardingScreen } from "@/src/screens/auth/OnboardingScreen";
import { LoginScreen } from "@/src/screens/auth/LoginScreen";
import { SignupScreen } from "@/src/screens/auth/SignupScreen";
import { LiveTranslationScreen } from "@/src/screens/worklogs/LiveTranslationScreen";
import { ChatRoomListScreen } from "@/src/screens/chat/ChatRoomListScreen";
import { AdminHomeScreen } from "@/src/screens/home/AdminHomeScreen";
import { WorkerHomeScreen } from "@/src/screens/home/WorkerHomeScreen";
import { WorkLogListScreen } from "@/src/screens/worklogs/WorkLogListScreen";
import { AdminSafetyInspectionScreen } from "@/src/screens/safety/AdminSafetyInspectionScreen";
import { SafetyEducationScreen } from "@/src/screens/safety/SafetyEducationScreen";
import { WorkLogDetailScreen } from "@/src/screens/worklogs/WorkLogDetailScreen";
import { WorkLogEditorScreen } from "@/src/screens/worklogs/WorkLogEditorScreen";
import { WorkLogTranslationScreen } from "@/src/screens/worklogs/WorkLogTranslationScreen";
import { ChatRoomScreen } from "@/src/screens/chat/ChatRoomScreen";
import { ChatbotScreen } from "@/src/screens/chat/ChatbotScreen";
import { SettingsScreen } from "@/src/screens/settings/SettingsScreen";
import { AttendanceManagementScreen } from "@/src/screens/management/AttendanceManagementScreen";
import { EmergencyNoticeScreen } from "@/src/screens/management/EmergencyNoticeScreen";
import type { AuthStackParamList } from "@/src/navigation/types";
import NavIcon0 from "../../assets/nav/icon0.svg";
import NavIcon0Active from "../../assets/nav/icon0_Act.svg";
import NavIcon1 from "../../assets/nav/icon1.svg";
import NavIcon1Active from "../../assets/nav/icon1_Act.svg";
import NavIcon2 from "../../assets/nav/icon2.svg";
import NavIcon2Active from "../../assets/nav/icon2_Act.svg";
import NavIcon3 from "../../assets/nav/icon3.svg";
import NavIcon3Active from "../../assets/nav/icon3_Act.svg";
import NavIcon4 from "../../assets/nav/icon4.svg";
import NavIcon4Active from "../../assets/nav/icon4_Act.svg";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator();
const TranslateStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const WorkLogStack = createNativeStackNavigator();
const SafetyStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function stackScreenOptions(title?: string) {
  return {
    headerShown: true,
    title,
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTintColor: "#FFFFFF",
    headerShadowVisible: false,
    headerTitleStyle: { fontWeight: "800" as const, fontSize: 28 },
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
  };
}

function TranslateNavigator() {
  return (
    <TranslateStack.Navigator screenOptions={stackScreenOptions()}>
      <TranslateStack.Screen name="LiveTranslationRoot" component={LiveTranslationScreen} options={stackScreenOptions("실시간번역")} />
    </TranslateStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={stackScreenOptions()}>
      <ChatStack.Screen name="ChatRooms" component={ChatRoomListScreen} options={stackScreenOptions("채팅")} />
      <ChatStack.Screen
        name="ChatRoom"
        component={ChatRoomScreen as React.ComponentType<any>}
        options={({ route }: any) => stackScreenOptions(route.params?.title ?? "채팅")}
      />
      <ChatStack.Screen name="Chatbot" component={ChatbotScreen} options={stackScreenOptions("토크인")} />
      <ChatStack.Screen name="Settings" component={SettingsScreen} options={stackScreenOptions("설정")} />
    </ChatStack.Navigator>
  );
}

function HomeNavigator() {
  const role = useAuthStore((state) => state.role);
  const homeTitle = role === "ADMIN" ? "관리자 기능" : "근태";

  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions()}>
      <HomeStack.Screen name="HomeRoot" component={role === "ADMIN" ? AdminHomeScreen : WorkerHomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} options={stackScreenOptions("설정")} />
      <HomeStack.Screen name="AttendanceManagement" component={AttendanceManagementScreen} options={stackScreenOptions("근태관리")} />
      <HomeStack.Screen name="EmergencyNotice" component={EmergencyNoticeScreen} options={stackScreenOptions("긴급사항")} />
      <HomeStack.Screen name="HomeHeader" component={role === "ADMIN" ? AdminHomeScreen : WorkerHomeScreen} options={stackScreenOptions(homeTitle)} />
    </HomeStack.Navigator>
  );
}

function WorkLogNavigator() {
  return (
    <WorkLogStack.Navigator screenOptions={stackScreenOptions()}>
      <WorkLogStack.Screen name="WorkLogList" component={WorkLogListScreen} options={stackScreenOptions("작업일지")} />
      <WorkLogStack.Screen
        name="WorkLogDetail"
        component={WorkLogDetailScreen as React.ComponentType<any>}
        options={stackScreenOptions("작업일지 상세")}
      />
      <WorkLogStack.Screen
        name="WorkLogEditor"
        component={WorkLogEditorScreen as React.ComponentType<any>}
        options={stackScreenOptions("작업일지 작성")}
      />
      <WorkLogStack.Screen
        name="WorkLogTranslation"
        component={WorkLogTranslationScreen as React.ComponentType<any>}
        options={stackScreenOptions("작업일지 번역")}
      />
    </WorkLogStack.Navigator>
  );
}

function SafetyNavigator() {
  const role = useAuthStore((state) => state.role);

  return (
    <SafetyStack.Navigator screenOptions={stackScreenOptions()}>
      <SafetyStack.Screen
        name="SafetyRoot"
        component={role === "ADMIN" ? AdminSafetyInspectionScreen : SafetyEducationScreen}
        options={stackScreenOptions("안전점검")}
      />
    </SafetyStack.Navigator>
  );
}

function DockinTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const iconMap = {
    Translate: { active: NavIcon0Active, inactive: NavIcon0 },
    Chat: { active: NavIcon1Active, inactive: NavIcon1 },
    Home: { active: NavIcon2Active, inactive: NavIcon2 },
    WorkLogs: { active: NavIcon3Active, inactive: NavIcon3 },
    Safety: { active: NavIcon4Active, inactive: NavIcon4 },
  } as const;

  return (
    <View style={styles.tabOuter}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = typeof options.tabBarLabel === "string" ? options.tabBarLabel : options.title ?? route.name;
          const Icon = focused ? iconMap[route.name as keyof typeof iconMap].active : iconMap[route.name as keyof typeof iconMap].inactive;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
            >
              <Icon width={28} height={28} />
              <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  const role = useAuthStore((state) => state.role);

  return (
    <Tab.Navigator
      tabBar={(props) => <DockinTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Translate" component={TranslateNavigator} options={{ tabBarLabel: "번역" }} />
      <Tab.Screen name="Chat" component={ChatNavigator} options={{ tabBarLabel: "채팅" }} />
      <Tab.Screen name="Home" component={HomeNavigator} options={{ tabBarLabel: role === "ADMIN" ? "관리자기능" : "근태" }} />
      <Tab.Screen name="WorkLogs" component={WorkLogNavigator} options={{ tabBarLabel: "작업일지" }} />
      <Tab.Screen name="Safety" component={SafetyNavigator} options={{ tabBarLabel: "안전점검" }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: theme.colors.background },
      }}
    >
      {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabOuter: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FBFDFF",
    borderTopWidth: 1,
    borderTopColor: "#E3EAF2",
    minHeight: 84,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: "#AEBFD1",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C7D0DA",
  },
  tabLabelFocused: {
    color: theme.colors.primary,
  },
});
