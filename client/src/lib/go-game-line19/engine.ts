/**
 * 围棋游戏引擎 - 1x19 棋盘
 */

import type { BoardState, GameState, Move, Player, Position, StoneColor } from './types';

export const BOARD_SIZE = 19;

/**
 * 创建空棋盘
 */
export function createEmptyBoard(): BoardState {
  return Array(BOARD_SIZE).fill(null);
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
  };
}

/**
 * 检查位置是否在棋盘范围内
 */
export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < BOARD_SIZE;
}

/**
 * 获取相邻位置
 */
export function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  
  if (pos.x > 0) adjacent.push({ x: pos.x - 1 });
  if (pos.x < BOARD_SIZE - 1) adjacent.push({ x: pos.x + 1 });
  
  return adjacent;
}

/**
 * 获取棋盘上指定位置的棋子颜色
 */
export function getStoneAt(board: BoardState, pos: Position): StoneColor {
  if (!isValidPosition(pos)) return null;
  return board[pos.x];
}

/**
 * 设置棋盘上指定位置的棋子
 */
export function setStoneAt(board: BoardState, pos: Position, color: StoneColor): BoardState {
  const newBoard = [...board];
  newBoard[pos.x] = color;
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
 * 计算一组棋子的气（自由度）
 * 使用深度优先搜索找出所有连接的棋子及其气
 */
export function calculateLiberties(
  board: BoardState,
  pos: Position,
  visited: Set<number> = new Set()
): { stones: Position[]; liberties: Position[] } {
  const color = getStoneAt(board, pos);
  if (color === null) return { stones: [], liberties: [] };

  const stones: Position[] = [];
  const liberties: Position[] = [];
  const stack: Position[] = [pos];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = current.x;

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
      const adjKey = adj.x;
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
  let newBoard = [...board];
  const captured: Position[] = [];

  for (let x = 0; x < BOARD_SIZE; x++) {
    const pos = { x };
    if (getStoneAt(newBoard, pos) === color && isCaptured(newBoard, pos)) {
      const { stones } = calculateLiberties(newBoard, pos);
      for (const stone of stones) {
        newBoard = setStoneAt(newBoard, stone, null);
        captured.push(stone);
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
  if (state.koPosition && pos.x === state.koPosition.x) {
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
  
  // 连续两次虚手，游戏结束，计算地盘
  if (newConsecutivePasses >= 2) {
    // 计算每方占据的交叉点数量
    let blackTerritory = 0;
    let whiteTerritory = 0;

    // 先统计棋子数量
    for (let x = 0; x < BOARD_SIZE; x++) {
      const stone = state.board[x];
      if (stone === 'black') {
        blackTerritory++;
      } else if (stone === 'white') {
        whiteTerritory++;
      }
    }

    // 找出所有连续空点区域，判断每个区域的归属
    let i = 0;
    while (i < BOARD_SIZE) {
      if (state.board[i] === null) {
        // 找到一个空点区域的起点
        const start = i;
        let end = i;
        
        // 找到这个空点区域的终点
        while (end < BOARD_SIZE && state.board[end] === null) {
          end++;
        }
        end--; // end 现在指向最后一个空点
        
        const emptyCount = end - start + 1;
        
        // 判断这个空点区域两端的棋子颜色
        const leftStone = start > 0 ? state.board[start - 1] : null;
        const rightStone = end < BOARD_SIZE - 1 ? state.board[end + 1] : null;
        
        if (leftStone === 'black' && rightStone === 'black') {
          // 两端都是黑棋，整个区域属于黑棋
          blackTerritory += emptyCount;
        } else if (leftStone === 'white' && rightStone === 'white') {
          // 两端都是白棋，整个区域属于白棋
          whiteTerritory += emptyCount;
        } else if (
          (leftStone === 'black' && rightStone === 'white') ||
          (leftStone === 'white' && rightStone === 'black')
        ) {
          // 两端是黑白各一个，区域被平分
          blackTerritory += emptyCount / 2;
          whiteTerritory += emptyCount / 2;
        } else if (leftStone === 'black' && rightStone === null) {
          // 左边是黑棋，右边是边界，属于黑棋
          blackTerritory += emptyCount;
        } else if (leftStone === 'white' && rightStone === null) {
          // 左边是白棋，右边是边界，属于白棋
          whiteTerritory += emptyCount;
        } else if (leftStone === null && rightStone === 'black') {
          // 左边是边界，右边是黑棋，属于黑棋
          blackTerritory += emptyCount;
        } else if (leftStone === null && rightStone === 'white') {
          // 左边是边界，右边是白棋，属于白棋
          whiteTerritory += emptyCount;
        } else {
          // 两端都是边界（整个棋盘都是空的），平分
          blackTerritory += emptyCount / 2;
          whiteTerritory += emptyCount / 2;
        }
        
        i = end + 1;
      } else {
        i++;
      }
    }

    const blackScore = blackTerritory;
    const whiteScore = whiteTerritory;

    // 19路一根筋规则：黑棋需要至少 11 个子才能获胜
    let winner: 'black' | 'white' | 'draw';
    if (blackScore >= 11) {
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
  
  for (let x = 0; x < BOARD_SIZE; x++) {
    const pos = { x };
    if (isValidMove(state, pos)) {
      legalMoves.push(pos);
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
  let blackTerritory = 0;
  let whiteTerritory = 0;

  // 先统计棋子数量
  for (let x = 0; x < BOARD_SIZE; x++) {
    const stone = state.board[x];
    if (stone === 'black') {
      blackTerritory++;
    } else if (stone === 'white') {
      whiteTerritory++;
    }
  }

  // 找出所有连续空点区域，判断每个区域的归属
  let i = 0;
  while (i < BOARD_SIZE) {
    if (state.board[i] === null) {
      // 找到一个空点区域的起点
      const start = i;
      let end = i;
      
      // 找到这个空点区域的终点
      while (end < BOARD_SIZE && state.board[end] === null) {
        end++;
      }
      end--; // end 现在指向最后一个空点
      
      const emptyCount = end - start + 1;
      
      // 判断这个空点区域两端的棋子颜色
      const leftStone = start > 0 ? state.board[start - 1] : null;
      const rightStone = end < BOARD_SIZE - 1 ? state.board[end + 1] : null;
      
      if (leftStone === 'black' && rightStone === 'black') {
        // 两端都是黑棋，整个区域属于黑棋
        blackTerritory += emptyCount;
      } else if (leftStone === 'white' && rightStone === 'white') {
        // 两端都是白棋，整个区域属于白棋
        whiteTerritory += emptyCount;
      } else if (
        (leftStone === 'black' && rightStone === 'white') ||
        (leftStone === 'white' && rightStone === 'black')
      ) {
        // 两端是黑白各一个，区域被平分
        blackTerritory += emptyCount / 2;
        whiteTerritory += emptyCount / 2;
      } else if (leftStone === 'black' && rightStone === null) {
        // 左边是黑棋，右边是边界，属于黑棋
        blackTerritory += emptyCount;
      } else if (leftStone === 'white' && rightStone === null) {
        // 左边是白棋，右边是边界，属于白棋
        whiteTerritory += emptyCount;
      } else if (leftStone === null && rightStone === 'black') {
        // 左边是边界，右边是黑棋，属于黑棋
        blackTerritory += emptyCount;
      } else if (leftStone === null && rightStone === 'white') {
        // 左边是边界，右边是白棋，属于白棋
        whiteTerritory += emptyCount;
      } else {
        // 两端都是边界（整个棋盘都是空的），平分
        blackTerritory += emptyCount / 2;
        whiteTerritory += emptyCount / 2;
      }
      
      i = end + 1;
    } else {
      i++;
    }
  }

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
 * 智能裁判 - 立即结束游戏并判定胜负
 */
export function judgeGame(state: GameState): GameState {
  const { blackTerritory, whiteTerritory, blackScore, whiteScore } = analyzeSituation(state);

  // 19路一根筋规则：黑棋需要至少 11 个子才能获胜
  let winner: 'black' | 'white' | 'draw';
  if (blackScore >= 11) {
    winner = 'black';
  } else {
    winner = 'white';
  }

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
