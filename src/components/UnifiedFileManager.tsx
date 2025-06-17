import React, { useState, useCallback } from 'react';
import { FileInfo } from '../types';
import { UploadCloud, AlertCircle, Plus, X, FileIcon, File, File as FilePdf, FileText, FileImage, FileArchive } from 'lucide-react';
import { generateUniqueId, formatFileSize, formatDate } from '../utils';

interface UnifiedFileManagerProps {
  files: FileInfo[];
  onFilesAdded: (files: FileInfo[]) => void;
  onFileRemove: (id: string) => void;
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

const UnifiedFileManager: React.FC<UnifiedFileManagerProps> = ({
  files,
  onFilesAdded,
  onFileRemove,
  darkMode
}) => {
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
      
      // 중복 파일 확인 (파일명과 크기로 판단)
      const isDuplicate = files.some(existingFile => 
        existingFile.name === file.name && existingFile.sizeInBytes === file.size
      );
      
      if (isDuplicate) {
        rejectedFiles.push(`${file.name} (중복)`);
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
        setDragError(`지원하지 않는 파일이거나 중복된 파일입니다: ${rejectedFiles.join(', ')}`);
        return;
      } else {
        setDragError(`일부 파일은 추가되지 않았습니다: ${rejectedFiles.join(', ')}`);
      }
    }
    
    if (newFiles.length > 0) {
      onFilesAdded(newFiles);
    }
    
    setIsDragging(false);
  }, [files, onFilesAdded, isFileTypeAllowed]);

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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FilePdf className="text-red-500" size={20} />;
    } else if (fileType.includes('image')) {
      return <FileImage className="text-purple-500" size={20} />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <FileArchive className="text-yellow-500" size={20} />;
    } else if (fileType.includes('text') || fileType.includes('doc')) {
      return <FileText className="text-blue-500" size={20} />;
    } else {
      return <File className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg transition-colors duration-200 ${
          isDragging 
            ? `${darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'}` 
            : `${darkMode ? 'border-gray-600 hover:border-blue-400 bg-gray-800/50 hover:bg-gray-700/50' : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'}`
        }`}
      >
        {/* 파일 목록이 없을 때 - 업로드 영역 */}
        {files.length === 0 ? (
          <div className="p-8 text-center">
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
        ) : (
          /* 파일 목록이 있을 때 - 목록 + 추가 버튼 */
          <div className="p-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileIcon className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  업로드된 파일
                </h4>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({files.length}개)
                </span>
              </div>
              
              {/* 파일 추가 버튼 */}
              <div>
                <input
                  type="file"
                  id="addFileInput"
                  multiple
                  accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <label
                  htmlFor="addFileInput"
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Plus size={16} />
                  <span>파일 추가</span>
                </label>
              </div>
            </div>
            
            {/* 파일 목록 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map(file => (
                <div 
                  key={file.id} 
                  className={`flex items-center justify-between p-3 rounded-lg group ${
                    darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  } transition-colors duration-150 border ${
                    darkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden flex-1">
                    {getFileIcon(file.type)}
                    
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {file.size}
                        </span>
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>•</span>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {formatDate(file.uploadedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 hover:bg-red-600 text-gray-400 hover:text-white' 
                        : 'bg-gray-100 hover:bg-red-600 text-gray-500 hover:text-white'
                    }`}
                    aria-label={`${file.name} 삭제`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* 드래그 오버레이 */}
            {isDragging && (
              <div className={`absolute inset-0 rounded-lg flex items-center justify-center ${
                darkMode ? 'bg-blue-900/40' : 'bg-blue-50/90'
              }`}>
                <div className="text-center">
                  <UploadCloud 
                    className={`mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} 
                    size={32} 
                  />
                  <p className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    파일을 놓아서 추가하기
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {dragError && (
        <div className="mt-4 flex items-center space-x-2 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm">{dragError}</span>
        </div>
      )}
    </div>
  );
};

export default UnifiedFileManager;