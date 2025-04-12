import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { GameState } from '../types';

// 类型定义
type Grid = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';

interface MessageProps {
  type: 'win' | 'over';
}

// 样式组件
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
`;

const Board = styled.div`
  background-color: #bbada0;
  padding: 15px;
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin: 20px 0;
  position: relative;
`;

const Cell = styled.div<{ value: number }>`
  width: 80px;
  height: 80px;
  background-color: ${({ value }) => getCellBackground(value)};
  color: ${({ value }) => (value <= 4 ? '#776e65' : '#f9f6f2')};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ value }) => (value < 100 ? '36px' : value < 1000 ? '32px' : '24px')};
  font-weight: bold;
  border-radius: 3px;
  transition: all 0.15s ease;
  position: relative;
  z-index: 10;

  @media (max-width: 520px) {
    width: 60px;
    height: 60px;
    font-size: ${({ value }) => (value < 100 ? '28px' : value < 1000 ? '24px' : '18px')};
  }
`;

const ScoreContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
`;

const ScoreBox = styled.div`
  background: #bbada0;
  padding: 10px 25px;
  border-radius: 6px;
  text-align: center;
  min-width: 100px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ScoreTitle = styled.div`
  color: #eee4da;
  text-transform: uppercase;
  font-size: 14px;
  margin-bottom: 5px;
`;

const ScoreValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const Button = styled.button`
  background-color: #8f7a66;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  margin: 10px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #7f6a56;
    transform: scale(1.05);
  }
`;

const Message = styled.div<MessageProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(238, 228, 218, 0.73);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: bold;
  color: ${({ type }) => (type === 'over' ? '#776e65' : '#f67c5f')};
  border-radius: 6px;

  @media (max-width: 520px) {
    font-size: 40px;
  }
`;

const MessageButton = styled(Button)`
  margin-top: 20px;
  font-size: 24px;
`;

// 辅助函数
const getCellBackground = (value: number): string => {
  const colors: Record<number, string> = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
    4096: '#3c3a32',
    8192: '#3c3a32'
  };
  return colors[value] || '#cdc1b4';
};

const createEmptyGrid = (): Grid => {
  return Array(4).fill(null).map(() => Array(4).fill(0));
};

