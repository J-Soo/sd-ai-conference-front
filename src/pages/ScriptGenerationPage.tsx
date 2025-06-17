import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Calendar, Clock, Trash2, CheckSquare, Square, X, AlertCircle, Volume2, TestTube, FileSearch } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FileManager from '../components/FileManager';
import ScriptSegmentViewer from '../components/ScriptSegmentViewer';
import { Script } from '../types';
import { formatDate } from '../utils';
import axios from 'axios';

// 스타일명 한글 변환 함수
const getStyleDisplayName = (style?: string): string => {
  switch (style) {
    case 'professional':
      return '전문적';
    case 'casual':
      return '캐주얼';
    case 'custom':
      return '직접작성';
    default:
      return '기본';
  }
};

// 방금 생성된 스크립트인지 확인 (5분 이내) - New 라벨용
const isVeryRecentScript = (createdAt: string): boolean => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(createdAt) > fiveMinutesAgo;
};

// 페이지 로드 후 생성된 스크립트인지 확인 - 배경색 변경용
const isGeneratedAfterPageLoad = (createdAt: string, pageLoadTime: Date): boolean => {
  return new Date(createdAt) > pageLoadTime;
};

interface ScriptGenerationPageProps {
  darkMode: boolean;
  serverConnected: boolean;
  setServerConnected: (connected: boolean) => void;
  onNavigateToVoiceGeneration: () => void;
}

