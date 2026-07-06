import { Tabs } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, PersonStanding, BarChart3, User, Stethoscope, BookOpen } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

const ICONS: Record<string, any> = {
  home: Home,
  body: PersonStanding,
  knowledge: BookOpen,
  medical: Stethoscope,
  progress: BarChart3,
  profile: User,
};

/** Custom tab bar ported from the web BottomNav (pill highlight, 6 tabs). */
const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const labels: Record<string, string> = {
    home: t("Start", "Home"),
    body: t("K\u00f6rper", "Body"),
    knowledge: t("Wissen", "Learn"),
    medical: t("Medizin", "Medical"),
    progress: t("Verlauf", "Progress"),
    profile: t("Profil", "Profile"),
  };

  return (
    <View
      className="flex-row items-center justify-around border-t border-border bg-card px-2 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              navigation.navigate(route.name as never);
            }}
            className={`items-center gap-0.5 px-2.5 py-1 rounded-xl ${isActive ? "bg-droppi-sky-light" : ""}`}
          >
            <Icon size={20} color={isActive ? colors.primary : colors.mutedForeground} />
            <Text className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {labels[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="body" />
      <Tabs.Screen name="knowledge" />
      <Tabs.Screen name="medical" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
