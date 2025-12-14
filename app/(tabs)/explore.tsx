import { SearchFilter } from '@/components/search-filter';
import { SearchInput } from '@/components/search-input';
import { SearchResults } from '@/components/search-results';
import { useSearch } from '@/hooks/use-search';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_USERS = [
  { id: '1', name: 'Nguyễn Văn A', username: '@nguyenvana' },
  { id: '2', name: 'Trần Thị B', username: '@tranthib' },
  { id: '3', name: 'Lê Văn C', username: '@levanc' },
];

const MOCK_TRENDING = [
  { id: '1', tag: '#ReactNative', posts: 1234 },
  { id: '2', tag: '#Expo', posts: 856 },
  { id: '3', tag: '#Mobile', posts: 642 },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearched,
    activeFilter,
    setActiveFilter,
    handleSearch,
    getFilteredResults,
    getTotalCount,
    updatePostReaction,
    updatePostShare,
  } = useSearch();

  const filteredResults = getFilteredResults();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={() => handleSearch()}
        isSearching={isSearching}
      />

      {hasSearched && (
        <SearchFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          totalCount={getTotalCount()}
          usersCount={searchResults.users.length}
          postsCount={searchResults.posts.length}
        />
      )}

      <ScrollView style={styles.content}>
        {hasSearched ? (
          <SearchResults 
            users={filteredResults.users}
            posts={filteredResults.posts}
            onUserPress={(user) => {
              console.log('Navigate to user:', user.id);
            }}
            onPostPress={(post) => {
              console.log('Navigate to post:', post.id);
            }}
            onReactionToggle={updatePostReaction}
            onShareToggle={updatePostShare}
          />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Xu hướng</Text>
              {MOCK_TRENDING.map((item) => (
                <TouchableOpacity key={item.id} style={styles.trendingItem}>
                  <Text style={styles.trendingTag}>{item.tag}</Text>
                  <Text style={styles.trendingCount}>{item.posts} bài viết</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gợi ý theo dõi</Text>
              {MOCK_USERS.map((user) => (
                <View key={user.id} style={styles.userItem}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar} />
                    <View>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userUsername}>{user.username}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>Theo dõi</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },



  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  trendingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendingTag: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendingCount: {
    fontSize: 14,
    color: '#666',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});