import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  darkMode: boolean;
  disabled?: boolean;
  currentImage?: string;
}

// 허용된 이미지 파일 타입
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

// 허용된 파일 확장자
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  darkMode, 
  disabled = false,
  currentImage 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // 파일 타입 확인 함수
  const isImageTypeAllowed = useCallback((file: File): boolean => {
    // MIME 타입 확인
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return true;
    }
    
    // 확장자 확인 (MIME 타입이 정확하지 않을 때를 대비)
    const fileName = file.name.toLowerCase();
    return ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
  }, []);

  const processFile = useCallback((file: File) => {
    setDragError(null);
    
    // 파일 타입 확인
    if (!isImageTypeAllowed(file)) {
      setDragError('지원하지 않는 이미지 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.');
      return;
    }
    
    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      setDragError('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.');
      return;
    }
    
    onImageSelected(file);
    setIsDragging(false);
  }, [onImageSelected, isImageTypeAllowed]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    } else {
      setDragError("유효한 이미지 파일을 찾을 수 없습니다. 다시 시도해주세요.");
    }
    
    setIsDragging(false);
  }, [processFile, disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      e.target.value = '';
    }
  }, [processFile, disabled]);

  return (
    <div className="w-full">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          disabled 
            ? `cursor-not-allowed ${darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-100/50'}`
            : `cursor-pointer ${
                isDragging 
                  ? `${darkMode ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50'}` 
                  : `${darkMode ? 'border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:bg-gray-700/50' : 'border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50'}`
              }`
        }`}
      >
        <input
          type="file"
          id="imageInput"
          accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled}
        />
        
        <label htmlFor="imageInput" className={`w-full h-full block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          {currentImage ? (
            <div className="space-y-3">
              <img 
                src={currentImage} 
                alt="업로드된 이미지" 
                className="mx-auto max-h-32 rounded-lg object-cover"
              />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {disabled ? '이미지가 설정되었습니다' : '다른 이미지로 변경하려면 클릭하세요'}
              </p>
            </div>
          ) : (
            <>
              <UploadCloud 
                className={`mx-auto mb-3 ${
                  disabled
                    ? `${darkMode ? 'text-gray-600' : 'text-gray-400'}`
                    : isDragging 
                      ? `${darkMode ? 'text-purple-400' : 'text-purple-500'}` 
                      : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                }`} 
                size={40} 
              />
              
              <p className={`text-base font-medium ${
                disabled
                  ? `${darkMode ? 'text-gray-600' : 'text-gray-400'}`
                  : isDragging 
                    ? `${darkMode ? 'text-purple-300' : 'text-purple-600'}` 
                    : `${darkMode ? 'text-gray-300' : 'text-gray-700'}`
              }`}>
                {disabled 
                  ? "이미지 업로드 비활성화됨"
                  : isDragging 
                    ? "여기에 이미지를 놓으세요" 
                    : "이미지를 이곳에 끌어다 놓으세요"
                }
              </p>
              
              {!disabled && (
                <>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    또는 <span className={`${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} font-medium`}>파일 찾아보기</span>
                  </p>
                  <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    지원 형식: JPG, PNG, GIF, WebP (최대 10MB)
                  </p>
                </>
              )}
            </>
          )}
        </label>
      </div>
      
      {dragError && (
        <div className="mt-3 flex items-center space-x-2 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm">{dragError}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;