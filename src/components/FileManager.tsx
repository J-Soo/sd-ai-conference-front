import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import FileList from './FileList';
import { FileInfo } from '../types';
import { Upload, Volume2, Clock, TestTube } from 'lucide-react';
import axios from 'axios';

// 기본 API 기본 URL (환경 변수나 자동 탐색으로 대체될 수 있음)
const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

interface FileManagerProps {
  darkMode: boolean;
  serverConnected: boolean;
  setServerConnected: (connected: boolean) => void;
  onNavigateToVoiceGeneration?: () => void;
  onScriptGenerated?: () => void;
  onGenerationResult?: (result: string) => void; // 생성 결과를 부모로 전달하는 콜백
}

const FileManager: React.FC<FileManagerProps> = ({ 
  darkMode, 
  serverConnected, 
  setServerConnected,
  onNavigateToVoiceGeneration,
  onScriptGenerated,
  onGenerationResult
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL);
  const [durationMinutes, setDurationMinutes] = useState<number>(3);

  // 더미 응답 데이터
  const DUMMY_RESPONSES = [
    `안녕하세요! 오늘 발표할 주제에 대해 말씀드리겠습니다.

첫 번째로, 우리가 다룰 핵심 내용은 다음과 같습니다:
- 현재 시장 상황 분석
- 새로운 기술 동향
- 향후 전망과 기회

두 번째로, 시장 분석 결과를 보면 지난 분기 대비 30% 성장을 기록했습니다. 이는 우리의 예상을 뛰어넘는 결과입니다.

세 번째로, 기술 혁신 측면에서 AI와 머신러닝 기술의 도입이 핵심 성공 요인이었습니다.

마지막으로, 앞으로의 계획과 목표에 대해 말씀드리겠습니다. 우리는 다음 분기에 더욱 혁신적인 솔루션을 선보일 예정입니다.

감사합니다.`,

    `여러분, 반갑습니다!

오늘 준비한 발표 내용은 크게 세 부분으로 구성되어 있습니다.

**1부: 문제 정의**
현재 우리가 직면한 주요 과제들을 살펴보겠습니다. 고객 만족도 향상과 운영 효율성 개선이 핵심입니다.

**2부: 해결 방안**
이러한 문제들을 해결하기 위한 구체적인 전략을 제시하겠습니다:
- 프로세스 자동화
- 데이터 기반 의사결정
- 고객 중심 서비스 개선

**3부: 실행 계획**
단계별 실행 로드맵과 예상 성과를 공유하겠습니다.

이번 프로젝트를 통해 우리는 더 나은 미래를 만들어갈 것입니다.

질문이 있으시면 언제든 말씀해 주세요. 감사합니다!`,

    `프레젠테이션을 시작하겠습니다.

**개요**
오늘 발표는 혁신과 성장에 관한 이야기입니다. 우리가 어떻게 변화하는 시장에 적응하고 있는지 보여드리겠습니다.

**현황 분석**
- 매출 증가율: 전년 대비 25% 상승
- 고객 만족도: 4.8/5.0 달성
- 시장 점유율: 업계 3위로 상승

**핵심 성과**
우리의 주요 성과는 다음과 같습니다:
1. 신제품 출시 성공
2. 글로벌 시장 진출
3. 파트너십 확대

**향후 계획**
다음 단계로는 다음과 같은 목표를 설정했습니다:
- 디지털 전환 가속화
- 지속가능한 성장 모델 구축
- 인재 육성 프로그램 강화

**결론**
우리는 지속적인 혁신을 통해 더 큰 성공을 이룰 것입니다.

여러분의 관심과 지원에 감사드립니다.`
  ];

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
    
    console.log('사용 가능한 서버를 찾지 못했습니다. 테스트 모드로 전환합니다.');
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

  // 더미 데이터로 응답 시뮬레이션
  const simulateResponse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 2-4초 랜덤 로딩 시간
      const loadingTime = Math.random() * 2000 + 2000;
      await new Promise(resolve => setTimeout(resolve, loadingTime));
      
      // 랜덤 더미 응답 선택
      const randomResponse = DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)];
      
      // 파일 정보를 포함한 응답 생성
      const fileInfo = files[0];
      const enhancedResponse = `[테스트 모드] 파일: ${fileInfo.name} (${fileInfo.size})
발표 시간: ${durationMinutes}분
생성 시간: ${new Date().toLocaleString()}

========================================
생성된 발표 대본:
========================================

${randomResponse}

========================================
※ 이는 테스트용 더미 데이터입니다.
실제 서비스 이용을 위해서는 백엔드 서버가 필요합니다.
========================================`;
      
      // 생성 결과를 부모 컴포넌트로 전달
      if (onGenerationResult) {
        onGenerationResult(enhancedResponse);
      }
      
      setIsLoading(false);
      
      // 대본 생성 완료 콜백 호출
      if (onScriptGenerated) {
        onScriptGenerated();
      }
      
    } catch (error: any) {
      setError("테스트 모드에서 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("파일을 먼저 업로드해주세요.");
      return;
    }
    
    // 서버가 연결되지 않은 경우 더미 데이터로 시뮬레이션
    if (!serverConnected) {
      await simulateResponse();
      return;
    }

    setIsLoading(true);
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
      
      // 생성된 대본을 부모 컴포넌트로 전달
      if (onGenerationResult) {
        onGenerationResult(resultResponse.data.script);
      }
      
      setIsLoading(false);
      
      // 대본 생성 완료 콜백 호출
      if (onScriptGenerated) {
        onScriptGenerated();
      }
      
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

  const handleNavigateToVoiceGeneration = () => {
    if (onNavigateToVoiceGeneration) {
      onNavigateToVoiceGeneration();
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md h-full`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">파일 업로드</h2>
          {!serverConnected && (
            <div className="flex items-center space-x-2">
              <TestTube className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} size={16} />
              <span className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                테스트 모드
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
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
            disabled={isLoading || files.length === 0}
            className={`mt-6 px-5 py-3 rounded-md w-full flex justify-center items-center space-x-2 font-medium transition-colors duration-200
              ${isLoading 
                ? `${darkMode ? 'bg-blue-700 text-gray-300' : 'bg-blue-400 text-white'} cursor-not-allowed` 
                : files.length === 0
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
                <span>{serverConnected ? '처리 중...' : '테스트 처리 중...'}</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>{serverConnected ? '서버로 전송' : '테스트 실행'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileManager;