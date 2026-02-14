import { useState, useEffect } from 'react';
import type { BoardState, Position, StoneColor } from '@/lib/go-game-line/types';

interface LineBoardProps {
  board: BoardState;
  onIntersectionClick?: (pos: Position) => void;
  lastMove?: Position | null;
  disabled?: boolean;
}

export function LineBoard({
  board,
  onIntersectionClick,
  lastMove,
  disabled = false,
}: LineBoardProps) {
  const BOARD_WIDTH = board.length; // 动态获取棋盘大小
  const [containerWidth, setContainerWidth] = useState(660);
  
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth - 48, 700);
      setContainerWidth(width);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  const cellSize = Math.floor(containerWidth / (BOARD_WIDTH + 1));
  const padding = Math.max(20, cellSize * 0.5);
  const boardWidth = (BOARD_WIDTH - 1) * cellSize + padding * 2;
  const boardHeight = Math.max(100, cellSize * 2.5);
  const stoneRadius = cellSize * 0.4;

  const handleIntersectionClick = (x: number) => {
    if (!disabled && onIntersectionClick) {
      onIntersectionClick({ x });
    }
  };

  const isLastMove = (x: number) => {
    return lastMove && lastMove.x === x;
  };

  return (
    <div className="flex justify-center items-center py-4 px-3">
      <svg
        width={boardWidth}
        height={boardHeight}
        className="shadow-lg rounded bg-card"
      >
        {/* Draw horizontal line */}
        <line
          x1={padding}
          y1={boardHeight / 2}
          x2={padding + (BOARD_WIDTH - 1) * cellSize}
          y2={boardHeight / 2}
          stroke="#8B4513"
          strokeWidth="2"
        />

        {/* Draw vertical marks at intersections */}
        {Array.from({ length: BOARD_WIDTH }).map((_, i) => (
          <line
            key={`mark-${i}`}
            x1={padding + i * cellSize}
            y1={boardHeight / 2 - 8}
            x2={padding + i * cellSize}
            y2={boardHeight / 2 + 8}
            stroke="#8B4513"
            strokeWidth="2"
          />
        ))}

        {/* Draw stones */}
        {board.map((stone: StoneColor, x: number) => {
          if (stone === null) return null;

          const cx = padding + x * cellSize;
          const cy = boardHeight / 2;
          const isBlack = stone === 'black';

          return (
            <g key={`stone-${x}`}>
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
                fill={isBlack ? '#000000' : '#FFFFFF'}
                stroke={isBlack ? '#000000' : '#999999'}
                strokeWidth="1.5"
              />
              {isLastMove(x) && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={stoneRadius * 0.3}
                  fill="#FF4444"
                />
              )}
            </g>
          );
        })}

        {/* Interactive intersection points */}
        {Array.from({ length: BOARD_WIDTH }).map((_, x) => {
          if (board[x] !== null) return null;

          const cx = padding + x * cellSize;
          const cy = boardHeight / 2;

          return (
            <circle
              key={`intersection-${x}`}
              cx={cx}
              cy={cy}
              r={stoneRadius * 1.2}
              fill="transparent"
              className={`${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:fill-accent/20'
              } transition-all`}
              onClick={() => handleIntersectionClick(x)}
            />
          );
        })}
      </svg>
    </div>
  );
}
