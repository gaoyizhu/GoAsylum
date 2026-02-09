import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";
import { ArrowLeft, Eraser } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { CanvasColor } from '@/lib/go-game-canvas13x13/types';
import { CANVAS_COLORS } from '@/lib/go-game-canvas13x13/types';

export default function GameCanvas() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const boardSize = 13;
  const [board, setBoard] = useState<(CanvasColor | null)[][]>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const [selectedColor, setSelectedColor] = useState<CanvasColor>('#000000');

  const cellSize = 40;
  const padding = 30;
  const boardWidth = (boardSize - 1) * cellSize + padding * 2;
  const boardHeight = (boardSize - 1) * cellSize + padding * 2;
  const stoneRadius = cellSize * 0.45;

  const handleIntersectionClick = (x: number, y: number) => {
    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = selectedColor;
    setBoard(newBoard);
  };

  const handleClear = () => {
    setBoard(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-4 flex justify-between items-center border-b border-border">
        <Button variant="ghost" onClick={() => setLocation('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.game.backHome}
        </Button>
        <h2 className="text-xl font-medium text-primary">{t.home.canvasGo}</h2>
        <div className="w-32" />
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 flex justify-center">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-center items-center p-4">
                  <svg width={boardWidth} height={boardHeight} className="shadow-lg rounded bg-card">
                    {/* Grid lines */}
                    <g stroke="#8B4513" strokeWidth="1.5">
                      {Array.from({ length: boardSize }).map((_, i) => (
                        <line key={`h-${i}`} x1={padding} y1={padding + i * cellSize}
                          x2={padding + (boardSize - 1) * cellSize} y2={padding + i * cellSize} />
                      ))}
                      {Array.from({ length: boardSize }).map((_, i) => (
                        <line key={`v-${i}`} x1={padding + i * cellSize} y1={padding}
                          x2={padding + i * cellSize} y2={padding + (boardSize - 1) * cellSize} />
                      ))}
                    </g>

                    {/* Stones */}
                    {board.map((row, y) =>
                      row.map((color, x) => {
                        if (!color) return null;
                        const cx = padding + x * cellSize;
                        const cy = padding + y * cellSize;
                        return (
                          <g key={`stone-${x}-${y}`}>
                            <circle cx={cx + 2} cy={cy + 2} r={stoneRadius} fill="#000000" opacity="0.2" />
                            <circle cx={cx} cy={cy} r={stoneRadius} fill={color}
                              stroke={color === '#FFFFFF' ? '#999999' : color} strokeWidth="1.5" />
                          </g>
                        );
                      })
                    )}

                    {/* Interactive points */}
                    {Array.from({ length: boardSize }).map((_, y) =>
                      Array.from({ length: boardSize }).map((_, x) => {
                        const cx = padding + x * cellSize;
                        const cy = padding + y * cellSize;
                        return (
                          <circle key={`int-${x}-${y}`} cx={cx} cy={cy} r={stoneRadius * 0.8}
                            fill="transparent" className="cursor-pointer hover:fill-accent/20 transition-all"
                            onClick={() => handleIntersectionClick(x, y)} />
                        );
                      })
                    )}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">Select Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {CANVAS_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded border-2 transition-all ${
                        selectedColor === color ? 'border-primary scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow">
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full" onClick={handleClear}>
                  <Eraser className="mr-2 h-4 w-4" />
                  Clear Canvas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
