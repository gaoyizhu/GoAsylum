/*
 * Standard Go Game Page
 * Wabi-Sabi design: Zen-like spacing, natural interactions, contemplative atmosphere
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoBoard } from "@/components/GoBoard";
import { useLanguage } from "@/lib/i18n/language-context";
import { ArrowLeft, RotateCcw, Flag, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import * as Engine9x9 from "@/lib/go-game-9x9/engine";
import * as Engine13x13 from "@/lib/go-game-13x13/engine";
import type { GameState, Position } from "@/lib/go-game-9x9/types";

export default function GameStandard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/game/:type/:size/:mode");
  
  const boardSize = params?.size === '13x13' ? 13 : 9;
  const Engine = boardSize === 13 ? Engine13x13 : Engine9x9;
  
  const [gameState, setGameState] = useState<GameState>(Engine.createInitialGameState());
  const [aiThinking, setAiThinking] = useState(false);

  const handleIntersectionClick = (pos: Position) => {
    if (gameState.status !== 'playing' || aiThinking) return;
    
    if (Engine.isValidMove(gameState, pos)) {
      const newState = Engine.makeMove(gameState, pos);
      setGameState(newState);
      
      // AI response (simple random move for now)
      if (params?.mode === 'vsAI' && newState.currentPlayer === 'white') {
        setTimeout(() => makeAIMove(newState), 500);
      }
    }
  };

  const makeAIMove = (state: GameState) => {
    setAiThinking(true);
    
    // Simple AI: find all valid moves and pick randomly
    const validMoves: Position[] = [];
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const pos = { x, y };
        if (Engine.isValidMove(state, pos)) {
          validMoves.push(pos);
        }
      }
    }
    
    if (validMoves.length > 0) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      const newState = Engine.makeMove(state, randomMove);
      setGameState(newState);
    } else {
      // AI passes if no valid moves
      setGameState(Engine.makePass(state));
    }
    
    setAiThinking(false);
  };

  const handleUndo = () => {
    if (gameState.moveHistory.length > 0) {
      let newState = Engine.undoMoves(gameState, params?.mode === 'vsAI' ? 2 : 1);
      setGameState(newState);
    }
  };

  const handlePass = () => {
    const newState = Engine.makePass(gameState);
    setGameState(newState);
    
    // AI response
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
    <div 
      className="min-h-screen paper-texture"
      style={{
        backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/Iz4HeWdS0k5BbrvPTSHBXR-img-1_1770622221000_na1fn_aGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0l6NEhlV2RTMGs1QmJydlBUU0hCWFItaW1nLTFfMTc3MDYyMjIyMTAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1ay5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iu2zqhdoRkGuoME4u8u3Bv07L8fogfF0U3xHjWyGuXF-I83DvgnY9AkykTsujVqG7nD1EVkN~5EOoZHRLH2KJU8OA3CM4MytdK75lQvWLrIKb9VS2dJXSNVbGgPoC-eq3Z~v2zNpPPUuJOv3l6dS0uCRXqioWxn3SPHytt3lqNVI7pUfUkrwlc6kdlbFKiYrmuOOHC2lNNCyk9hTZDTM83wyRNKQXyBKvTNG-i1FfMch85Vf7zDHkw-Z~IwLDX1b5lnSUAHYgEtjDvr5bbkl6PPIzbtTUGE~VUMbmB-ifqc6bmj8ZEy7U3FFwgDXgBtH4vLGxe0EQIgYI1tcCr3jiw__')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header className="container py-4 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="ink-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.game.backHome}
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-medium">
            {gameState.currentPlayer === 'black' ? t.game.blackTurn : t.game.whiteTurn}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t.game.move.replace('{0}', String(gameState.moveHistory.length))}
          </p>
        </div>
        <div className="w-32" />
      </header>

      {/* Main Game Area */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Board - 3/4 width */}
          <div className="lg:col-span-3 flex justify-center">
            <Card className="wabi-shadow-lg bg-card/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <GoBoard
                  board={gameState.board}
                  boardSize={boardSize}
                  onIntersectionClick={handleIntersectionClick}
                  lastMove={lastMove}
                  disabled={gameState.status !== 'playing' || aiThinking}
                />
                {aiThinking && (
                  <p className="text-center text-muted-foreground mt-4">
                    {t.game.aiThinking}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls - 1/4 width */}
          <div className="lg:col-span-1 space-y-4">
            {/* Game Info */}
            <Card className="wabi-shadow bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t.game.black}</h3>
                  <p className="text-2xl font-emphasis">{t.game.captures}: {gameState.blackCaptures}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t.game.white}</h3>
                  <p className="text-2xl font-emphasis">{t.game.captures}: {gameState.whiteCaptures}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="wabi-shadow bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full ink-transition"
                  onClick={handleUndo}
                  disabled={gameState.moveHistory.length === 0 || aiThinking}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.game.undo}
                </Button>
                <Button
                  variant="outline"
                  className="w-full ink-transition"
                  onClick={handlePass}
                  disabled={gameState.status !== 'playing' || aiThinking}
                >
                  <Circle className="mr-2 h-4 w-4" />
                  {t.game.pass}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full ink-transition"
                  onClick={handleResign}
                  disabled={gameState.status !== 'playing' || aiThinking}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {t.game.resign}
                </Button>
                <Button
                  variant="default"
                  className="w-full ink-transition"
                  onClick={handleNewGame}
                >
                  {t.game.newGame}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      {gameState.status === 'finished' && gameState.result && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="wabi-shadow-lg max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-3xl font-medium">
                {gameState.result.winner === 'black' ? t.game.blackWins : 
                 gameState.result.winner === 'white' ? t.game.whiteWins : 
                 t.game.draw}
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>{t.game.blackCaptures.replace('{0}', String(gameState.result.blackCaptures))}</p>
                <p>{t.game.whiteCaptures.replace('{0}', String(gameState.result.whiteCaptures))}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleNewGame} className="flex-1 ink-transition">
                  {t.game.playAgain}
                </Button>
                <Button onClick={() => setLocation('/')} variant="outline" className="flex-1 ink-transition">
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
