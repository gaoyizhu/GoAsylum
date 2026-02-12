/**
 * 三色围棋（3 Color Go）引擎
 * 
 * 规则：
 * - 三个玩家分别使用黑色、白色、绿色棋子
 * - 对任何一方来说，其他两种颜色的棋子都是敌人
 * - 如果被其他颜色的棋子占住了所有气，棋子就会被吃掉
 */

import type { GameState, PlayerColor, Position, MoveResult } from './types';

const BOARD_SIZE = 13;

export function createInitialState(): GameState {
  const board: (PlayerColor | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  return {
    board,
    currentPlayer: 'black',
    capturedStones: {
      black: 0,
      white: 0,
      green: 0,
    },
    history: [],
    lastMove: null,
    koPosition: null,
  };
}

function cloneBoard(board: (PlayerColor | null)[][]): (PlayerColor | null)[][] {
  return board.map(row => [...row]);
}

function getNextPlayer(current: PlayerColor, resignedPlayers: PlayerColor[] = []): PlayerColor {
  let next = current;
  let attempts = 0;
  
  // 最多尝试3次，避免无限循环
  while (attempts < 3) {
    if (next === 'black') next = 'white';
    else if (next === 'white') next = 'green';
    else next = 'black';
    
    // 如果下一个玩家没有认输，返回
    if (!resignedPlayers.includes(next)) {
      return next;
    }
    
    attempts++;
  }
  
  // 如果所有玩家都认输了，返回当前玩家
  return current;
}

function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

function getNeighbors(x: number, y: number): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (isValidPosition(nx, ny)) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
}

function getGroup(
  board: (PlayerColor | null)[][],
  x: number, 
  y: number,
  visited: boolean[][]
): Position[] {
  const color = board[y][x];
  if (color === null || visited[y][x]) return [];

  const group: Position[] = [];
  const stack: Position[] = [{ x, y }];
  visited[y][x] = true;

  while (stack.length > 0) {
    const pos = stack.pop()!;
    group.push(pos);

    const neighbors = getNeighbors(pos.x, pos.y);
    for (const neighbor of neighbors) {
      if (!visited[neighbor.y][neighbor.x] && board[neighbor.y][neighbor.x] === color) {
        visited[neighbor.y][neighbor.x] = true;
        stack.push(neighbor);
      }
    }
  }

  return group;
}

function hasLiberties(board: (PlayerColor | null)[][], group: Position[]): boolean {
  for (const pos of group) {
    const neighbors = getNeighbors(pos.x, pos.y);
    for (const neighbor of neighbors) {
      if (board[neighbor.y][neighbor.x] === null) {
        return true;
      }
    }
  }
  return false;
}

function removeGroup(board: (PlayerColor | null)[][], group: Position[]): void {
  for (const pos of group) {
    board[pos.y][pos.x] = null;
  }
}

function captureStones(
  board: (PlayerColor | null)[][],
  currentPlayer: PlayerColor
): { black: number; white: number; green: number } {
  const captured = { black: 0, white: 0, green: 0 };
  const visited: boolean[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(false));

  // 检查所有敌方棋子（对当前玩家来说，其他两种颜色都是敌人）
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const stone = board[y][x];
      if (stone !== null && stone !== currentPlayer && !visited[y][x]) {
        const group = getGroup(board, x, y, visited);
        if (group.length > 0 && !hasLiberties(board, group)) {
          captured[stone] += group.length;
          removeGroup(board, group);
        }
      }
    }
  }

  return captured;
}

function boardsEqual(
  board1: (PlayerColor | null)[][],
  board2: (PlayerColor | null)[][]
): boolean {
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board1[y][x] !== board2[y][x]) {
        return false;
      }
    }
  }
  return true;
}

export function makeMove(state: GameState, x: number, y: number): MoveResult {
  // 检查位置是否有效
  if (!isValidPosition(x, y)) {
    return { success: false, error: 'Invalid position' };
  }

  // 检查位置是否已被占用
  if (state.board[y][x] !== null) {
    return { success: false, error: 'Position already occupied' };
  }

  // 创建新棋盘状态
  const newBoard = cloneBoard(state.board);
  newBoard[y][x] = state.currentPlayer;

  // 提掉所有被围住的敌方棋子
  const captured = captureStones(newBoard, state.currentPlayer);

  // 检查自杀手（落子后自己的棋子没有气）
  const visited: boolean[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(false));
  const myGroup = getGroup(newBoard, x, y, visited);
  if (!hasLiberties(newBoard, myGroup)) {
    return { success: false, error: 'Suicide move not allowed' };
  }

  // 检查打劫
  if (state.history.length > 0) {
    const lastBoard = state.history[state.history.length - 1];
    if (boardsEqual(newBoard, lastBoard)) {
      return { success: false, error: 'Ko rule violation' };
    }
  }

  // 创建新状态
  const newState: GameState = {
    board: newBoard,
    currentPlayer: getNextPlayer(state.currentPlayer, state.resignedPlayers ? Array.from(state.resignedPlayers) : []),
    capturedStones: {
      black: state.capturedStones.black + captured.black,
      white: state.capturedStones.white + captured.white,
      green: state.capturedStones.green + captured.green,
    },
    history: [...state.history, cloneBoard(state.board)],
    lastMove: { x, y },
    koPosition: null,
    resignedPlayers: state.resignedPlayers || new Set(),
  };

  return { success: true, newState };
}

