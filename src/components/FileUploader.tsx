import React, { useCallback, useState } from 'react';
import { FileInfo } from '../types';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { generateUniqueId, formatFileSize } from '../utils';

interface FileUploaderProps {
  onFilesAdded: (files: FileInfo[]) => void;
  darkMode: boolean;
}

// 허용된 파일 타입
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint', // PPT
  'application/vnd.openxmlformats-officedocument.presentationml.presentation' // PPTX
];

// 허용된 파일 확장자
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.ppt', '.pptx'];

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesAdded, darkMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // 파일 타입 확인 함수
  const isFileTypeAllowed = useCallback((file: File): boolean => {
    // MIME 타입 확인
    if (ALLOWED_FILE_TYPES.includes(file.type)) {
      return true;
    }
    
    // 확장자 확인 (MIME 타입이 정확하지 않을 때를 대비)
    const fileName = file.name.toLowerCase();
    return ALLOWED_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext));
  }, []);

  const processFiles = useCallback((fileList: FileList) => {
    setDragError(null);
    
    const newFiles: FileInfo[] = [];
    const rejectedFiles: string[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // 파일 타입 확인
      if (!isFileTypeAllowed(file)) {
        rejectedFiles.push(file.name);
        continue;
      }
      
      newFiles.push({
        id: generateUniqueId(),
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        sizeInBytes: file.size,
        file: file,
        uploadedAt: new Date().toISOString()
      });
    }
    
    // 거부된 파일이 있을 경우 에러 메시지 표시
    if (rejectedFiles.length > 0) {
      if (rejectedFiles.length === fileList.length) {
        setDragError(`지원하지 않는 파일 형식입니다. PPT, PPTX, PDF 파일만 업로드 가능합니다.`);
        return;
      } else {
        setDragError(`일부 파일은 지원하지 않는 형식입니다: ${rejectedFiles.join(', ')}`);
      }
    }
    
    if (newFiles.length > 0) {
      onFilesAdded(newFiles);
    }
    
    setIsDragging(false);
  }, [onFilesAdded, isFileTypeAllowed]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    } else {
      setDragError("유효한 파일을 찾을 수 없습니다. 다시 시도해주세요.");
    }
    
    setIsDragging(false);
  }, [processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  return (
    <div className="w-full">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer
          ${isDragging 
            ? `${darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'}` 
            : `${darkMode ? 'border-gray-600 hover:border-blue-400 bg-gray-800/50 hover:bg-gray-700/50' : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'}`
          }`}
      >
        <input
          type="file"
          id="fileInput"
          multiple
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
          onChange={handleFileInputChange}
        />
        
        <label htmlFor="fileInput" className="w-full h-full block cursor-pointer">
          <UploadCloud 
            className={`mx-auto mb-4 ${
              isDragging 
                ? `${darkMode ? 'text-blue-400' : 'text-blue-500'}` 
                : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
            }`} 
            size={48} 
          />
          
          <p className={`text-lg font-medium ${
            isDragging 
              ? `${darkMode ? 'text-blue-300' : 'text-blue-600'}` 
              : `${darkMode ? 'text-gray-300' : 'text-gray-700'}`
          }`}>
            {isDragging ? "여기에 파일을 놓으세요" : "파일을 이곳에 끌어다 놓으세요"}
          </p>
          
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            또는 <span className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium`}>파일 찾아보기</span>
          </p>
          <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            지원 형식: PDF, PPT, PPTX
          </p>
        </label>
      </div>
      
      {dragError && (
        <div className="mt-4 flex items-center space-x-2 text-red-600">
          <AlertCircle size={16} />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;