/**
 * 13×13 磁性围棋游戏引擎
 * 
 * 磁性规则：
 * - 落子后会吸引上下左右四个方向最近的异色棋子（异性相吸，移动一步靠近）
 * - 落子后会排斥上下左右四个方向最近的同色棋子（同性相斥，移动一步远离）
 * - 如果目标位置被其他棋子占据或超出边界，则不移动
 */

import type {
  BoardState,
  GameState,
  Move,
  Player,
  Position,
  StoneColor,
  GameResult,
  MagneticMove,
} from './types';

export const BOARD_SIZE = 13;

// 创建空棋盘
export function createEmptyBoard(): BoardState {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

// 创建初始游戏状态
export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'black',
    moveHistory: [],
    blackCaptures: 0,
    whiteCaptures: 0,
    consecutivePasses: 0,
    status: 'playing',
    result: null,
    koPosition: null,
    deadStones: [],
  };
}

// 获取指定位置的棋子
export function getStoneAt(board: BoardState, pos: Position): StoneColor {
  if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) {
    return null;
  }
  return board[pos.y][pos.x];
}

// 设置指定位置的棋子
export function setStoneAt(board: BoardState, pos: Position, color: StoneColor): void {
  if (pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE) {
    board[pos.y][pos.x] = color;
  }
}

// 复制棋盘
export function copyBoard(board: BoardState): BoardState {
  return board.map(row => [...row]);
}

// 检查两个位置是否相等
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

// 获取相邻位置
export function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 1, y: 0 },  // 右
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }, // 左
  ];

  for (const dir of directions) {
    const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    if (newPos.x >= 0 && newPos.x < BOARD_SIZE && newPos.y >= 0 && newPos.y < BOARD_SIZE) {
      adjacent.push(newPos);
    }
  }

  return adjacent;
}

// 查找同一横线或竖线上最近的棋子
function findNearestStone(
  board: BoardState,
  pos: Position,
  color: StoneColor,
  direction: 'horizontal' | 'vertical'
): Position | null {
  const directions = direction === 'horizontal'
    ? [{ x: -1, y: 0 }, { x: 1, y: 0 }] // 左右
    : [{ x: 0, y: -1 }, { x: 0, y: 1 }]; // 上下

  let nearestPos: Position | null = null;
  let minDistance = Infinity;

  for (const dir of directions) {
    let currentPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    let distance = 1;

    while (
      currentPos.x >= 0 &&
      currentPos.x < BOARD_SIZE &&
      currentPos.y >= 0 &&
      currentPos.y < BOARD_SIZE
    ) {
      const stone = getStoneAt(board, currentPos);
      if (stone === color) {
        if (distance < minDistance) {
          minDistance = distance;
          nearestPos = { ...currentPos };
        }
        break;
      }
      currentPos = { x: currentPos.x + dir.x, y: currentPos.y + dir.y };
      distance++;
    }
  }

  return nearestPos;
}

// 计算磁性效果导致的棋子移动
function calculateMagneticMoves(
  board: BoardState,
  newStonePos: Position,
  newStoneColor: Player
): MagneticMove[] {
  const magneticMoves: MagneticMove[] = [];
  const boardCopy = copyBoard(board);

  const oppositeColor = newStoneColor === 'black' ? 'white' : 'black';
  const sameColor = newStoneColor;

  // 四个方向：上、下、左、右
  const directions = [
    { x: 0, y: -1, name: 'up' },    // 上
    { x: 0, y: 1, name: 'down' },   // 下
    { x: -1, y: 0, name: 'left' },  // 左
    { x: 1, y: 0, name: 'right' },  // 右
  ];

  for (const dir of directions) {
    // 在这个方向上找最近的棋子
    let currentPos = { x: newStonePos.x + dir.x, y: newStonePos.y + dir.y };
    let nearestStone: { pos: Position; color: StoneColor } | null = null;

    while (
      currentPos.x >= 0 &&
      currentPos.x < BOARD_SIZE &&
      currentPos.y >= 0 &&
      currentPos.y < BOARD_SIZE
    ) {
      const stone = getStoneAt(boardCopy, currentPos);
      if (stone !== null) {
        nearestStone = { pos: { ...currentPos }, color: stone };
        break;
      }
      currentPos = { x: currentPos.x + dir.x, y: currentPos.y + dir.y };
    }

    if (nearestStone) {
      // 判断是同色还是异色
      const isOpposite = nearestStone.color === oppositeColor;
      const isSame = nearestStone.color === sameColor;

      let targetPos: Position | null = null;

      if (isOpposite) {
        // 异性相吸：向新落子方向移动一步（靠近）
        targetPos = {
          x: nearestStone.pos.x - dir.x,
          y: nearestStone.pos.y - dir.y,
        };
      } else if (isSame) {
        // 同性相斥：向远离新落子方向移动一步（远离）
        targetPos = {
          x: nearestStone.pos.x + dir.x,
          y: nearestStone.pos.y + dir.y,
        };
      }

      // 检查目标位置是否有效且为空
      if (
        targetPos &&
        targetPos.x >= 0 &&
        targetPos.x < BOARD_SIZE &&
        targetPos.y >= 0 &&
        targetPos.y < BOARD_SIZE &&
        getStoneAt(boardCopy, targetPos) === null
      ) {
        magneticMoves.push({
          from: nearestStone.pos,
          to: targetPos,
          color: nearestStone.color as Player,
          type: isOpposite ? 'attract' : 'repel',
        });
        // 更新棋盘副本，避免影响其他方向的计算
        setStoneAt(boardCopy, nearestStone.pos, null);
        setStoneAt(boardCopy, targetPos, nearestStone.color);
      }
    }
  }

  return magneticMoves;
}

