import React from 'react';
import { ArrowLeft } from 'lucide-react';
import FileManager from '../components/FileManager';

interface ScriptGenerationPageProps {
  darkMode: boolean;
  serverConnected: boolean;
  setServerConnected: (connected: boolean) => void;
  onBack: () => void;
}

const ScriptGenerationPage: React.FC<ScriptGenerationPageProps> = ({
  darkMode,
  serverConnected,
  setServerConnected,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-full transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
          aria-label="홈으로 돌아가기"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-semibold">대본 생성</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            PPT나 PDF 파일을 업로드하여 AI 발표 대본을 생성하세요
          </p>
        </div>
      </div>

      <FileManager 
        darkMode={darkMode} 
        serverConnected={serverConnected}
        setServerConnected={setServerConnected}
      />
    </div>
  );
};

export default ScriptGenerationPage;