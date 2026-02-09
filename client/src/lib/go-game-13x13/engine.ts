/**
 * 13×13 围棋游戏引擎
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
 * 获取相邻位置（上下左右）
 */
export function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  
  if (pos.x > 0) adjacent.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < BOARD_SIZE - 1) adjacent.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0) adjacent.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < BOARD_SIZE - 1) adjacent.push({ x: pos.x, y: pos.y + 1 });
  
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

    // 检查相邻位置
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
    if (captured.length >= 2) {
      // 倒扑，允许
    } else {
      // 打劫，禁止
      return false;
    }
  }
  
  // 5. 如果提掉了对方棋子，使用提子后的棋盘
  if (captured.length > 0) {
    testBoard = boardAfterCapture;
  }
  
  // 6. 检查自己是否还有气
  if (isCaptured(testBoard, pos)) {
    return false; // 自杀手，不合法
  }

  return true;
}

/**
 * 执行落子
 */
export function makeMove(state: GameState, pos: Position): GameState {
  if (!isValidMove(state, pos)) {
    throw new Error('Invalid move');
  }

  // 放置棋子
  let newBoard = setStoneAt(state.board, pos, state.currentPlayer);

  // 提掉对方被围的棋子
  const opponentColor = getOpponentColor(state.currentPlayer);
  const { board: boardAfterCapture, captured } = removeCapturedStones(newBoard, opponentColor);
  newBoard = boardAfterCapture;

  // 更新提子数
  const newBlackCaptures = state.blackCaptures + (state.currentPlayer === 'black' ? captured.length : 0);
  const newWhiteCaptures = state.whiteCaptures + (state.currentPlayer === 'white' ? captured.length : 0);

  // 检查打劫：如果只提掉一个子，且落子后自己也只有一口气，则记录打劫位置
  let koPosition: Position | null = null;
  if (captured.length === 1) {
    const { liberties } = calculateLiberties(newBoard, pos);
    if (liberties.length === 1) {
      koPosition = captured[0];
    }
  }

  // 创建移动记录
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
 * 执行虚手（Pass）
 */
export function makePass(state: GameState): GameState {
  const newConsecutivePasses = state.consecutivePasses + 1;
  
  // 连续两次虚手，游戏结束，计算地盘（使用中国规则：数子法）
  if (newConsecutivePasses >= 2) {
    const { blackTerritory, whiteTerritory } = calculateTerritory(state.board);
    
    const blackScore = blackTerritory;
    const whiteScore = whiteTerritory;

    // 中国规则：黑棋需要至少 88 个子才能获胜（贴 3.5 目）
    // 13×13 = 169 个交叉点，黑棋需要 88，白棋需要 82 即可获胜
    let winner: 'black' | 'white' | 'draw';
    if (blackScore >= 88) {
      winner = 'black';
    } else {
      winner = 'white';
    }

    return {
      ...state,
      currentPlayer: getOpponentColor(state.currentPlayer),
      consecutivePasses: newConsecutivePasses,
      status: 'finished',
      result: {
        winner,
        blackCaptures: state.blackCaptures,
        whiteCaptures: state.whiteCaptures,
        blackTerritory,
        whiteTerritory,
        reason: 'double-pass',
      },
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
 * 计算地盘（中国规则：数子法）
 * 统计每方的棋子数量 + 该方完全围住的空点数量
 * 
 * 算法：对于每个空点，向四周扩展，看最先碰到什么颜色的棋子
 * - 如果只碰到黑棋 → 这个空点属于黑棋
 * - 如果只碰到白棋 → 这个空点属于白棋
 * - 如果同时碰到黑棋和白棋 → 这是中立点（双活），平分给双方
 */
export function calculateTerritory(board: BoardState): {
  blackTerritory: number;
  whiteTerritory: number;
} {
  let blackTerritory = 0;
  let whiteTerritory = 0;
  let neutralPoints = 0; // 中立点（双活）

  // 遍历所有位置
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pos = { x, y };
      const stone = board[y][x];
      
      if (stone === 'black') {
        blackTerritory++;
      } else if (stone === 'white') {
        whiteTerritory++;
      } else {
        // 空点：判断它属于哪一方
        const owner = determineEmptyPointOwner(board, pos);
        
        if (owner === 'black') {
          blackTerritory++;
        } else if (owner === 'white') {
          whiteTerritory++;
        } else {
          // 中立点（双活）：边界同时有黑棋和白棋
          neutralPoints++;
        }
      }
    }
  }

  // 中立点平分给双方
  const halfNeutral = neutralPoints / 2;
  blackTerritory += halfNeutral;
  whiteTerritory += halfNeutral;

  return { blackTerritory, whiteTerritory };
}

/**
 * 判断单个空点的归属
 * 返回 'black' | 'white' | null
 * 
 * 算法：
 * 1. 找出这个空点所在的连通空点区域
 * 2. 检查这个区域的边界（相邻的棋子）
 * 3. 如果边界只有一种颜色 → 属于该颜色
 * 4. 如果边界有两种颜色 → 不属于任何一方
 */
function determineEmptyPointOwner(board: BoardState, start: Position): 'black' | 'white' | null {
  // 找出连通的空点区域
  const region: Position[] = [];
  const visited = new Set<string>();
  const queue: Position[] = [start];
  visited.add(positionKey(start));

  while (queue.length > 0) {
    const current = queue.shift()!;
    region.push(current);

    // 检查相邻位置
    for (const adj of getAdjacentPositions(current)) {
      const key = positionKey(adj);
      if (visited.has(key)) continue;

      const color = getStoneAt(board, adj);
      
      if (color === null) {
        // 碰到空点，加入区域
        visited.add(key);
        queue.push(adj);
      }
      // 碰到棋子，不加入区域，等会检查边界
    }
  }

  // 检查区域边界的棋子颜色
  const adjacentColors = new Set<StoneColor>();

  for (const pos of region) {
    for (const adj of getAdjacentPositions(pos)) {
      const color = getStoneAt(board, adj);
      if (color !== null) {
        adjacentColors.add(color);
      }
    }
  }

  // 判断结果
  if (adjacentColors.size === 0) {
    // 没有碰到任何棋子（不可能发生）
    return null;
  } else if (adjacentColors.size === 1) {
    // 只碰到一种颜色
    return adjacentColors.has('black') ? 'black' : 'white';
  } else {
    // 碰到两种颜色
    return null;
  }
}

/**
 * 悔棋（撤销最后 N 步）
 */
export function undoMoves(state: GameState, count: number = 2): GameState {
  if (state.moveHistory.length < count) {
    return state; // 没有足够的历史记录
  }

  // 重新构建游戏状态
  let newState = createInitialGameState();
  const movesToReplay = state.moveHistory.slice(0, -count);

  for (const move of movesToReplay) {
    newState = makeMove(newState, move.position);
  }

  return newState;
}

/**
 * 认输
 */
export function resign(state: GameState): GameState {
  return {
    ...state,
    status: 'finished',
    result: {
      winner: getOpponentColor(state.currentPlayer),
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
 * 形势判断 - 分析当前棋局的地盘情况
 */
export function analyzeSituation(state: GameState): {
  blackTerritory: number;
  whiteTerritory: number;
  blackScore: number;
  whiteScore: number;
  advantage: 'black' | 'white' | 'even';
  advantagePoints: number;
} {
  const { blackTerritory, whiteTerritory } = calculateTerritory(state.board);

  const blackScore = blackTerritory;
  const whiteScore = whiteTerritory;
  const diff = blackScore - whiteScore;

  let advantage: 'black' | 'white' | 'even';
  if (diff > 0.5) {
    advantage = 'black';
  } else if (diff < -0.5) {
    advantage = 'white';
  } else {
    advantage = 'even';
  }

  return {
    blackTerritory,
    whiteTerritory,
    blackScore,
    whiteScore,
    advantage,
    advantagePoints: Math.abs(diff),
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
    // 只能标记棋子，不能标记空点
    return state;
  }

  const key = positionKey(position);
  const isMarked = state.deadStones.some(p => positionKey(p) === key);

  if (isMarked) {
    // 取消标记
    return {
      ...state,
      deadStones: state.deadStones.filter(p => positionKey(p) !== key),
    };
  } else {
    // 添加标记
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

  // 创建一个临时棋盘，移除死棋
  const tempBoard: BoardState = state.board.map(row => [...row]);
  for (const pos of state.deadStones) {
    tempBoard[pos.y][pos.x] = null;
  }

  // 计算地盘
  const { blackTerritory, whiteTerritory } = calculateTerritory(tempBoard);

  // 判断胜负（黑棋需要 >= 88 个子才能获胜）
  let winner: Player | 'draw';
  if (blackTerritory >= 88) {
    winner = 'black';
  } else {
    winner = 'white';
  }

  return {
    ...state,
    status: 'finished',
    deadStones: [],
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

/**
 * 智能裁判 - 立即结束游戏并判定胜负
 */
export function judgeGame(state: GameState): GameState {
  const { blackTerritory, whiteTerritory, blackScore, whiteScore } = analyzeSituation(state);

  // 中国规则：黑棋需要至少 88 个子才能获胜（贴 3.5 目）
  let winner: 'black' | 'white' | 'draw';
  if (blackScore >= 88) {
    winner = 'black';
  } else if (whiteScore >= 82) {
    winner = 'white';
  } else {
    winner = 'draw';
  }

  return {
    ...state,
    status: 'finished',
    deadStones: [],
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
