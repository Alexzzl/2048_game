import Game2048 from './components/Game2048'

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#faf8ef'
    }}>
      <Game2048 />
    </div>
  )
}

export default App 