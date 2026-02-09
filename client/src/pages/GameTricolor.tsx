import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TricolorBoard } from "@/components/TricolorBoard";
import { useLanguage } from "@/lib/i18n/language-context";
import { ArrowLeft, RotateCcw, Circle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import * as Engine from '@/lib/go-game-tricolor13x13/engine';
import type { GameState, Position } from '@/lib/go-game-tricolor13x13/types';

export default function GameTricolor() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const [gameState, setGameState] = useState<GameState>(Engine.createInitialState());

  const handleIntersectionClick = (pos: Position) => {
    const result = Engine.makeMove(gameState, pos.x, pos.y);
    if (result.success && result.newState) {
      setGameState(result.newState);
    }
  };

  const handleUndo = () => {
    const newState = Engine.undo(gameState);
    if (newState) {
      setGameState(newState);
    }
  };

  const handlePass = () => {
    const newState = Engine.pass(gameState);
    setGameState(newState);
  };

  const handleNewGame = () => {
    setGameState(Engine.createInitialState());
  };

  const getCurrentPlayerText = () => {
    switch (gameState.currentPlayer) {
      case 'black': return t.game.blackTurn;
      case 'white': return t.game.whiteTurn;
      case 'green': return t.game.greenTurn || 'Green Turn';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-4 flex justify-between items-center border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.game.backHome}
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-medium text-primary">
            {getCurrentPlayerText()}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t.game.move.replace('{0}', String(gameState.history.length))}
          </p>
        </div>
        <div className="w-32" />
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 flex justify-center">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <TricolorBoard
                  board={gameState.board}
                  boardSize={13}
                  onIntersectionClick={handleIntersectionClick}
                  lastMove={gameState.lastMove}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t.game.black}</h3>
                  <p className="text-2xl font-bold">{t.game.captures}: {gameState.capturedStones.black}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t.game.white}</h3>
                  <p className="text-2xl font-bold">{t.game.captures}: {gameState.capturedStones.white}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t.game.green || 'Green'}</h3>
                  <p className="text-2xl font-bold">{t.game.captures}: {gameState.capturedStones.green}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow">
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleUndo}
                  disabled={gameState.history.length === 0}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.game.undo}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePass}
                >
                  <Circle className="mr-2 h-4 w-4" />
                  {t.game.pass}
                </Button>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleNewGame}
                >
                  {t.game.newGame}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
