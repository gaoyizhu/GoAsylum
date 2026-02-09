import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";
import { ArrowLeft, RotateCcw, Flag, Circle } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import type { GameState, Position } from '@/lib/go-game-9x9/types';

interface GameTemplateProps {
  Engine: any;
  BoardComponent: React.ComponentType<any>;
  boardSize: number;
  gameTypeName: string;
  showColors?: boolean;
}

export function GameTemplate({
  Engine,
  BoardComponent,
  boardSize,
  gameTypeName,
  showColors = true,
}: GameTemplateProps) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/game/:type/:size/:mode");
  
  const [gameState, setGameState] = useState<GameState>(Engine.createInitialGameState());
  const [aiThinking, setAiThinking] = useState(false);

  const handleIntersectionClick = (pos: Position) => {
    if (gameState.status !== 'playing' || aiThinking) return;
    
    if (Engine.isValidMove(gameState, pos)) {
      const newState = Engine.makeMove(gameState, pos);
      setGameState(newState);
      
      // AI response
      if (params?.mode === 'vsAI' && newState.currentPlayer === 'white') {
        setTimeout(() => makeAIMove(newState), 500);
      }
    }
  };

  const makeAIMove = (state: GameState) => {
    setAiThinking(true);
    
    const validMoves = Engine.getLegalMoves ? Engine.getLegalMoves(state) : [];
    
    if (validMoves.length > 0) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      const newState = Engine.makeMove(state, randomMove);
      setGameState(newState);
    } else {
      setGameState(Engine.makePass(state));
    }
    
    setAiThinking(false);
  };

  const handleUndo = () => {
    if (gameState.moveHistory.length > 0) {
      const undoCount = params?.mode === 'vsAI' ? 2 : 1;
      const newState = Engine.undoMoves(gameState, undoCount);
      setGameState(newState);
    }
  };

  const handlePass = () => {
    const newState = Engine.makePass(gameState);
    setGameState(newState);
    
    if (params?.mode === 'vsAI' && newState.currentPlayer === 'white' && newState.status === 'playing') {
      setTimeout(() => makeAIMove(newState), 500);
    }
  };

  const handleResign = () => {
    setGameState(Engine.resign(gameState));
  };

  const handleNewGame = () => {
    setGameState(Engine.createInitialGameState());
  };

  const lastMove = gameState.moveHistory.length > 0 
    ? gameState.moveHistory[gameState.moveHistory.length - 1].position 
    : null;

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
            {gameState.currentPlayer === 'black' ? t.game.blackTurn : t.game.whiteTurn}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t.game.move.replace('{0}', String(gameState.moveHistory.length))}
          </p>
        </div>
        <div className="w-32" />
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 flex justify-center">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <BoardComponent
                  board={gameState.board}
                  boardSize={boardSize}
                  onIntersectionClick={handleIntersectionClick}
                  lastMove={lastMove}
                  disabled={gameState.status !== 'playing' || aiThinking}
                  showColors={showColors}
                />
                {aiThinking && (
                  <p className="text-center text-muted-foreground mt-4">
                    {t.game.aiThinking}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t.game.black}</h3>
                  <p className="text-2xl font-bold">{t.game.captures}: {gameState.blackCaptures}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t.game.white}</h3>
                  <p className="text-2xl font-bold">{t.game.captures}: {gameState.whiteCaptures}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow">
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleUndo}
                  disabled={gameState.moveHistory.length === 0 || aiThinking}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.game.undo}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePass}
                  disabled={gameState.status !== 'playing' || aiThinking}
                >
                  <Circle className="mr-2 h-4 w-4" />
                  {t.game.pass}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleResign}
                  disabled={gameState.status !== 'playing' || aiThinking}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {t.game.resign}
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

      {gameState.status === 'finished' && gameState.result && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="shadow-lg max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">
                {gameState.result.winner === 'black' ? t.game.blackWins : 
                 gameState.result.winner === 'white' ? t.game.whiteWins : 
                 t.game.draw}
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>{t.game.blackCaptures.replace('{0}', String(gameState.result.blackCaptures))}</p>
                <p>{t.game.whiteCaptures.replace('{0}', String(gameState.result.whiteCaptures))}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleNewGame} className="flex-1">
                  {t.game.playAgain}
                </Button>
                <Button onClick={() => setLocation('/')} variant="outline" className="flex-1">
                  {t.game.backHome}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
