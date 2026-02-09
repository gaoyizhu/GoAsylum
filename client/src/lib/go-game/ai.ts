/**
 * 围棋 AI 对手
 * 实现简单的策略：优先提子 > 避免被提 > 随机落子
 */

import type { GameState, Position } from './types';
import { getLegalMoves, makeMove, calculateLiberties, getAdjacentPositions, getStoneAt, getOpponentColor } from './engine';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

/**
 * AI 选择下一步落子位置
 */
export function getAIMove(state: GameState, difficulty: AIDifficulty = 'medium'): Position | null {
  const legalMoves = getLegalMoves(state);
  
  if (legalMoves.length === 0) {
    return null; // 没有合法落子，需要虚手
  }

  switch (difficulty) {
    case 'easy':
      return getRandomMove(legalMoves);
    case 'medium':
      return getMediumMove(state, legalMoves);
    case 'hard':
      return getHardMove(state, legalMoves);
    default:
      return getRandomMove(legalMoves);
  }
}

/**
 * 简单难度：完全随机
 */
function getRandomMove(legalMoves: Position[]): Position {
  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

/**
 * 中等难度：考虑基本策略
 * 1. 优先提子（能吃掉对方棋子）
 * 2. 避免被提（保护自己的棋子）
 * 3. 随机落子
 */
function getMediumMove(state: GameState, legalMoves: Position[]): Position {
  const aiColor = state.currentPlayer;
  const opponentColor = getOpponentColor(aiColor);

  // 策略 1: 寻找能提子的位置
  for (const move of legalMoves) {
    const testState = makeMove(state, move);
    const lastMove = testState.moveHistory[testState.moveHistory.length - 1];
    if (lastMove.capturedStones.length > 0) {
      return move; // 找到能提子的位置
    }
  }

  // 策略 2: 保护自己即将被提的棋子
  for (let x = 0; x < state.board.length; x++) {
    const pos = { x };
    if (getStoneAt(state.board, pos) === aiColor) {
      const { liberties } = calculateLiberties(state.board, pos);
      if (liberties.length === 1) {
        // 只有一口气，尝试补气
        const liberty = liberties[0];
        if (legalMoves.some(m => m.x === liberty.x)) {
          return liberty;
        }
      }
    }
  }

  // 策略 3: 攻击对方只有一口气的棋子
  for (let x = 0; x < state.board.length; x++) {
    const pos = { x };
    if (getStoneAt(state.board, pos) === opponentColor) {
      const { liberties } = calculateLiberties(state.board, pos);
      if (liberties.length === 1) {
        const liberty = liberties[0];
        if (legalMoves.some(m => m.x === liberty.x)) {
          return liberty;
        }
      }
    }
  }

  // 策略 4: 随机落子
  return getRandomMove(legalMoves);
}

/**
 * 困难难度：更高级的策略
 * 1. 评估每个位置的价值
 * 2. 选择价值最高的位置
 */
function getHardMove(state: GameState, legalMoves: Position[]): Position {
  const aiColor = state.currentPlayer;
  const opponentColor = getOpponentColor(aiColor);

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;

    // 模拟落子
    const testState = makeMove(state, move);
    const lastMove = testState.moveHistory[testState.moveHistory.length - 1];

    // 评分因素 1: 提子数（非常重要）
    score += lastMove.capturedStones.length * 100;

    // 评分因素 2: 落子后自己的气数（重要）
    const { liberties: myLiberties } = calculateLiberties(testState.board, move);
    score += myLiberties.length * 10;

    // 评分因素 3: 威胁对方棋子（中等重要）
    for (const adj of getAdjacentPositions(move)) {
      if (getStoneAt(testState.board, adj) === opponentColor) {
        const { liberties: oppLiberties } = calculateLiberties(testState.board, adj);
        if (oppLiberties.length === 1) {
          score += 50; // 威胁到对方
        } else if (oppLiberties.length === 2) {
          score += 20;
        }
      }
    }

    // 评分因素 4: 保护自己的棋子（重要）
    for (const adj of getAdjacentPositions(move)) {
      if (getStoneAt(state.board, adj) === aiColor) {
        const { liberties: myGroupLiberties } = calculateLiberties(state.board, adj);
        if (myGroupLiberties.length === 1) {
          score += 80; // 救自己的棋子
        } else if (myGroupLiberties.length === 2) {
          score += 30;
        }
      }
    }

    // 评分因素 5: 位置偏好（轻微）
    // 中间位置更有价值
    const center = Math.floor(state.board.length / 2);
    const distanceFromCenter = Math.abs(move.x - center);
    score += (state.board.length - distanceFromCenter) * 2;

    // 添加少量随机性，避免 AI 过于机械
    score += Math.random() * 5;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
