// Service để upload file lên Cloudinary
// Sử dụng UNSIGNED UPLOAD PRESET - KHÔNG CẦN API SECRET (an toàn cho Frontend)
// 
// HƯỚNG DẪN SETUP:
// 1. Vào Cloudinary Dashboard > Settings > Upload > Upload presets
// 2. Tạo preset mới với:
//    - Name: 'avatar_upload' (hoặc tên bạn muốn)
//    - Signing mode: UNSIGNED (quan trọng!)
//    - Folder: 'avatars' (optional)
//    - Allowed formats: jpg, png, webp
//    - Max file size: 5MB
// 3. Save preset và cập nhật uploadPreset bên dưới

const CLOUDINARY_CONFIG = {
  cloudName: 'dnjykfio6', // Chỉ cần cloudName cho unsigned upload
  // KHÔNG CẦN apiKey và apiSecret cho unsigned upload preset
  uploadPreset: null, // Cập nhật thành tên preset bạn đã tạo (ví dụ: 'avatar_upload')
};

/**
 * Upload file lên Cloudinary và trả về URL
 * @param {File} file - File cần upload
 * @returns {Promise<string>} - URL của file đã upload
 */
export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
    
    let uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

    // Unsigned upload REQUIRES upload preset - không cần API secret
    if (!CLOUDINARY_CONFIG.uploadPreset) {
      throw new Error(
        '⚠️ Upload preset chưa được cấu hình!\n\n' +
        'Vui lòng:\n' +
        '1. Vào Cloudinary Dashboard > Settings > Upload > Upload presets\n' +
        '2. Tạo preset mới với Signing mode: UNSIGNED\n' +
        '3. Đặt tên preset (ví dụ: "avatar_upload")\n' +
        '4. Cập nhật uploadPreset trong cloudinaryService.js'
      );
    }
    
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    // Thêm folder để organize files (optional, có thể config trong preset)
    formData.append('folder', 'avatars');

    // Upload lên Cloudinary
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Upload thất bại: ${response.status}`;
      
      // Nếu unsigned upload fail, có thể preset chưa được setup đúng
      if (errorMessage.includes('preset') || errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        throw new Error(
          'Cloudinary upload preset chưa được cấu hình hoặc preset không đúng.\n\n' +
          'Kiểm tra:\n' +
          '1. Preset đã được tạo trong Cloudinary Dashboard chưa?\n' +
          '2. Signing mode đã được set là "UNSIGNED" chưa?\n' +
          '3. Tên preset trong code có khớp với tên trong Dashboard không?\n' +
          '4. Preset có được enable không?\n\n' +
          'Xem chi tiết trong comment của cloudinaryService.js'
        );
      }
      
      // Xử lý các lỗi khác
      if (errorMessage.includes('413') || errorMessage.includes('size')) {
        throw new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.secure_url; // Trả về HTTPS URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Có lỗi xảy ra khi upload ảnh lên Cloudinary');
  }
};

/**
 * Validate file trước khi upload
 * @param {File} file - File cần validate
 * @returns {{valid: boolean, message?: string}}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, message: 'Vui lòng chọn file' };
  }

  // Kiểm tra loại file
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'Chỉ được upload file ảnh!' };
  }

  // Kiểm tra kích thước (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, message: 'Kích thước file không được vượt quá 5MB!' };
  }

  return { valid: true };
};

export default {
  uploadToCloudinary,
  validateImageFile,
};

