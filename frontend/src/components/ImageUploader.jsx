import React, { useState } from 'react';
import { mediaApi } from '../api/mediaApi';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ImageUploader = ({ type, options = {}, onUploadComplete, label = 'Upload Image' }) => {
  // type: 'profile-photo' | 'store-logo' | 'store-banner' | 'product-photo' | 'vehicle-doc' | 'proof-of-delivery'
  // options: { storeId, productId, orderId }
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local type check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Set preview
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get upload URL from backend
      const { uploadUrl, objectKey, publicUrl } = await mediaApi.getUploadUrl(type, {
        ...options,
        contentType: file.type,
      });

      // 2. Direct upload to S3
      const successS3 = await mediaApi.uploadFileDirectToS3(uploadUrl, file, file.type);
      if (!successS3) {
        throw new Error('S3 upload failed');
      }

      // 3. Confirm upload with backend
      const confirmData = await mediaApi.confirmUpload(type, options, objectKey);
      
      setSuccess(true);
      if (onUploadComplete) {
        onUploadComplete(confirmData.url || publicUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-teal dark:hover:border-teal-light rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-800/40 transition-all duration-200 overflow-hidden relative group">
        {uploading ? (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : previewUrl ? (
          <div className="w-full h-full relative">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <UploadCloud className="text-white" size={24} />
              <span className="text-white text-xs font-semibold ml-2">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-2.5 text-gray-400 group-hover:text-teal dark:group-hover:text-teal-light transition-colors" />
            <p className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-teal dark:group-hover:text-teal-light transition-colors">
              {label}
            </p>
            <p className="text-xs text-gray-400">JPEG, PNG, or WebP</p>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {success && !uploading && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle size={14} />
          <span>Upload complete!</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
