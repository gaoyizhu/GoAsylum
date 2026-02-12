import React from 'react';
import type { Position } from '@/lib/go-game-tricolor13x13/types';

type PlayerColor = 'black' | 'white' | 'green';

interface TricolorBoardProps {
  board: (PlayerColor | null)[][];
  boardSize: number;
  onIntersectionClick?: (pos: Position) => void;
  lastMove?: Position | null;
  disabled?: boolean;
}

export function TricolorBoard({
  board,
  boardSize,
  onIntersectionClick,
  lastMove,
  disabled = false,
}: TricolorBoardProps) {
  // 响应式尺寸
  const maxBoardWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 40, 600) : 560;
  const cellSize = Math.floor(maxBoardWidth / boardSize);
  const padding = Math.max(20, cellSize * 0.5);
  const boardWidth = (boardSize - 1) * cellSize + padding * 2;
  const boardHeight = (boardSize - 1) * cellSize + padding * 2;
  const stoneRadius = cellSize * 0.45;

  const handleIntersectionClick = (x: number, y: number) => {
    if (!disabled && onIntersectionClick) {
      onIntersectionClick({ x, y });
    }
  };

  const isLastMove = (x: number, y: number) => {
    return lastMove && lastMove.x === x && lastMove.y === y;
  };

  const getStoneColor = (color: PlayerColor) => {
    switch (color) {
      case 'black': return '#000000';
      case 'white': return '#FFFFFF';
      case 'green': return '#22C55E';
    }
  };

  const getStrokeColor = (color: PlayerColor) => {
    switch (color) {
      case 'black': return '#000000';
      case 'white': return '#999999';
      case 'green': return '#16A34A';
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

        {/* Star points for 13x13 */}
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

        {/* Draw stones */}
        {board.map((row, y) =>
          row.map((stone, x) => {
            if (stone === null) return null;

            const cx = padding + x * cellSize;
            const cy = padding + y * cellSize;

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
                  fill={getStoneColor(stone)}
                  stroke={getStrokeColor(stone)}
                  strokeWidth="1.5"
                />
                {isLastMove(x, y) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius * 0.3}
                    fill="#FF4444"
                  />
                )}
              </g>
            );
          })
        )}

        {/* Interactive intersection points */}
        {Array.from({ length: boardSize }).map((_, y) =>
          Array.from({ length: boardSize }).map((_, x) => {
            if (board[y][x] !== null) return null;

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
      </svg>
    </div>
  );
}
