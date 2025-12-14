import { FilterType } from '@/hooks/use-search';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SearchFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
  usersCount: number;
  postsCount: number;
}

export function SearchFilter({ 
  activeFilter, 
  onFilterChange, 
  totalCount, 
  usersCount, 
  postsCount 
}: SearchFilterProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
        onPress={() => onFilterChange('all')}
      >
        <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
          Tất cả ({totalCount})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'users' && styles.activeFilterButton]}
        onPress={() => onFilterChange('users')}
      >
        <Text style={[styles.filterText, activeFilter === 'users' && styles.activeFilterText]}>
          Mọi người ({usersCount})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'posts' && styles.activeFilterButton]}
        onPress={() => onFilterChange('posts')}
      >
        <Text style={[styles.filterText, activeFilter === 'posts' && styles.activeFilterText]}>
          Bài đăng ({postsCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 10,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
});