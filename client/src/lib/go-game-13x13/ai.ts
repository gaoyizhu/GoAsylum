/**
 * 13×13 围棋 AI 算法
 */

import type { GameState, Position } from './types';
import { getLegalMoves, getStoneAt, calculateLiberties, getAdjacentPositions } from './engine';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

/**
 * 获取 AI 的下一步落子位置
 */
export function getAIMove(state: GameState, difficulty: AIDifficulty): Position | null {
  const legalMoves = getLegalMoves(state);
  
  if (legalMoves.length === 0) {
    return null; // 没有合法落子位置
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
 * 简单难度：随机选择一个合法位置
 */
function getRandomMove(legalMoves: Position[]): Position {
  const randomIndex = Math.floor(Math.random() * legalMoves.length);
  return legalMoves[randomIndex];
}

/**
 * 中等难度：考虑提子和保护自己的棋子
 */
function getMediumMove(state: GameState, legalMoves: Position[]): Position {
  const aiColor = state.currentPlayer;
  const opponentColor = aiColor === 'black' ? 'white' : 'black';

  // 1. 检查是否有可以提掉对方棋子的位置
  for (const move of legalMoves) {
    // 模拟落子后，检查是否能提掉对方的棋子
    for (const adj of getAdjacentPositions(move)) {
      const stone = getStoneAt(state.board, adj);
      if (stone === opponentColor) {
        const { liberties } = calculateLiberties(state.board, adj);
        // 如果对方这组棋子只有一口气，落子后可以提掉
        if (liberties.length === 1 && liberties[0].x === move.x && liberties[0].y === move.y) {
          return move;
        }
      }
    }
  }

  // 2. 检查自己是否有棋子需要救（只有一口气）
  for (const move of legalMoves) {
    for (const adj of getAdjacentPositions(move)) {
      const stone = getStoneAt(state.board, adj);
      if (stone === aiColor) {
        const { liberties } = calculateLiberties(state.board, adj);
        // 如果自己这组棋子只有一口气，落子救活
        if (liberties.length === 1 && liberties[0].x === move.x && liberties[0].y === move.y) {
          return move;
        }
      }
    }
  }

  // 3. 否则随机选择
  return getRandomMove(legalMoves);
}

/**
 * 困难难度：评估每个位置的价值
 */
function getHardMove(state: GameState, legalMoves: Position[]): Position {
  const aiColor = state.currentPlayer;
  const opponentColor = aiColor === 'black' ? 'white' : 'black';

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;

    // 1. 提子价值（最高优先级）
    let captureCount = 0;
    for (const adj of getAdjacentPositions(move)) {
      const stone = getStoneAt(state.board, adj);
      if (stone === opponentColor) {
        const { liberties, stones } = calculateLiberties(state.board, adj);
        if (liberties.length === 1 && liberties[0].x === move.x && liberties[0].y === move.y) {
          captureCount += stones.length;
        }
      }
    }
    score += captureCount * 100;

    // 2. 救自己的棋子（高优先级）
    let saveCount = 0;
    for (const adj of getAdjacentPositions(move)) {
      const stone = getStoneAt(state.board, adj);
      if (stone === aiColor) {
        const { liberties, stones } = calculateLiberties(state.board, adj);
        if (liberties.length === 1 && liberties[0].x === move.x && liberties[0].y === move.y) {
          saveCount += stones.length;
        }
      }
    }
    score += saveCount * 80;

    // 3. 扩展自己的势力（中优先级）
    let friendlyNeighbors = 0;
    for (const adj of getAdjacentPositions(move)) {
      const stone = getStoneAt(state.board, adj);
      if (stone === aiColor) {
        friendlyNeighbors++;
      }
    }
    score += friendlyNeighbors * 10;

    // 4. 减少对方的气（低优先级）
    let opponentLibertyReduction = 0;
    for (const adj of getAdjacentPositions(move)) {
      const stone = getStoneAt(state.board, adj);
      if (stone === opponentColor) {
        const { liberties } = calculateLiberties(state.board, adj);
        if (liberties.length === 2) {
          opponentLibertyReduction++;
        }
      }
    }
    score += opponentLibertyReduction * 5;

    // 5. 中心位置加分
    const centerX = 6;
    const centerY = 6;
    const distanceToCenter = Math.abs(move.x - centerX) + Math.abs(move.y - centerY);
    score += (12 - distanceToCenter) * 2;

    // 6. 角和边的位置加分（围棋中角和边容易围地）
    if (move.x === 0 || move.x === 12 || move.y === 0 || move.y === 12) {
      score += 3;
    }
    if ((move.x === 0 || move.x === 12) && (move.y === 0 || move.y === 12)) {
      score += 5; // 角的位置额外加分
    }

    // 添加一点随机性，避免 AI 太机械
    score += Math.random() * 2;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
