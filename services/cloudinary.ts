/**
 * Service để upload ảnh lên Cloudinary
 */
export const CloudinaryService = {
  /**
   * Upload một ảnh lên Cloudinary
   */
  uploadImage: async (imageUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const response = await fetch(process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_URL!, {
      method: 'POST',
      body: formData,
      
    });

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    console.error('Cloudinary Error Data:', data);
    throw new Error('Upload failed');
  },

  /**
   * Upload nhiều ảnh lên Cloudinary
   */
  uploadMultipleImages: async (
    imageUris: string[],
    onProgress?: (index: number, total: number) => void
  ): Promise<string[]> => {
    const uploadPromises = imageUris.map(async (uri, index) => {
      try {
        const url = await CloudinaryService.uploadImage(uri);
        onProgress?.(index + 1, imageUris.length);
        return url;
      } catch (error) {
        console.error(`Failed to upload image ${index}:`, error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  },
};