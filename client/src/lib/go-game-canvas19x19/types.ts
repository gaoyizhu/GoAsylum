/**
 * 13×13 画布模式类型定义
 * 
 * 画布模式规则：
 * - 提供16种颜色的棋子供玩家自由放置
 * - 无围棋规则限制，可以随意覆盖已有棋子
 * - 无胜负判定，纯粹的绘画模式
 */

// 16种颜色定义（市面上最普遍的标准色）
export type CanvasColor =
  | '#000000' // 黑色
  | '#FFFFFF' // 白色
  | '#FF0000' // 红色
  | '#00FF00' // 鲜绿色
  | '#0000FF' // 蓝色
  | '#FFFF00' // 黄色
  | '#FF00FF' // 品红
  | '#00FFFF' // 青色
  | '#FFA500' // 橙色
  | '#800080' // 紫色
  | '#FFC0CB' // 粉红
  | '#00FF7F' // 春绿
  | '#8B4513' // 棕色
  | '#FFD700' // 金色
  | '#808080' // 灰色
  | '#A52A2A'; // 棕红

export const CANVAS_COLORS: CanvasColor[] = [
  '#000000', // 黑色
  '#FFFFFF', // 白色
  '#FF0000', // 红色
  '#00FF00', // 鲜绿色
  '#0000FF', // 蓝色
  '#FFFF00', // 黄色
  '#FF00FF', // 品红
  '#00FFFF', // 青色
  '#FFA500', // 橙色
  '#800080', // 紫色
  '#FFC0CB', // 粉红
  '#00FF7F', // 春绿
  '#8B4513', // 棕色
  '#FFD700', // 金色
  '#808080', // 灰色
  '#A52A2A', // 棕红
];

// 棋子形状类型
export type StoneShape = 'circle' | 'square' | 'plus' | 'cross';

export interface Position {
  x: number;
  y: number;
}

// 棋子信息：记录颜色、形状和边框状态
export interface StoneInfo {
  color: CanvasColor;
  shape: StoneShape;
  showBorder: boolean;
}

// 棋盘状态：每个位置可以是棋子信息或null（空）
export type BoardState = (StoneInfo | null)[][];

export interface CanvasMove {
  position: Position;
  color: CanvasColor;
  shape: StoneShape;
  showBorder: boolean;
  moveNumber: number;
}

export interface CanvasState {
  board: BoardState;
  moveHistory: CanvasMove[];
  selectedColor: CanvasColor;
  selectedShape: StoneShape;
  showBorder: boolean;
  isEraser: boolean;
  showGrid: boolean;
}
