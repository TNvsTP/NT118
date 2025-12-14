# Hướng dẫn Overflow Menu cho PostCard

## Tổng quan
Tính năng overflow menu cho phép người dùng thực hiện các hành động bổ sung trên bài viết thông qua menu ba chấm (⋯).

## Chức năng

### Đối với bài viết của mình
Khi nhấn vào menu overflow trên bài viết của chính mình, sẽ hiển thị 2 lựa chọn:

1. **Chỉnh sửa (✏️)**
   - Mở modal EditPostModal
   - Cho phép chỉnh sửa nội dung và media
   - Có thể thêm/xóa ảnh
   - Nội dung không được để trống
   - Sử dụng PostService.editPost()

2. **Xóa (🗑️)**
   - Hiển thị dialog xác nhận
   - Sử dụng PostService.deletePost()
   - Xóa bài viết khỏi danh sách sau khi thành công

### Đối với bài viết của người khác
Khi nhấn vào menu overflow trên bài viết của người khác, sẽ hiển thị 1 lựa chọn:

1. **Báo cáo (🚨)**
   - Mở modal ReportPostModal
   - Cho phép chọn nhiều lý do báo cáo
   - Có thể nhập lý do khác (tùy chọn)
   - Gom tất cả lý do thành chuỗi string, cách nhau bằng dấu phẩy
   - Sử dụng PostService.reportPost()

## Components

### PostCard
- Thêm overflow menu button (⋯)
- Kiểm tra quyền sở hữu bài viết thông qua useAuth()
- Hiển thị menu tương ứng với quyền

### EditPostModal
- Modal chỉnh sửa bài viết
- Hỗ trợ chỉnh sửa content và media
- Upload ảnh qua CloudinaryService
- Validation: content không được trống

### ReportPostModal
- Modal báo cáo bài viết
- Danh sách lý do có sẵn: Spam, Nội dung không phù hợp, Bạo lực, Quấy rối, Thông tin sai lệch, Bản quyền, Nội dung người lớn
- Cho phép chọn nhiều lý do
- Ô nhập lý do khác (tùy chọn, tối đa 200 ký tự)

## API Services

### PostService.editPost()
```typescript
editPost(postId: number, content: string, media_url: string[]): Promise<PostItem>
```

### PostService.deletePost()
```typescript
deletePost(postId: number): Promise<void>
```

### PostService.reportPost()
```typescript
reportPost(postId: number, reason: string): Promise<void>
```

## State Management

### Callbacks trong PostCard
- `onPostUpdated?: (updatedPost: PostItem) => void`
- `onPostDeleted?: (postId: number) => void`

### Hook Updates
- `usePostInteractions`: Thêm `updatePost()` và `removePost()`
- `usePosts`: Export các hàm mới
- `useSearch`: Thêm hỗ trợ update/remove posts trong search results

## Usage

### Trong Home Screen
```tsx
<PostCard 
  post={item} 
  onReactionToggle={handleReactionToggle}
  onShareToggle={handleShareToggle}
  onPostUpdated={handlePostUpdated}
  onPostDeleted={handlePostDeleted}
/>
```

### Trong Search Results
```tsx
<SearchResults 
  users={filteredResults.users}
  posts={filteredResults.posts}
  onReactionToggle={updatePostReaction}
  onShareToggle={updatePostShare}
  onPostUpdated={updatePost}
  onPostDeleted={removePost}
/>
```

## Styling
- Menu overlay với background mờ
- Menu items với padding và hover effects
- Delete item có màu đỏ để phân biệt
- Modal với presentation style phù hợp

## Security
- Kiểm tra quyền sở hữu bài viết trước khi hiển thị menu edit/delete
- Validation input trước khi gửi API
- Xử lý lỗi và hiển thị thông báo phù hợp