import React from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface ConnectionBannerProps {
  isConnected: boolean;
  darkMode: boolean;
}

const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ isConnected, darkMode }) => {
  if (isConnected) {
    return (
      <div className={`px-4 py-2 ${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border-b`}>
        <div className="container mx-auto flex items-center justify-center space-x-2">
          <Wifi className="text-green-600" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
            백엔드 서버 연결됨
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 ${darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border-b`}>
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <AlertTriangle className="text-yellow-600" size={18} />
        <div className="text-center">
          <span className={`text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
            백엔드 서버에 연결할 수 없습니다
          </span>
          <span className={`text-xs block ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>
            현재 테스트 모드로 동작 중입니다 (더미 데이터 사용)
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionBanner;