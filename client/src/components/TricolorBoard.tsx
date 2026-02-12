import { useState, useEffect } from 'react';
import type { Position } from '@/lib/go-game-tricolor13x13/types';

type PlayerColor = 'black' | 'white' | 'green';

interface TricolorBoardProps {
  board: (PlayerColor | null)[][];
  boardSize: number;
  onIntersectionClick?: (pos: Position) => void;
  lastMove?: Position | null;
  disabled?: boolean;
  isMarkingDeadStones?: boolean;
  deadStones?: Set<string>;
}

export function TricolorBoard({
  board,
  boardSize,
  onIntersectionClick,
  lastMove,
  disabled = false,
  isMarkingDeadStones = false,
  deadStones = new Set(),
}: TricolorBoardProps) {
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
            const isDead = deadStones.has(`${x},${y}`);

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
                  opacity={isDead ? 0.4 : 1}
                />
                {isLastMove(x, y) && !isDead && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius * 0.3}
                    fill={stone === 'white' ? '#000000' : '#FFFFFF'}
                  />
                )}
                {isDead && (
                  <g>
                    <line
                      x1={cx - stoneRadius * 0.5}
                      y1={cy - stoneRadius * 0.5}
                      x2={cx + stoneRadius * 0.5}
                      y2={cy + stoneRadius * 0.5}
                      stroke="#FF4444"
                      strokeWidth="3"
                    />
                    <line
                      x1={cx + stoneRadius * 0.5}
                      y1={cy - stoneRadius * 0.5}
                      x2={cx - stoneRadius * 0.5}
                      y2={cy + stoneRadius * 0.5}
                      stroke="#FF4444"
                      strokeWidth="3"
                    />
                  </g>
                )}
              </g>
            );
          })
        )}

        {/* Interactive intersection points */}
        {Array.from({ length: boardSize }).map((_, y) =>
          Array.from({ length: boardSize }).map((_, x) => {
            // 标记死棋状态：只显示有棋子的位置的交互区域
            // 正常状态：只显示空位置的交互区域
            const hasStone = board[y][x] !== null;
            if (isMarkingDeadStones ? !hasStone : hasStone) return null;

            const cx = padding + x * cellSize;
            const cy = padding + y * cellSize;
            const isDisabled = isMarkingDeadStones ? false : disabled;

            return (
              <circle
                key={`intersection-${x}-${y}`}
                cx={cx}
                cy={cy}
                r={stoneRadius * 0.8}
                fill="transparent"
                className={`${
                  isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:fill-accent/20'
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