// 应用磁性效果到棋盘
function applyMagneticMoves(board: BoardState, magneticMoves: MagneticMove[]): void {
  for (const move of magneticMoves) {
    setStoneAt(board, move.from, null);
    setStoneAt(board, move.to, move.color);
  }
}

// 查找连接的棋子组
function findGroup(board: BoardState, pos: Position, color: Player): Position[] {
  const group: Position[] = [];
  const visited = new Set<string>();
  const stack = [pos];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = `${current.x},${current.y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (getStoneAt(board, current) !== color) continue;

    group.push(current);

    const adjacent = getAdjacentPositions(current);
    for (const adj of adjacent) {
      stack.push(adj);
    }
  }

  return group;
}

// 计算一组棋子的气
function countLiberties(board: BoardState, group: Position[]): number {
  const liberties = new Set<string>();

  for (const pos of group) {
    const adjacent = getAdjacentPositions(pos);
    for (const adj of adjacent) {
      if (getStoneAt(board, adj) === null) {
        liberties.add(`${adj.x},${adj.y}`);
      }
    }
  }

  return liberties.size;
}

// 移除没有气的棋子组
function removeDeadGroups(board: BoardState, color: Player): Position[] {
  const captured: Position[] = [];
  const visited = new Set<string>();

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pos = { x, y };
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (getStoneAt(board, pos) !== color) continue;

      const group = findGroup(board, pos, color);
      for (const groupPos of group) {
        visited.add(`${groupPos.x},${groupPos.y}`);
      }

      if (countLiberties(board, group) === 0) {
        for (const groupPos of group) {
          setStoneAt(board, groupPos, null);
          captured.push(groupPos);
        }
      }
    }
  }

  return captured;
}

// 检查落子是否合法
export function isValidMove(state: GameState, pos: Position): boolean {
  // 检查位置是否在棋盘内
  if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) {
    return false;
  }

  // 检查位置是否已有棋子
  if (getStoneAt(state.board, pos) !== null) {
    return false;
  }

  // 检查是否是打劫位置
  if (state.koPosition && positionsEqual(pos, state.koPosition)) {
    return false;
  }

  // 创建临时棋盘来检查自杀手
  const tempBoard = copyBoard(state.board);
  setStoneAt(tempBoard, pos, state.currentPlayer);

  // 先检查是否能提掉对方的棋子
  const oppositeColor = state.currentPlayer === 'black' ? 'white' : 'black';
  const capturedOpposite = removeDeadGroups(tempBoard, oppositeColor);

  // 如果能提掉对方的棋子，则合法
  if (capturedOpposite.length > 0) {
    return true;
  }

  // 检查自己的棋子是否有气
  const group = findGroup(tempBoard, pos, state.currentPlayer);
  const liberties = countLiberties(tempBoard, group);

  return liberties > 0;
}

// 落子
export function makeMove(state: GameState, pos: Position): GameState {
  if (!isValidMove(state, pos)) {
    return state;
  }

  const newBoard = copyBoard(state.board);
  setStoneAt(newBoard, pos, state.currentPlayer);

  // 计算磁性效果
  const magneticMoves = calculateMagneticMoves(newBoard, pos, state.currentPlayer);
  
  // 应用磁性效果
  applyMagneticMoves(newBoard, magneticMoves);

  // 磁性效果后，先提掉对方没有气的棋子，再提掉己方没有气的棋子
  const oppositeColor = state.currentPlayer === 'black' ? 'white' : 'black';
  const capturedOpponentStones = removeDeadGroups(newBoard, oppositeColor);
  const capturedOwnStones = removeDeadGroups(newBoard, state.currentPlayer);
  
  const capturedStones = [...capturedOpponentStones, ...capturedOwnStones];

  // 更新提子数（只计算提掉对方的棋子）
  const newBlackCaptures =
    state.blackCaptures + (state.currentPlayer === 'black' ? capturedOpponentStones.length : capturedOwnStones.length);
  const newWhiteCaptures =
    state.whiteCaptures + (state.currentPlayer === 'white' ? capturedOpponentStones.length : capturedOwnStones.length);

  // 检查打劫
  let koPosition: Position | null = null;
  if (
    capturedStones.length === 1 &&
    magneticMoves.length === 0 // 只有在没有磁性移动时才检查打劫
  ) {
    const capturedPos = capturedStones[0];
    const group = findGroup(newBoard, pos, state.currentPlayer);
    if (group.length === 1 && countLiberties(newBoard, group) === 1) {
      koPosition = capturedPos;
    }
  }

  // 创建移动记录
  const move: Move = {
    position: pos,
    color: state.currentPlayer,
    moveNumber: state.moveHistory.length + 1,
    capturedStones,
    magneticMoves,
  };

  return {
    ...state,
    board: newBoard,
    currentPlayer: oppositeColor,
    moveHistory: [...state.moveHistory, move],
    blackCaptures: newBlackCaptures,
    whiteCaptures: newWhiteCaptures,
    consecutivePasses: 0,
    koPosition,
  };
}

// 虚手
export function pass(state: GameState): GameState {
  const newConsecutivePasses = state.consecutivePasses + 1;

  // 如果连续两次虚手，游戏结束
  if (newConsecutivePasses >= 2) {
    return {
      ...state,
      consecutivePasses: newConsecutivePasses,
      status: 'marking_dead_stones',
    };
  }

  return {
    ...state,
    currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black',
    consecutivePasses: newConsecutivePasses,
    koPosition: null,
  };
}

// 悔棋
export function undo(state: GameState): GameState {
  if (state.moveHistory.length < 1) {
    return state;
  }

  // 撤销最后一步棋
  const newHistory = state.moveHistory.slice(0, -1);
  
  // 重新构建棋盘状态
  let newState = createInitialState();
  for (const move of newHistory) {
    newState = makeMove(newState, move.position);
  }

  return newState;
}

// 认输
export function resign(state: GameState): GameState {
  const winner = state.currentPlayer === 'black' ? 'white' : 'black';
  
  return {
    ...state,
    status: 'finished',
    result: {
      winner,
      blackCaptures: state.blackCaptures,
      whiteCaptures: state.whiteCaptures,
      reason: 'resignation',
    },
  };
}

// 计算地盘
export function calculateTerritory(
  board: BoardState,
  deadStones: Position[]
): { blackTerritory: number; whiteTerritory: number } {
  const tempBoard = copyBoard(board);

  // 移除死棋
  for (const pos of deadStones) {
    setStoneAt(tempBoard, pos, null);
  }

  let blackTerritory = 0;
  let whiteTerritory = 0;

  // 计算每个位置的归属
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pos = { x, y };
      const stone = getStoneAt(tempBoard, pos);

      if (stone === 'black') {
        blackTerritory++;
      } else if (stone === 'white') {
        whiteTerritory++;
      } else {
        // 空点：检查是否被某一方完全包围
        const surroundingColors = new Set<StoneColor>();
        const visited = new Set<string>();
        const stack = [pos];

        while (stack.length > 0) {
          const current = stack.pop()!;
          const key = `${current.x},${current.y}`;

          if (visited.has(key)) continue;
          visited.add(key);

          const currentStone = getStoneAt(tempBoard, current);
          if (currentStone !== null) {
            surroundingColors.add(currentStone);
            continue;
          }

          const adjacent = getAdjacentPositions(current);
          for (const adj of adjacent) {
            stack.push(adj);
          }
        }

        if (surroundingColors.size === 1) {
          if (surroundingColors.has('black')) {
            blackTerritory++;
          } else if (surroundingColors.has('white')) {
            whiteTerritory++;
          }
        } else if (surroundingColors.size === 2) {
          // 中立点，各算 0.5
          blackTerritory += 0.5;
          whiteTerritory += 0.5;
        }
      }
    }
  }

  return { blackTerritory, whiteTerritory };
}

// 确认死棋并计算得分
export function confirmDeadStones(state: GameState): GameState {
  const { blackTerritory, whiteTerritory } = calculateTerritory(state.board, state.deadStones);

  // 黑棋需要至少 44 个交叉点才能获胜
  const winner = blackTerritory >= 44 ? 'black' : 'white';

  return {
    ...state,
    status: 'finished',
    result: {
      winner,
      blackCaptures: state.blackCaptures,
      whiteCaptures: state.whiteCaptures,
      blackTerritory,
      whiteTerritory,
      reason: 'judge',
    },
  };
}

// 形势判断
export function analyzeSituation(state: GameState): {
  blackScore: number;
  whiteScore: number;
  advantage: 'black' | 'white' | 'even';
  advantagePoints: number;
} {
  const { blackTerritory, whiteTerritory } = calculateTerritory(state.board, []);

  const blackScore = blackTerritory;
  const whiteScore = whiteTerritory;

  const diff = Math.abs(blackScore - whiteScore);
  const advantage = blackScore > whiteScore ? 'black' : blackScore < whiteScore ? 'white' : 'even';

  return {
    blackScore,
    whiteScore,
    advantage,
    advantagePoints: diff,
  };
}

// 切换死棋标记
export function toggleDeadStone(state: GameState, pos: Position): GameState {
  const index = state.deadStones.findIndex(p => positionsEqual(p, pos));
  
  if (index >= 0) {
    // 移除标记
    return {
      ...state,
      deadStones: state.deadStones.filter((_, i) => i !== index),
    };
  } else {
    // 添加标记
    return {
      ...state,
      deadStones: [...state.deadStones, pos],
    };
  }
}

// 判断游戏结果
export function judgeGame(state: GameState): GameState {
  return confirmDeadStones(state);
}
