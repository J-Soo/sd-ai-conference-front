import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import Header from './components/Header';
import ConnectionBanner from './components/ConnectionBanner';
import HomePage from './pages/HomePage';
import ScriptGenerationPage from './pages/ScriptGenerationPage';
import VoiceGenerationPage from './pages/VoiceGenerationPage';
import { PageType } from './types';

function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [serverConnected, setServerConnected] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<PageType>('home');
  
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
    setCurrentPage('voice-generation');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'script-generation':
        return (
          <ScriptGenerationPage
            darkMode={darkMode}
            serverConnected={serverConnected}
            setServerConnected={setServerConnected}
            onBack={() => setCurrentPage('home')}
            onNavigateToVoiceGeneration={handleNavigateToVoiceGeneration}
          />
        );
      case 'voice-generation':
        return (
          <VoiceGenerationPage
            darkMode={darkMode}
            serverConnected={serverConnected}
            onBack={() => setCurrentPage('home')}
          />
        );
      default:
        return (
          <HomePage
            darkMode={darkMode}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <ConnectionBanner isConnected={serverConnected} darkMode={darkMode} />
      <Header darkMode={darkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {currentPage === 'home' ? '관리자 페이지' : 
             currentPage === 'script-generation' ? '대본 생성' : '음성 생성'}
          </h1>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-700'} transition-colors duration-200`}
            aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        {renderCurrentPage()}
      </main>
      
      <footer className={`py-6 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} SD AI Conference
        </div>
      </footer>
    </div>
  );
}

export default App;