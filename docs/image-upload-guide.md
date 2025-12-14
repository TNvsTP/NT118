# Hướng dẫn Upload Ảnh trong Bài Viết

## Tính năng

Ứng dụng hỗ trợ upload nhiều ảnh khi đăng bài viết với các tính năng:

- Upload tối đa 10 ảnh mỗi bài viết
- Nội dung bài viết là bắt buộc, ảnh là tùy chọn
- Upload ảnh lên Cloudinary trước khi đăng bài
- Hiển thị progress khi upload
- Xem trước ảnh trước khi đăng
- Xóa ảnh đã chọn

## Cách sử dụng

1. **Đăng bài viết mới:**
   - Nhấn nút "+" ở trang chủ
   - Nhập nội dung bài viết (bắt buộc)
   - Nhấn "📷 Thêm ảnh" để chọn ảnh từ thư viện
   - Chọn nhiều ảnh (tối đa 10)
   - Nhấn "Đăng" để đăng bài

2. **Quản lý ảnh:**
   - Xem trước ảnh đã chọn
   - Nhấn nút "×" để xóa ảnh không mong muốn
   - Ảnh sẽ được upload lên Cloudinary khi đăng bài

## Cấu hình Cloudinary

Trong file `.env`:

```
EXPO_PUBLIC_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/your-cloud-name/upload
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
EXPO_PUBLIC_CLOUDINARY_UPLOAD_CLOUD_NAME=your-cloud-name
```

## API

### Đăng bài viết mới

```typescript
POST /api/posts
{
  "content": "Nội dung bài viết",
  "media_urls": ["url1", "url2", "url3"]
}
```

### Response

```typescript
{
  "id": 1,
  "content": "Nội dung bài viết",
  "media_urls": ["url1", "url2", "url3"],
  "user": {...},
  "created_at": "2024-01-01T00:00:00Z",
  ...
}
```

## Components

- **NewPostScreen**: Modal đăng bài viết với upload ảnh
- **CloudinaryService**: Service upload ảnh lên Cloudinary
- **PostCard**: Hiển thị bài viết với gallery ảnh
- **MediaGallery**: Component hiển thị nhiều ảnh trong bài viết

## Permissions

Ứng dụng cần quyền truy cập thư viện ảnh:
- iOS: `NSPhotoLibraryUsageDescription`
- Android: `READ_EXTERNAL_STORAGE`