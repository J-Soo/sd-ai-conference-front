import React from 'react';
import { FileSearch, Loader2 } from 'lucide-react';

interface ResponseDisplayProps {
  response: string | null;
  isLoading: boolean;
  darkMode: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, isLoading, darkMode }) => {
  // 여러 파일 결과가 포함된 응답인지 확인 (구분자로 확인)
  const hasMultipleResults = response?.includes('========================================');
  
  return (
    <div className="h-full">
      {isLoading ? (
        <div className="h-full flex flex-col items-center justify-center py-12">
          <Loader2 className={`animate-spin mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={32} />
          <p className="text-lg font-medium">대본 생성 중...</p>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            이 작업은 1~2분 정도 소요될 수 있습니다. 잠시만 기다려주세요.
          </p>
        </div>
      ) : response ? (
        <div className={`p-6 rounded-md overflow-auto h-[calc(100%-2rem)] 
          ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {hasMultipleResults ? '여러 파일의 생성 결과' : '생성된 대본'}
          </h3>
          <div className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {response}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center py-12">
          <FileSearch className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
          <p className="text-lg font-medium">응답 대기 중</p>
          <p className={`mt-2 text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            파일을 업로드하고 "서버로 전송" 버튼을 클릭하면 이곳에 생성된 대본이 표시됩니다
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;