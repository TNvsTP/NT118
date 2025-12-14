import { CloudinaryService } from '@/services/cloudinary';
import { PostService } from '@/services/post';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface SelectedImage {
  uri: string;
  uploading: boolean;
  uploadedUrl?: string;
}

export default function NewPostScreen() {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // Chọn ảnh từ thư viện
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10, // Giới hạn 10 ảnh
    });

    if (!result.canceled && result.assets) {
      const newImages: SelectedImage[] = result.assets.map((asset: any) => ({
        uri: asset.uri,
        uploading: false,
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  // Xóa ảnh
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Đăng bài
  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Nội dung bài viết không được để trống');
      return;
    }

    setIsPosting(true);
    try {
      let mediaUrls: string[] = [];
      
      // Upload ảnh nếu có
      if (selectedImages.length > 0) {
        const imageUris = selectedImages.map(img => img.uri);
        mediaUrls = await CloudinaryService.uploadMultipleImages(
          imageUris,
          (completed: number, total: number) => {
            // Cập nhật progress cho từng ảnh
            setSelectedImages(prev => 
              prev.map((img, i) => 
                i < completed ? { ...img, uploading: false, uploadedUrl: 'uploaded' } : 
                i === completed ? { ...img, uploading: true } : img
              )
            );
          }
        );
      }

      // Đăng bài với nội dung và ảnh
      await PostService.addPost(content.trim(), mediaUrls);
      
      Alert.alert('Thành công', 'Đăng bài thành công!');
      
      // Reset form
      setContent('');
      setSelectedImages([]);
      
      router.back();
    } catch (error) {
      console.error('Error posting:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng bài');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isPosting}>
          <Text style={[styles.cancelButton, isPosting && styles.disabled]}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bài viết mới</Text>
        <TouchableOpacity onPress={handlePost} disabled={isPosting || !content.trim()}>
          {isPosting ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={[
              styles.postButton, 
              (!content.trim() || isPosting) && styles.disabled
            ]}>
              Đăng
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Bạn đang nghĩ gì?"
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
          editable={!isPosting}
        />

        {/* Nút chọn ảnh */}
        <TouchableOpacity 
          style={styles.imagePickerButton} 
          onPress={pickImages}
          disabled={isPosting}
        >
          <Text style={styles.imagePickerText}>📷 Thêm ảnh</Text>
        </TouchableOpacity>

        {/* Hiển thị ảnh đã chọn */}
        {selectedImages.length > 0 && (
          <View style={styles.imagesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                  
                  {/* Loading overlay khi đang upload */}
                  {image.uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                  
                  {/* Nút xóa ảnh */}
                  {!isPosting && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
  disabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  input: {
    minHeight: 120,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    margin: 15,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#007AFF',
  },
  imagesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});