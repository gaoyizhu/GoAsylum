/*
 * Wabi-Sabi Design Philosophy Applied:
 * - Hand-drawn quality board lines with subtle imperfections
 * - Natural wood texture background
 * - Gentle stone placement animations
 * - Soft shadows mimicking traditional Go stones
 */

import React from 'react';
import type { BoardState, Position } from '@/lib/go-game-9x9/types';

interface GoBoardProps {
  board: BoardState;
  boardSize: number;
  onIntersectionClick?: (pos: Position) => void;
  lastMove?: Position | null;
  highlightedPositions?: Position[];
  disabled?: boolean;
}

export function GoBoard({
  board,
  boardSize,
  onIntersectionClick,
  lastMove,
  highlightedPositions = [],
  disabled = false,
}: GoBoardProps) {
  const cellSize = 40; // Size of each grid cell in pixels
  const padding = 30; // Padding around the board
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

  return (
    <div className="flex justify-center items-center p-4">
      <svg
        width={boardWidth}
        height={boardHeight}
        className="wabi-shadow-lg rounded"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/Iz4HeWdS0k5BbrvPTSHBXR-img-2_1770622220000_na1fn_Z28tYm9hcmQtdGV4dHVyZQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0l6NEhlV2RTMGs1QmJydlBUU0hCWFItaW1nLTJfMTc3MDYyMjIyMDAwMF9uYTFmbl9aMjh0WW05aGNtUXRkR1Y0ZEhWeVpRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=I9jligIGwL3wTW8VEw20aldQWihNhcJmVzCSTN3AfKSltjweJHud0n6f74KfPJ457MFiL4sXsRKNyAasa2R9U2xeeOi8zvjTJcFbc4UMyJnoCMfhvO-mA7-PVhUeTLUfEHTWnt5HPYy3qXFdbx1ivX3dxe7MvV01db0xY7U4uqf52PAey5BG4b5s1uBkdzYIkOU8V356XMj7Q-v1mYoLHX8C4sFxyll5PN9~9GCBhOHT~6DIoUzFV0ni3FLw6LH286QRhaobFwsHkROe7~c1gfNfPkqziqIKz-Rz8Vzgp5vjmaQWta8xWKQ9Q2jmFgk8jC9I-qnilVaYBKkNr-klfA__')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Draw grid lines */}
        <g stroke="oklch(0.2 0.01 60)" strokeWidth="1.5" opacity="0.8">
          {/* Horizontal lines */}
          {Array.from({ length: boardSize }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={padding}
              y1={padding + i * cellSize}
              x2={padding + (boardSize - 1) * cellSize}
              y2={padding + i * cellSize}
            />
          ))}
          {/* Vertical lines */}
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

        {/* Star points for 9x9 and 13x13 boards */}
        {boardSize === 9 && (
          <>
            {[2, 6].map(x =>
              [2, 6].map(y => (
                <circle
                  key={`star-${x}-${y}`}
                  cx={padding + x * cellSize}
                  cy={padding + y * cellSize}
                  r={3}
                  fill="oklch(0.2 0.01 60)"
                  opacity="0.6"
                />
              ))
            )}
            <circle
              cx={padding + 4 * cellSize}
              cy={padding + 4 * cellSize}
              r={3}
              fill="oklch(0.2 0.01 60)"
              opacity="0.6"
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
                  fill="oklch(0.2 0.01 60)"
                  opacity="0.6"
                />
              ))
            )}
            <circle
              cx={padding + 6 * cellSize}
              cy={padding + 6 * cellSize}
              r={3}
              fill="oklch(0.2 0.01 60)"
              opacity="0.6"
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

            return (
              <g key={`stone-${x}-${y}`} className="ink-transition">
                {/* Stone shadow */}
                <circle
                  cx={cx + 2}
                  cy={cy + 2}
                  r={stoneRadius}
                  fill="oklch(0.2 0.01 60)"
                  opacity="0.15"
                />
                {/* Stone */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={stoneRadius}
                  fill={isBlack ? 'oklch(0.15 0.01 60)' : 'oklch(0.98 0.005 85)'}
                  stroke={isBlack ? 'oklch(0.1 0.01 60)' : 'oklch(0.7 0.02 70)'}
                  strokeWidth="1.5"
                  className="ink-transition"
                />
                {/* Last move marker */}
                {isLastMove(x, y) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius * 0.3}
                    fill={isBlack ? 'oklch(0.98 0.005 85)' : 'oklch(0.15 0.01 60)'}
                    opacity="0.8"
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
                } ink-transition`}
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
            fill="var(--color-kaki-orange)"
            opacity="0.6"
            className="animate-pulse"
          />
        ))}
      </svg>
    </div>
  );
}
