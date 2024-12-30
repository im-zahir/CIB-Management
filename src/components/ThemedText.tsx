import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'link' | 'subtitle';
  children: React.ReactNode;
}

export function ThemedText({ type = 'default', style, children, ...props }: ThemedTextProps) {
  const theme = useTheme();

  const textStyles = {
    default: {
      color: theme.colors.onBackground,
      fontSize: 16,
    },
    title: {
      color: theme.colors.onBackground,
      fontSize: 20,
      fontWeight: 'bold',
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
    },
    link: {
      color: theme.colors.primary,
      fontSize: 16,
      textDecorationLine: 'underline',
    },
  };

  return (
    <Text style={[textStyles[type], style]} {...props}>
      {children}
    </Text>
  );
}
