import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // A smoother pulse animation with a wider range for better visibility
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
    backgroundColor: '#cbd5e1', // Slate-300 for clear visibility
  };

  return (
    <Animated.View 
      style={[
        baseStyle, 
        animatedStyle, 
        style
      ]} 
    />
  );
}

const styles = StyleSheet.create({});
