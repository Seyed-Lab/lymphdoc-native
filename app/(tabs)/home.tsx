import HomeScreen from "@/screens/HomeScreen";
import { useStore } from "@/lib/StoreContext";

export default function HomeTab() {
  const store = useStore();
  return <HomeScreen store={store} />;
}
