import { router, useRootNavigationState } from 'expo-router'; // 1. Thêm import này
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  const rootNavigationState = useRootNavigationState(); // 2. Lấy trạng thái navigation
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 3. Check xem root layout đã mount xong chưa
    if (!rootNavigationState?.key) return;
    
    setIsReady(true);
  }, [rootNavigationState?.key]);

  useEffect(() => {
    if (!isReady) return;

    // 4. Chỉ chạy logic điều hướng khi đã sẵn sàng
    const checkLogin = async () => {
      const isLoggedIn = false; // Logic check login của bạn

      // Dùng setTimeout nhỏ để đẩy xuống cuối hàng đợi sự kiện (trick giúp mượt hơn trên Android)
      setTimeout(() => {
        if (isLoggedIn) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(auth)/login'); // Đảm bảo đường dẫn này đúng với file bạn có
        }
      }, 100);
    };

    checkLogin();
  }, [isReady]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});