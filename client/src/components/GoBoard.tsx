import { useState, useEffect } from 'react';
import type { BoardState, Position } from '@/lib/go-game-9x9/types';

interface GoBoardProps {
  board: BoardState;
  boardSize: number;
  onIntersectionClick?: (pos: Position) => void;
  lastMove?: Position | null;
  highlightedPositions?: Position[];
  disabled?: boolean;
  showColors?: boolean; // For mono mode
  amnesiaMode?: boolean; // For amnesia mode
  moveHistory?: any[]; // Move history for amnesia mode
  deadStones?: Position[]; // Dead stones marked during counting
  isMarkingDeadStones?: boolean; // Whether in marking dead stones mode
}

export function GoBoard({
  board,
  boardSize,
  onIntersectionClick,
  lastMove,
  highlightedPositions = [],
  disabled = false,
  showColors = true,
  amnesiaMode = false,
  moveHistory = [],
  deadStones = [],
  isMarkingDeadStones = false,
}: GoBoardProps) {
  // 响应式尺寸：动态获取屏幕宽度
  const [containerWidth, setContainerWidth] = useState(560);
  
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth - 80, 600);
      setContainerWidth(width);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  const cellSize = Math.floor(containerWidth / (boardSize + 1));
  const padding = Math.max(20, cellSize * 0.5);
  const boardWidth = (boardSize - 1) * cellSize + padding * 2;
  const boardHeight = (boardSize - 1) * cellSize + padding * 2;
  const stoneRadius = cellSize * 0.45;

  const handleIntersectionClick = (x: number, y: number) => {
    if (!disabled && onIntersectionClick) {
      onIntersectionClick({ x, y });
    }
  };

  const isHighlighted = (x: number, y: number) => {
    return highlightedPositions.some(pos => pos.x === x && pos.y === y);
  };

  const isLastMove = (x: number, y: number) => {
    return lastMove && lastMove.x === x && lastMove.y === y;
  };

  // 失忆症模式：根据棋子手数计算渐变颜色
  const getAmnesiaColor = (x: number, y: number, isBlack: boolean): string => {
    if (!amnesiaMode) {
      // 非失忆症模式，返回正常颜色
      return isBlack ? '#000' : '#fff';
    }

    if (showColors) {
      // "回忆过去"模式：显示真实的黑白颜色
      return isBlack ? '#000' : '#fff';
    }

    // 默认失忆症模式：显示渐变颜色
    // 查找该棋子的手数
    const move = moveHistory.find((m: any) => m.position.x === x && m.position.y === y);
    if (!move) return '#808080';

    const currentMoveNumber = moveHistory.length;
    const age = currentMoveNumber - move.moveNumber; // 棋子的"年龄"

    // 最近10手棋子渐变，超过10手的显示灰色
    if (age >= 10) {
      return '#808080';
    }

    // 线性渐变：黑棋从 #000000 渐变到 #808080，白棋从 #FFFFFF 渐变到 #808080
    const ratio = age / 10; // 0 到 1
    if (isBlack) {
      const gray = Math.round(0x00 + (0x80 - 0x00) * ratio);
      return `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;
    } else {
      const gray = Math.round(0xFF - (0xFF - 0x80) * ratio);
      return `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <svg
        width={boardWidth}
        height={boardHeight}
        className="shadow-lg rounded bg-card"
      >
        {/* Draw grid lines */}
        <g stroke="#8B4513" strokeWidth="1.5">
          {Array.from({ length: boardSize }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={padding}
              y1={padding + i * cellSize}
              x2={padding + (boardSize - 1) * cellSize}
              y2={padding + i * cellSize}
            />
          ))}
          {Array.from({ length: boardSize }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={padding + i * cellSize}
              y1={padding}
              x2={padding + i * cellSize}
              y2={padding + (boardSize - 1) * cellSize}
            />
          ))}
        </g>

        {/* Star points */}
        {boardSize === 9 && (
          <>
            {[2, 6].map(x =>
              [2, 6].map(y => (
                <circle
                  key={`star-${x}-${y}`}
                  cx={padding + x * cellSize}
                  cy={padding + y * cellSize}
                  r={3}
                  fill="#8B4513"
                />
              ))
            )}
            <circle
              cx={padding + 4 * cellSize}
              cy={padding + 4 * cellSize}
              r={3}
              fill="#8B4513"
            />
          </>
        )}
        {boardSize === 13 && (
          <>
            {[3, 9].map(x =>
              [3, 9].map(y => (
                <circle
                  key={`star-${x}-${y}`}
                  cx={padding + x * cellSize}
                  cy={padding + y * cellSize}
                  r={3}
                  fill="#8B4513"
                />
              ))
            )}
            <circle
              cx={padding + 6 * cellSize}
              cy={padding + 6 * cellSize}
              r={3}
              fill="#8B4513"
            />
          </>
        )}

        {/* Draw stones */}
        {board.map((row, y) =>
          row.map((stone, x) => {
            if (stone === null) return null;

            const cx = padding + x * cellSize;
            const cy = padding + y * cellSize;
            const isBlack = stone === 'black';
            
            // 失忆症模式使用渐变颜色，一色模式使用白色，否则正常显示
            let displayColor: string;
            let strokeColor: string;
            
            if (amnesiaMode) {
              // 失忆症模式：使用渐变颜色
              displayColor = getAmnesiaColor(x, y, isBlack);
              strokeColor = displayColor === '#FFFFFF' ? '#999999' : displayColor;
            } else if (!showColors) {
              // 一色模式：所有棋子显示为白色
              displayColor = '#FFFFFF';
              strokeColor = '#999999';
            } else {
              // 正常模式
              displayColor = isBlack ? '#000000' : '#FFFFFF';
              strokeColor = isBlack ? '#000000' : '#999999';
            }

            return (
              <g key={`stone-${x}-${y}`}>
                <circle
                  cx={cx + 2}
                  cy={cy + 2}
                  r={stoneRadius}
                  fill="#000000"
                  opacity="0.2"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={stoneRadius}
                  fill={displayColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  opacity={deadStones.some(ds => ds.x === x && ds.y === y) ? 0.4 : 1}
                />
                {isLastMove(x, y) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius * 0.3}
                    fill="#FF4444"
                  />
                )}
                {/* 死棋标记：红色叉号 */}
                {deadStones.some(ds => ds.x === x && ds.y === y) && (
                  <>
                    <line
                      x1={cx - stoneRadius * 0.5}
                      y1={cy - stoneRadius * 0.5}
                      x2={cx + stoneRadius * 0.5}
                      y2={cy + stoneRadius * 0.5}
                      stroke="#FF0000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={cx + stoneRadius * 0.5}
                      y1={cy - stoneRadius * 0.5}
                      x2={cx - stoneRadius * 0.5}
                      y2={cy + stoneRadius * 0.5}
                      stroke="#FF0000"
                      strokeWidth="2.5"
                    />
                  </>
                )}
              </g>
            );
          })
        )}

        {/* Interactive intersection points */}
        {Array.from({ length: boardSize }).map((_, y) =>
          Array.from({ length: boardSize }).map((_, x) => {
            // 标记死棋状态下，只为有棋子的位置添加交互区域
            // 正常状态下，只为空位置添加交互区域
            const hasStone = board[y][x] !== null;
            
            // 正常下棋：只能点击空位
            // 标记死棋：只能点击有棋子的位置
            if (!isMarkingDeadStones && hasStone) return null;
            if (isMarkingDeadStones && !hasStone) return null;

            const cx = padding + x * cellSize;
            const cy = padding + y * cellSize;

            return (
              <circle
                key={`intersection-${x}-${y}`}
                cx={cx}
                cy={cy}
                r={stoneRadius * 0.8}
                fill="transparent"
                className={`${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:fill-accent/20'
                } transition-all`}
                onClick={() => handleIntersectionClick(x, y)}
              />
            );
          })
        )}

        {/* Highlighted positions */}
        {highlightedPositions.map((pos, idx) => (
          <circle
            key={`highlight-${idx}`}
            cx={padding + pos.x * cellSize}
            cy={padding + pos.y * cellSize}
            r={stoneRadius * 0.4}
            fill="#D4AF37"
            opacity="0.6"
            className="animate-pulse"
          />
        ))}
      </svg>
    </div>
  );
}
