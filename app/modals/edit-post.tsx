import { type PostItem } from '@/models/post';
import { CloudinaryService } from '@/services/cloudinary';
import { PostService } from '@/services/post';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface EditPostModalProps {
  visible: boolean;
  onClose: () => void;
  post: PostItem;
  onPostUpdated: (updatedPost: PostItem) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  onClose,
  post,
  onPostUpdated,
}) => {
  const [content, setContent] = useState(post.content);
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    post.media?.map(m => m.media_url) || []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Reset form khi modal được mở
  React.useEffect(() => {
    if (visible) {
      setContent(post.content);
      setMediaUrls(post.media?.map(m => m.media_url) || []);
    }
  }, [visible, post]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Nội dung không được để trống');
      return;
    }

    setIsLoading(true);
    try {
      const updatedPost = await PostService.editPost(post.id, content.trim(), mediaUrls);
      onPostUpdated(updatedPost);
      onClose();
      Alert.alert('Thành công', 'Đã cập nhật bài viết');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setIsLoading(true);
        const uploadPromises = result.assets.map(asset => 
          CloudinaryService.uploadImage(asset.uri)
        );
        
        const uploadedUrls = await Promise.all(uploadPromises);
        setMediaUrls(prev => [...prev, ...uploadedUrls]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải ảnh lên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Chỉnh sửa bài viết</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isLoading || !content.trim()}
          >
            <Text style={[
              styles.saveButton,
              (!content.trim() || isLoading) && styles.saveButtonDisabled
            ]}>
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            placeholder="Bạn đang nghĩ gì?"
            multiline
            textAlignVertical="top"
          />

          {mediaUrls.length > 0 && (
            <View style={styles.mediaContainer}>
              {mediaUrls.map((url, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: url }} style={styles.mediaImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={styles.addImageButton}
            onPress={handleAddImage}
            disabled={isLoading}
          >
            <Text style={styles.addImageText}>
              {isLoading ? 'Đang tải...' : '📷 Thêm ảnh'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  mediaItem: {
    position: 'relative',
    width: (screenWidth - 48) / 2,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addImageButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  addImageText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default EditPostModal;