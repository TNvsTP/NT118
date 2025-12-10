import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="new-post" 
        options={{ 
          presentation: 'modal',
          title: 'Bài viết mới'
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          presentation: 'modal',
          title: 'Chỉnh sửa trang cá nhân'
        }} 
      />
    </Stack>
  );
}
