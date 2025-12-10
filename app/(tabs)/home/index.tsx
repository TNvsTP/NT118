import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_POSTS = [
  { id: '1', author: 'Nguyễn Văn A', content: 'Bài viết đầu tiên của tôi!', likes: 10, comments: 5 },
  { id: '2', author: 'Trần Thị B', content: 'Hôm nay thật đẹp trời!', likes: 25, comments: 8 },
  { id: '3', author: 'Lê Văn C', content: 'Chia sẻ một số kinh nghiệm...', likes: 42, comments: 12 },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang chủ</Text>
        <Link href="/modals/new-post" asChild>
          <TouchableOpacity style={styles.newPostButton}>
            <Text style={styles.newPostText}>+</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <ScrollView style={styles.feed}>
        {MOCK_POSTS.map((post) => (
          <Link key={post.id} href={`/post/${post.id}` as any} asChild>
            <TouchableOpacity style={styles.post}>
              <View style={styles.postHeader}>
                <View style={styles.avatar} />
                <Text style={styles.author}>{post.author}</Text>
              </View>
              <Text style={styles.content}>{post.content}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.stat}>❤️ {post.likes}</Text>
                <Text style={styles.stat}>💬 {post.comments}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPostText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  feed: {
    flex: 1,
  },
  post: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  author: {
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    color: '#666',
  },
});
