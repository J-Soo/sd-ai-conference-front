import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScriptSegment, Script, SegmentVideoConfig } from '../types';
import { FileText, Loader2, AlertCircle, Hash, FileIcon, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface ScriptSegmentViewerProps {
  selectedScript: Script | null;
  darkMode: boolean;
  serverConnected: boolean;
}

const ScriptSegmentViewer: React.FC<ScriptSegmentViewerProps> = ({
  selectedScript,
  darkMode,
  serverConnected
}) => {
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoConfigs, setVideoConfigs] = useState<Record<string, SegmentVideoConfig>>({});
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  
  // 각 세그먼트의 체크 완료 상태를 추적
  const [completedSegments, setCompletedSegments] = useState<Set<string>>(new Set());
  
  // 폴링 인터벌 참조
  const pollingIntervalRef = useRef<number | null>(null);
  
  // 폴링 주기 (5초)
  const POLLING_INTERVAL = 5000;

  // 더미 세그먼트 데이터 (백엔드 연결이 안될 때 사용)
  const generateDummySegments = (scriptId: string): ScriptSegment[] => {
    const dummySegments: ScriptSegment[] = [
      {
        id: `seg_${scriptId}_1`,
        script_id: scriptId,
        segment_index: 1,
        content: '안녕하세요! 오늘 발표할 주제에 대해 말씀드리겠습니다.',
        slide_reference: 'slide_01.png',
        created_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_2`,
        script_id: scriptId,
        segment_index: 2,
        content: '첫 번째로, 우리가 다룰 핵심 내용은 다음과 같습니다:\n- 현재 시장 상황 분석\n- 새로운 기술 동향\n- 향후 전망과 기회',
        slide_reference: 'slide_02.png',
        created_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_3`,
        script_id: scriptId,
        segment_index: 3,
        content: '두 번째로, 시장 분석 결과를 보면 지난 분기 대비 30% 성장을 기록했습니다. 이는 우리의 예상을 뛰어넘는 결과입니다.',
        slide_reference: 'slide_03.png',
        created_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_4`,
        script_id: scriptId,
        segment_index: 4,
        content: '세 번째로, 기술 혁신 측면에서 AI와 머신러닝 기술의 도입이 핵심 성공 요인이었습니다.',
        slide_reference: undefined,
        created_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_5`,
        script_id: scriptId,
        segment_index: 5,
        content: '마지막으로, 앞으로의 계획과 목표에 대해 말씀드리겠습니다. 우리는 다음 분기에 더욱 혁신적인 솔루션을 선보일 예정입니다.\n\n감사합니다.',
        slide_reference: 'slide_04.png',
        created_at: new Date().toISOString()
      }
    ];
    
    return dummySegments;
  };

  // 더미 비디오 설정 데이터 (백엔드 연결이 안될 때 사용)
  const generateDummyVideoConfigs = (scriptId: string, segments: ScriptSegment[]): Record<string, SegmentVideoConfig> => {
    const configs: Record<string, SegmentVideoConfig> = {};
    
    segments.forEach((segment, index) => {
      // 일부는 완료, 일부는 다른 상태로 설정
      const statuses: Array<'pending' | 'generating' | 'completed' | 'failed'> = ['completed', 'completed', 'generating', 'pending', 'failed'];
      
      configs[segment.id] = {
        id: `cfg_${segment.id}`,
        script_id: scriptId,
        segment_id: segment.id,
        video_prompt: index % 2 === 0 ? `고품질 AI 컨퍼런스 영상: ${segment.content.substring(0, 50)}...` : undefined,
        prompt_status: statuses[index % statuses.length],
        prompt_retry_count: index % 3,
        prompt_version: 1,
        is_user_modified: false,
        use_avatar: false,
        last_modified_by: 'system',
        modified_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    return configs;
  };

  // 선택된 스크립트가 변경될 때 세그먼트 로드
  useEffect(() => {
    if (selectedScript) {
      loadSegments(selectedScript.id);
      // 스크립트가 변경되면 완료된 세그먼트 목록 초기화
      setCompletedSegments(new Set());
    } else {
      setSegments([]);
      setVideoConfigs({});
      setError(null);
      setCompletedSegments(new Set());
    }
  }, [selectedScript]);

  // 세그먼트가 로드된 후 비디오 설정 로드 및 폴링 시작
  useEffect(() => {
    if (selectedScript && segments.length > 0) {
      loadVideoConfigs(selectedScript.id);
    }
    
    // 클린업: 컴포넌트 언마운트 시 폴링 중지
    return () => {
      stopPolling();
    };
  }, [segments, selectedScript?.id]);

  // 별도의 useEffect로 폴링 관리
  useEffect(() => {
    // 서버 연결되어 있고, 세그먼트가 있고, 완료되지 않은 세그먼트가 있을 때만 폴링
    if (serverConnected && segments.length > 0 && completedSegments.size < segments.length) {
      console.log('폴링 시작 조건:', {
        serverConnected,
        segmentsLength: segments.length,
        completedSize: completedSegments.size,
        shouldPoll: completedSegments.size < segments.length
      });
      startPolling();
    } else {
      console.log('폴링 중지 조건:', {
        serverConnected,
        segmentsLength: segments.length,
        completedSize: completedSegments.size,
        allCompleted: completedSegments.size >= segments.length
      });
      stopPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [serverConnected, segments.length, completedSegments.size]);

  // 폴링 시작
  const startPolling = () => {
    // 기존 폴링이 있다면 중지
    stopPolling();
    
    // 이미 모든 세그먼트가 완료되었는지 확인
    if (completedSegments.size >= segments.length) {
      console.log('startPolling: 이미 모든 세그먼트 완료');
      return;
    }
    
    // 즉시 한 번 체크
    checkAndUpdateSegmentStatuses();
    
    // 새로운 폴링 시작
    pollingIntervalRef.current = setInterval(() => {
      checkAndUpdateSegmentStatuses();
    }, POLLING_INTERVAL);
    
    console.log('폴링 시작됨');
  };

  // 폴링 중지
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // 세그먼트 상태 체크 및 업데이트
  const checkAndUpdateSegmentStatuses = async () => {
    if (!selectedScript || segments.length === 0) return;
    
    // 완료되지 않은 세그먼트만 체크
    const segmentsToCheck = segments.filter(segment => !completedSegments.has(String(segment.id)));
    
    console.log('폴링 상태:', {
      전체세그먼트수: segments.length,
      완료된세그먼트수: completedSegments.size,
      체크할세그먼트수: segmentsToCheck.length,
      완료된세그먼트ID: Array.from(completedSegments)
    });
    
    if (segmentsToCheck.length === 0) {
      // 모든 세그먼트가 완료되면 폴링 중지
      console.log('모든 세그먼트 완료 - 폴링 중지');
      stopPolling();
      return;
    }
    
    try {
      // 각 세그먼트에 대해 비동기로 상태 체크
      const checkPromises = segmentsToCheck.map(async (segment) => {
        try {
          // 개별 세그먼트의 설정 조회 (script_id를 쿼리 파라미터로 전달)
          const response = await axios.get(`http://localhost:8000/api/v1/segment-video-configs/by-segment/${segment.id}?script_id=${selectedScript.id}`);
          
          if (response.data) {
            const config = response.data;
            
            console.log(`세그먼트 ${segment.id} 상태:`, config.prompt_status);
            
            // 상태 업데이트
            setVideoConfigs(prev => ({
              ...prev,
              [segment.id]: config
            }));
            
            // 완료된 경우 완료 목록에 추가
            if (config.prompt_status === 'completed') {
              console.log(`세그먼트 ${segment.id} 완료 - completedSegments에 추가`);
              setCompletedSegments(prev => new Set([...prev, String(segment.id)]));
            }
          }
        } catch (error: any) {
          // 404 에러인 경우 설정이 없는 것이므로 생성 API 호출
          if (error.response && error.response.status === 404) {
            console.log(`세그먼트 ${segment.id}에 대한 설정이 없습니다. 생성을 시작합니다.`);
            // 설정이 없으면 자동으로 생성 (by-segment API가 자동으로 처리)
            // 다음 폴링에서 상태를 다시 체크할 것임
          } else {
            console.error(`세그먼트 ${segment.id} 상태 체크 오류:`, error);
          }
        }
      });
      
      // 모든 체크 완료 대기
      await Promise.all(checkPromises);
      
    } catch (error) {
      console.error('세그먼트 상태 체크 중 오류:', error);
    }
  };

  const loadSegments = async (scriptId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/scripts/${scriptId}/segments`);
          console.log('세그먼트 API 응답:', response.data);
          
          if (response.data && Array.isArray(response.data)) {
            setSegments(response.data);
          } else {
            console.error('세그먼트 API 응답 형식 오류:', response.data);
            setError('세그먼트 API에서 유효한 배열 형식의 응답을 받지 못했습니다.');
            setSegments([]);
          }
        } catch (apiError: any) {
          console.error('세그먼트 API 호출 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('세그먼트를 찾을 수 없습니다. 대본 ID가 유효하지 않거나 세그먼트가 생성되지 않았습니다.');
            // API가 구현되지 않은 경우에만 임시로 더미 데이터 사용
            setSegments(generateDummySegments(scriptId));
          } else {
            setError(`세그먼트 로드 오류: ${apiError.response?.data?.detail || apiError.message || '알 수 없는 오류'}`);
            setSegments([]);
          }
        }
      } else {
        // 테스트 모드: 더미 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 800)); // 로딩 시뮬레이션
        setSegments(generateDummySegments(scriptId));
      }
    } catch (err: any) {
      console.error('세그먼트 로드 오류:', err);
      setError('세그먼트를 불러오는 중 오류가 발생했습니다.');
      setSegments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 비디오 설정 로드
  const loadVideoConfigs = useCallback(async (scriptId: string) => {
    setLoadingConfigs(true);
    
    try {
      if (serverConnected) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/segment-video-configs/by-script/${scriptId}`);
          console.log('비디오 설정 API 응답:', response.data);
          
          if (response.data && response.data.configs && Array.isArray(response.data.configs)) {
            // 세그먼트 ID로 인덱싱된 객체로 변환
            const configsMap: Record<string, SegmentVideoConfig> = {};
            const newCompletedSegments = new Set<string>();
            
            response.data.configs.forEach((config: SegmentVideoConfig) => {
              configsMap[config.segment_id] = config;
              
              // 이미 완료된 세그먼트는 완료 목록에 추가
              if (config.prompt_status === 'completed') {
                newCompletedSegments.add(String(config.segment_id));
              }
            });
            
            setVideoConfigs(configsMap);
            setCompletedSegments(newCompletedSegments);
            
            console.log('초기 로드 완료:', {
              로드된설정수: Object.keys(configsMap).length,
              완료된세그먼트수: newCompletedSegments.size,
              완료된세그먼트ID: Array.from(newCompletedSegments),
              전체세그먼트수: segments.length
            });
          } else {
            console.error('비디오 설정 API 응답 형식 오류:', response.data);
            // 에러가 발생해도 빈 맵으로 설정
            setVideoConfigs({});
            setCompletedSegments(new Set());
          }
        } catch (apiError: any) {
          console.error('비디오 설정 API 호출 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            // API가 구현되지 않은 경우 더미 데이터 사용
            const dummyConfigs = generateDummyVideoConfigs(scriptId, segments);
            setVideoConfigs(dummyConfigs);
            
            // 더미 데이터에서 완료된 세그먼트 추출
            const newCompletedSegments = new Set<string>();
            Object.entries(dummyConfigs).forEach(([segmentId, config]) => {
              if (config.prompt_status === 'completed') {
                newCompletedSegments.add(String(segmentId));
              }
            });
            setCompletedSegments(newCompletedSegments);
          } else {
            // 에러가 발생해도 UI를 방해하지 않도록 빈 맵으로 설정
            setVideoConfigs({});
            setCompletedSegments(new Set());
          }
        }
      } else {
        // 테스트 모드: 더미 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        const dummyConfigs = generateDummyVideoConfigs(scriptId, segments);
        setVideoConfigs(dummyConfigs);
        
        // 더미 데이터에서 완료된 세그먼트 추출
        const newCompletedSegments = new Set<string>();
        Object.entries(dummyConfigs).forEach(([segmentId, config]) => {
          if (config.prompt_status === 'completed') {
            newCompletedSegments.add(String(segmentId));
          }
        });
        setCompletedSegments(newCompletedSegments);
      }
    } catch (err: any) {
      console.error('비디오 설정 로드 오류:', err);
      setVideoConfigs({});
      setCompletedSegments(new Set());
    } finally {
      setLoadingConfigs(false);
    }
  }, [serverConnected, segments]);

  // 세그먼트 상단에 프롬프트 상태 뱃지 렌더링
  const renderPromptStatusBadge = (segmentId: string) => {
    const config = videoConfigs[segmentId];
    
    // 설정이 없거나 pending 상태인 경우
    if (!config || config.prompt_status === 'pending') {
      return (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-200 text-gray-600'
        }`}>
          <Loader2 size={12} className="animate-spin" />
          <span>생성 대기 중</span>
        </div>
      );
    }
    
    if (config.prompt_status === 'completed') {
      return (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
        }`}>
          <CheckCircle size={12} />
          <span>생성 완료</span>
        </div>
      );
    } else if (config.prompt_status === 'generating') {
      return (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
        }`}>
          <Loader2 size={12} className="animate-spin" />
          <span>생성 중...</span>
        </div>
      );
    } else if (config.prompt_status === 'failed') {
      return (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
        }`}>
          <AlertCircle size={12} />
          <span>생성 실패</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md h-full`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">대본 세그먼트 목록</h3>
          <div className="flex items-center gap-2">
            {serverConnected && segments.length > 0 && completedSegments.size < segments.length && (
              <div className="flex items-center gap-1">
                <Loader2 size={14} className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  프롬프트 생성 확인 중...
                </span>
              </div>
            )}
            {!serverConnected && selectedScript && (
              <div className="flex items-center space-x-1">
                <span className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  테스트 데이터
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
        {!selectedScript ? (
          <div className="flex flex-col items-center justify-center py-8 h-full">
            <FileText className={`mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              대본을 선택하면 세그먼트가 표시됩니다
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
            <span className="ml-2">세그먼트 로드 중...</span>
          </div>
        ) : error ? (
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : segments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              이 대본에는 세그먼트가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">
                {selectedScript.title}
              </h4>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                총 {segments.length}개의 세그먼트
                {completedSegments.size > 0 && ` (${completedSegments.size}개 완료)`}
              </p>
            </div>
            
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className={`p-4 rounded-lg border transition-colors duration-200 relative ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700/30 hover:bg-gray-700/50' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {renderPromptStatusBadge(segment.id)}
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {segment.segment_index}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      세그먼트 {segment.segment_index}
                    </span>
                  </div>
                  
                  {segment.slide_reference && (
                    <div className="flex items-center space-x-1 text-xs">
                      <FileIcon size={12} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {segment.slide_reference}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {segment.content.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex} className="mb-1">
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-1 text-xs">
                    <Hash size={10} />
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                      ID: {segment.id}
                    </span>
                  </div>
                  
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(segment.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptSegmentViewer;