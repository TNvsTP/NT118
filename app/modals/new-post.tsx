import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NewPostScreen() {
  const [content, setContent] = useState('');

  const handlePost = () => {
    // Logic đăng bài
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bài viết mới</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postButton}>Đăng</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Bạn đang nghĩ gì?"
        multiline
        value={content}
        onChangeText={setContent}
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  postButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
