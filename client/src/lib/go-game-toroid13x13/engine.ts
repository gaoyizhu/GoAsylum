/**
 * 13×13 穿越围棋（Toroid Go）游戏引擎
 * 环面拓扑结构：左右边界相连，上下边界相连
 */

import type { BoardState, GameState, Move, Player, Position, StoneColor } from './types';

export const BOARD_SIZE = 13;

/**
 * 创建空棋盘
 */
export function createEmptyBoard(): BoardState {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

/**
 * 创建初始游戏状态
 */
export function createInitialGameState(): GameState {
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

/**
 * 检查位置是否在棋盘范围内
 */
export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
}

/**
 * 环面拓扑：将坐标映射到棋盘范围内（左右、上下边界相连）
 */
function wrapPosition(x: number, y: number): Position {
  return {
    x: ((x % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE,
    y: ((y % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE,
  };
}

/**
 * 获取相邻位置（上下左右）
 * 在环面拓扑中，边界棋子可以穿越到对面
 */
export function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  
  // 左边：如果在左边界（x=0），穿越到右边界（x=12）
  adjacent.push(wrapPosition(pos.x - 1, pos.y));
  
  // 右边：如果在右边界（x=12），穿越到左边界（x=0）
  adjacent.push(wrapPosition(pos.x + 1, pos.y));
  
  // 上边：如果在上边界（y=0），穿越到下边界（y=12）
  adjacent.push(wrapPosition(pos.x, pos.y - 1));
  
  // 下边：如果在下边界（y=12），穿越到上边界（y=0）
  adjacent.push(wrapPosition(pos.x, pos.y + 1));
  
  return adjacent;
}

/**
 * 获取棋盘上指定位置的棋子颜色
 */
export function getStoneAt(board: BoardState, pos: Position): StoneColor {
  if (!isValidPosition(pos)) return null;
  return board[pos.y][pos.x];
}

/**
 * 设置棋盘上指定位置的棋子
 */
export function setStoneAt(board: BoardState, pos: Position, color: StoneColor): BoardState {
  const newBoard = board.map((row) => [...row]);
  newBoard[pos.y][pos.x] = color;
  return newBoard;
}

/**
 * 检查位置是否为空
 */
export function isEmpty(board: BoardState, pos: Position): boolean {
  return getStoneAt(board, pos) === null;
}

/**
 * 获取对手颜色
 */
export function getOpponentColor(color: Player): Player {
  return color === 'black' ? 'white' : 'black';
}

/**
 * 位置转字符串键（用于 Set）
 */
function positionKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

/**
 * 计算一组棋子的气（自由度）
 * 使用深度优先搜索找出所有连接的棋子及其气
 */
export function calculateLiberties(
  board: BoardState,
  pos: Position,
  visited: Set<string> = new Set()
): { stones: Position[]; liberties: Position[] } {
  const color = getStoneAt(board, pos);
  if (color === null) return { stones: [], liberties: [] };

  const stones: Position[] = [];
  const liberties: Position[] = [];
  const stack: Position[] = [pos];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = positionKey(current);

    if (visited.has(key)) continue;
    visited.add(key);

    const currentColor = getStoneAt(board, current);
    if (currentColor === null) {
      // 空位是气
      liberties.push(current);
      continue;
    }

    if (currentColor !== color) continue;

    stones.push(current);

    // 检查相邻位置（在环面拓扑中自动处理边界穿越）
    for (const adj of getAdjacentPositions(current)) {
      const adjKey = positionKey(adj);
      if (!visited.has(adjKey)) {
        stack.push(adj);
      }
    }
  }

  return { stones, liberties };
}

/**
 * 检查一组棋子是否被提（没有气）
 */
export function isCaptured(board: BoardState, pos: Position): boolean {
  const { liberties } = calculateLiberties(board, pos);
  return liberties.length === 0;
}

/**
 * 移除被提掉的棋子，返回新棋盘和被提掉的位置
 */
export function removeCapturedStones(
  board: BoardState,
  color: Player
): { board: BoardState; captured: Position[] } {
  let newBoard = board.map((row) => [...row]);
  const captured: Position[] = [];
  const visited = new Set<string>();

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pos = { x, y };
      const key = positionKey(pos);
      
      if (visited.has(key)) continue;
      
      if (getStoneAt(newBoard, pos) === color && isCaptured(newBoard, pos)) {
        const { stones } = calculateLiberties(newBoard, pos);
        for (const stone of stones) {
          newBoard = setStoneAt(newBoard, stone, null);
          captured.push(stone);
          visited.add(positionKey(stone));
        }
      }
    }
  }

  return { board: newBoard, captured };
}

/**
 * 检查落子是否合法
 */
export function isValidMove(state: GameState, pos: Position): boolean {
  // 1. 位置必须在棋盘范围内
  if (!isValidPosition(pos)) return false;

  // 2. 位置必须为空
  if (!isEmpty(state.board, pos)) return false;

  // 3. 模拟落子，检查是否自杀和打劫
  let testBoard = setStoneAt(state.board, pos, state.currentPlayer);
  
  // 先检查是否能提掉对方棋子
  const opponentColor = getOpponentColor(state.currentPlayer);
  const { board: boardAfterCapture, captured } = removeCapturedStones(testBoard, opponentColor);
  
  // 4. 检查打劫规则：只有当只吃了1个对方棋子时，才可能是打劫
  if (state.koPosition && pos.x === state.koPosition.x && pos.y === state.koPosition.y) {
    // 如果吃掉了2个或更多棋子，这是倒扑，允许落子
    if (captured.length < 2) {
      return false; // 打劫禁止立即回提
    }
  }
  
  // 5. 检查自杀：落子后己方棋子没有气
  testBoard = boardAfterCapture;
  if (isCaptured(testBoard, pos)) {
    return false;
  }

  return true;
}

/**
 * 落子
 */
export function makeMove(state: GameState, pos: Position): GameState {
  if (!isValidMove(state, pos)) {
    return state;
  }

  // 1. 放置棋子
  let newBoard = setStoneAt(state.board, pos, state.currentPlayer);

  // 2. 提掉对方没有气的棋子
  const opponentColor = getOpponentColor(state.currentPlayer);
  const { board: boardAfterCapture, captured } = removeCapturedStones(newBoard, opponentColor);
  newBoard = boardAfterCapture;

  // 3. 更新提子数
  const newBlackCaptures = state.blackCaptures + (state.currentPlayer === 'black' ? captured.length : 0);
  const newWhiteCaptures = state.whiteCaptures + (state.currentPlayer === 'white' ? captured.length : 0);

  // 4. 检查打劫：只有当吃了1个对方棋子，且己方只有1个棋子时，才设置打劫位置
  let koPosition: Position | null = null;
  if (captured.length === 1) {
    const { stones } = calculateLiberties(newBoard, pos);
    if (stones.length === 1) {
      koPosition = captured[0];
    }
  }

  // 5. 记录这一手
  const move: Move = {
    position: pos,
    color: state.currentPlayer,
    moveNumber: state.moveHistory.length + 1,
    capturedStones: captured,
  };

  return {
    ...state,
    board: newBoard,
    currentPlayer: getOpponentColor(state.currentPlayer),
    moveHistory: [...state.moveHistory, move],
    blackCaptures: newBlackCaptures,
    whiteCaptures: newWhiteCaptures,
    consecutivePasses: 0,
    koPosition,
  };
}

/**
 * 虚手（Pass）
 */
export function makePass(state: GameState): GameState {
  const newConsecutivePasses = state.consecutivePasses + 1;
  
  // 双方连续虚手，进入标记死棋阶段
  if (newConsecutivePasses >= 2) {
    return {
      ...state,
      consecutivePasses: newConsecutivePasses,
      status: 'marking_dead_stones',
    };
  }

  return {
    ...state,
    currentPlayer: getOpponentColor(state.currentPlayer),
    consecutivePasses: newConsecutivePasses,
    koPosition: null, // 虚手后解除打劫限制
  };
}

/**
 * 计算地盘（用于标记死棋后的最终计分）
 * 使用扩展方法：从每个空点出发，检查能到达的所有空点和棋子
 */
export function calculateTerritory(board: BoardState): {
  blackTerritory: number;
  whiteTerritory: number;
  neutralTerritory: number;
} {
  const visited = new Set<string>();
  let blackTerritory = 0;
  let whiteTerritory = 0;
  let neutralTerritory = 0;

  // 首先计算棋盘上的棋子数
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const stone = board[y][x];
      if (stone === 'black') {
        blackTerritory++;
      } else if (stone === 'white') {
        whiteTerritory++;
      }
    }
  }

  // 然后计算空点的归属
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pos = { x, y };
      const key = positionKey(pos);

      if (visited.has(key) || getStoneAt(board, pos) !== null) {
        continue;
      }

      // 从这个空点出发，找出所有连接的空点
      const emptyRegion: Position[] = [];
      const borderColors = new Set<StoneColor>();
      const stack: Position[] = [pos];
      const regionVisited = new Set<string>();

      while (stack.length > 0) {
        const current = stack.pop()!;
        const currentKey = positionKey(current);

        if (regionVisited.has(currentKey)) continue;
        regionVisited.add(currentKey);

        const stone = getStoneAt(board, current);
        if (stone === null) {
          emptyRegion.push(current);
          visited.add(currentKey);

          // 检查相邻位置
          for (const adj of getAdjacentPositions(current)) {
            if (!regionVisited.has(positionKey(adj))) {
              stack.push(adj);
            }
          }
        } else {
          // 遇到棋子，记录颜色
          borderColors.add(stone);
        }
      }

      // 根据边界棋子的颜色判断地盘归属
      if (borderColors.size === 1) {
        if (borderColors.has('black')) {
          blackTerritory += emptyRegion.length;
        } else if (borderColors.has('white')) {
          whiteTerritory += emptyRegion.length;
        }
      } else if (borderColors.size > 1) {
        // 双活情况，中立点平分
        neutralTerritory += emptyRegion.length;
      }
    }
  }

  return { blackTerritory, whiteTerritory, neutralTerritory };
}

