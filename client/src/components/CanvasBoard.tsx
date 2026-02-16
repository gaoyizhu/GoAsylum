/**
 * Canvas Board Component - 画布模式棋盘（艺术家模式）
 */
import { useState, useEffect } from 'react';
import type { Position } from '@/lib/go-game-canvas13x13/types';

interface StoneInfo {
  color: string;
  shape: 'circle' | 'square' | 'cross';
  showBorder: boolean;
}

interface LineInfo {
  start: Position;
  end: Position;
  color: string;
}

interface CanvasBoardProps {
  board: (StoneInfo | null)[][];
  boardSize: number;
  onIntersectionClick?: (pos: Position) => void;
  disabled?: boolean;
  showGrid?: boolean;
  lines?: LineInfo[];
  pendingLineStart?: Position | null;
  selectedColor?: string;
}

export function CanvasBoard({
  board,
  boardSize,
  onIntersectionClick,
  disabled = false,
  showGrid = true,
  lines = [],
  pendingLineStart = null,
  selectedColor = '#000000',
}: CanvasBoardProps) {
  const [containerWidth, setContainerWidth] = useState(560);
  
  useEffect(() => {
    const updateWidth = () => {
      // 19路棋盘使用更宽的容器，减少边距
      const margin = boardSize === 19 ? 0 : 56;
      const maxWidth = boardSize === 19 ? 800 : 600;
      const width = Math.min(window.innerWidth - margin, maxWidth);
      setContainerWidth(width);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [boardSize]);
  
  const cellSize = Math.floor(containerWidth / (boardSize + 1));
  // 19路棋盘使用10px padding让边缘棋子完整显示，其他使用正常padding
  const padding = boardSize === 19 ? 10 : Math.max(20, cellSize * 0.5);
  const boardWidth = (boardSize - 1) * cellSize + padding * 2;
  const boardHeight = (boardSize - 1) * cellSize + padding * 2;
  const stoneRadius = cellSize * 0.45;

  const handleIntersectionClick = (x: number, y: number) => {
    if (!disabled && onIntersectionClick) {
      onIntersectionClick({ x, y });
    }
  };

  return (
    <div className={boardSize === 19 ? "inline-block" : "inline-block bg-white rounded-lg shadow-lg p-3"}>
      <svg
        width={boardWidth}
        height={boardHeight}
        className="bg-white"
      >
        {/* Grid lines */}
        {showGrid && (
          <g stroke="#2C3E50" strokeWidth="1.5">
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
        )}

        {/* Star points */}
        {showGrid && boardSize === 13 && (
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
        
        {/* Star points for 19x19 board */}
        {showGrid && boardSize === 19 && (
          <>
            {[3, 9, 15].map(x =>
              [3, 9, 15].map(y => (
                <circle
                  key={`star-${x}-${y}`}
                  cx={padding + x * cellSize}
                  cy={padding + y * cellSize}
                  r={3}
                  fill="#8B4513"
                />
              ))
            )}
          </>
        )}

        {/* Draw colored stones */}
        {board.map((row, y) =>
          row.map((stoneInfo, x) => {
            if (stoneInfo === null) return null;

            const cx = padding + x * cellSize;
            const cy = padding + y * cellSize;
            const { color, shape, showBorder } = stoneInfo;

            return (
              <g key={`stone-${x}-${y}`}>
                {/* 棋子 */}
                {shape === 'circle' && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius + 0.5}
                    fill={color}
                    stroke={showBorder ? (color === '#FFFFFF' ? '#999999' : '#000000') : 'none'}
                    strokeWidth={showBorder ? "2" : "0"}
                  />
                )}
                {shape === 'square' && (
                  <rect
                    x={cx - stoneRadius - (boardSize === 19 ? 1 : 2.5)}
                    y={cy - stoneRadius - (boardSize === 19 ? 1 : 2.5)}
                    width={stoneRadius * 2 + (boardSize === 19 ? 2 : 5)}
                    height={stoneRadius * 2 + (boardSize === 19 ? 2 : 5)}
                    fill={color}
                    stroke={showBorder ? (color === '#FFFFFF' ? '#999999' : '#000000') : 'none'}
                    strokeWidth={showBorder ? "2" : "0"}
                  />
                )}
                {shape === 'cross' && (
                  <>
                    {/* 八边形星星形状 */}
                    <path
                      d={(() => {
                        // 19路棋盘：星星增大3px，13路棋盘：保持缩减
                        const verticalLength = boardSize === 19 ? stoneRadius * 1.8 + 2.5 : stoneRadius * 1.8 - 0.5;
                        const horizontalLength = boardSize === 19 ? stoneRadius * 1.4 + 1.5 : stoneRadius * 1.4 - 1.5;
                        const lineWidth = stoneRadius * 0.35; // 更瘦
                        const halfVertical = verticalLength / 2;
                        const halfHorizontal = horizontalLength / 2;
                        const halfWidth = lineWidth / 2;
                        const cos45 = Math.cos(Math.PI / 4);
                        const r1 = halfVertical; // 纵向半径
                        const r1h = halfHorizontal; // 横向半径
                        const r2 = halfWidth / cos45;
                        
                        return `
                          M ${cx} ${cy - r1}
                          L ${cx + r2} ${cy - r2}
                          L ${cx + r1h} ${cy}
                          L ${cx + r2} ${cy + r2}
                          L ${cx} ${cy + r1}
                          L ${cx - r2} ${cy + r2}
                          L ${cx - r1h} ${cy}
                          L ${cx - r2} ${cy - r2}
                          Z
                        `;
                      })()}
                      fill={color}
                      stroke={showBorder ? (color === '#FFFFFF' ? '#999999' : '#000000') : 'none'}
                      strokeWidth={showBorder ? "2" : "0"}
                    />
                  </>
                )}
              </g>
            );
          })
        )}

        {/* 线段渲染 */}
        {lines.map((line, index) => {
          const x1 = padding + line.start.x * cellSize;
          const y1 = padding + line.start.y * cellSize;
          const x2 = padding + line.end.x * cellSize;
          const y2 = padding + line.end.y * cellSize;
          return (
            <line
              key={`line-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={line.color}
              strokeWidth={boardSize === 19 ? 3 : 4}
              strokeLinecap="round"
            />
          );
        })}

        {/* 待完成线段的起点提示 */}
        {pendingLineStart && (
          <circle
            cx={padding + pendingLineStart.x * cellSize}
            cy={padding + pendingLineStart.y * cellSize}
            r={boardSize === 19 ? 4 : 5}
            fill={selectedColor}
            opacity={0.7}
          />
        )}

        {/* Interactive intersection points */}
        {Array.from({ length: boardSize }).map((_, y) =>
          Array.from({ length: boardSize }).map((_, x) => {
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
