import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  isSearching?: boolean;
  placeholder?: string;
}

export function SearchInput({ 
  value, 
  onChangeText, 
  onSearch, 
  isSearching = false,
  placeholder = "Tìm kiếm..." 
}: SearchInputProps) {
  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onKeyPress={handleKeyPress}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={onSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons name="search" size={20} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  searchButton: {
    padding: 8,
  },
});