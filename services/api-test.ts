// Test file for API calls - for development only
import { api } from './api';

export const testApiCalls = async () => {
  try {
    console.log('Testing API calls...');
    
    // Test get posts
    console.log('1. Testing getPosts...');
    const postsResponse = await api.getPosts();
    console.log('Posts response:', postsResponse);
    
    if (postsResponse.data && postsResponse.data.length > 0) {
      const firstPostId = postsResponse.data[0].id;
      
      // Test get single post
      console.log('2. Testing getPost...');
      const postResponse = await api.getPost(firstPostId);
      console.log('Post response:', postResponse);
      
      // Test get comments
      console.log('3. Testing getPostComments...');
      const commentsResponse = await api.getPostComments(firstPostId);
      console.log('Comments response:', commentsResponse);
      
      // Test add comment (optional - only if you want to test)
      // console.log('4. Testing addComment...');
      // const addCommentResponse = await api.addComment(firstPostId, 'Test comment from app');
      // console.log('Add comment response:', addCommentResponse);
    }
    
    console.log('All API tests completed successfully!');
  } catch (error) {
    console.error('API test failed:', error);
  }
};