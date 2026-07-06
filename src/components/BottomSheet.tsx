import { ReactNode } from "react";
import { Modal, View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "@/lib/theme";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Native replacement for the web app's shadcn Sheet (side="bottom"). */
const BottomSheet = ({ open, onClose, title, children }: Props) => (
  <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable className="flex-1 bg-black/30" onPress={onClose} />
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="bg-background rounded-t-3xl max-h-[88%] pb-8">
        <View className="items-center pt-2 pb-1">
          <View className="w-10 h-1.5 rounded-full bg-muted" />
        </View>
        <View className="flex-row items-center justify-between px-5 pb-2">
          <Text className="text-lg font-extrabold text-foreground">{title ?? ""}</Text>
          <Pressable onPress={onClose} hitSlop={8} className="w-8 h-8 rounded-full bg-muted items-center justify-center">
            <X size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <ScrollView className="px-5" keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

export default BottomSheet;
