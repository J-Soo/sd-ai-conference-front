import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Download, Loader2, FileText, Clock, Calendar, Volume2, AlertCircle, Trash2, CheckSquare, Square, X } from 'lucide-react';
import { Script, AudioGeneration } from '../types';
import axios from 'axios';

interface VoiceGenerationPageProps {
  darkMode: boolean;
  serverConnected: boolean;
  onBack: () => void;
}

const VoiceGenerationPage: React.FC<VoiceGenerationPageProps> = ({
  darkMode,
  serverConnected,
  onBack
}) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [audioGeneration, setAudioGeneration] = useState<AudioGeneration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingScripts, setLoadingScripts] = useState(true);
  
  // 삭제 관련 상태
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedScriptIds, setSelectedScriptIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null);
  const [deletingScriptId, setDeletingScriptId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 더미 스크립트 데이터 (백엔드 연결이 안될 때 사용)
  const dummyScripts: Script[] = [
    {
      id: '1',
      title: '마케팅 전략 발표',
      content: '안녕하세요! 오늘 발표할 주제에 대해 말씀드리겠습니다.\n\n첫 번째로, 우리가 다룰 핵심 내용은 다음과 같습니다:\n- 현재 시장 상황 분석\n- 새로운 기술 동향\n- 향후 전망과 기회\n\n감사합니다.',
      file_name: 'marketing_strategy.pptx',
      duration_minutes: 5,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: '프로젝트 진행 현황',
      content: '여러분, 반갑습니다!\n\n오늘 준비한 발표 내용은 크게 세 부분으로 구성되어 있습니다.\n\n**1부: 문제 정의**\n현재 우리가 직면한 주요 과제들을 살펴보겠습니다.\n\n질문이 있으시면 언제든 말씀해 주세요. 감사합니다!',
      file_name: 'project_status.pdf',
      duration_minutes: 3,
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      title: '혁신과 성장 전략',
      content: '프레젠테이션을 시작하겠습니다.\n\n**개요**\n오늘 발표는 혁신과 성장에 관한 이야기입니다.\n\n**결론**\n우리는 지속적인 혁신을 통해 더 큰 성공을 이룰 것입니다.\n\n여러분의 관심과 지원에 감사드립니다.',
      file_name: 'innovation_strategy.pptx',
      duration_minutes: 7,
      created_at: '2024-01-13T09:15:00Z',
      updated_at: '2024-01-13T09:15:00Z'
    }
  ];

  // 스크립트 목록 로드
  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setLoadingScripts(true);
    setError(null);

    try {
      if (serverConnected) {
        // 실제 백엔드 API 호출
        try {
          const response = await axios.get('http://localhost:8000/api/v1/generation/scripts');
          console.log('API 응답:', response.data);
          if (response.data && Array.isArray(response.data)) {
            setScripts(response.data);
          } else {
            console.error('API 응답 형식 오류:', response.data);
            setError('API에서 유효한 응답을 받지 못했습니다.');
            // 에러 시 빈 배열 설정 (더미 데이터 사용 안함)
            setScripts([]);
          }
        } catch (apiError: any) {
          console.error('API 호출 오류:', apiError);
          
          // 404 에러 - API가 아직 구현되지 않은 경우 특별 처리
          if (apiError.response && apiError.response.status === 404) {
            setError('스크립트 API가 아직 구현되지 않았습니다. 대본 생성 후 다시 시도해주세요.');
          } else {
            setError(`서버 오류: ${apiError.message || '알 수 없는 오류'}`);
          }
          
          // 빈 배열 설정 (더미 데이터 사용 안함)
          setScripts([]);
        }
      } else {
        // 테스트 모드: 더미 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        setScripts(dummyScripts);
      }
    } catch (err: any) {
      console.error('스크립트 로드 오류:', err);
      setError('스크립트를 불러오는 중 오류가 발생했습니다.');
      // 에러 시 빈 배열 설정 (더미 데이터 사용 안함)
      setScripts([]);
    } finally {
      setLoadingScripts(false);
    }
  };

  // 개별 삭제 확인 모달 표시
  const showDeleteConfirmation = (script: Script) => {
    setScriptToDelete(script);
    setShowSingleDeleteConfirm(true);
  };

  // 개별 대본 삭제 실행
  const handleDeleteScript = async () => {
    if (!scriptToDelete) return;

    setIsDeleting(true);
    setDeletingScriptId(scriptToDelete.id);

    try {
      if (serverConnected) {
        try {
          await axios.delete(`http://localhost:8000/api/v1/generation/scripts/${scriptToDelete.id}`);
          
          // 성공적으로 삭제된 경우 로컬 상태 업데이트
          setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
          
          // 삭제된 스크립트가 현재 선택된 스크립트인 경우 선택 해제
          if (selectedScript?.id === scriptToDelete.id) {
            setSelectedScript(null);
            setAudioGeneration(null);
          }
          
        } catch (apiError: any) {
          console.error('API 삭제 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('삭제 API가 아직 구현되지 않았습니다.');
            
            // API가 구현되지 않은 경우에만 임시로 로컬에서 삭제 (개발 편의를 위해)
            setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
            if (selectedScript?.id === scriptToDelete.id) {
              setSelectedScript(null);
              setAudioGeneration(null);
            }
          } else {
            setError(`삭제 중 오류 발생: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        // 테스트 모드: 로컬에서 삭제 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
        
        if (selectedScript?.id === scriptToDelete.id) {
          setSelectedScript(null);
          setAudioGeneration(null);
        }
      }
    } catch (err: any) {
      console.error('대본 삭제 오류:', err);
      setError('대본 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setDeletingScriptId(null);
      setShowSingleDeleteConfirm(false);
      setScriptToDelete(null);
    }
  };

  // 다중 대본 삭제
  const handleDeleteMultipleScripts = async () => {
    if (selectedScriptIds.size === 0) return;

    setIsDeleting(true);

    try {
      const scriptIdsArray = Array.from(selectedScriptIds);
      
      if (serverConnected) {
        try {
          await axios.delete('http://localhost:8000/api/v1/generation/scripts/bulk', {
            data: { script_ids: scriptIdsArray }
          });
          
          // 성공적으로 삭제된 경우 로컬 상태 업데이트
          setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
          
          // 삭제된 스크립트 중에 현재 선택된 스크립트가 있는 경우 선택 해제
          if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
            setSelectedScript(null);
            setAudioGeneration(null);
          }
          
        } catch (apiError: any) {
          console.error('API 다중 삭제 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('다중 삭제 API가 아직 구현되지 않았습니다.');
            
            // API가 구현되지 않은 경우에만 임시로 로컬에서 삭제 (개발 편의를 위해)
            setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
            if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
              setSelectedScript(null);
              setAudioGeneration(null);
            }
          } else {
            setError(`다중 삭제 중 오류 발생: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        // 테스트 모드: 로컬에서 삭제 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
        
        if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
          setSelectedScript(null);
          setAudioGeneration(null);
        }
      }
      
      // 다중 선택 모드 종료 및 선택 초기화
      setIsMultiSelectMode(false);
      setSelectedScriptIds(new Set());
      setShowDeleteConfirm(false);
      
    } catch (err: any) {
      console.error('다중 대본 삭제 오류:', err);
      setError('다중 대본 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 다중 선택 토글
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedScriptIds(new Set());
  };

  // 스크립트 선택 토글
  const toggleScriptSelection = (scriptId: string) => {
    const newSelection = new Set(selectedScriptIds);
    if (newSelection.has(scriptId)) {
      newSelection.delete(scriptId);
    } else {
      newSelection.add(scriptId);
    }
    setSelectedScriptIds(newSelection);
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedScriptIds.size === scripts.length) {
      setSelectedScriptIds(new Set());
    } else {
      setSelectedScriptIds(new Set(scripts.map(script => script.id)));
    }
  };

  const handleGenerateAudio = async () => {
    if (!selectedScript) return;

    setIsLoading(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          // 실제 API 호출 시도
          const response = await axios.post(`http://localhost:8000/api/v1/generation/generate-audio/${selectedScript.id}`);
          
          if (response.data && response.data.audio_url) {
            setAudioGeneration({
              id: response.data.id || 'audio_' + Date.now(),
              script_id: selectedScript.id,
              audio_url: response.data.audio_url,
              status: response.data.status || 'completed',
              created_at: response.data.created_at || new Date().toISOString(),
              updated_at: response.data.updated_at || new Date().toISOString()
            });
          } else {
            // API 응답이 유효하지 않은 경우
            console.error('API 응답 형식 오류:', response.data);
            setError('API에서 유효한 응답을 받지 못했습니다.');
          }
        } catch (apiError: any) {
          console.error('API 호출 오류:', apiError);
          
          // 404 에러 - API가 아직 구현되지 않은 경우
          if (apiError.response && apiError.response.status === 404) {
            setError('음성 생성 API가 아직 구현되지 않았습니다.');
            
            // API가 구현되지 않은 경우에만 임시로 더미 데이터 사용 (개발 편의를 위해)
            // 실제 환경에서는 이 부분 제거 필요
            const dummyAudio: AudioGeneration = {
              id: 'audio_' + Date.now(),
              script_id: selectedScript.id,
              audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // 테스트용 오디오
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setAudioGeneration(dummyAudio);
          } else {
            setError(`서버 오류: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        // 테스트 모드: 더미 오디오 생성 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        
        const dummyAudio: AudioGeneration = {
          id: 'test_audio_' + Date.now(),
          script_id: selectedScript.id,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // 테스트용 오디오
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setAudioGeneration(dummyAudio);
      }
    } catch (err: any) {
      console.error('음성 생성 오류:', err);
      setError('음성 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioGeneration?.audio_url) return;

    if (!audioElement) {
      const audio = new Audio(audioGeneration.audio_url);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = () => {
    if (!audioGeneration?.audio_url) return;
    
    const link = document.createElement('a');
    link.href = audioGeneration.audio_url;
    link.download = `${selectedScript?.title || 'audio'}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <h2 className="text-xl font-semibold">음성 생성</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            저장된 대본을 선택하여 TTS 음성을 생성하세요
          </p>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 스크립트 목록 */}
        <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">저장된 대본 목록</h3>
                {!serverConnected && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    테스트 모드 - 더미 데이터 표시 중
                  </p>
                )}
              </div>
              
              {scripts.length > 0 && (
                <div className="flex items-center space-x-2">
                  {isMultiSelectMode && (
                    <>
                      <button
                        onClick={toggleSelectAll}
                        className={`p-1.5 rounded-md transition-colors duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                        title={selectedScriptIds.size === scripts.length ? "전체 해제" : "전체 선택"}
                      >
                        {selectedScriptIds.size === scripts.length ? 
                          <CheckSquare size={16} /> : 
                          <Square size={16} />
                        }
                      </button>
                      
                      {selectedScriptIds.size > 0 && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={isDeleting}
                          className={`p-1.5 rounded-md transition-colors duration-200 ${
                            isDeleting
                              ? darkMode 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : darkMode
                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                          title={`선택된 ${selectedScriptIds.size}개 삭제`}
                        >
                          {isDeleting ? <Loader2 className="animate-spin\" size={16} /> : <Trash2 size={16} />}
                        </button>
                      )}
                      
                      <button
                        onClick={toggleMultiSelectMode}
                        className={`p-1.5 rounded-md transition-colors duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                        title="선택 모드 종료"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  
                  {!isMultiSelectMode && (
                    <button
                      onClick={toggleMultiSelectMode}
                      className={`p-1.5 rounded-md transition-colors duration-200 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      title="다중 선택 모드"
                    >
                      <CheckSquare size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {loadingScripts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                <span className="ml-2">대본 목록 로드 중...</span>
              </div>
            ) : scripts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  저장된 대본이 없습니다
                </p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  대본 생성 페이지에서 먼저 대본을 생성해주세요
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className={`group p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedScript?.id === script.id && !isMultiSelectMode
                        ? darkMode 
                          ? 'border-blue-500 bg-blue-900/20' 
                          : 'border-blue-500 bg-blue-50'
                        : darkMode
                          ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className={`flex-1 ${isMultiSelectMode ? '' : 'cursor-pointer'}`}
                        onClick={() => {
                          if (isMultiSelectMode) {
                            toggleScriptSelection(script.id);
                          } else {
                            setSelectedScript(script);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          {isMultiSelectMode && (
                            <div className="mt-1">
                              {selectedScriptIds.has(script.id) ? 
                                <CheckSquare className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={18} /> : 
                                <Square className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                              }
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">{script.title}</h4>
                            <div className="flex items-center space-x-4 text-xs">
                              <div className="flex items-center space-x-1">
                                <FileText size={12} />
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                  {script.file_name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                  {script.duration_minutes}분
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar size={12} />
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                  {formatDate(script.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!isMultiSelectMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showDeleteConfirmation(script);
                          }}
                          disabled={isDeleting && deletingScriptId === script.id}
                          className={`ml-2 p-1.5 rounded-md transition-all duration-200 ${
                            isDeleting && deletingScriptId === script.id
                              ? darkMode 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : darkMode
                                ? 'bg-gray-600 text-gray-400 hover:bg-red-600 hover:text-white'
                                : 'bg-gray-200 text-gray-500 hover:bg-red-600 hover:text-white'
                          }`}
                          title="대본 삭제"
                        >
                          {isDeleting && deletingScriptId === script.id ? 
                            <Loader2 className="animate-spin\" size={14} /> : 
                            <Trash2 size={14} />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 음성 생성 영역 */}
        <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold">음성 생성</h3>
          </div>
          <div className="p-6">
            {!selectedScript ? (
              <div className="text-center py-8">
                <Volume2 className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  대본을 선택해주세요
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 선택된 대본 정보 */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className="font-medium mb-2">{selectedScript.title}</h4>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-h-60 overflow-y-auto`}>
                    {/* 대본 내용 전체 표시 - 여러 줄 형식 유지 */}
                    {selectedScript.content.split('\n').map((line, index) => (
                      <p key={index} className="mb-1">
                        {line || '\u00A0'} {/* 빈 줄은 공백 문자로 대체 */}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 mt-3 text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      예상 시간: {selectedScript.duration_minutes}분
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      글자 수: {selectedScript.content.length}자
                    </span>
                  </div>
                </div>

                {/* 음성 생성 버튼 */}
                <button
                  onClick={handleGenerateAudio}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                    isLoading
                      ? darkMode 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : darkMode
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin\" size={18} />
                      <span>음성 생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={18} />
                      <span>음성 생성하기</span>
                    </>
                  )}
                </button>

                {/* 생성된 오디오 플레이어 */}
                {audioGeneration && (
                  <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                    <h5 className="font-medium mb-3">생성된 음성</h5>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handlePlayPause}
                        className={`p-2 rounded-full ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors duration-200`}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <span className={`flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedScript.title}.wav
                      </span>
                      <button
                        onClick={handleDownload}
                        className={`p-2 rounded-full ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
                        title="다운로드"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                    {!serverConnected && (
                      <p className={`text-xs mt-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        테스트 모드 - 샘플 오디오 파일
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 개별 삭제 확인 모달 */}
      {showSingleDeleteConfirm && scriptToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">대본 삭제 확인</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "<strong>{scriptToDelete.title}</strong>" 대본을 삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-500">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSingleDeleteConfirm(false);
                  setScriptToDelete(null);
                }}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                취소
              </button>
              <button
                onClick={handleDeleteScript}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isDeleting
                    ? darkMode 
                      ? 'bg-red-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-400 text-white cursor-not-allowed'
                    : darkMode
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin\" size={16} />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <span>삭제</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 다중 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">대본 삭제 확인</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              선택된 {selectedScriptIds.size}개의 대본을 삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-500">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                취소
              </button>
              <button
                onClick={handleDeleteMultipleScripts}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isDeleting
                    ? darkMode 
                      ? 'bg-red-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-400 text-white cursor-not-allowed'
                    : darkMode
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin\" size={16} />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <span>삭제</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceGenerationPage;