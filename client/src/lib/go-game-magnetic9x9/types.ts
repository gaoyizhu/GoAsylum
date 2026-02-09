/**
 * 9×9 磁性围棋游戏类型定义
 */

export type StoneColor = 'black' | 'white' | null;

export type Position = {
  x: number; // 0-8 for 9x9 board
  y: number; // 0-8 for 9x9 board
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
  magneticMoves: MagneticMove[]; // 磁性效果导致的棋子移动
};

export type MagneticMove = {
  from: Position;
  to: Position;
  color: Player;
  type: 'attract' | 'repel'; // 吸引或排斥
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
