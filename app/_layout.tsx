import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StorageProvider } from "@/lib/storage";
import { I18nProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/StoreContext";
import { colors } from "@/lib/theme";

const Loading = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
    <ActivityIndicator color={colors.primary} size="large" />
  </View>
);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StorageProvider fallback={<Loading />}>
          <I18nProvider>
            <StoreProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </StoreProvider>
          </I18nProvider>
        </StorageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
