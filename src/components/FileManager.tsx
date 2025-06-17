import React, { useState, useEffect } from 'react';
import UnifiedFileManager from './UnifiedFileManager';
import { FileInfo } from '../types';
import { Timer, TestTube, Sparkles, Loader2 } from 'lucide-react';
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
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [style, setStyle] = useState<string>('professional');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  // 기본 프롬프트 템플릿
  const defaultPrompts = {
    professional: '전문적이고 공식적인 어조로 발표 대본을 작성해주세요. 비즈니스 환경에 적합한 용어와 문체를 사용하여 신뢰성 있는 내용으로 구성해주세요.',
    casual: '친근하고 편안한 어조로 발표 대본을 작성해주세요. 일상적인 언어를 사용하여 청중과의 거리감을 줄이고 친밀감을 형성할 수 있도록 해주세요.',
    custom: customPrompt
  };

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
    if (!isNaN(value) && value >= 0) {
      setDurationMinutes(value);
    }
  };

  const handleDurationSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value < 60) {
      setDurationSeconds(value);
    }
  };

  const handleDurationSecondsBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value < 60) {
      // 10초 단위로 내림 처리
      const roundedValue = Math.floor(value / 10) * 10;
      setDurationSeconds(roundedValue);
    }
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStyle(e.target.value);
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
  };

  // 더미 데이터로 응답 시뮬레이션
  const simulateResponse = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // 진행률 시뮬레이션
      const steps = [
        { progress: 10, message: '파일 업로드 중...' },
        { progress: 30, message: '텍스트 추출 중...' },
        { progress: 50, message: 'AI 대본 생성 중...' },
        { progress: 80, message: '결과 검증 중...' },
        { progress: 100, message: '완료!' }
      ];

      for (const step of steps) {
        setLoadingProgress(step.progress);
        setLoadingMessage(step.message);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // 랜덤 더미 응답 선택
      const randomResponse = DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)];
      
      // 파일 정보를 포함한 응답 생성
      const fileInfo = files[0];
      const enhancedResponse = `[테스트 모드] 파일: ${fileInfo.name} (${fileInfo.size})
발표 시간: ${durationMinutes}분 ${durationSeconds}초
생성 스타일: ${style === 'professional' ? '전문적' : style === 'casual' ? '캐주얼' : '직접작성'}
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
    setLoadingProgress(10);
    setLoadingMessage('파일 업로드 중...');

    try {
      // 첫 번째 파일을 기본 파일로 사용
      const mainFile = files[0].file;
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', mainFile);
      formData.append('style', style);
      formData.append('custom_prompt', style === 'custom' ? customPrompt : defaultPrompts[style as keyof typeof defaultPrompts]);
      formData.append('language', 'ko'); // 기본 언어
      formData.append('duration_minutes', durationMinutes.toString()); // 발표 시간 (분)
      formData.append('duration_seconds', durationSeconds.toString()); // 발표 시간 (초)
      
      console.log('API 호출:', `${apiBaseUrl}/scripts/generate`);
      console.log('파일 정보:', mainFile.name, mainFile.type, mainFile.size);
      console.log('발표 시간:', durationMinutes, '분', durationSeconds, '초');
      
      setLoadingProgress(30);
      setLoadingMessage('대본 생성 요청 중...');
      
      // 대본 생성 요청 API 호출
      const response = await axios.post(
        `${apiBaseUrl}/scripts/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('서버 응답:', response.data);
      
      // 생성 ID 가져오기 (서버는 task_id로 반환)
      const generationId = response.data.task_id;
      
      // 응답값 검증
      if (!generationId) {
        console.error('생성 ID를 찾을 수 없습니다:', response.data);
        setError('서버 응답에서 생성 ID를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }
      
      // 대본 생성이 완료될 때까지 상태 확인
      let isCompleted = false;
      let generationStatus = '';
      let currentProgress = 50;
      
      setLoadingProgress(50);
      setLoadingMessage('AI 대본 생성 중...');
      
      while (!isCompleted) {
        // 2초 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 진행률 점진적 증가
        currentProgress = Math.min(currentProgress + 10, 90);
        setLoadingProgress(currentProgress);
        
        // 상태 확인 API 호출
        const statusResponse = await axios.get(`${apiBaseUrl}/scripts/status/${generationId}`);
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
      setLoadingProgress(100);
      setLoadingMessage('완료!');
      
      const resultResponse = await axios.get(`${apiBaseUrl}/scripts/result/${generationId}`);
      console.log('결과 응답:', resultResponse.data);
      
      // 생성된 대본을 부모 컴포넌트로 전달
      if (onGenerationResult) {
        onGenerationResult(resultResponse.data.script);
      }
      
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
      
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
    <div className="h-full flex flex-col">
      {/* 스크롤 가능한 상단 영역 */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* 통합 파일 관리 영역 */}
        <div>
          <h3 className="text-lg font-medium mb-3">파일 업로드</h3>
          <UnifiedFileManager
            files={files}
            onFilesAdded={handleFilesAdded}
            onFileRemove={handleFileRemove}
            darkMode={darkMode}
          />
          
          {error && (
            <div className={`mt-4 p-3 rounded-md border ${
              darkMode 
                ? 'bg-red-900/20 border-red-700 text-red-400' 
                : 'bg-red-100 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}
        </div>
            
        {/* 발표 설정 영역 - 좌우 배치 */}
        <div>
          <h3 className="text-lg font-medium mb-3">발표 설정</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 왼쪽: 발표 시간 */}
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-3">
                <Timer className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={18} />
                <h4 className="font-medium">발표 시간</h4>
              </div>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationMinutes}
                      onChange={handleDurationChange}
                      className={`w-full p-2 rounded-md border text-center font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                    <span className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      분
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="10"
                      value={durationSeconds}
                      onChange={handleDurationSecondsChange}
                      onBlur={handleDurationSecondsBlur}
                      className={`w-full p-2 rounded-md border text-center font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                    <span className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      초
                    </span>
                  </div>
                </div>
              </div>
              <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                초는 10초 단위로 자동 조정됩니다
              </p>
            </div>

            {/* 오른쪽: 대본 스타일 */}
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-3">
                <TestTube className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={18} />
                <h4 className="font-medium">대본 스타일</h4>
              </div>
              <select
                value={style}
                onChange={handleStyleChange}
                className={`w-full p-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="professional">전문적</option>
                <option value="casual">캐주얼</option>
                <option value="custom">직접 작성</option>
              </select>
              <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                대본의 어조와 표현 스타일을 결정합니다
              </p>
            </div>
          </div>
        </div>

        {/* 생성 프롬프트 영역 */}
        <div className="flex-1 min-h-0">
          <h3 className="text-lg font-medium mb-3">생성 프롬프트</h3>
          <div className="h-full flex flex-col min-h-0">
            <textarea
              value={style === 'custom' ? customPrompt : defaultPrompts[style as keyof typeof defaultPrompts]}
              onChange={handleCustomPromptChange}
              disabled={style !== 'custom'}
              rows={6}
              className={`w-full p-3 rounded-md border resize-none flex-1 min-h-[180px] ${
                style === 'custom'
                  ? darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-800'
                  : darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              placeholder="직접 작성을 선택하면 프롬프트를 수정할 수 있습니다..."
            />
          </div>
        </div>
      </div>
            
      {/* 하단 고정 버튼 영역 */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={isLoading || files.length === 0}
          className={`px-5 py-3 rounded-md w-full flex justify-center items-center space-x-2 font-medium transition-colors duration-200
              ${isLoading 
                ? `${darkMode ? 'bg-blue-700 text-gray-300' : 'bg-blue-400 text-white'} cursor-not-allowed` 
                : files.length === 0
                  ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                  : `${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white`
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>{serverConnected ? '처리 중...' : '테스트 처리 중...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{serverConnected ? 'AI 대본 생성' : 'AI 대본 생성(테스트)'}</span>
              </>
            )}
        </button>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-8 rounded-lg max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mb-4">
                <Sparkles className={`mx-auto animate-pulse ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={48} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                AI 대본 생성 중
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loadingMessage}
              </p>
              
              {/* 진행률 바 */}
              <div className={`w-full rounded-full h-2 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              
              {/* 퍼센테이지 */}
              <p className={`text-lg font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {loadingProgress}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;