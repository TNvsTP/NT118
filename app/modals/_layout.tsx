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
      <Stack.Screen 
        name="reactions-shares-modal" 
        options={{ 
          presentation: 'modal',
          title: 'Lượt tương tác'
        }} 
      />
      <Stack.Screen 
        name="edit-post" 
        options={{ 
          presentation: 'modal',
          title: 'Chỉnh sửa bài viết'
        }} 
      />
      <Stack.Screen 
        name="report-post" 
        options={{ 
          presentation: 'modal',
          title: 'Báo cáo bài viết'
        }} 
      />
    </Stack>
  );
}
