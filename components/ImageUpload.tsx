
import React, { useCallback, useRef } from 'react';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  currentImageUrl?: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelect, currentImageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);


  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative w-full aspect-video bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors duration-200 cursor-pointer flex items-center justify-center overflow-hidden"
      >
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Preview" className="object-contain w-full h-full" />
        ) : (
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-2 text-sm">Click or drag & drop to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
