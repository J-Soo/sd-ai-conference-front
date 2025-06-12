import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Header from './components/Header';
import ConnectionBanner from './components/ConnectionBanner';
import HomePage from './pages/HomePage';
import ScriptGenerationPage from './pages/ScriptGenerationPage';
import VoiceGenerationPage from './pages/VoiceGenerationPage';
import VideoManagementPage from './pages/VideoManagementPage';
import AvatarManagementPage from './pages/AvatarManagementPage';

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
        return '대본 관리';
      case '/voice':
        return '음성 관리';
      case '/videos':
        return '영상 관리';
      case '/avatars':
        return '아바타 관리';
      default:
        return '관리자 페이지';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <ConnectionBanner isConnected={serverConnected} darkMode={darkMode} />
      <Header darkMode={darkMode} onHomeClick={handleHomeClick} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
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
        
        <Routes>
          <Route path="/" element={
            <HomePage
              darkMode={darkMode}
              onNavigate={(page) => {
                const routeMap = {
                  'script-generation': '/scripts',
                  'voice-generation': '/voice',
                  'video-management': '/videos',
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