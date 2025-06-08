import React from 'react';
import { Moon, Sun } from 'lucide-react';
import FileManager from './components/FileManager';
import Header from './components/Header';
import ConnectionBanner from './components/ConnectionBanner';

function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [serverConnected, setServerConnected] = React.useState<boolean>(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <ConnectionBanner isConnected={serverConnected} darkMode={darkMode} />
      <Header darkMode={darkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">관리자 페이지</h1>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-700'} transition-colors duration-200`}
            aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <FileManager 
          darkMode={darkMode} 
          serverConnected={serverConnected}
          setServerConnected={setServerConnected}
        />
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