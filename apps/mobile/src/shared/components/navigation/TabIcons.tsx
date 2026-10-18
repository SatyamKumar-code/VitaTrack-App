import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export interface TabIconProps {
  color: any;
  size?: number;
  focused?: boolean;
}

/**
 * 🏠 Home Tab Icon: Modern minimal home outline with glowing hearth
 */
export const HomeTabIcon: React.FC<TabIconProps> = ({ color, size = 22, focused }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15C14 14.4477 13.5523 14 13 14H11C10.4477 14 10 14.4477 10 15V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.15 : 0}
      />
    </Svg>
  );
};

/**
 * 📝 Checkup Tab Icon: Clinical clipboard with health checkmark
 */
export const CheckupTabIcon: React.FC<TabIconProps> = ({ color, size = 22, focused }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="4"
        width="14"
        height="17"
        rx="2"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.15 : 0}
      />
      <Path
        d="M9 2H15C15.5523 2 16 2.44772 16 3V5H8V3C8 2.44772 8.44772 2 9 2Z"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 13.5L11 15.5L15 11"
        stroke={color}
        strokeWidth={focused ? 2.2 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

/**
 * ☀️ Guidance Tab Icon: Radiant sun with solar synthesis rays
 */
export const GuidanceTabIcon: React.FC<TabIconProps> = ({ color, size = 22, focused }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="4.5"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.2 : 0}
      />
      <Path
        d="M12 2V4.5M12 19.5V22M4.5 12H2M22 12H19.5M6.7 6.7L4.9 4.9M19.1 19.1L17.3 17.3M6.7 17.3L4.9 19.1M19.1 4.9L17.3 6.7"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * 📊 Trends Tab Icon: Ascending longitudinal analytics chart
 */
export const TrendsTabIcon: React.FC<TabIconProps> = ({ color, size = 22, focused }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 20H21"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
      />
      <Rect
        x="5"
        y="13"
        width="3"
        height="7"
        rx="1"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.2 : 0}
      />
      <Rect
        x="10.5"
        y="9"
        width="3"
        height="11"
        rx="1"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.25 : 0}
      />
      <Rect
        x="16"
        y="5"
        width="3"
        height="15"
        rx="1"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.35 : 0}
      />
    </Svg>
  );
};

/**
 * 👤 Profile Tab Icon: Protected user biometric silhouette
 */
export const ProfileTabIcon: React.FC<TabIconProps> = ({ color, size = 22, focused }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="4"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.2 : 0}
      />
      <Path
        d="M5 20C5 16.6863 8.13401 14 12 14C15.866 14 19 16.6863 19 20"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};