/**
 * 悔棋（撤销最后 N 手）
 */
export function undoMoves(state: GameState, count: number = 2): GameState {
  if (state.moveHistory.length < count) {
    return state;
  }

  // 重新从初始状态开始，重放除了最后 N 手之外的所有手
  const newHistory = state.moveHistory.slice(0, -count);
  let newState = createInitialGameState();

  for (const move of newHistory) {
    newState = makeMove(newState, move.position);
  }

  return newState;
}

/**
 * 认输
 */
export function resign(state: GameState): GameState {
  const winner = getOpponentColor(state.currentPlayer);
  
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

/**
 * 获取所有合法落子位置
 */
export function getLegalMoves(state: GameState): Position[] {
  const legalMoves: Position[] = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pos = { x, y };
      if (isValidMove(state, pos)) {
        legalMoves.push(pos);
      }
    }
  }

  return legalMoves;
}

/**
 * 分析当前局面（用于形势判断）
 */
export function analyzeSituation(state: GameState): {
  blackTerritory: number;
  whiteTerritory: number;
  neutralTerritory: number;
  blackScore: number;
  whiteScore: number;
} {
  const { blackTerritory, whiteTerritory, neutralTerritory } = calculateTerritory(state.board);
  
  // 计算总分：地盘 + 提子数 + 中立点平分
  const blackScore = blackTerritory + state.blackCaptures + neutralTerritory / 2;
  const whiteScore = whiteTerritory + state.whiteCaptures + neutralTerritory / 2;

  return {
    blackTerritory,
    whiteTerritory,
    neutralTerritory,
    blackScore,
    whiteScore,
  };
}

