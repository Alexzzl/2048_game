import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { GameState } from '../types';

// 类型定义
type Grid = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';
// 在文件顶部添加主题类型定义
type Theme = 'light' | 'dark';

interface MessageProps {
  type: 'win' | 'over';
}

// 添加主题颜色配置
const themes = {
  light: {
    background: '#faf8ef',
    text: '#776e65',
    board: '#bbada0',
    tile: '#cdc1b4',
    brightText: '#f9f6f2',
    button: '#8f7a66',
    buttonHover: '#7f6a56',
    scoreBox: '#bbada0',
    scoreText: '#eee4da',
    overlay: 'rgba(238, 228, 218, 0.85)',
  },
  dark: {
    background: '#1c1c1c',
    text: '#d8d4cf',
    board: '#2c2c2c',
    tile: '#3c3c3c',
    brightText: '#f9f6f2',
    button: '#4a4a4a',
    buttonHover: '#5a5a5a',
    scoreBox: '#2c2c2c',
    scoreText: '#d8d4cf',
    overlay: 'rgba(28, 28, 28, 0.85)',
  }
};

// 样式组件
const GameContainer = styled.div<{ theme: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;

  @media (min-width: 521px) {
    padding: 40px 20px;
  }

  @media (max-width: 520px) {
    padding: 10px;
    max-width: 100%;
  }

  @media (max-width: 400px) {
    padding: 8px;
  }

  background-color: ${({ theme }: { theme: Theme }) => themes[theme as keyof typeof themes].background};
  transition: background-color 0.3s ease;
`;


const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  margin-top: 30px;
  box-sizing: border-box;

  @media (max-width: 520px) {
    margin-bottom: 10px;
  }
`;

const TitleAndScores = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  box-sizing: border-box;

  @media (max-width: 520px) {
    gap: 10px;
  }
`;

const Title = styled.h1<{ theme: Theme }>`
  color: ${({ theme }) => themes[theme as keyof typeof themes].text};
  margin: 0;
  font-size: 48px;

  @media (max-width: 520px) {
    font-size: 36px;
  }

  @media (max-width: 400px) {
    font-size: 32px;
  }
`;

const Board = styled.div<{ theme: Theme }>`
  background-color: ${({ theme }) => themes[theme as keyof typeof themes].board};
  padding: 15px;
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin: 20px 0;
  position: relative;
  width: 100%;
  max-width: 520px;
  aspect-ratio: 1;

  @media (min-width: 521px) {
    padding: 20px;
    gap: 20px;
  }

  @media(min-height: 1000px) {
    max-width: 800px;
  }

  @media (max-width: 520px) {
    padding: 10px;
    gap: 8px;
    margin: 10px 0;
  }

  @media (max-width: 400px) {
    max-width: 100%;
    padding: 8px;
    gap: 6px;
    margin-top: 100px;
    margin-bottom: 1000px;
    border-radius: 4px;
  }
`;

const Cell = styled.div<{ value: number; theme: Theme }>`
  aspect-ratio: 1;
  width: 100%;
  background-color: ${({ value, theme }) => value ? getCellBackground(value, theme) : themes[theme as keyof typeof themes].tile};
  color: ${({ value, theme }) => (value <= 4 ? themes[theme as keyof typeof themes].text : themes[theme as keyof typeof themes].brightText)}; display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.15s ease;
  position: relative;
  z-index: 10;
  box-shadow: ${({ value }) => value ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};

  font-size: ${({ value }) => {
    if (value < 100) return 'min(11vw, 48px)';
    if (value < 1000) return 'min(9vw, 40px)';
    return 'min(6vw, 32px)';
  }};

  @media (max-width: 520px) {
    border-radius: 4px;
    font-size: ${({ value }) => {
    if (value < 100) return '40px';
    if (value < 1000) return '35px';
    return '30px';
  }};
    border-radius: 3px;
  }
`;

const ScoreContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const ScoreBox = styled.div<{ theme: Theme }>`
  background: ${({ theme }) => themes[theme as keyof typeof themes].scoreBox};
  padding: 5px 15px;
  border-radius: 3px;
  text-align: center;
  min-width: 80px;
`;

const ScoreTitle = styled.div<{ theme: Theme }>`
  color: ${({ theme }) => themes[theme as keyof typeof themes].scoreText};
  text-transform: uppercase;
  font-size: 12px;
  margin-bottom: 2px;
`;

const ScoreValue = styled.div`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const Button = styled.button`
  background-color: #8f7a66;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 8px 15px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #7f6a56;
    transform: scale(1.05);
  }

  @media (max-width: 520px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

// 添加主题切换按钮样式
const ThemeButton = styled(Button)`
  margin-left: 10px;
`;

const Message = styled.div<MessageProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(238, 228, 218, 0.85);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: min(12vw, 60px);
  font-weight: bold;
  color: ${({ type }) => (type === 'over' ? '#776e65' : '#f67c5f')};
  border-radius: 6px;
  backdrop-filter: blur(2px);

  @media (max-width: 520px) {
    font-size: 40px;
    background-color: rgba(238, 228, 218, 0.73);
  }
`;

const MessageButton = styled(Button)`
  margin-top: 20px;
  font-size: 24px;
`;

// 辅助函数
const getCellBackground = (value: number, theme: Theme): string => {
  const colors: Record<number, Record<Theme, string>> = {
    2: { light: '#eee4da', dark: '#484848' },
    4: { light: '#ede0c8', dark: '#585858' },
    8: { light: '#f2b179', dark: '#6d4c41' },
    16: { light: '#f59563', dark: '#855e52' },
    32: { light: '#f67c5f', dark: '#9c6b5f' },
    64: { light: '#f65e3b', dark: '#b37b6f' },
    128: { light: '#edcf72', dark: '#c28b7f' },
    256: { light: '#edcc61', dark: '#d19b8f' },
    512: { light: '#edc850', dark: '#e0ab9f' },
    1024: { light: '#edc53f', dark: '#efbbaf' },
    2048: { light: '#edc22e', dark: '#ffcbbf' },
    4096: { light: '#3c3a32', dark: '#2c2c2c' },
    8192: { light: '#3c3a32', dark: '#2c2c2c' }
  };
  return colors[value]?.[theme] || themes[theme].tile;
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
  const [theme, setTheme] = useState<Theme>('light');
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

  // 添加主题切换函数
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <GameContainer theme={theme} onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}>
      <Header>
        <TitleAndScores>
          <Title theme={theme}>2048</Title>
          <ScoreContainer>
            <ScoreBox theme={theme}>
              <ScoreTitle theme={theme}>当前分数</ScoreTitle>
              <ScoreValue>{gameState.score}</ScoreValue>
            </ScoreBox>
            <ScoreBox theme={theme}>
              <ScoreTitle theme={theme}>最高分</ScoreTitle>
              <ScoreValue>{highScore}</ScoreValue>
            </ScoreBox>
          </ScoreContainer>
        </TitleAndScores>
        <Button onClick={resetGame}>🔄</Button>
        <ThemeButton onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </ThemeButton>
      </Header>

      <Board
        theme={theme}
        className="board"
      >
        {gameState.grid.flat().map((value, index) => (
          <Cell
            theme={theme}
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
    </GameContainer>
  );
};

export default Game2048;