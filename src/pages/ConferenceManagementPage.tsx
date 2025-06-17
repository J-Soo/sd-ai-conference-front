import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, Loader2, CheckCircle, XCircle, AlertCircle, Play, Download, Settings, Eye, EyeOff } from 'lucide-react';
import { Script, AudioGeneration, VideoGeneration, Conference } from '../types';
import { formatDate } from '../utils';
import axios from 'axios';

interface ConferenceManagementPageProps {
  darkMode: boolean;
  serverConnected: boolean;
}

const ConferenceManagementPage: React.FC<ConferenceManagementPageProps> = ({
  darkMode,
  serverConnected
}) => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  
  // UI 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  // 미리보기 모달 상태
  const [showPreview, setShowPreview] = useState(false);
  const [previewConference, setPreviewConference] = useState<Conference | null>(null);

  // 더미 데이터
  const generateDummyConferences = (): Conference[] => [
    {
      conference_id: 'conf_1',
      conference_title: '마케팅 전략 발표',
      conference_owner: '김철수',
      use_yn: true,
      script_id: 'script_1',
      tts_id: 'tts_1',
      total_segments: 3,
      video_ready: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T12:00:00Z'
    },
    {
      conference_id: 'conf_2',
      conference_title: '프로젝트 진행 현황',
      conference_owner: '박영희',
      use_yn: false,
      script_id: 'script_2',
      tts_id: 'tts_2',
      total_segments: 4,
      video_ready: false,
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T20:00:00Z'
    },
    {
      conference_id: 'conf_3',
      conference_title: '2024년 사업 계획',
      conference_owner: '이민수',
      use_yn: true,
      script_id: 'script_3',
      tts_id: null,
      total_segments: 5,
      video_ready: true,
      created_at: '2024-01-13T09:15:00Z',
      updated_at: '2024-01-13T11:30:00Z'
    }
  ];

  // 컨퍼런스 목록 로드
  useEffect(() => {
    loadConferences();
  }, []);

  const loadConferences = async () => {
    setLoading(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          const response = await axios.get('http://localhost:8000/api/v1/conferences');
          if (response.data && Array.isArray(response.data)) {
            setConferences(response.data);
          } else {
            setError('API에서 유효한 응답을 받지 못했습니다.');
            setConferences([]);
          }
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            setError('컨퍼런스 API가 아직 구현되지 않았습니다.');
            setConferences(generateDummyConferences());
          } else {
            setError(`서버 오류: ${apiError.message || '알 수 없는 오류'}`);
            setConferences([]);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConferences(generateDummyConferences());
      }
    } catch (err: any) {
      setError('컨퍼런스를 불러오는 중 오류가 발생했습니다.');
      setConferences([]);
    } finally {
      setLoading(false);
    }
  };

  // 사용 여부 토글
  const handleToggleEnabled = async (conferenceId: string) => {
    try {
      const conference = conferences.find(c => c.conference_id === conferenceId);
      if (!conference) return;

      const newEnabledState = !conference.use_yn;

      if (serverConnected) {
        try {
          await axios.patch(`http://localhost:8000/api/v1/conferences/${conferenceId}/toggle`, {
            use_yn: newEnabledState
          });
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            // API가 구현되지 않은 경우 로컬에서 처리
          } else {
            setError(`사용 여부 변경 오류: ${apiError.message || '알 수 없는 오류'}`);
            return;
          }
        }
      }

      // 로컬 상태 업데이트
      setConferences(prev => prev.map(conference => 
        conference.conference_id === conferenceId 
          ? { ...conference, use_yn: newEnabledState, updated_at: new Date().toISOString() }
          : conference
      ));
      
      setSuccessMessage(`컨퍼런스가 ${newEnabledState ? '활성화' : '비활성화'}되었습니다.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('사용 여부 변경 중 오류가 발생했습니다.');
    }
  };

  // 미리보기 모달 열기
  const handlePreview = (conference: Conference) => {
    setPreviewConference(conference);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">

      {error && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* 컨퍼런스 목록 */}
      <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">컨퍼런스 목록</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {conferences.length}개의 컨퍼런스 • {conferences.filter(c => c.use_yn).length}개 활성화됨
                {!serverConnected && ' • 테스트 모드'}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedConference(null);
                setShowRegistrationForm(true);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                darkMode 
                  ? 'bg-rose-400 hover:bg-rose-500 text-white' 
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              컨퍼런스 생성
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
              <span className="ml-2">로드 중...</span>
            </div>
          ) : conferences.length === 0 ? (
            <div className="text-center py-12">
              <FileText className={`mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
              <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                컨퍼런스를 생성하세요
              </h4>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                아직 생성된 컨퍼런스가 없습니다. 새로운 컨퍼런스를 생성해보세요.
              </p>
              <button
                onClick={() => {
                  setSelectedConference(null);
                  setShowRegistrationForm(true);
                }}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-rose-400 hover:bg-rose-500 text-white' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                첫 번째 컨퍼런스 생성하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {conferences.map((conference) => (
                <div
                  key={conference.conference_id}
                  className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                    selectedConference?.conference_id === conference.conference_id
                      ? darkMode 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-blue-500 bg-blue-50'
                      : darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedConference(conference);
                    setShowRegistrationForm(false);
                  }}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {conference.conference_title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {conference.use_yn ? (
                            <Eye className="text-green-500" size={16} />
                          ) : (
                            <EyeOff className="text-gray-400" size={16} />
                          )}
                          <span className={`text-xs ${conference.use_yn ? 'text-green-500' : 'text-gray-400'}`}>
                            {conference.use_yn ? '사용' : '미사용'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleEnabled(conference.conference_id);
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                            conference.use_yn
                              ? darkMode 
                                ? 'bg-red-600 hover:bg-red-500 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                              : darkMode 
                                ? 'bg-green-600 hover:bg-green-500 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {conference.use_yn ? '비활성화' : '활성화'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 h-6">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          소유자: {conference.conference_owner}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 h-6">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          세그먼트: {conference.total_segments}개
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 h-6">
                        <Calendar size={12} />
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(conference.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 컨퍼런스 등록/수정 영역 */}
      {(showRegistrationForm || selectedConference) && (
        <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedConference ? '컨퍼런스 수정' : '새 컨퍼런스 생성'}
              </h3>
              <button
                onClick={() => {
                  setShowRegistrationForm(false);
                  setSelectedConference(null);
                }}
                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                닫기
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  컨퍼런스 제목
                </label>
                <input
                  type="text"
                  defaultValue={selectedConference?.conference_title || ''}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="컨퍼런스 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  소유자
                </label>
                <input
                  type="text"
                  defaultValue={selectedConference?.conference_owner || ''}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="소유자명을 입력하세요"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  대본 선택
                </label>
                <select
                  defaultValue={selectedConference?.script_id || ''}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">대본을 선택하세요</option>
                  <option value="script_1">마케팅 전략 발표</option>
                  <option value="script_2">프로젝트 진행 현황</option>
                  <option value="script_3">2024년 사업 계획</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  음성 선택
                </label>
                <select
                  defaultValue={selectedConference?.tts_id || ''}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">음성을 선택하세요</option>
                  <option value="tts_1">남성 목소리 1</option>
                  <option value="tts_2">여성 목소리 1</option>
                  <option value="tts_3">남성 목소리 2</option>
                </select>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRegistrationForm(false);
                  setSelectedConference(null);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                취소
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-rose-400 hover:bg-rose-500 text-white' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {selectedConference ? '수정' : '생성'}
              </button>
              
              {selectedConference && (
                <>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    영상 생성으로 이동
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    영상 관리로 이동
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConferenceManagementPage;