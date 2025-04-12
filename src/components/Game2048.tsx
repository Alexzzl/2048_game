import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { GameState, Grid, Direction } from '../types';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Board = styled.div`
  background-color: #bbada0;
  padding: 15px;
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin: 20px 0;
`;

const Cell = styled.div<{ value: number }>`
  width: 80px;
  height: 80px;
  background-color: ${({ value }) => getCellBackground(value)};
  color: ${({ value }) => value <= 4 ? '#776e65' : '#f9f6f2'};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ value }) => (value < 100 ? '36px' : value < 1000 ? '32px' : '24px')};
  font-weight: bold;
  border-radius: 3px;
  transition: all 0.15s ease;
`;

const Score = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0;
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
  
  &:hover {
    background-color: #7f6a56;
  }
`;

const getCellBackground = (value: number): string => {
  const colors: { [key: number]: string } = {
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
    2048: '#edc22e'
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
  const [touchStart, setTouchStart] = useState<[number, number] | null>(null);

  const rotateGrid = (grid: Grid): Grid => {
    const N = grid.length;
    const rotated = Array(N).fill(null).map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        rotated[j][N - 1 - i] = grid[i][j];
      }
    }
    return rotated;
  };

  const compress = (grid: Grid): [Grid, boolean, number] => {
    const N = grid.length;
    const newGrid = Array(N).fill(null).map(() => Array(N).fill(0));
    let score = 0;
    let moved = false;

    for (let i = 0; i < N; i++) {
      let position = 0;
      for (let j = 0; j < N; j++) {
        if (grid[i][j] !== 0) {
          if (position > 0 && newGrid[i][position - 1] === grid[i][j]) {
            newGrid[i][position - 1] *= 2;
            score += newGrid[i][position - 1];
            moved = true;
          } else {
            if (j !== position) moved = true;
            newGrid[i][position] = grid[i][j];
            position++;
          }
        }
      }
    }
    return [newGrid, moved, score];
  };

  const moveGrid = (direction: Direction): void => {
    let currentGrid = gameState.grid.map(row => [...row]);
    let moved = false;
    let score = 0;

    // 根据方向旋转网格
    switch (direction) {
      case 'left':
        [currentGrid, moved, score] = compress(currentGrid);
        break;
      case 'right':
        currentGrid = currentGrid.map(row => row.reverse());
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
        won: hasWon,
        gameOver: isGameOver
      }));
    }
  };

  const checkGameOver = (grid: Grid): boolean => {
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
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver) return;

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
  }, [gameState.gameOver]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart([touch.clientX, touch.clientY]);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
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
  };

  const handleTouchCancel = () => {
    setTouchStart(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const resetGame = () => {
    setGameState({
      grid: addRandomTile(addRandomTile(createEmptyGrid())),
      score: 0,
      gameOver: false,
      won: false
    });
  };

  return (
    <GameContainer>
      <h1 style={{ color: '#776e65', marginBottom: '20px' }}>2048</h1>
      <Score>
        <span>得分</span>
        {gameState.score}
      </Score>
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
      </Board>
      <Button onClick={resetGame}>新游戏</Button>
      {gameState.gameOver && <Message type="over">游戏结束！</Message>}
      {gameState.won && <Message type="win">恭喜你赢了！</Message>}
    </GameContainer>
  );
};

export default Game2048; 