import React from 'react';
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
  className = ""
}) => {
  // 프롬프트 상태 뱃지 렌더링
  const renderStatusBadge = (segmentId: string) => {
    if (!showStatus) return null;
    
    const config = videoConfigs[segmentId];
    
    // 설정이 없거나 pending 상태인 경우
    if (!config || config.prompt_status === 'pending') {
      return (
        <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-200 text-gray-600'
        }`}>
          <Clock size={12} />
          <span>대기중</span>
        </div>
      );
    }
    
    if (config.prompt_status === 'completed') {
      return (
        <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
        }`}>
          <CheckCircle size={12} />
          <span>완료</span>
        </div>
      );
    } else if (config.prompt_status === 'generating') {
      return (
        <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
        }`}>
          <Loader2 size={12} className="animate-spin" />
          <span>생성중</span>
        </div>
      );
    } else if (config.prompt_status === 'failed') {
      return (
        <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
          darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
        }`}>
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
    <div className={`space-y-4 ${className}`}>
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
    </div>
  );
};

export default SegmentList;