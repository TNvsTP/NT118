# WebSocket Setup với Pusher

## Tổng quan
Hệ thống WebSocket đã được tích hợp vào ứng dụng để hỗ trợ chat real-time sử dụng Pusher.

## Cấu hình

### 1. Biến môi trường (.env)
```
EXPO_PUBLIC_PUSHER_APP_KEY=fa5b12accf383fffbde7
EXPO_PUBLIC_PUSHER_APP_CLUSTER=ap1
```

### 2. Cài đặt dependencies
```bash
npm install pusher-js
```

## Cách hoạt động

### 1. Khởi tạo kết nối
- WebSocket được khởi tạo tự động khi app khởi động trong `app/_layout.tsx`
- Service `webSocketService` quản lý kết nối Pusher

### 2. Chat real-time
- Khi vào chat với `conversationId`, tự động subscribe vào channel `chat.${conversationId}`
- Lắng nghe event `MessageSent` để nhận tin nhắn mới
- Tin nhắn mới được thêm vào danh sách tự động

### 3. Hooks được sử dụng

#### `useWebSocket()`
- Hook cơ bản để quản lý WebSocket connection
- Cung cấp các method: subscribe, unsubscribe, listen, stop listening

#### `useChatWebSocket(conversationId, onNewMessage)`
- Hook chuyên dụng cho chat
- Tự động subscribe/unsubscribe khi conversationId thay đổi
- Callback `onNewMessage` được gọi khi có tin nhắn mới

#### `useMessages(conversationId)`
- Hook đã được tích hợp WebSocket
- Trả về thêm `isWebSocketConnected` để hiển thị trạng thái

### 4. Components

#### `WebSocketStatus`
- Component hiển thị trạng thái kết nối WebSocket
- Cập nhật real-time: connected, connecting, disconnected

## Cách sử dụng

### Trong chat screen:
```tsx
const { messages, isWebSocketConnected } = useMessages(conversationId);

// Hiển thị trạng thái kết nối
<WebSocketStatus />
```

### Lắng nghe custom events:
```tsx
const { listenToEvent } = useWebSocket();

useEffect(() => {
  listenToEvent('my-channel', 'my-event', (data) => {
    console.log('Received:', data);
  });
}, []);
```

## Lưu ý
- WebSocket tự động reconnect khi mất kết nối
- Tin nhắn được deduplicate để tránh hiển thị trùng lặp
- Channel được unsubscribe tự động khi rời khỏi chat