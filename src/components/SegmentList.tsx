import React, { useState } from 'react';
import { ScriptSegment, SegmentVideoConfig } from '../types';
import { FileIcon, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';

interface SegmentListProps {
  segments: ScriptSegment[];
  videoConfigs?: Record<string, SegmentVideoConfig>;
  selectedSegment?: ScriptSegment | null;
  onSegmentSelect?: (segment: ScriptSegment) => void;
  darkMode: boolean;
  showStatus?: boolean; // 상태 표시 여부
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
  serverConnected?: boolean; // 서버 연결 상태
}

const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  videoConfigs = {},
  selectedSegment,
  onSegmentSelect,
  darkMode,
  showStatus = true,
  isLoading = false,
  error = null,
  emptyMessage = "세그먼트가 없습니다",
  className = "",
  serverConnected = false
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 더미 프롬프트 데이터 (테스트 모드용)
  const getDummyPrompt = (segmentId: string, status: string) => {
    const prompts = {
      'completed': [
        '고품질 AI 컨퍼런스 영상을 생성해주세요. 전문적이고 깔끔한 스타일로 제작하며, 비즈니스 환경에 적합한 배경과 조명을 사용해주세요. 발표자는 자신감 있고 친근한 표정으로 카메라를 바라보며 말하고 있어야 합니다.',
        '교육용 프레젠테이션 영상을 만들어주세요. 학습자가 집중할 수 있도록 깔끔하고 명확한 시각적 요소를 포함하며, 설명하는 내용과 관련된 적절한 그래픽이나 차트를 배경에 배치해주세요.',
        '마케팅 전략 발표 영상을 제작해주세요. 현대적이고 역동적인 느낌의 배경과 함께, 데이터와 그래프를 효과적으로 보여줄 수 있는 구성으로 만들어주세요. 발표자는 열정적이고 설득력 있는 모습이어야 합니다.'
      ],
      'generating': [
        '프로젝트 진행 현황 보고서 영상을 생성 중입니다. 팀워크와 협업을 강조하는 배경과 함께, 진행률과 성과를 시각적으로 표현할 수 있는 요소들을 포함하여 제작하고 있습니다.',
        '기술 혁신 관련 프레젠테이션 영상을 만들고 있습니다. 미래지향적이고 혁신적인 느낌의 배경과 함께, 기술적 내용을 이해하기 쉽게 전달할 수 있는 시각적 구성으로 생성 중입니다.'
      ],
      'failed': [
        '영상 생성 중 오류가 발생했습니다. 프롬프트 내용을 다시 확인하고 재시도해주세요.',
        '서버 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      ],
      'pending': [
        '아직 프롬프트가 생성되지 않았습니다. 잠시 후 자동으로 생성됩니다.',
        '대기열에서 처리를 기다리고 있습니다.'
      ]
    };
    
    const statusPrompts = prompts[status as keyof typeof prompts] || prompts.pending;
    const index = parseInt(segmentId.slice(-1)) % statusPrompts.length;
    return statusPrompts[index];
  };

  // 프롬프트 내용 가져오기
  const getPromptContent = (segmentId: string) => {
    const config = videoConfigs[segmentId];
    
    if (serverConnected && config?.video_prompt) {
      return config.video_prompt;
    } else {
      // 테스트 모드 또는 프롬프트가 없는 경우 더미 데이터 사용
      const status = config?.prompt_status || 'pending';
      return getDummyPrompt(segmentId, status);
    }
  };

  // 마우스 이벤트 핸들러
  const handleMouseEnter = (segmentId: string, event: React.MouseEvent) => {
    if (!showStatus) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredSegment(segmentId);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  // 프롬프트 상태 뱃지 렌더링
  const renderStatusBadge = (segmentId: string) => {
    if (!showStatus) return null;
    
    const config = videoConfigs[segmentId];
    
    // 설정이 없거나 pending 상태인 경우
    if (!config || config.prompt_status === 'pending') {
      return (
        <div 
          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 cursor-help ${
            darkMode ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          } transition-colors duration-200`}
          onMouseEnter={(e) => handleMouseEnter(segmentId, e)}
          onMouseLeave={handleMouseLeave}
        >
          <Clock size={12} />
          <span>대기중</span>
        </div>
      );
    }
    
    if (config.prompt_status === 'completed') {
      return (
        <div 
          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 cursor-help ${
            darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-800/40' : 'bg-green-100 text-green-700 hover:bg-green-200'
          } transition-colors duration-200`}
          onMouseEnter={(e) => handleMouseEnter(segmentId, e)}
          onMouseLeave={handleMouseLeave}
        >
          <CheckCircle size={12} />
          <span>완료</span>
        </div>
      );
    } else if (config.prompt_status === 'generating') {
      return (
        <div 
          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 cursor-help ${
            darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/40' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          } transition-colors duration-200`}
          onMouseEnter={(e) => handleMouseEnter(segmentId, e)}
          onMouseLeave={handleMouseLeave}
        >
          <Loader2 size={12} className="animate-spin" />
          <span>생성중</span>
        </div>
      );
    } else if (config.prompt_status === 'failed') {
      return (
        <div 
          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 cursor-help ${
            darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-800/40' : 'bg-red-100 text-red-700 hover:bg-red-200'
          } transition-colors duration-200`}
          onMouseEnter={(e) => handleMouseEnter(segmentId, e)}
          onMouseLeave={handleMouseLeave}
        >
          <AlertCircle size={12} />
          <span>실패</span>
        </div>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
        <span className="ml-2">세그먼트 로드 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileIcon className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 relative ${className}`}>
      {segments.map((segment) => (
        <div
          key={segment.id}
          onClick={() => onSegmentSelect?.(segment)}
          className={`p-4 rounded-lg border transition-colors duration-200 ${
            onSegmentSelect ? 'cursor-pointer' : ''
          } ${
            selectedSegment?.id === segment.id
              ? darkMode 
                ? 'border-blue-500 bg-blue-900/20' 
                : 'border-blue-500 bg-blue-50'
              : darkMode
                ? 'border-gray-600 bg-gray-700/30 hover:bg-gray-700/50' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                selectedSegment?.id === segment.id
                  ? darkMode ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
                  : darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {segment.segment_index}
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                세그먼트 {segment.segment_index}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {segment.slide_reference && (
                <div className="flex items-center space-x-1 text-xs">
                  <FileIcon size={12} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {segment.slide_reference}
                  </span>
                </div>
              )}
              {renderStatusBadge(segment.id)}
            </div>
          </div>
          
          <div className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {segment.content.split('\n').map((line, lineIndex) => (
              <p key={lineIndex} className="mb-1">
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>
      ))}

      {/* 툴팁 */}
      {hoveredSegment && showStatus && (
        <div
          className={`fixed z-50 max-w-sm p-3 rounded-lg shadow-lg border pointer-events-none transform -translate-x-1/2 -translate-y-full ${
            darkMode 
              ? 'bg-gray-900 border-gray-700 text-gray-200' 
              : 'bg-white border-gray-200 text-gray-800'
          }`}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="text-xs font-medium mb-2">생성된 프롬프트:</div>
          <div className="text-xs leading-relaxed">
            {getPromptContent(hoveredSegment)}
          </div>
          {!serverConnected && (
            <div className={`text-xs mt-2 italic ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              (테스트 데이터)
            </div>
          )}
          
          {/* 툴팁 화살표 */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
              darkMode ? 'border-t-gray-900' : 'border-t-white'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default SegmentList;