import cloudinary from '../config/cloudinary.js';

export class CloudinaryService {
  // Upload image to Cloudinary
  static async uploadImage(filePath, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'cms-uploads',
        resource_type: 'auto',
        ...options,
      });

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // Delete image from Cloudinary
  static async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }

  // Delete multiple images
  static async deleteImages(publicIds) {
    try {
      const results = await Promise.all(
        publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
      );
      return results;
    } catch (error) {
      throw new Error(`Cloudinary batch deletion failed: ${error.message}`);
    }
  }
}

export default CloudinaryService;
