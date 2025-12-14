# Tính năng Ẩn Bài Đăng Sau Khi Report

## Tổng quan
Khi người dùng report một bài đăng thành công, bài đăng đó sẽ được ẩn khỏi feed ngay lập tức để cải thiện trải nghiệm người dùng.

## Luồng hoạt động

### 1. User Report Post
```
User nhấn ⋯ → Chọn "🚨 Báo cáo" → Chọn lý do → Nhấn "Gửi"
```

### 2. Report Success Flow
```
ReportPostModal.handleSubmit()
  ↓
PostService.reportPost() → API Success
  ↓
onReportSuccess(postId) → Callback to PostCard
  ↓
onPostReported(postId) → Callback to Parent Component
  ↓
removePost(postId) → Remove from list/hide post
```

### 3. UI Updates
- **Immediate**: Bài đăng biến mất khỏi danh sách
- **Feedback**: Alert "Đã gửi báo cáo. Cảm ơn bạn..."
- **Navigation**: Modal đóng, user quay về feed

## Implementation

### ReportPostModal
```typescript
interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
  onReportSuccess?: (postId: number) => void; // ← New callback
}

const handleSubmit = async () => {
  try {
    await PostService.reportPost(postId, reasons.join(', '));
    Alert.alert('Thành công', '...');
    
    onReportSuccess?.(postId); // ← Trigger hide
    onClose();
  } catch (error) {
    // Handle error
  }
};
```

### PostCard
```typescript
interface PostCardProps {
  // ... existing props
  onPostReported?: (postId: number) => void; // ← New callback
}

const handleReportSuccess = (postId: number) => {
  onPostReported?.(postId); // ← Pass to parent
};

<ReportPostModal
  visible={showReportModal}
  onClose={() => setShowReportModal(false)}
  postId={currentPost.id}
  onReportSuccess={handleReportSuccess} // ← Connect callback
/>
```

### Parent Components

#### Home Screen
```typescript
const handlePostReported = (postId: number) => {
  removePost(postId); // ← Remove from posts list
};

<PostCard 
  post={item}
  onPostReported={handlePostReported} // ← Handle hide
/>
```

#### Search Results
```typescript
<SearchResults 
  posts={filteredResults.posts}
  onPostReported={handlePostReported} // ← Pass through
/>
```

#### Post Detail
```typescript
<PostCard 
  post={post}
  onPostReported={(postId) => {
    router.back(); // ← Navigate back since post is hidden
  }}
/>
```

## State Management

### Hook Updates
- **usePosts**: Đã có `removePost()` function
- **useSearch**: Đã có `removePost()` function  
- **usePostInteractions**: Đã có `removePost()` function

### Data Flow
```
Report Success
  ↓
PostCard.onPostReported(postId)
  ↓
Parent.handlePostReported(postId)
  ↓
Hook.removePost(postId)
  ↓
State Update → UI Re-render → Post Hidden
```

## User Experience

### Behavior
1. **Report Action**: User chọn lý do và gửi report
2. **Success Feedback**: Alert thông báo thành công
3. **Immediate Hide**: Bài đăng biến mất ngay lập tức
4. **Clean UI**: Không còn thấy nội dung vi phạm

### Benefits
- **Instant Gratification**: User thấy hành động có hiệu quả ngay
- **Clean Feed**: Loại bỏ nội dung không mong muốn
- **Better UX**: Không cần refresh hay reload
- **Trust Building**: Tăng niềm tin vào hệ thống báo cáo

## Edge Cases

### Network Issues
- **Report Fails**: Bài đăng vẫn hiển thị, show error message
- **Partial Success**: Nếu API success nhưng callback fail, vẫn ẩn bài đăng

### Navigation
- **Detail View**: Quay về trang trước khi report thành công
- **Feed View**: Bài đăng biến mất khỏi danh sách
- **Search View**: Bài đăng biến mất khỏi kết quả tìm kiếm

### Data Consistency
- **Local State**: Bài đăng bị remove khỏi local state
- **Server State**: Server xử lý report và có thể ẩn bài đăng
- **Cache**: Không cần invalidate cache vì đã remove local

## Testing

### Test Cases
1. **Report Success**: Bài đăng ẩn ngay sau khi report thành công
2. **Report Failure**: Bài đăng vẫn hiển thị khi report thất bại
3. **Multiple Reports**: Report nhiều bài đăng liên tiếp
4. **Navigation**: Behavior đúng trong detail view vs feed view
5. **State Sync**: Local state và UI đồng bộ

### Manual Testing
```
1. Mở app → Vào Home feed
2. Tìm bài đăng của người khác
3. Nhấn ⋯ → Chọn "🚨 Báo cáo"
4. Chọn lý do → Nhấn "Gửi"
5. Verify: Alert success + Bài đăng biến mất
```

## Security & Privacy

### Considerations
- **No Undo**: Không có cách undo report (by design)
- **Local Hide**: Chỉ ẩn local, không ảnh hưởng user khác
- **Server Processing**: Server xử lý report theo policy riêng
- **Abuse Prevention**: Rate limiting và validation ở server side