const addRandomTile = (grid: Grid): Grid => {
  const emptyCells: [number, number][] = [];
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 0) emptyCells.push([i, j]);
    });
  });

  if (emptyCells.length === 0) return grid;

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const Game2048: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: addRandomTile(addRandomTile(createEmptyGrid())),
    score: 0,
    gameOver: false,
    won: false
  });
  const [highScore, setHighScore] = useState<number>(
    parseInt(localStorage.getItem('2048-high-score') || '0')
  );
  const [touchStart, setTouchStart] = useState<[number, number] | null>(null);
  const [keepPlaying, setKeepPlaying] = useState(false);

  // 更新最高分
  useEffect(() => {
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      localStorage.setItem('2048-high-score', gameState.score.toString());
    }
  }, [gameState.score, highScore]);

  // 顺时针旋转90度
  const rotateGrid = useCallback((grid: Grid): Grid => {
    const N = grid.length;
    const rotated = Array(N).fill(null).map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        rotated[i][j] = grid[N - 1 - j][i];
      }
    }
    return rotated;
  }, []);

  // 压缩和合并行
  const compress = useCallback((grid: Grid): [Grid, boolean, number] => {
    const N = grid.length;
    const newGrid = createEmptyGrid();
    let score = 0;
    let moved = false;

    for (let i = 0; i < N; i++) {
      let col = 0;
      let prevValue: number | null = null;
      
      for (let j = 0; j < N; j++) {
        if (grid[i][j] !== 0) {
          if (prevValue === grid[i][j]) {
            // 合并相同数字
            newGrid[i][col - 1] = prevValue * 2;
            score += prevValue * 2;
            moved = true;
            prevValue = null;
          } else {
            // 移动数字
            if (j !== col) moved = true;
            newGrid[i][col] = grid[i][j];
            prevValue = grid[i][j];
            col++;
          }
        }
      }
    }

    return [newGrid, moved, score];
  }, []);

  // 检查游戏是否结束
  const checkGameOver = useCallback((grid: Grid): boolean => {
    // 检查是否有空格
    if (grid.some(row => row.some(cell => cell === 0))) {
      return false;
    }

    // 检查是否有相邻的相同数字
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = grid[i][j];
        // 检查右边
        if (j < 3 && current === grid[i][j + 1]) return false;
        // 检查下边
        if (i < 3 && current === grid[i + 1][j]) return false;
      }
    }

    return true;
  }, []);

  // 移动网格
  const moveGrid = useCallback((direction: Direction): void => {
    if (gameState.gameOver && !keepPlaying) return;

    let currentGrid = gameState.grid.map(row => [...row]);
    let moved = false;
    let score = 0;

    // 根据方向处理网格
    switch (direction) {
      case 'left':
        [currentGrid, moved, score] = compress(currentGrid);
        break;
      case 'right':
        currentGrid = currentGrid.map(row => [...row].reverse());
        [currentGrid, moved, score] = compress(currentGrid);
        currentGrid = currentGrid.map(row => row.reverse());
        break;
      case 'up':
        currentGrid = rotateGrid(rotateGrid(rotateGrid(currentGrid)));
        [currentGrid, moved, score] = compress(currentGrid);
        currentGrid = rotateGrid(currentGrid);
        break;
      case 'down':
        currentGrid = rotateGrid(currentGrid);
        [currentGrid, moved, score] = compress(currentGrid);
        currentGrid = rotateGrid(rotateGrid(rotateGrid(currentGrid)));
        break;
    }

    if (moved) {
      const newGrid = addRandomTile(currentGrid);
      const newScore = gameState.score + score;
      const hasWon = newGrid.some(row => row.some(cell => cell === 2048));
      const isGameOver = checkGameOver(newGrid);

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        score: newScore,
        won: hasWon && !prev.won, // 只在第一次达到2048时设置won为true
        gameOver: isGameOver
      }));
    }
  }, [gameState, keepPlaying, compress, rotateGrid, checkGameOver]);

  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver && !keepPlaying) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveGrid('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveGrid('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveGrid('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveGrid('right');
        break;
    }
  }, [gameState.gameOver, keepPlaying, moveGrid]);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart([touch.clientX, touch.clientY]);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart || (gameState.gameOver && !keepPlaying)) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart[0];
    const deltaY = touch.clientY - touchStart[1];
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      moveGrid(deltaX > 0 ? 'right' : 'left');
    } else {
      moveGrid(deltaY > 0 ? 'down' : 'up');
    }

    setTouchStart(null);
  }, [touchStart, gameState.gameOver, keepPlaying, moveGrid]);

  const handleTouchCancel = useCallback(() => {
    setTouchStart(null);
  }, []);

  // 添加键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameState({
      grid: addRandomTile(addRandomTile(createEmptyGrid())),
      score: 0,
      gameOver: false,
      won: false
    });
    setKeepPlaying(false);
  }, []);

  // 继续游戏（达到2048后）
  const continueGame = useCallback(() => {
    setKeepPlaying(true);
  }, []);

  return (
    <GameContainer>
      <h1 style={{ color: '#776e65', marginBottom: '20px' }}>2048</h1>
      <ScoreContainer>
        <ScoreBox>
          <ScoreTitle>当前分数</ScoreTitle>
          <ScoreValue>{gameState.score}</ScoreValue>
        </ScoreBox>
        <ScoreBox>
          <ScoreTitle>最高分</ScoreTitle>
          <ScoreValue>{highScore}</ScoreValue>
        </ScoreBox>
      </ScoreContainer>
      <Board
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className="board"
      >
        {gameState.grid.flat().map((value, index) => (
          <Cell 
            key={index} 
            value={value}
            className={value ? 'cell-new' : ''}
          >
            {value !== 0 ? value : ''}
          </Cell>
        ))}
        {gameState.gameOver && (
          <Message type="over">
            游戏结束！
            <MessageButton onClick={resetGame}>再试一次</MessageButton>
          </Message>
        )}
        {gameState.won && !keepPlaying && (
          <Message type="win">
            你赢了！
            <div style={{ display: 'flex', gap: '10px' }}>
              <MessageButton onClick={continueGame}>继续</MessageButton>
              <MessageButton onClick={resetGame}>新游戏</MessageButton>
            </div>
          </Message>
        )}
      </Board>
      <Button onClick={resetGame}>新游戏</Button>
    </GameContainer>
  );
};

export default Game2048;