/**
 * 开始标记死棋
 */
export function startMarkingDeadStones(state: GameState): GameState {
  return {
    ...state,
    status: 'marking_dead_stones',
    deadStones: [],
  };
}

/**
 * 切换死棋标记
 */
export function toggleDeadStone(state: GameState, position: Position): GameState {
  if (state.status !== 'marking_dead_stones') {
    return state;
  }

  const stone = getStoneAt(state.board, position);
  if (stone === null) {
    return state;
  }

  const isAlreadyMarked = state.deadStones.some(pos => pos.x === position.x && pos.y === position.y);

  if (isAlreadyMarked) {
    return {
      ...state,
      deadStones: state.deadStones.filter(pos => !(pos.x === position.x && pos.y === position.y)),
    };
  } else {
    return {
      ...state,
      deadStones: [...state.deadStones, position],
    };
  }
}

/**
 * 确认死棋标记，计算最终得分
 */
export function confirmDeadStones(state: GameState): GameState {
  if (state.status !== 'marking_dead_stones') {
    return state;
  }

  // 从棋盘上移除死棋
  let finalBoard = state.board.map(row => [...row]);
  for (const pos of state.deadStones) {
    finalBoard = setStoneAt(finalBoard, pos, null);
  }

  // 计算地盘
  const { blackTerritory, whiteTerritory, neutralTerritory } = calculateTerritory(finalBoard);
  
  // 计算总分：地盘 + 提子数 + 中立点平分
  const blackScore = blackTerritory + state.blackCaptures + neutralTerritory / 2;
  const whiteScore = whiteTerritory + state.whiteCaptures + neutralTerritory / 2;

  // 判断胜负（13×13 棋盘：黑棋需要 >= 88 个交叉点才能获胜）
  const winner: Player | 'draw' = blackScore >= 88 ? 'black' : 'white';

  return {
    ...state,
    board: finalBoard,
    status: 'finished',
    result: {
      winner,
      blackCaptures: state.blackCaptures,
      whiteCaptures: state.whiteCaptures,
      blackTerritory,
      whiteTerritory,
      reason: 'score',
    },
  };
}

/**
 * 智能裁判（申请点目）
 */
export function judgeGame(state: GameState): GameState {
  const { blackTerritory, whiteTerritory, neutralTerritory, blackScore, whiteScore } = analyzeSituation(state);

  // 判断胜负（13×13 棋盘：黑棋需要 >= 88 个交叉点才能获胜）
  const winner: Player | 'draw' = blackScore >= 88 ? 'black' : 'white';

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

