import { useWebSocket } from '@/hooks/use-websocket';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const WebSocketStatus = () => {
  const { getConnectionState } = useWebSocket();
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, [getConnectionState]);

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return '#34C759';
      case 'connecting':
        return '#FF9500';
      case 'disconnected':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Đã kết nối';
      case 'connecting':
        return 'Đang kết nối';
      case 'disconnected':
        return 'Mất kết nối';
      default:
        return 'Không xác định';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
});