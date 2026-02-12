/**
 * Game Page - 统一游戏页面，根据URL参数加载不同游戏
 */

import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// 导入不同的棋盘组件
import { LineBoard } from "@/components/LineBoard";
import { GoBoard } from "@/components/GoBoard";
import { TricolorBoard } from "@/components/TricolorBoard";
import { CanvasBoard } from "@/components/CanvasBoard";

// 导入引擎
import * as LineEngine from "@/lib/go-game-line/engine";
import * as Engine9x9 from "@/lib/go-game-9x9/engine";
import * as Engine13x13 from "@/lib/go-game-13x13/engine";
import * as ToroidEngine9x9 from "@/lib/go-game-toroid9x9/engine";
import * as ToroidEngine13x13 from "@/lib/go-game-toroid13x13/engine";
import * as MagneticEngine9x9 from "@/lib/go-game-magnetic9x9/engine";
import * as MagneticEngine13x13 from "@/lib/go-game-magnetic13x13/engine";
import * as TricolorEngine from "@/lib/go-game-tricolor13x13/engine";
import * as CanvasEngine from "@/lib/go-game-canvas13x13/engine";

import type { GameState as LineGameState } from "@/lib/go-game-line/types";
import type { GameState as StandardGameState } from "@/lib/go-game-9x9/types";
import type { GameState as TricolorGameState } from "@/lib/go-game-tricolor13x13/types";

