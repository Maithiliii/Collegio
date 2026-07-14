import React from "react";
import { Image } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { colors } from "../../theme/tokens";
import ServicesIconSource from "../../assets/icons8-services-50.png";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export const SearchIcon: React.FC<IconProps> = ({ size = 17, color = colors.ink, strokeWidth = 2.4 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={strokeWidth} />
    <Path d="m20 20-3.5-3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({ size = 19, color = colors.ink, strokeWidth = 2.2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ClearIcon: React.FC<IconProps> = ({ size = 11, color = colors.yellow, strokeWidth = 3 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, color = colors.ink, strokeWidth = 2.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const BackChevronIcon: React.FC<IconProps> = ({ size = 17, color = colors.ink, strokeWidth = 2.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ size = 14, color = colors.mutedText, strokeWidth = 2.2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const PhotoUploadIcon: React.FC<IconProps> = ({ size = 24, color = colors.mutedText, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={5} width={18} height={15} rx={2} stroke={color} strokeWidth={strokeWidth} fill="none" />
    <Circle cx={9} cy={10} r={1.6} stroke={color} strokeWidth={strokeWidth} />
    <Path d="M3 17l5-4 4 3 4-3 5 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 19, color = colors.white, strokeWidth = 2.6 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const HomeTabIcon: React.FC<IconProps> = ({ size = 19, color = colors.ink, strokeWidth = 2.3 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4v-9z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
  </Svg>
);

export const GoodsTabIcon: React.FC<IconProps> = ({ size = 19, color = colors.ink, strokeWidth = 2.1 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7l8-4 8 4-8 4-8-4z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <Path d="M4 7v6l8 4 8-4V7" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
  </Svg>
);

export const ServicesTabIcon: React.FC<IconProps> = ({ size = 19, color = colors.ink }) => (
  <Image
    source={ServicesIconSource}
    resizeMode="contain"
    style={{ width: size, height: size, tintColor: color }}
  />
);

export const LostFoundTabIcon: React.FC<IconProps> = ({ size = 19, color = colors.ink, strokeWidth = 2.1 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="m20 20-3.5-3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);
