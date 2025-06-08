import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import FileList from './FileList';
import ResponseDisplay from './ResponseDisplay';
import { FileInfo } from '../types';
import { Upload, SendHorizontal, Clock } from 'lucide-react';
import axios from 'axios';

// 기본 API 기본 URL (환경 변수나 자동 탐색으로 대체될 수 있음)
const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

interface FileManagerProps {
  darkMode: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({ darkMode }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL);
  const [serverConnected, setServerConnected] = useState<boolean>(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(3);

  // 서버 자동 탐색 함수
  const discoverServer = async () => {
    console.log('서버 자동 탐색 시작...');
    
    // 먼저 환경 변수에 설정된 URL 시도
    if (import.meta.env.VITE_API_BASE_URL) {
      try {
        const healthUrl = `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, '')}/health`;
        console.log(`환경 변수 URL 시도: ${healthUrl}`);
        const response = await axios.get(healthUrl, { timeout: 2000 });
        console.log('서버 연결 성공:', response.data);
        setApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
        setServerConnected(true);
        return;
      } catch (err) {
        console.warn('환경 변수 URL 연결 실패, 다른 포트 시도...');
      }
    }
    
    // 여러 포트 시도 (8000부터 8010까지)
    for (let port = 8000; port <= 8010; port++) {
      try {
        const baseUrl = `http://localhost:${port}`;
        console.log(`포트 시도: ${port}`);
        const response = await axios.get(`${baseUrl}/health`, { timeout: 1000 });
        console.log(`서버 연결 성공 (포트 ${port}):`, response.data);
        setApiBaseUrl(`${baseUrl}/api/v1`);
        setServerConnected(true);
        return;
      } catch (err) {
        console.warn(`포트 ${port} 연결 실패`);
      }
    }
    
    console.error('사용 가능한 서버를 찾지 못했습니다.');
    setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
    setServerConnected(false);
  };

  useEffect(() => {
    // 서버 자동 탐색
    discoverServer();
  }, []);

  const handleFilesAdded = (newFiles: FileInfo[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const handleFileRemove = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setDurationMinutes(value);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("파일을 먼저 업로드해주세요.");
      return;
    }
    
    if (!serverConnected) {
      setError("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.");
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      // 첫 번째 파일을 기본 파일로 사용
      const mainFile = files[0].file;
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', mainFile);
      formData.append('style', 'professional'); // 기본 스타일
      formData.append('language', 'ko'); // 기본 언어
      formData.append('duration_minutes', durationMinutes.toString()); // 발표 시간
      
      console.log('API 호출:', `${apiBaseUrl}/generation/generate-script`);
      console.log('파일 정보:', mainFile.name, mainFile.type, mainFile.size);
      console.log('발표 시간:', durationMinutes, '분');
      
      // 대본 생성 요청 API 호출
      const response = await axios.post(
        `${apiBaseUrl}/generation/generate-script`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('서버 응답:', response.data);
      
      // 생성 ID 가져오기
      const generationId = response.data.generation_id;
      
      // 대본 생성이 완료될 때까지 상태 확인
      let isCompleted = false;
      let generationStatus = '';
      
      while (!isCompleted) {
        // 2초 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 상태 확인 API 호출
        const statusResponse = await axios.get(`${apiBaseUrl}/generation/status/${generationId}`);
        console.log('상태 확인 응답:', statusResponse.data);
        
        generationStatus = statusResponse.data.status;
        
        // 작업이 완료되었거나 실패한 경우 반복 종료
        if (['completed', 'failed'].includes(generationStatus)) {
          isCompleted = true;
        }
      }
      
      // 작업이 실패한 경우
      if (generationStatus === 'failed') {
        setError('대본 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        setIsLoading(false);
        return;
      }
      
      // 작업이 완료된 경우 결과 가져오기
      const resultResponse = await axios.get(`${apiBaseUrl}/generation/result/${generationId}`);
      console.log('결과 응답:', resultResponse.data);
      
      // 생성된 대본 표시
      setResponse(resultResponse.data.script);
      
      setIsLoading(false);
      
    } catch (error: any) {
      console.error('API 호출 중 오류 발생:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        setError(`오류: ${error.response.data.detail || error.message}`);
      } else {
        setError(`오류: ${error.message}`);
      }
      
      setIsLoading(false);
    }
  };

  const handleProcessResponse = async () => {
    if (!response) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newResponse = `
처리 결과:
--------------
이전 응답을 성공적으로 처리했습니다.
원본 응답 크기: ${response.length} 바이트
처리 완료 시간: ${new Date().toLocaleString()}
      `;
      setResponse(newResponse);
    } catch (err) {
      setError("응답 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-xl font-semibold">파일 업로드</h2>
          {serverConnected ? (
            <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              서버 연결됨: {apiBaseUrl}
            </p>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              서버 연결 안됨 - 다시 연결 시도 중...
            </p>
          )}
        </div>
        <div className="p-6">
          <FileUploader onFilesAdded={handleFilesAdded} darkMode={darkMode} />
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">업로드된 파일</h3>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {files.length}개의 파일
              </span>
            </div>
            
            <FileList files={files} onRemove={handleFileRemove} darkMode={darkMode} />
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                발표 시간 (분)
              </label>
              <div className="flex items-center">
                <Clock className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                <input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={handleDurationChange}
                  className={`w-full p-2 rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                발표 예상 시간을 분 단위로 입력하세요. 기본값: 3분
              </p>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || files.length === 0 || !serverConnected}
              className={`mt-6 px-5 py-3 rounded-md w-full flex justify-center items-center space-x-2 font-medium transition-colors duration-200
                ${isLoading 
                  ? `${darkMode ? 'bg-blue-700 text-gray-300' : 'bg-blue-400 text-white'} cursor-not-allowed` 
                  : files.length === 0 || !serverConnected
                    ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                    : `${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white`
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>처리 중...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>서버로 전송</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-xl font-semibold">서버 응답</h2>
        </div>
        <div className="p-6">
          <ResponseDisplay response={response} isLoading={isLoading} darkMode={darkMode} />
          
          {response && !isLoading && (
            <button
              onClick={handleProcessResponse}
              className={`mt-6 px-5 py-3 rounded-md w-full flex justify-center items-center space-x-2 font-medium
                ${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-700'} text-white
                transition-colors duration-200`}
            >
              <SendHorizontal size={18} />
              <span>응답 처리</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;