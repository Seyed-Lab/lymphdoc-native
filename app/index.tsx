import { Redirect } from "expo-router";
import { useStore } from "@/lib/StoreContext";

export default function Index() {
  const store = useStore();
  if (!store.settings.profile.onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/home" />;
}
