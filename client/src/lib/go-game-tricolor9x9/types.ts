/**
 * 三色围棋（3 Color Go）类型定义
 * 
 * 规则：
 * - 三个玩家分别使用黑色、白色、绿色棋子
 * - 对任何一方来说，其他两种颜色的棋子都是敌人
 * - 如果被其他颜色的棋子占住了所有气，棋子就会被吃掉
 * - 只有 13×13 棋盘
 * - 最终显示黑、白、绿各占了多少个交叉点
 */

export type PlayerColor = 'black' | 'white' | 'green';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  board: (PlayerColor | null)[][];
  currentPlayer: PlayerColor;
  capturedStones: {
    black: number;
    white: number;
    green: number;
  };
  history: (PlayerColor | null)[][][];
  lastMove: Position | null;
  koPosition: Position | null;
  status?: 'playing' | 'marking_dead_stones' | 'finished';
  deadStones?: Set<string>;
  winner?: PlayerColor;
  score?: {
    black: number;
    white: number;
    green: number;
  };
  resignedPlayers?: Set<PlayerColor>;
}

export interface MoveResult {
  success: boolean;
  newState?: GameState;
  error?: string;
}
