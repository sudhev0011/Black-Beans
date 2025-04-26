const cloudinary = require("../../config/cloudinaryConfig");

const cloudinaryDeleteImages = async (imageUrls) => {
  // Ensure imageUrls is an array
  if (!Array.isArray(imageUrls)) {
    throw new Error('imageUrls must be an array');
  }

  const getPublicIdFromUrl = (url) => {
    try {
      const parts = url.split('/');
      const fileWithExtension = parts.pop();
      const folder = parts[parts.length - 1];
      const [publicId] = fileWithExtension.split('.');
      return folder === 'products' ? `products/${publicId}` : publicId;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      throw error;
    }
  };

  const deletePromises = imageUrls.map(async (url) => {
    try {
      const publicId = getPublicIdFromUrl(url);
      console.log('Attempting to delete image with publicId:', publicId); // Debug log
      
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true, // Ensures CDN cache is invalidated
        resource_type: 'image'
      });
      
      console.log(`Delete result for ${publicId}:`, result);
      return result;
    } catch (error) {
      console.error(`Error deleting image ${url}:`, error);
      throw error;
    }
  });

  try {
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Deletion failed:', error);
    throw error;
  }
};

module.exports = cloudinaryDeleteImages;