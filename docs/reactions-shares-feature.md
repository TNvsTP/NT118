# Tính năng hiển thị danh sách Reactions và Shares

## Tổng quan
Tính năng này cho phép người dùng xem danh sách những người đã thích (reaction) và chia sẻ (share) một bài viết cụ thể.

## Cách sử dụng

### Trong PostCard
1. **Xem danh sách người thích**: Nhấn vào số lượng reactions (số bên cạnh icon trái tim)
2. **Xem danh sách người chia sẻ**: Nhấn vào số lượng shares (số bên cạnh icon chia sẻ)

### Trong Modal
1. **Chuyển đổi tab**: Nhấn vào tab "Thích" hoặc "Chia sẻ" để xem danh sách tương ứng
2. **Xem profile**: Nhấn vào tên hoặc avatar của người dùng để đi tới trang profile
3. **Đóng modal**: Nhấn nút "Đóng" ở góc trái trên

## Cấu trúc code

### Components
- `PostCard`: Component chính hiển thị bài viết với các nút tương tác
- `ReactionsSharesModal`: Modal hiển thị danh sách người reactions/shares

### Services
- `PostService.getReactions(postId)`: Lấy danh sách người thích bài viết
- `PostService.getShares(postId)`: Lấy danh sách người chia sẻ bài viết

### Models
- `Reaction`: Model cho reaction với thông tin user
- `Share`: Model cho share với thông tin user

## API Endpoints
- `GET /posts/{id}/reactions`: Lấy danh sách reactions
- `GET /posts/{id}/shares`: Lấy danh sách shares

## Tính năng
- ✅ Hiển thị danh sách người thích/chia sẻ
- ✅ Chuyển đổi giữa tab thích và chia sẻ
- ✅ Nhấn vào user để xem profile
- ✅ Loading state khi tải dữ liệu
- ✅ Empty state khi không có dữ liệu
- ✅ Xử lý lỗi khi API fail
- ✅ Responsive design cho mobile

## Test
Sử dụng `TestPostCard` component để test tính năng với mock data.