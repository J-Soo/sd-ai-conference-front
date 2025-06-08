import React from 'react';
import { FileInfo } from '../types';
import { FileIcon, File, File as FilePdf, FileText, FileImage, FileArchive, X } from 'lucide-react';
import { formatDate } from '../utils';

interface FileListProps {
  files: FileInfo[];
  onRemove: (id: string) => void;
  darkMode: boolean;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, darkMode }) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FilePdf className="text-red-500\" size={20} />;
    } else if (fileType.includes('image')) {
      return <FileImage className="text-purple-500" size={20} />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <FileArchive className="text-yellow-500\" size={20} />;
    } else if (fileType.includes('text') || fileType.includes('doc')) {
      return <FileText className="text-blue-500" size={20} />;
    } else {
      return <File className="text-gray-500\" size={20} />;
    }
  };

  if (files.length === 0) {
    return (
      <div className={`rounded-md p-6 text-center ${darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
        <FileIcon className="mx-auto mb-2 opacity-40" size={24} />
        <p>아직 업로드된 파일이 없습니다</p>
      </div>
    );
  }

  return (
    <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'} -mx-4`}>
      {files.map(file => (
        <li 
          key={file.id} 
          className={`px-4 py-3 flex items-center justify-between group ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors duration-150`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            {getFileIcon(file.type)}
            
            <div className="min-w-0">
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
            onClick={() => onRemove(file.id)}
            className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200
              ${darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
            aria-label={`${file.name} 삭제`}
          >
            <X size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default FileList;