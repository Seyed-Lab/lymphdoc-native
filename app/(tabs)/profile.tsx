import ProfileScreen from "@/screens/ProfileScreen";
import { useStore } from "@/lib/StoreContext";

export default function ProfileTab() {
  const store = useStore();
  return <ProfileScreen store={store} />;
}
