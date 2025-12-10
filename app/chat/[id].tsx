import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';

const MOCK_MESSAGES = [
  { id: '1', text: 'Chào bạn!', isMine: false, time: '10:30' },
  { id: '2', text: 'Chào! Bạn khỏe không?', isMine: true, time: '10:31' },
  { id: '3', text: 'Mình khỏe, cảm ơn bạn', isMine: false, time: '10:32' },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar} />
          <Text style={styles.headerTitle}>Người dùng {id}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.messagesList}>
        {MOCK_MESSAGES.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isMine ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isMine ? styles.myBubble : styles.theirBubble,
              ]}
            >
              <Text style={message.isMine ? styles.myText : styles.theirText}>
                {message.text}
              </Text>
            </View>
            <Text style={styles.messageTime}>{message.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#ddd',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  myBubble: {
    backgroundColor: '#007AFF',
  },
  theirBubble: {
    backgroundColor: '#fff',
  },
  myText: {
    color: '#fff',
    fontSize: 15,
  },
  theirText: {
    color: '#000',
    fontSize: 15,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