export default function Game() {
  const [, params] = useRoute("/game/:type/:size/:mode");
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  
  const gameType = params?.type || 'standard';
  const boardSize = params?.size || '9x9';
  const gameMode = params?.mode || 'pvp';

  // 根据游戏类型选择引擎
  const getEngine = () => {
    if (gameType === 'line') return LineEngine;
    if (gameType === 'toroid') return boardSize === '9x9' ? ToroidEngine9x9 : ToroidEngine13x13;
    if (gameType === 'magnetic') return boardSize === '9x9' ? MagneticEngine9x9 : MagneticEngine13x13;
    if (gameType === 'tricolor') return TricolorEngine;
    if (gameType === 'canvas') return CanvasEngine;
    return boardSize === '9x9' ? Engine9x9 : Engine13x13;
  };

  const engine = getEngine();
  
  const [gameState, setGameState] = useState<any>(() => {
    // 画布、磁性、三色使用createInitialState
    if (gameType === 'canvas' || gameType === 'magnetic' || gameType === 'tricolor') {
      return (engine as any).createInitialState();
    }
    // 其他游戏使用createInitialGameState
    return (engine as any).createInitialGameState();
  });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showColors, setShowColors] = useState(false); // 一色围棋特有：显示黑白按钮
  
  // 画布模式特有状态
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedShape, setSelectedShape] = useState<'circle' | 'square' | 'cross'>('circle');
  const [showBorder, setShowBorder] = useState(true);
  const [isEraser, setIsEraser] = useState(false);
  const [showGrid, setShowGrid] = useState(gameType !== 'canvas');

  const lastMove = gameState.moveHistory?.length > 0
    ? gameState.moveHistory[gameState.moveHistory.length - 1].position
    : null;

  // 三色围棋没有status字段，总是允许落子
  const isPlayerTurn = gameType === 'tricolor'
    ? true
    : (gameMode === 'pvp' 
      ? gameState.status === 'playing'
      : gameState.currentPlayer === 'black' && gameState.status === 'playing');

  const canUndo = gameState.moveHistory?.length >= (gameMode === 'ai' ? 2 : 1);

  const handlePlaceStone = (position: any) => {
    // 标记死棋状态：点击棋子标记/取消标记
    if (gameState.status === 'marking_dead_stones') {
      handleToggleDeadStone(position);
      return;
    }

    // 画布模式特殊处理
    if (gameType === 'canvas') {
      const canvasEngine = engine as typeof CanvasEngine;
      // 更新state中的选项，然后调用placeColor
      const updatedState = {
        ...gameState,
        selectedColor,
        selectedShape,
        showBorder,
        isEraser
      };
      const newState = canvasEngine.placeColor(updatedState, position);
      setGameState(newState);
      return;
    }
    
    if (!isPlayerTurn || isAIThinking) return;
    
    // 三色围棋特殊处理：没有isValidMove，直接调用makeMove并检查结果
    if (gameType === 'tricolor') {
      const result = (engine as any).makeMove(gameState, position.x, position.y);
      if (result.success && result.newState) {
        setGameState(result.newState);
      }
      return;
    }
    
    if ((engine as any).isValidMove(gameState, position)) {
      const newState = (engine as any).makeMove(gameState, position);
      setGameState(newState);

      // AI回合
      if (gameMode === 'ai' && gameType === 'line' && newState.status === 'playing' && newState.currentPlayer === 'white') {
        setIsAIThinking(true);
        setTimeout(() => {
          const aiMove = getRandomValidMove(newState);
          if (aiMove) {
            setGameState((engine as any).makeMove(newState, aiMove));
          } else {
            setGameState((engine as any).makePass(newState));
          }
          setIsAIThinking(false);
        }, 500);
      }
    }
  };

  const getRandomValidMove = (state: any) => {
    const validMoves: any[] = [];
    const size = gameType === 'line' ? 13 : (boardSize === '9x9' ? 9 : 13);
    
    if (gameType === 'line') {
      for (let x = 0; x < size; x++) {
        const pos = { x, y: 0 };
        if ((engine as any).isValidMove(state, pos)) {
          validMoves.push(pos);
        }
      }
    } else {
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const pos = { x, y };
          if ((engine as any).isValidMove(state, pos)) {
            validMoves.push(pos);
          }
        }
      }
    }
    
    return validMoves.length > 0 ? validMoves[Math.floor(Math.random() * validMoves.length)] : null;
  };

  const handlePass = () => {
    if (!isPlayerTurn || isAIThinking) return;
    setGameState((engine as any).makePass(gameState));
  };

  const handleUndo = () => {
    if (!canUndo || isAIThinking) return;
    const steps = gameMode === 'ai' ? 2 : 1;
    setGameState((engine as any).undoMoves(gameState, steps));
  };

  const handleResign = () => {
    if (gameState.status !== 'playing' || isAIThinking) return;
    if ('resign' in engine) {
      setGameState((engine as any).resign(gameState));
    }
  };

  const handleNewGame = () => {
    // 画布、磁性、三色使用createInitialState
    if (gameType === 'canvas' || gameType === 'magnetic' || gameType === 'tricolor') {
      setGameState((engine as any).createInitialState());
    } else {
      setGameState((engine as any).createInitialGameState());
    }
    setShowColors(false);
  };

  const handleJudge = () => {
    if (gameState.status !== 'playing' || isAIThinking) return;
    // 开始标记死棋
    if ('startMarkingDeadStones' in engine) {
      setGameState((engine as any).startMarkingDeadStones(gameState));
    }
  };

  const handleToggleDeadStone = (position: any) => {
    if (gameState.status !== 'marking_dead_stones') return;
    if ('toggleDeadStone' in engine) {
      setGameState((engine as any).toggleDeadStone(gameState, position));
    }
  };

  const handleConfirmDeadStones = () => {
    if (gameState.status !== 'marking_dead_stones') return;
    if ('confirmDeadStones' in engine) {
      setGameState((engine as any).confirmDeadStones(gameState));
    }
  };

  const handleCancelMarkingDeadStones = () => {
    if (gameState.status !== 'marking_dead_stones') return;
    if ('cancelMarkingDeadStones' in engine) {
      setGameState((engine as any).cancelMarkingDeadStones(gameState));
    }
  };

  const handleBackHome = () => {
    setLocation('/');
  };

  // 渲染棋盘
  const renderBoard = () => {
    if (gameType === 'line') {
      return (
        <LineBoard
          board={gameState.board}
          onIntersectionClick={handlePlaceStone}
          lastMove={lastMove}
          disabled={!isPlayerTurn || isAIThinking}
        />
      );
    }

    if (gameType === 'tricolor') {
      return (
        <TricolorBoard
          board={gameState.board}
          boardSize={13}
          onIntersectionClick={handlePlaceStone}
          lastMove={lastMove}
          disabled={!isPlayerTurn || isAIThinking}
        />
      );
    }

    if (gameType === 'canvas') {
      return (
        <CanvasBoard
          board={gameState.board}
          boardSize={13}
          onIntersectionClick={handlePlaceStone}
          disabled={false}
          showGrid={showGrid}
        />
      );
    }

    return (
      <GoBoard
        board={gameState.board}
        onIntersectionClick={handlePlaceStone}
        lastMove={lastMove}
        disabled={!isPlayerTurn || isAIThinking}
        boardSize={parseInt(boardSize.split('x')[0])}
        showColors={gameType === 'mono' || gameType === 'amnesia' ? showColors : true}
        amnesiaMode={gameType === 'amnesia'}
        moveHistory={gameState.moveHistory}
      />
    );
  };

  // 获取当前玩家文本
  const getCurrentPlayerText = () => {
    if (gameState.status === 'marking_dead_stones') {
      return t.game.markDeadStones || '标记死棋';
    }
    if (gameState.status === 'finished') {
      if (!gameState.result) return t.game.draw;
      const winner = gameState.result.winner;
      if (winner === 'black') return t.game.blackWins;
      if (winner === 'white') return t.game.whiteWins;
      if (winner === 'red') return (t.game as any).redWins || '红棋胜';
      return t.game.draw;
    }
    if (gameState.currentPlayer === 'black') return t.game.blackTurn;
    if (gameState.currentPlayer === 'white') return t.game.whiteTurn;
    if (gameState.currentPlayer === 'green') return t.game.greenTurn;
    if (gameState.currentPlayer === 'red') return (t.game as any).redTurn || '红棋回合';
    return '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackHome}
          className="bg-black/5"
        >
          {t.game.backHome}
        </Button>
        <div className="flex flex-col items-center">
          <div className="text-lg font-medium text-foreground">
            {getCurrentPlayerText()}
          </div>
          <div className="text-sm text-muted-foreground">
            {t.game.move?.replace('{0}', String(gameState.moveHistory?.length || 0))}
          </div>
        </div>
        <div className="w-20" />
      </div>

      {/* Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        {renderBoard()}
      </div>

      {/* Control Buttons */}
      <div className="bg-card border-t border-border p-4">
        <div className="max-w-md mx-auto space-y-2">
          {/* 画布模式：颜色选择器 */}
          {gameType === 'canvas' && (
            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-1">
                {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded border-2 ${
                      selectedColor === color ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                    } ${color === '#FFFFFF' ? 'bg-white' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {['#FFA500', '#800080', '#FFC0CB', '#00FF7F', '#8B4513', '#FFD700', '#808080', '#A52A2A'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded border-2 ${
                      selectedColor === color ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* 形状选择器 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">形状：</span>
                <div className="flex gap-1">
                  <Button
                    variant={selectedShape === 'circle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedShape('circle')}
                    className="w-12 h-12 text-2xl p-0"
                  >
                    ●
                  </Button>
                  <Button
                    variant={selectedShape === 'square' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedShape('square')}
                    className="w-12 h-12 text-2xl p-0"
                  >
                    ■
                  </Button>
                  <Button
                    variant={selectedShape === 'cross' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedShape('cross')}
                    className="w-12 h-12 text-xl p-0"
                  >
                    ✨
                  </Button>
                </div>
                <Button
                  variant={showBorder ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowBorder(!showBorder)}
                  className="ml-auto"
                >
                  {showBorder ? '有边框' : '无边框'}
                </Button>
                <Button
                  variant={isEraser ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsEraser(!isEraser)}
                >
                  橡皮擦
                </Button>
              </div>
            </div>
          )}

          {/* First Row */}
          <div className="grid grid-cols-3 gap-2">
            {/* 一色围棋特有：显示黑白按钮 */}
            {gameType === 'mono' && (
              <Button
                variant={showColors ? "default" : "outline"}
                onClick={() => setShowColors(!showColors)}
                className={showColors ? "bg-primary text-primary-foreground" : "text-foreground"}
              >
                {(t.game as any).showColors || '显示黑白'}
              </Button>
            )}
            {/* 失忆症特有：回忆过去按钮 */}
            {gameType === 'amnesia' && (
              <Button
                variant={showColors ? "default" : "outline"}
                onClick={() => setShowColors(!showColors)}
                className={showColors ? "bg-primary text-primary-foreground" : "text-foreground"}
              >
                {(t.game as any).recallPast || '回忆过去'}
              </Button>
            )}
            {/* 画布模式特殊按钮 */}
            {gameType === 'canvas' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowGrid(!showGrid)}
                  className="text-foreground"
                >
                  {showGrid ? '隐藏棋盘' : '显示棋盘'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="text-foreground"
                >
                  {t.game.undo}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('确定要清空棋盘吗？所有作品将被清除。')) {
                      const canvasEngine = engine as typeof CanvasEngine;
                      setGameState(canvasEngine.clearCanvas(gameState));
                    }
                  }}
                  className="text-destructive"
                >
                  清空棋盘
                </Button>
              </>
            ) : gameState.status === 'marking_dead_stones' ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelMarkingDeadStones}
                  className="text-foreground"
                >
                  {t.game.cancelMarkingDeadStones || '取消'}
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmDeadStones}
                  className="text-primary-foreground col-span-2"
                >
                  {t.game.confirmDeadStones || '确认死棋'}
                </Button>
              </>
            ) : (
              <>
                {gameType !== 'mono' && gameType !== 'amnesia' && (
                  <Button
                    variant="outline"
                    onClick={handleUndo}
                    disabled={!canUndo || isAIThinking}
                    className="text-foreground"
                  >
                    {t.game.undo}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={gameType === 'mono' ? handleUndo : handlePass}
                  disabled={gameType === 'mono' ? (!canUndo || isAIThinking) : (!isPlayerTurn || isAIThinking)}
                  className="text-foreground"
                >
                  {gameType === 'mono' ? t.game.undo : t.game.pass}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleJudge}
                  disabled={gameState.status !== 'playing' || isAIThinking}
                  className="text-primary"
                >
                  {gameType === 'mono' ? t.game.pass : t.game.judge}
                </Button>
              </>
            )}
          </div>

          {/* Second Row */}
          {gameType !== 'canvas' && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleResign}
                disabled={gameState.status !== 'playing' || isAIThinking}
                className="text-destructive"
              >
                {t.game.resign}
              </Button>
              <Button
                variant="outline"
                onClick={handleNewGame}
                className="text-primary"
              >
                {t.game.newGame}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-card border-t border-border px-4 py-3">
        {/* 游戏结果显示 */}
        {gameState.status === 'finished' && gameState.result && (
          <div className="text-center mb-3 p-3 bg-primary/10 rounded-lg">
            <div className="text-lg font-semibold text-foreground">
              {t.game.black}: {gameState.result.blackTerritory?.toFixed(1) || 0}, {t.game.white}: {gameState.result.whiteTerritory?.toFixed(1) || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {gameState.result.winner === 'black' ? t.game.blackWins : gameState.result.winner === 'white' ? t.game.whiteWins : t.game.draw}
            </div>
          </div>
        )}
        {/* 提子信息 */}
        <div className="flex justify-around">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-black" />
            <span className="text-foreground">{t.game.black}</span>
            <span className="text-muted-foreground text-sm">
              {t.game.captures}: {gameState.blackCaptures || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white border border-gray-400" />
            <span className="text-foreground">
              {gameMode === 'ai' && gameType === 'line' ? t.game.whiteAI : t.game.white}
            </span>
            <span className="text-muted-foreground text-sm">
              {t.game.captures}: {gameState.whiteCaptures || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
