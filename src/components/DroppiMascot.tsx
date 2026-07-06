import { Image, ImageStyle, StyleProp } from "react-native";

const SOURCES = {
  happy: require("../../assets/droppi/droppi-happy.png"),
  celebrate: require("../../assets/droppi/droppi-celebrate.png"),
  wave: require("../../assets/droppi/droppi-wave.png"),
  detective: require("../../assets/droppi/droppi-detective.png"),
  clipboard: require("../../assets/droppi/droppi-clipboard.png"),
  shopping: require("../../assets/droppi/droppi-shopping.png"),
  device: require("../../assets/droppi/droppi-device.png"),
  prof: require("../../assets/droppi/prof-droppi.png"),
} as const;

export type DroppiVariant = keyof typeof SOURCES;

interface Props {
  variant?: DroppiVariant;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const DroppiMascot = ({ variant = "happy", size = 96, style }: Props) => (
  <Image
    source={SOURCES[variant]}
    style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    accessibilityLabel="Droppi"
  />
);

export default DroppiMascot;
