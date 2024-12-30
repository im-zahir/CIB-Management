// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'shippingbox.fill': 'inventory',
  'dollarsign.circle.fill': 'attach-money',
  'creditcard.fill': 'credit-card',
  'person.3.fill': 'group',
  'chart.bar.fill': 'bar-chart',
  'gearshape.fill': 'settings',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as const;

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];
type SFSymbolName = keyof typeof MAPPING;

export type IconSymbolName = SFSymbolName;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. 
 * This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({ name, size = 24, color, style, weight }: IconSymbolProps) {
  const materialName = MAPPING[name] as MaterialIconName;
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