export function calculateTerritory(board: (PlayerColor | null)[][]): {
  black: number;
  white: number;
  green: number;
} {
  let black = 0;
  let white = 0;
  let green = 0;

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const stone = board[y][x];
      if (stone === 'black') black++;
      else if (stone === 'white') white++;
      else if (stone === 'green') green++;
    }
  }

  return { black, white, green };
}

export function pass(state: GameState): GameState {
  return {
    ...state,
    currentPlayer: getNextPlayer(state.currentPlayer),
    history: [...state.history, cloneBoard(state.board)],
    // 虚手不改变 lastMove
  };
}

export function undo(state: GameState): GameState | null {
  // 如果没有历史记录，无法悔棋
  if (state.history.length === 0) {
    return null;
  }

  // 获取上一步的棋盘状态
  const previousBoard = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  // 获取上一个玩家（因为要撤销当前玩家的上一手）
  const getPreviousPlayer = (current: PlayerColor): PlayerColor => {
    if (current === 'black') return 'green';
    if (current === 'white') return 'black';
    return 'white';
  };

  // 找到上一步的 lastMove（如果有的话）
  let previousLastMove: Position | null = null;
  if (newHistory.length > 0) {
    const prevBoard = newHistory[newHistory.length - 1];
    // 比较 previousBoard 和 prevBoard，找到不同的位置
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (previousBoard[y][x] !== prevBoard[y][x] && previousBoard[y][x] !== null) {
          previousLastMove = { x, y };
          break;
        }
      }
      if (previousLastMove) break;
    }
  }

  return {
    board: cloneBoard(previousBoard),
    currentPlayer: getPreviousPlayer(state.currentPlayer),
    capturedStones: state.capturedStones, // 注意：这里没有恢复提子数，因为计算较复杂
    history: newHistory,
    lastMove: previousLastMove,
    koPosition: null,
  };
}

// 点目相关函数
export function startMarkingDeadStones(state: GameState): GameState {
  return {
    ...state,
    status: 'marking_dead_stones' as any,
    deadStones: new Set<string>(),
  };
}

export function toggleDeadStone(state: GameState, position: Position): GameState {
  const key = `${position.x},${position.y}`;
  const newDeadStones = new Set((state as any).deadStones || []);
  
  if (newDeadStones.has(key)) {
    newDeadStones.delete(key);
  } else {
    newDeadStones.add(key);
  }
  
  return {
    ...state,
    deadStones: newDeadStones as any,
  };
}

export function confirmDeadStones(state: GameState): GameState {
  const deadStones = (state as any).deadStones || new Set<string>();
  
  // 创建新棋盘，移除死棋
  const newBoard = cloneBoard(state.board);
  deadStones.forEach((key: string) => {
    const [x, y] = key.split(',').map(Number);
    newBoard[y][x] = null;
  });
  
  // 计算地盘
  const territory = calculateTerritory(newBoard);
  
  // 计算得分（三色围棋：每方的得分 = 棋子数 + 地盘数）
  const blackScore = territory.black;
  const whiteScore = territory.white;
  const greenScore = territory.green;
  
  // 判断胜者（得分最高的一方）
  let winner: PlayerColor;
  if (blackScore >= whiteScore && blackScore >= greenScore) {
    winner = 'black';
  } else if (whiteScore >= greenScore) {
    winner = 'white';
  } else {
    winner = 'green';
  }
  
  return {
    ...state,
    status: 'finished' as any,
    winner: winner as any,
    score: { black: blackScore, white: whiteScore, green: greenScore } as any,
    deadStones: undefined as any,
  };
}

export function cancelMarkingDeadStones(state: GameState): GameState {
  return {
    ...state,
    status: 'playing' as any,
    deadStones: undefined as any,
  };
}
/**
 * 认输函数
 * 当前玩家认输，游戏继续，轮到下一个未认输的玩家
 */
export function resign(state: GameState): GameState {
  const resignedPlayers = new Set(state.resignedPlayers || []);
  resignedPlayers.add(state.currentPlayer);
  
  // 如果有两个玩家认输，游戏结束，剩下的玩家获胜
  if (resignedPlayers.size >= 2) {
    const remainingPlayer = (['black', 'white', 'green'] as PlayerColor[]).find(
      p => !resignedPlayers.has(p)
    );
    return {
      ...state,
      resignedPlayers,
      status: 'finished' as any,
      winner: remainingPlayer as any,
    };
  }
  
  // 否则，游戏继续，轮到下一个未认输的玩家
  let nextPlayer = getNextPlayer(state.currentPlayer);
  while (resignedPlayers.has(nextPlayer)) {
    nextPlayer = getNextPlayer(nextPlayer);
  }
  
  return {
    ...state,
    currentPlayer: nextPlayer,
    resignedPlayers,
  };
}
