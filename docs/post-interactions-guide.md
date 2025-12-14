# Hướng dẫn Tương tác với Bài viết

## Tổng quan

Đã implement các chức năng tương tác với bài viết theo yêu cầu:

### 1. Nhấn vào Avatar → Đi tới Profile User
- **Component**: `PostCard`
- **Chức năng**: Khi nhấn vào avatar hoặc tên người đăng, sẽ navigate tới `/profile/{userId}`
- **File liên quan**: 
  - `components/post-card.tsx` - Component chính
  - `app/profile/[id].tsx` - Trang profile user

### 2. Nhấn vào Ảnh → Mở ảnh fullscreen
- **Component**: `MediaGallery` trong `PostCard`
- **Chức năng**: Khi nhấn vào ảnh, sẽ mở modal hiển thị ảnh fullscreen với khả năng swipe qua các ảnh
- **File liên quan**:
  - `app/modals/image-viewer.tsx` - Modal hiển thị ảnh

### 3. Reaction và Share
- **Chức năng**: Toggle reaction (like/unlike) và share với cập nhật UI real-time
- **API**: Sử dụng `PostService.toggleReaction()` và `PostService.toggleShare()`
- **File liên quan**:
  - `hooks/use-post-interactions.ts` - Hook quản lý state interactions
  - `hooks/use-posts.ts` - Hook cho danh sách posts (home)
  - `hooks/use-post-detail.ts` - Hook cho chi tiết post

### 4. Nhấn vào Content/Comment → Đi tới Chi tiết Post
- **Chức năng**: 
  - Ở trang home/search: nhấn vào content hoặc comment sẽ đi tới `/post/{postId}`
  - Ở trang chi tiết post: không có action (disabled)
- **Props**: `isDetailView` để phân biệt context

## Cấu trúc File

```
components/
├── post-card.tsx          # Component tái sử dụng cho hiển thị post
└── loading-spinner.tsx    # Component loading

app/
├── (tabs)/
│   └── home.tsx          # Trang home sử dụng PostCard
├── post/
│   └── [id].tsx          # Trang chi tiết post
├── profile/
│   └── [id].tsx          # Trang profile user
└── modals/
    └── image-viewer.tsx  # Modal hiển thị ảnh fullscreen

hooks/
├── use-post-interactions.ts  # Hook quản lý state interactions
├── use-posts.ts             # Hook cho danh sách posts
└── use-post-detail.ts       # Hook cho chi tiết post
```

## Cách sử dụng

### Trong Home Screen:
```tsx
import { PostCard } from '../../components/post-card';

const { posts, updatePostReaction, updatePostShare } = usePosts();

<PostCard 
  post={item} 
  onReactionToggle={updatePostReaction}
  onShareToggle={updatePostShare}
/>
```

### Trong Post Detail Screen:
```tsx
<PostCard 
  post={post} 
  isDetailView={true}
  onReactionToggle={updatePostReaction}
  onShareToggle={updatePostShare}
/>
```

## Tính năng

### ✅ Đã hoàn thành:
- [x] Nhấn avatar → đi tới profile user
- [x] Nhấn ảnh → mở ảnh fullscreen với gallery
- [x] Toggle reaction với UI real-time
- [x] Toggle share với UI real-time  
- [x] Nhấn content/comment → đi tới chi tiết post (chỉ khi không ở detail view)
- [x] Component PostCard tái sử dụng
- [x] Hook quản lý state interactions
- [x] Modal hiển thị ảnh với swipe gesture

### 🔄 Cần bổ sung:
- [ ] API lấy thông tin user profile
- [ ] Hiển thị danh sách posts của user trong profile
- [ ] Xử lý lỗi khi API thất bại
- [ ] Loading states cho các interactions
- [ ] Zoom gesture cho ảnh trong modal

## Lưu ý kỹ thuật

1. **State Management**: Sử dụng optimistic updates để UI phản hồi ngay lập tức
2. **Navigation**: Sử dụng Expo Router với dynamic routes
3. **Component Design**: PostCard component có thể tái sử dụng với props khác nhau
4. **Error Handling**: Hiển thị Alert khi có lỗi API
5. **Performance**: Lazy loading và memoization cho các operations nặng