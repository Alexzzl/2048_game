import Game2048 from './components/Game2048'
import { useEffect, useState } from 'react'

function App() {
  const [theme] = useState<'light' | 'dark'>('dark'); // 根据实际主题状态修改

  useEffect(() => {
    document.body.className = theme + '-theme';
  }, [theme]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
    }}>
      <Game2048 />
    </div>
  )
}

export default App