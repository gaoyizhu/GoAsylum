/**
 * 13×13 画布模式游戏引擎
 * 
 * 画布模式规则：
 * - 提供16种颜色的棋子供玩家自由放置
 * - 无围棋规则限制，可以随意覆盖已有棋子
 * - 无胜负判定，纯粹的绘画模式
 */

import type {
  BoardState,
  CanvasState,
  CanvasMove,
  Position,
  CanvasColor,
  StoneShape,
  StoneInfo,
} from './types';
import { CANVAS_COLORS } from './types';

export const BOARD_SIZE = 19;

// 创建空棋盘
export function createEmptyBoard(): BoardState {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

// 创建初始游戏状态
export function createInitialState(): CanvasState {
  return {
    board: createEmptyBoard(),
    moveHistory: [],
    selectedColor: CANVAS_COLORS[0], // 默认选择黑色
    selectedShape: 'circle', // 默认圆形
    showBorder: false, // 默认无边框
    isEraser: false, // 默认不是橡皮擦模式
    showGrid: false, // 默认隐藏棋盘网格
    lines: [], // 线段列表
    pendingLineStart: null, // 等待第二个点
  };
}

// 获取指定位置的棋子信息
export function getStoneAt(board: BoardState, pos: Position): StoneInfo | null {
  if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) {
    return null;
  }
  return board[pos.y][pos.x];
}

// 设置指定位置的棋子信息
export function setStoneAt(board: BoardState, pos: Position, stone: StoneInfo | null): void {
  if (pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE) {
    board[pos.y][pos.x] = stone;
  }
}

// 复制棋盘
export function copyBoard(board: BoardState): BoardState {
  return board.map(row => [...row]);
}

// 放置颜色（无任何规则限制，可以覆盖已有棋子）
// 如果是橡皮擦模式，则清除棋子
export function placeColor(state: CanvasState, pos: Position): CanvasState {
  // 检查位置是否在棋盘内
  if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) {
    return state;
  }

  const newBoard = copyBoard(state.board);
  const existingStone = getStoneAt(state.board, pos);
  
  // 橡皮擦模式：清除棋子
  if (state.isEraser) {
    setStoneAt(newBoard, pos, null);
    return {
      ...state,
      board: newBoard,
      // 橡皮擦不记录到移动历史
    };
  }
  
  // 正常模式：检查是否与现有棋子相同
  if (existingStone && 
      existingStone.color === state.selectedColor && 
      existingStone.shape === state.selectedShape) {
    // 相同颜色和形状，清除棋子
    setStoneAt(newBoard, pos, null);
    return {
      ...state,
      board: newBoard,
      // 清除操作不记录到移动历史
    };
  }
  
  // 不同颜色或形状，正常放置棋子
  const stoneInfo: StoneInfo = {
    color: state.selectedColor,
    shape: state.selectedShape,
    showBorder: state.showBorder,
  };
  setStoneAt(newBoard, pos, stoneInfo);

  // 创建移动记录
  const move: CanvasMove = {
    position: pos,
    color: state.selectedColor,
    shape: state.selectedShape,
    showBorder: state.showBorder,
    moveNumber: state.moveHistory.length + 1,
  };

  return {
    ...state,
    board: newBoard,
    moveHistory: [...state.moveHistory, move],
  };
}

// 选择颜色
export function selectColor(state: CanvasState, color: CanvasColor): CanvasState {
  return {
    ...state,
    selectedColor: color,
  };
}

// 撤销
export function undo(state: CanvasState): CanvasState {
  if (state.moveHistory.length === 0 && state.lines.length === 0) {
    return state;
  }

  // 如果有线段，优先撤销线段
  if (state.lines.length > 0) {
    return {
      ...state,
      lines: state.lines.slice(0, -1),
    };
  }

  // 否则撤销最后一个棋子
  const newHistory = state.moveHistory.slice(0, -1);
  
  // 重新构建棋盘状态
  let newState = createInitialState();
  newState.selectedColor = state.selectedColor; // 保持当前选择的颜色
  newState.selectedShape = state.selectedShape; // 保持当前选择的形状
  newState.showBorder = state.showBorder; // 保持当前边框状态
  newState.isEraser = state.isEraser; // 保持橡皮擦状态
  newState.showGrid = state.showGrid; // 保持网格状态
  newState.lines = state.lines; // 保持线段数据
  
  for (const move of newHistory) {
    const tempBoard = copyBoard(newState.board);
    const stoneInfo: StoneInfo = {
      color: move.color,
      shape: move.shape,
      showBorder: move.showBorder,
    };
    setStoneAt(tempBoard, move.position, stoneInfo);
    newState = {
      ...newState,
      board: tempBoard,
      moveHistory: [...newState.moveHistory, move],
    };
  }

  return newState;
}

// 清空画布
export function clearCanvas(state: CanvasState): CanvasState {
  return {
    ...state,
    board: createEmptyBoard(),
    moveHistory: [],
    lines: [], // 清空线段
  };
}

// 切换橡皮擦模式
export function toggleEraser(state: CanvasState): CanvasState {
  return {
    ...state,
    isEraser: !state.isEraser,
  };
}

// 切换棋盘网格显示
export function toggleGrid(state: CanvasState): CanvasState {
  return {
    ...state,
    showGrid: !state.showGrid,
  };
}
