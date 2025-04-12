export type Cell = number;
export type Grid = Cell[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  grid: Grid;
  score: number;
  gameOver: boolean;
  won: boolean;
} 