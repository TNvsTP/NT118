import { Link, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.post}>
          <View style={styles.postHeader}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.author}>Nguyễn Văn A</Text>
              <Text style={styles.time}>2 giờ trước</Text>
            </View>
          </View>

          <Text style={styles.postContent}>
            Đây là nội dung chi tiết của bài viết #{id}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text>❤️ 10</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text>💬 5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text>🔄 2</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Link href={`/post/comments?postId=${id}`} asChild>
          <TouchableOpacity style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Bình luận</Text>
          </TouchableOpacity>
        </Link>
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
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  post: {
    backgroundColor: '#fff',
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    padding: 5,
  },
  commentsSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
