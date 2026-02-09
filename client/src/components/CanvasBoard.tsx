/**
 * Canvas Board Component - 画布模式棋盘（艺术家模式）
 */
import type { Position } from '@/lib/go-game-canvas13x13/types';

interface StoneInfo {
  color: string;
  shape: 'circle' | 'square' | 'cross';
  showBorder: boolean;
}

interface CanvasBoardProps {
  board: (StoneInfo | null)[][];
  boardSize: number;
  onIntersectionClick?: (pos: Position) => void;
  disabled?: boolean;
  showGrid?: boolean;
}

export function CanvasBoard({
  board,
  boardSize,
  onIntersectionClick,
  disabled = false,
  showGrid = true,
}: CanvasBoardProps) {
  const cellSize = 40;
  const padding = 30;
  const boardWidth = (boardSize - 1) * cellSize + padding * 2;
  const boardHeight = (boardSize - 1) * cellSize + padding * 2;
  const stoneRadius = cellSize * 0.45;

  const handleIntersectionClick = (x: number, y: number) => {
    if (!disabled && onIntersectionClick) {
      onIntersectionClick({ x, y });
    }
  };

  return (
    <div className="inline-block bg-[#FAEBD7] rounded-lg shadow-lg p-4">
      <svg
        width={boardWidth}
        height={boardHeight}
        className="bg-[#D2B48C]"
      >
        {/* Grid lines */}
        {showGrid && (
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
        )}

        {/* Star points */}
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

        {/* Draw colored stones */}
        {board.map((row, y) =>
          row.map((stoneInfo, x) => {
            if (stoneInfo === null) return null;

            const cx = padding + x * cellSize;
            const cy = padding + y * cellSize;
            const { color, shape, showBorder } = stoneInfo;

            return (
              <g key={`stone-${x}-${y}`}>
                {/* 阴影 */}
                {shape === 'circle' && (
                  <circle
                    cx={cx + 2}
                    cy={cy + 2}
                    r={stoneRadius}
                    fill="#000000"
                    opacity="0.2"
                  />
                )}
                {shape === 'square' && (
                  <rect
                    x={cx - stoneRadius + 2}
                    y={cy - stoneRadius + 2}
                    width={stoneRadius * 2}
                    height={stoneRadius * 2}
                    fill="#000000"
                    opacity="0.2"
                  />
                )}
                
                {/* 棋子 */}
                {shape === 'circle' && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius}
                    fill={color}
                    stroke={showBorder ? (color === '#FFFFFF' ? '#999999' : '#000000') : 'none'}
                    strokeWidth={showBorder ? "2" : "0"}
                  />
                )}
                {shape === 'square' && (
                  <rect
                    x={cx - stoneRadius}
                    y={cy - stoneRadius}
                    width={stoneRadius * 2}
                    height={stoneRadius * 2}
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
                        const lineLength = stoneRadius * 1.8;
                        const lineWidth = stoneRadius * 0.5;
                        const halfLen = lineLength / 2;
                        const halfWidth = lineWidth / 2;
                        const cos45 = Math.cos(Math.PI / 4);
                        const r1 = halfLen;
                        const r2 = halfWidth / cos45;
                        
                        return `
                          M ${cx} ${cy - r1}
                          L ${cx + r2} ${cy - r2}
                          L ${cx + r1} ${cy}
                          L ${cx + r2} ${cy + r2}
                          L ${cx} ${cy + r1}
                          L ${cx - r2} ${cy + r2}
                          L ${cx - r1} ${cy}
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
