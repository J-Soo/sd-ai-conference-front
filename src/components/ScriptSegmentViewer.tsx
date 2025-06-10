import React, { useState, useEffect } from 'react';
import { ScriptSegment, Script } from '../types';
import { FileText, Loader2, AlertCircle, Clock, Hash } from 'lucide-react';
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

  // 더미 세그먼트 데이터 (백엔드 연결이 안될 때 사용)
  const generateDummySegments = (scriptId: string): ScriptSegment[] => {
    const dummySegments: ScriptSegment[] = [
      {
        id: `seg_${scriptId}_1`,
        script_id: scriptId,
        segment_number: 1,
        title: '인사 및 소개',
        content: '안녕하세요! 오늘 발표할 주제에 대해 말씀드리겠습니다.',
        start_time: 0,
        end_time: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_2`,
        script_id: scriptId,
        segment_number: 2,
        title: '핵심 내용 소개',
        content: '첫 번째로, 우리가 다룰 핵심 내용은 다음과 같습니다:\n- 현재 시장 상황 분석\n- 새로운 기술 동향\n- 향후 전망과 기회',
        start_time: 15,
        end_time: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_3`,
        script_id: scriptId,
        segment_number: 3,
        title: '시장 분석 결과',
        content: '두 번째로, 시장 분석 결과를 보면 지난 분기 대비 30% 성장을 기록했습니다. 이는 우리의 예상을 뛰어넘는 결과입니다.',
        start_time: 45,
        end_time: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_4`,
        script_id: scriptId,
        segment_number: 4,
        title: '기술 혁신',
        content: '세 번째로, 기술 혁신 측면에서 AI와 머신러닝 기술의 도입이 핵심 성공 요인이었습니다.',
        start_time: 75,
        end_time: 105,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `seg_${scriptId}_5`,
        script_id: scriptId,
        segment_number: 5,
        title: '향후 계획 및 마무리',
        content: '마지막으로, 앞으로의 계획과 목표에 대해 말씀드리겠습니다. 우리는 다음 분기에 더욱 혁신적인 솔루션을 선보일 예정입니다.\n\n감사합니다.',
        start_time: 105,
        end_time: 135,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return dummySegments;
  };

  // 선택된 스크립트가 변경될 때 세그먼트 로드
  useEffect(() => {
    if (selectedScript) {
      loadSegments(selectedScript.id);
    } else {
      setSegments([]);
      setError(null);
    }
  }, [selectedScript]);

  const loadSegments = async (scriptId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/generation/scripts/${scriptId}/segments`);
          console.log('세그먼트 API 응답:', response.data);
          
          if (response.data && Array.isArray(response.data)) {
            setSegments(response.data);
          } else {
            console.error('세그먼트 API 응답 형식 오류:', response.data);
            setError('세그먼트 API에서 유효한 응답을 받지 못했습니다.');
            setSegments([]);
          }
        } catch (apiError: any) {
          console.error('세그먼트 API 호출 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('세그먼트 API가 아직 구현되지 않았습니다.');
            // API가 구현되지 않은 경우에만 임시로 더미 데이터 사용
            setSegments(generateDummySegments(scriptId));
          } else {
            setError(`세그먼트 로드 오류: ${apiError.message || '알 수 없는 오류'}`);
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

  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md h-full`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">대본 세그먼트</h3>
          {!serverConnected && selectedScript && (
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                테스트 데이터
              </span>
            </div>
          )}
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
              </p>
            </div>
            
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className={`p-4 rounded-lg border transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700/30 hover:bg-gray-700/50' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {segment.segment_number}
                    </div>
                    <h5 className="font-medium text-sm">{segment.title}</h5>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                      </span>
                    </div>
                  </div>
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
                      세그먼트 {segment.segment_number}
                    </span>
                  </div>
                  
                  {segment.start_time !== undefined && segment.end_time !== undefined && (
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {segment.end_time - segment.start_time}초
                    </span>
                  )}
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