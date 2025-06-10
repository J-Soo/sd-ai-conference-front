import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Loader2, Calendar, Clock, Trash2, CheckSquare, Square, X, AlertCircle, Volume2, TestTube, FileSearch } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FileManager from '../components/FileManager';
import ScriptSegmentViewer from '../components/ScriptSegmentViewer';
import { Script } from '../types';
import { formatDate } from '../utils';
import axios from 'axios';

interface ScriptGenerationPageProps {
  darkMode: boolean;
  serverConnected: boolean;
  setServerConnected: (connected: boolean) => void;
  onBack: () => void;
  onNavigateToVoiceGeneration: () => void;
}

const ScriptGenerationPage: React.FC<ScriptGenerationPageProps> = ({
  darkMode,
  serverConnected,
  setServerConnected,
  onBack,
  onNavigateToVoiceGeneration
}) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<string | null>(null);
  
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
      updated_at: '2024-01-14T20:00Z'
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
        try {
          const response = await axios.get('http://localhost:8000/api/v1/generation/scripts');
          console.log('API 응답:', response.data);
          if (response.data && Array.isArray(response.data)) {
            setScripts(response.data);
          } else {
            console.error('API 응답 형식 오류:', response.data);
            setError('API에서 유효한 응답을 받지 못했습니다.');
            setScripts([]);
          }
        } catch (apiError: any) {
          console.error('API 호출 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('스크립트 API가 아직 구현되지 않았습니다.');
            // API가 구현되지 않은 경우에만 임시로 더미 데이터 사용
            setScripts(dummyScripts);
          } else {
            setError(`서버 오류: ${apiError.message || '알 수 없는 오류'}`);
            setScripts([]);
          }
        }
      } else {
        // 테스트 모드: 더미 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScripts(dummyScripts);
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
          await axios.delete(`http://localhost:8000/api/v1/generation/scripts/${scriptToDelete.id}`);
          
          setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
          
          if (selectedScript?.id === scriptToDelete.id) {
            setSelectedScript(null);
          }
          
        } catch (apiError: any) {
          console.error('API 삭제 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('삭제 API가 아직 구현되지 않았습니다.');
            
            setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
            if (selectedScript?.id === scriptToDelete.id) {
              setSelectedScript(null);
            }
          } else {
            setError(`삭제 중 오류 발생: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        setScripts(prev => prev.filter(script => script.id !== scriptToDelete.id));
        
        if (selectedScript?.id === scriptToDelete.id) {
          setSelectedScript(null);
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
          
          setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
          
          if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
            setSelectedScript(null);
          }
          
        } catch (apiError: any) {
          console.error('API 다중 삭제 오류:', apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setError('다중 삭제 API가 아직 구현되지 않았습니다.');
            
            setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
            if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
              setSelectedScript(null);
            }
          } else {
            setError(`다중 삭제 중 오류 발생: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScripts(prev => prev.filter(script => !selectedScriptIds.has(script.id)));
        
        if (selectedScript && selectedScriptIds.has(selectedScript.id)) {
          setSelectedScript(null);
        }
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
  const handleGenerationResult = (result: string) => {
    setGenerationResult(result);
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
          <h2 className="text-xl font-semibold">대본 관리</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            PPT나 PDF 파일을 업로드하여 AI 발표 대본을 생성하고 관리하세요
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

      {/* 메인 컨테이너 - fit-content */}
      <div className="w-full">
        <PanelGroup direction="horizontal">
          {/* 왼쪽 열 */}
          <Panel defaultSize={50} minSize={30} className="pr-2">
            <div className="space-y-4">
              {/* 파일 업로드 영역 - 내부 요소에 맞춘 높이 */}
              <div className="h-[700px]">
                <FileManager 
                  darkMode={darkMode} 
                  serverConnected={serverConnected}
                  setServerConnected={setServerConnected}
                  onNavigateToVoiceGeneration={onNavigateToVoiceGeneration}
                  onScriptGenerated={loadScripts}
                  onGenerationResult={handleGenerationResult}
                />
              </div>
              
              {/* 생성 결과 영역 - 고정 높이 600px */}
              <div className="h-[600px]">
                <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md h-full`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">생성 결과</h3>
                      {!serverConnected && generationResult && (
                        <div className="flex items-center space-x-2">
                          <TestTube className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} size={16} />
                          <span className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            더미 데이터
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                    {generationResult ? (
                      <div className="space-y-4">
                        <div className={`p-6 rounded-md overflow-auto ${
                          darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'
                        }`}>
                          <div className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {generationResult}
                          </div>
                        </div>
                        
                        <button
                          onClick={onNavigateToVoiceGeneration}
                          className={`w-full px-5 py-3 rounded-md flex justify-center items-center space-x-2 font-medium
                            ${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-700'} text-white
                            transition-colors duration-200`}
                        >
                          <Volume2 size={18} />
                          <span>음성 생성하기</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 h-full">
                        <FileSearch className={`mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          파일을 업로드하고 대본을 생성하면 결과가 여기에 표시됩니다
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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

          {/* 오른쪽 열 */}
          <Panel defaultSize={50} minSize={30} className="pl-2">
            <div className="space-y-4">
              {/* 대본 목록 영역 - 고정 높이 500px */}
              <div className="h-[500px]">
                <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
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
                  <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
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
              </div>

              {/* 대본 세그먼트 영역 - 고정 높이 720px */}
              <div className="h-[900px]">
                <ScriptSegmentViewer 
                  selectedScript={selectedScript}
                  darkMode={darkMode}
                  serverConnected={serverConnected}
                />
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