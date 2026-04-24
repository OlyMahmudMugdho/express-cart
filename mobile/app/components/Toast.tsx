import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withSequence,
  runOnJS 
} from 'react-native-reanimated';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

export default function Toast({ 
  visible, 
  message, 
  type = 'success', 
  onDismiss, 
  duration = 3000 
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Enter animation
      translateY.value = withSpring(insets.top + 10, { damping: 15 });
      opacity.value = withSpring(1);

      // Exit animation after delay
      const timeout = setTimeout(() => {
        translateY.value = withSpring(-100, { damping: 15 }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        });
        opacity.value = withSpring(0);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible, insets.top]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#0f172a';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'checkmark-circle';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        <Ionicons name={getIcon() as any} size={22} color="#fff" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
});
