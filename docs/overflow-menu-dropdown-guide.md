# Hướng dẫn Overflow Menu Dropdown cho PostCard

## Cập nhật mới

### Thay đổi từ Modal sang Dropdown
- **Trước**: Overflow menu hiển thị dưới dạng modal overlay toàn màn hình
- **Sau**: Overflow menu hiển thị dưới dạng dropdown nhỏ gọn bên cạnh nút menu

### Cải thiện UX cho Edit Post
- **Local State Management**: PostCard giờ sử dụng `currentPost` state để cập nhật UI ngay lập tức
- **Real-time Updates**: Sau khi edit, bài viết được cập nhật hiển thị ngay mà không cần reload
- **Form Reset**: EditPostModal tự động reset form khi mở với dữ liệu mới nhất

## Cấu trúc Dropdown Menu

### Layout
```
┌─────────────────┐
│ Avatar  Name  ⋯ │ ← Nút overflow
│                 │
│ Content...      │
│                 │
│ [Media]         │
│                 │
│ ❤️ 💬 📤        │
└─────────────────┘
      ↓
┌─────────────┐
│ ✏️ Chỉnh sửa │ ← Dropdown menu
│ ─────────── │
│ 🗑️ Xóa      │
└─────────────┘
```

### Positioning
- **Position**: `absolute` với `top: 40px, right: 0`
- **Z-index**: Menu có `zIndex: 2`, overlay có `zIndex: 1`
- **Shadow**: Subtle shadow để tạo độ sâu

## State Management

### PostCard Internal State
```typescript
const [currentPost, setCurrentPost] = useState(post);

// Cập nhật khi prop thay đổi
useEffect(() => {
  setCurrentPost(post);
}, [post]);

// Cập nhật local khi edit
const handlePostUpdated = (updatedPost: PostItem) => {
  setCurrentPost(updatedPost);  // ← Cập nhật ngay lập tức
  onPostUpdated?.(updatedPost); // ← Thông báo parent
};
```

### Real-time Updates
1. **Edit**: Cập nhật `currentPost` → UI thay đổi ngay
2. **Reaction**: Cập nhật `currentPost` → Counter thay đổi ngay  
3. **Share**: Cập nhật `currentPost` → Icon thay đổi ngay

## API Integration

### EditPost Service
```typescript
editPost: async (postId: number, content: string, media_url: string[]) => {
  const response = await api.put(`posts/${postId}`, {content, media_url});
  const postData = response.data || response;
  
  // Chuyển đổi media_urls thành media array
  if (postData.media_url && !postData.media) {
    postData.media = postData.media_url.map((url, index) => ({
      id: index + 1,
      media_url: url
    }));
  }
  
  return postData;
}
```

## Styling

### Dropdown Styles
```css
dropdownMenu: {
  position: 'absolute',
  top: 40,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 8,
  minWidth: 140,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
  zIndex: 2,
}
```

### Overlay để đóng menu
```css
dropdownOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
}
```

## User Experience

### Interactions
1. **Mở menu**: Tap vào nút ⋯
2. **Đóng menu**: Tap bên ngoài menu hoặc chọn action
3. **Edit**: Mở modal → Chỉnh sửa → Lưu → UI cập nhật ngay
4. **Delete**: Hiển thị confirm dialog → Xóa → Remove khỏi list

### Visual Feedback
- **Hover effect**: Không có (mobile)
- **Active state**: Menu item highlight khi press
- **Loading state**: "Đang lưu..." trong edit modal
- **Success feedback**: Alert "Đã cập nhật bài viết"

## Performance

### Optimizations
- **Local state**: Giảm re-render từ parent
- **Optimistic updates**: UI phản hồi ngay, không đợi API
- **Minimal re-renders**: Chỉ update component cần thiết

### Memory Management
- **State cleanup**: Reset form khi đóng modal
- **Event listeners**: Tự động cleanup khi unmount

## Testing

### Test Cases
1. **Menu hiển thị đúng**: Owner vs non-owner
2. **Edit functionality**: Content + media updates
3. **Delete functionality**: Confirm dialog + removal
4. **Report functionality**: Modal mở đúng
5. **UI updates**: Real-time reflection của changes
6. **Dropdown positioning**: Đúng vị trí trên các screen sizes

### Edge Cases
- **Empty content**: Validation ngăn save
- **Network error**: Error handling + user feedback
- **Concurrent edits**: Last write wins
- **Large media**: Loading states + progress