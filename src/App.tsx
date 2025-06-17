import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowLeft, FileText, Mic, Video } from 'lucide-react';
import Header from './components/Header';
import ConnectionBanner from './components/ConnectionBanner';
import HomePage from './pages/HomePage';
import ScriptGenerationPage from './pages/ScriptGenerationPage';
import VoiceGenerationPage from './pages/VoiceGenerationPage';
import VideoGenerationPage from './pages/VideoGenerationPage';
import VideoManagementPage from './pages/VideoManagementPage';
import AvatarManagementPage from './pages/AvatarManagementPage';
import ConferenceManagementPage from './pages/ConferenceManagementPage';

// 라우터 내부에서 사용할 컴포넌트
function AppContent() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [serverConnected, setServerConnected] = React.useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 백엔드 서버 연결 상태 확인
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/health');
        if (response.ok) {
          setServerConnected(true);
        } else {
          setServerConnected(false);
        }
      } catch (error) {
        console.error('백엔드 서버 연결 확인 실패:', error);
        setServerConnected(false);
      }
    };
    
    checkServerConnection();
    
    // 30초마다 서버 연결 상태 확인
    const intervalId = setInterval(checkServerConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNavigateToVoiceGeneration = () => {
    navigate('/voice');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/scripts':
        return '대본 생성';
      case '/voice':
        return '음성 생성';
      case '/videos':
        return '영상 생성';
      case '/avatars':
        return '아바타 관리';
      case '/integrated':
        return '컨퍼런스 관리';
      case '/segment-videos':
        return '영상 관리';
      default:
        return '관리자 페이지';
    }
  };

  const getPageDescription = () => {
    switch (location.pathname) {
      case '/scripts':
        return 'PPT나 PDF 파일을 업로드하여 AI 기술로 발표 대본을 자동 생성하고 관리합니다';
      case '/voice':
        return '생성된 대본을 바탕으로 자연스러운 TTS 음성 파일을 생성하고 관리합니다';
      case '/videos':
        return '대본 세그먼트별로 영상 생성 옵션을 설정하고 AI 영상을 생성합니다';
      case '/avatars':
        return '영상 생성에 사용할 아바타를 등록하고 관리합니다';
      case '/integrated':
        return '컨퍼런스를 생성하고 관리합니다';
      case '/segment-videos':
        return '세그먼트별로 생성된 영상들을 확인하고 관리하세요';
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <ConnectionBanner isConnected={serverConnected} darkMode={darkMode} />
      <Header darkMode={darkMode} onHomeClick={handleHomeClick} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {location.pathname !== '/' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-end space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="홈으로 돌아가기"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold">
                  {getPageTitle()}
                </h1>
                {getPageDescription() && (
                  <p className={`text-sm pb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getPageDescription()}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {location.pathname === '/scripts' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate('/voice')}
                      className={`px-3 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2 text-sm ${
                        darkMode 
                          ? 'bg-green-700 hover:bg-green-600 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title="음성 생성"
                    >
                      <Mic size={16} />
                      <span>음성생성</span>
                    </button>
                    <button
                      onClick={() => navigate('/videos')}
                      className={`px-3 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2 text-sm ${
                        darkMode 
                          ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      title="영상 생성"
                    >
                      <Video size={16} />
                      <span>영상생성</span>
                    </button>
                  </div>
                )}
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-700'} transition-colors duration-200`}
                  aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">
                {getPageTitle()}
              </h1>
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-700'} transition-colors duration-200`}
                aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          )}
        </div>
        
        <Routes>
          <Route path="/" element={
            <HomePage
              darkMode={darkMode}
              onNavigate={(page) => {
                const routeMap = {
                  'script-generation': '/scripts',
                  'voice-generation': '/voice',
                  'video-management': '/videos',
                  'integrated-management': '/integrated',
                  'segment-video-management': '/segment-videos',
                  'avatar-management': '/avatars'
                };
                navigate(routeMap[page as keyof typeof routeMap] || '/');
              }}
            />
          } />
          <Route path="/scripts" element={
            <ScriptGenerationPage
              darkMode={darkMode}
              serverConnected={serverConnected}
              setServerConnected={setServerConnected}
              onNavigateToVoiceGeneration={handleNavigateToVoiceGeneration}
            />
          } />
          <Route path="/voice" element={
            <VoiceGenerationPage
              darkMode={darkMode}
              serverConnected={serverConnected}
            />
          } />
          <Route path="/videos" element={
            <VideoGenerationPage
              darkMode={darkMode}
              serverConnected={serverConnected}
            />
          } />
          <Route path="/segment-videos" element={
            <VideoManagementPage
              darkMode={darkMode}
              serverConnected={serverConnected}
            />
          } />
          <Route path="/avatars" element={
            <AvatarManagementPage
              darkMode={darkMode}
              serverConnected={serverConnected}
            />
          } />
          <Route path="/integrated" element={
            <ConferenceManagementPage
              darkMode={darkMode}
              serverConnected={serverConnected}
            />
          } />
        </Routes>
      </main>
      
      <footer className={`py-6 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} SD AI Conference
        </div>
      </footer>
    </div>
  );
}

// 메인 App 컴포넌트
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;