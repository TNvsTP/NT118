import { PostService } from '@/services/post';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
  onReportSuccess?: (postId: number) => void;
}

const REPORT_OPTIONS = [
  'Spam',
  'Nội dung không phù hợp',
  'Bạo lực',
  'Quấy rối',
  'Thông tin sai lệch',
  'Bản quyền',
  'Nội dung người lớn',
];

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  visible,
  onClose,
  postId,
  onReportSuccess,
}) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons(prev => {
      if (prev.includes(reason)) {
        return prev.filter(r => r !== reason);
      } else {
        return [...prev, reason];
      }
    });
  };

  const handleSubmit = async () => {
    const reasons = [...selectedReasons];
    if (otherReason.trim()) {
      reasons.push(otherReason.trim());
    }

    if (reasons.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một lý do');
      return;
    }

    setIsLoading(true);
    try {
      await PostService.reportPost(postId, reasons.join(', '));
      Alert.alert('Thành công', 'Đã gửi báo cáo. Cảm ơn bạn đã góp phần giữ cộng đồng an toàn.');
      
      // Gọi callback để ẩn bài đăng
      onReportSuccess?.(postId);
      
      onClose();
      // Reset form
      setSelectedReasons([]);
      setOtherReason('');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReasons([]);
    setOtherReason('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Báo cáo bài viết</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isLoading || (selectedReasons.length === 0 && !otherReason.trim())}
          >
            <Text style={[
              styles.submitButton,
              (selectedReasons.length === 0 && !otherReason.trim() || isLoading) && styles.submitButtonDisabled
            ]}>
              {isLoading ? 'Đang gửi...' : 'Gửi'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.description}>
            Vui lòng chọn lý do báo cáo bài viết này. Bạn có thể chọn nhiều lý do.
          </Text>

          <View style={styles.optionsContainer}>
            {REPORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  selectedReasons.includes(option) && styles.optionItemSelected
                ]}
                onPress={() => handleReasonToggle(option)}
              >
                <View style={[
                  styles.checkbox,
                  selectedReasons.includes(option) && styles.checkboxSelected
                ]}>
                  {selectedReasons.includes(option) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  selectedReasons.includes(option) && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.otherContainer}>
            <Text style={styles.otherLabel}>Lý do khác:</Text>
            <TextInput
              style={styles.otherInput}
              value={otherReason}
              onChangeText={setOtherReason}
              placeholder="Nhập lý do khác (tùy chọn)"
              multiline
              maxLength={200}
            />
            <Text style={styles.characterCount}>
              {otherReason.length}/200
            </Text>
          </View>
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
  submitButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  optionItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  otherContainer: {
    marginTop: 8,
  },
  otherLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  otherInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ReportPostModal;