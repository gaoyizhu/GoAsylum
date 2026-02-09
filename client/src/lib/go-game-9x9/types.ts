/**
 * 13×13 围棋游戏类型定义
 */

export type StoneColor = 'black' | 'white' | null;

export type Position = {
  x: number; // 0-12 for 13x13 board
  y: number; // 0-12 for 13x13 board
};

export type Stone = {
  position: Position;
  color: 'black' | 'white';
  moveNumber: number;
};

export type BoardState = StoneColor[][];

export type GameStatus = 'playing' | 'marking_dead_stones' | 'finished';

export type Player = 'black' | 'white';

export type GameResult = {
  winner: Player | 'draw';
  blackCaptures: number;
  whiteCaptures: number;
  blackTerritory?: number;
  whiteTerritory?: number;
  reason: 'resignation' | 'double-pass' | 'score' | 'judge';
};

export type Move = {
  position: Position;
  color: Player;
  moveNumber: number;
  capturedStones: Position[];
};

export type GameState = {
  board: BoardState;
  currentPlayer: Player;
  moveHistory: Move[];
  blackCaptures: number;
  whiteCaptures: number;
  consecutivePasses: number;
  status: GameStatus;
  result: GameResult | null;
  koPosition: Position | null; // 打劫位置
  deadStones: Position[]; // 标记为死棋的位置
};