const ScriptGenerationPage: React.FC<ScriptGenerationPageProps> = ({
  darkMode,
  serverConnected,
  setServerConnected,
  onNavigateToVoiceGeneration
}) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<string | null>(null);
  const [pageLoadTime] = useState<Date>(new Date()); // 페이지 로드 시간
  const [newGeneratedScriptIds, setNewGeneratedScriptIds] = useState<Set<string>>(new Set()); // 이번 세션에서 생성한 스크립트 ID들
  
  // 삭제 관련 상태
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedScriptIds, setSelectedScriptIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null);
  const [deletingScriptId, setDeletingScriptId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // 서버 연결 상태 확인
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await axios.get('http://localhost:8000/');
        if (response.status === 200) {
          setServerConnected(true);
        }
      } catch (error) {
        console.log('서버 연결 확인 실패:', error);
        setServerConnected(false);
      }
    };

    if (!serverConnected) {
      checkServerConnection();
    }
  }, [serverConnected, setServerConnected]);

  // 스크립트 목록 로드
  useEffect(() => {
    if (serverConnected) {
      loadScripts();
    }
  }, [serverConnected]);

  const loadScripts = async () => {
    setLoadingScripts(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          const response = await axios.get('http://localhost:8000/api/v1/scripts/recent');
          console.log('API 응답:', response.data);
          if (response.data && Array.isArray(response.data)) {
            setScripts(response.data.sort((a: Script, b: Script) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          } else {
            console.error('API 응답 형식 오류:', response.data);
            setError('API에서 유효한 응답을 받지 못했습니다.');
            setScripts([]);
          }
        } catch (apiError: any) {
          console.error('API 호출 오류:', apiError);
          setError(`서버 오류: ${apiError.response?.data?.detail || apiError.message || '알 수 없는 오류'}`);
          setScripts([]);
        }
      } else {
        setError('서버에 연결되지 않았습니다.');
        setScripts([]);
      }
    } catch (err: any) {
      console.error('스크립트 로드 오류:', err);
      setError('스크립트를 불러오는 중 오류가 발생했습니다.');
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
          await axios.delete(`http://localhost:8000/api/v1/scripts/${scriptToDelete.id}`);
          
          setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
          
          if (selectedScript?.id === scriptToDelete.id) {
            setSelectedScript(null);
          }
          
        } catch (apiError: any) {
          console.error('API 삭제 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('대본을 찾을 수 없습니다. 이미 삭제되었거나 존재하지 않습니다.');
            
            setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
            if (selectedScript?.id === scriptToDelete.id) {
              setSelectedScript(null);
            }
          } else {
            setError(`삭제 중 오류 발생: ${apiError.response?.data?.detail || apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        setError('서버에 연결되지 않았습니다. 삭제할 수 없습니다.');
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
          await axios.delete('http://localhost:8000/api/v1/scripts/bulk', {
            data: { script_ids: scriptIdsArray }
          });
          
          setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
          
          if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
            setSelectedScript(null);
          }
          
        } catch (apiError: any) {
          console.error('API 다중 삭제 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('일부 대본을 찾을 수 없습니다. 이미 삭제되었거나 존재하지 않는 항목이 있습니다.');
            
            setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
            if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
              setSelectedScript(null);
            }
          } else {
            setError(`다중 삭제 중 오류 발생: ${apiError.response?.data?.detail || apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        setError('서버에 연결되지 않았습니다. 삭제할 수 없습니다.');
        return;
      }
      
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

  // 생성 결과 처리
  const handleGenerationResult = async (result: string) => {
    setGenerationResult(result);
    
    // 새로 생성된 스크립트를 가져오기 위해 목록 새로고침
    if (serverConnected) {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/scripts/recent');
        if (response.data && Array.isArray(response.data)) {
          const newScripts = response.data.sort((a: Script, b: Script) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // 현재 페이지 로드 후 생성된 스크립트 찾기
          const newlyGenerated = newScripts.filter(script => 
            !scripts.some(existingScript => existingScript.id === script.id) &&
            isGeneratedAfterPageLoad(script.created_at, pageLoadTime)
          );
          
          // 새로 생성된 스크립트 ID들을 기록
          if (newlyGenerated.length > 0) {
            setNewGeneratedScriptIds(prev => {
              const updated = new Set(prev);
              newlyGenerated.forEach(script => updated.add(script.id));
              return updated;
            });
          }
          
          setScripts(newScripts);
          
          // 새로 생성된 스크립트가 있으면 첫 번째 것을 자동 선택
          if (newlyGenerated.length > 0) {
            setSelectedScript(newlyGenerated[0]);
          } else if (newScripts.length > 0) {
            // 새로 생성된 것이 없으면 가장 최근 스크립트 선택
            setSelectedScript(newScripts[0]);
          }
        }
      } catch (error) {
        console.error('스크립트 목록 새로고침 오류:', error);
      }
    }
  };

  return (
    <div className="space-y-10">

      {error && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 메인 컨테이너 - 비율 기반 */}
      <div className="w-full h-[calc(100vh-8rem)]">
        <PanelGroup direction="horizontal">
          {/* 왼쪽 열 - 대본 생성준비 */}
          <Panel defaultSize={40} minSize={30} className="pr-2">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md flex flex-col`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-xl font-semibold">대본 생성준비</h2>
                {!serverConnected && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    서버에 연결되지 않았습니다
                  </p>
                )}
              </div>
              <div className="px-6 py-6 pr-4 flex-1 overflow-y-auto overflow-x-hidden">
                <FileManager 
                  darkMode={darkMode} 
                  serverConnected={serverConnected}
                  setServerConnected={setServerConnected}
                  onNavigateToVoiceGeneration={onNavigateToVoiceGeneration}
                  onScriptGenerated={loadScripts}
                  onGenerationResult={handleGenerationResult}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className={`w-2 flex items-center justify-center group ${
            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
          } transition-colors duration-200`}>
            <div className={`w-1 h-12 rounded-full ${
              darkMode ? 'bg-gray-600 group-hover:bg-gray-500' : 'bg-gray-300 group-hover:bg-gray-400'
            } transition-colors duration-200`} />
          </PanelResizeHandle>

          {/* 오른쪽 열 - 대본 생성결과 */}
          <Panel defaultSize={60} minSize={30} className="pl-2">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md flex flex-col`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-xl font-semibold">대본 생성결과</h2>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-6">
                {/* 대본 목록 영역 */}
                <div className="h-[45%] min-h-[250px]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium">최근 생성된 대본 목록</h3>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        1시간 이내 결과만 조회됩니다
                      </p>
                      {!serverConnected && (
                        <p className={`text-xs mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          서버에 연결되지 않았습니다
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
                  <div className={`h-[calc(100%-4rem)] rounded-lg border overflow-hidden ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="p-2 h-full overflow-y-auto">
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
                          파일을 업로드하여 대본을 생성해주세요
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
                                : newGeneratedScriptIds.has(script.id) || isGeneratedAfterPageLoad(script.created_at, pageLoadTime)
                                  ? darkMode
                                    ? 'border-green-600 hover:border-green-500 bg-green-900/20 hover:bg-green-900/30'
                                    : 'border-green-300 hover:border-green-400 bg-green-50 hover:bg-green-100'
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
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-medium">{script.title}</h4>
                                      {isVeryRecentScript(script.created_at) && (
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                          darkMode 
                                            ? 'bg-green-800 text-green-200' 
                                            : 'bg-green-600 text-white'
                                        }`}>
                                          New
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs">
                                      <div className="flex items-center space-x-1">
                                        <TestTube size={12} />
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                          {getStyleDisplayName(script.style)}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock size={12} />
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                          {script.duration_minutes}분 {script.duration_seconds || 0}초
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
                </div>

                {/* 대본 전체 내용 영역 */}
                <div className="flex-1 min-h-[200px] mt-5">
                  <h3 className="text-lg font-medium mb-3">대본 전체 내용</h3>
                  {selectedScript && (
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedScript.title}
                    </p>
                  )}
                  <div className={`h-[calc(100%-4rem)] rounded-lg border overflow-hidden ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="p-4 h-full overflow-y-auto">
                    {selectedScript ? (
                      <div className={`p-6 rounded-md ${
                        darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'
                      }`}>
                        <div className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {selectedScript.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 h-full">
                        <FileText className={`mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          대본을 선택하면 전체 내용이 여기에 표시됩니다
                        </p>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
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

export default ScriptGenerationPage;