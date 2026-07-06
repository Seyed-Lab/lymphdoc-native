import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  children: ReactNode;
  scaleTo?: number;
  haptic?: boolean;
  className?: string;
}

/** Native replacement for framer-motion's whileTap={{ scale }} buttons, with optional haptics. */
const PressableScale = ({ children, scaleTo = 0.97, haptic = false, onPressIn, onPressOut, onPress, ...rest }: Props) => {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={style}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 20, stiffness: 300 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableScale;
