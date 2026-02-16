/**
 * Game Page - 统一游戏页面，根据URL参数加载不同游戏
 */

import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

// 导入不同的棋盘组件
import { LineBoard } from "@/components/LineBoard";
import { GoBoard } from "@/components/GoBoard";
import { TricolorBoard } from "@/components/TricolorBoard";
import { CanvasBoard } from "@/components/CanvasBoard";

// 导入引擎
import * as LineEngine from "@/lib/go-game-line/engine";
import * as LineEngine19 from "@/lib/go-game-line19/engine";
import * as Engine9x9 from "@/lib/go-game-9x9/engine";
import * as Engine13x13 from "@/lib/go-game-13x13/engine";
import * as ToroidEngine9x9 from "@/lib/go-game-toroid9x9/engine";
import * as ToroidEngine13x13 from "@/lib/go-game-toroid13x13/engine";
import * as MagneticEngine9x9 from "@/lib/go-game-magnetic9x9/engine";
import * as MagneticEngine13x13 from "@/lib/go-game-magnetic13x13/engine";
import * as TricolorEngine9x9 from "@/lib/go-game-tricolor9x9/engine";
import * as TricolorEngine from "@/lib/go-game-tricolor13x13/engine";
import * as CanvasEngine from "@/lib/go-game-canvas13x13/engine";
import * as CanvasEngine19x19 from "@/lib/go-game-canvas19x19/engine";

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
    if (gameType === 'line') return boardSize === '19x19' ? LineEngine19 : LineEngine;
    if (gameType === 'toroid') return boardSize === '9x9' ? ToroidEngine9x9 : ToroidEngine13x13;
    if (gameType === 'magnetic') return boardSize === '9x9' ? MagneticEngine9x9 : MagneticEngine13x13;
    if (gameType === 'tricolor') return boardSize === '9x9' ? TricolorEngine9x9 : TricolorEngine;
    if (gameType === 'canvas') return boardSize === '19x19' ? CanvasEngine19x19 : CanvasEngine;
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
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showColors, setShowColors] = useState(false); // 一色围棋特有：显示黑白按钮
  const [showAdvice, setShowAdvice] = useState(false); // 显示医嘱
  
  // 画布模式特有状态
  const [selectedColor, setSelectedColor] = useState('#FFFF00');
  const [selectedShape, setSelectedShape] = useState<'circle' | 'square' | 'cross' | 'line'>('cross');
  const [pendingLineStart, setPendingLineStart] = useState<{x: number, y: number} | null>(null);
  const [showBorder, setShowBorder] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [showGrid, setShowGrid] = useState(gameType !== 'canvas');

  const lastMove = gameType === 'tricolor'
    ? gameState.lastMove
    : (gameState.moveHistory?.length > 0
      ? gameState.moveHistory[gameState.moveHistory.length - 1].position
      : null);

  // 三色围棋没有status字段，总是允许落子
  const isPlayerTurn = gameType === 'tricolor'
    ? true
    : (gameMode === 'pvp' 
      ? gameState.status === 'playing'
      : gameState.currentPlayer === 'black' && gameState.status === 'playing');

  const canUndo = (gameType === 'tricolor' || gameType === 'magnetic')
    ? (gameState.history?.length >= 1 || gameState.moveHistory?.length >= (gameMode === 'ai' ? 2 : 1))
    : gameType === 'canvas'
    ? (gameState.moveHistory?.length >= 1 || (gameState as any).lines?.length >= 1)
    : gameState.moveHistory?.length >= (gameMode === 'ai' ? 2 : 1);

  const handlePlaceStone = (position: any) => {
    // 标记死棋状态：点击棋子标记/取消标记
    if (gameState.status === 'marking_dead_stones') {
      handleToggleDeadStone(position);
      return;
    }

    // 画布模式特殊处理
    if (gameType === 'canvas') {
      const canvasEngine = engine as typeof CanvasEngine;
      
      // 线段模式：需要两次点击
      if (selectedShape === 'line') {
        if (pendingLineStart === null) {
          // 第一次点击：记录起点
          setPendingLineStart(position);
        } else {
          // 第二次点击：绘制线段
          const newState = {
            ...gameState,
            lines: [...(gameState.lines || []), {
              start: pendingLineStart,
              end: position,
              color: selectedColor
            }]
          };
          setGameState(newState);
          setPendingLineStart(null);
        }
        return;
      }
      
      // 其他形状：正常处理
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
    if (gameType === 'tricolor') {
      setGameState((engine as any).pass(gameState));
    } else {
      setGameState((engine as any).makePass(gameState));
    }
  };

  const handleUndo = () => {
    if (!canUndo || isAIThinking) return;
    if (gameType === 'tricolor' || gameType === 'magnetic') {
      // 三色围棋和磁性围棋的undo只能撤销一步
      const result = (engine as any).undo(gameState);
      if (result) {
        setGameState(result);
      }
      // 如果是AI模式，再撤销一步AI的棋
      if (gameMode === 'ai' && result) {
        const result2 = (engine as any).undo(result);
        if (result2) {
          setGameState(result2);
        }
      }
    } else {
      const steps = gameMode === 'ai' ? 2 : 1;
      setGameState((engine as any).undoMoves(gameState, steps));
    }
  };

  const handleResign = () => {
    // 三色围棋没有status字段，所以需要特殊处理
    const isPlaying = gameType === 'tricolor' ? !gameState.status || gameState.status === 'playing' : gameState.status === 'playing';
    if (!isPlaying || isAIThinking) return;
    
    if (gameType === 'tricolor') {
      setShowResignDialog(true);
    } else if ('resign' in engine) {
      setGameState((engine as any).resign(gameState));
    }
  };

  const confirmResign = () => {
    setShowResignDialog(false);
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
    if (isAIThinking) return;
    
    // 线形围棋：直接裁判
    if (gameType === 'line') {
      if ('judgeGame' in engine) {
        setGameState((engine as any).judgeGame(gameState));
      }
      return;
    }
    
    // 三色围棋没有status字段，需要特殊处理
    if (gameType !== 'tricolor' && gameState.status !== 'playing') return;
    
    // 其他模式：开始标记死棋
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
          boardSize={boardSize === '9x9' ? 9 : 13}
          onIntersectionClick={handlePlaceStone}
          lastMove={lastMove}
          disabled={!isPlayerTurn || isAIThinking}
          isMarkingDeadStones={gameState.status === 'marking_dead_stones'}
          deadStones={gameState.deadStones}
        />
      );
    }

    if (gameType === 'canvas') {
      return (
        <CanvasBoard
          board={gameState.board}
          boardSize={parseInt(boardSize.split('x')[0])}
          onIntersectionClick={handlePlaceStone}
          disabled={false}
          showGrid={showGrid}
          lines={gameState.lines || []}
          pendingLineStart={pendingLineStart}
          selectedColor={selectedColor}
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
        deadStones={gameState.deadStones || []}
        isMarkingDeadStones={gameState.status === 'marking_dead_stones'}
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
    <div className={`min-h-screen ${gameType === 'canvas' ? 'bg-[#FAF3E8]' : 'bg-background'} flex flex-col`}>
      {/* Top Bar */}
      <div className={`${gameType === 'canvas' ? 'bg-[#F5E6D3]' : 'bg-card'} border-b border-border px-4 py-3 flex items-center justify-between`}>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvice(!showAdvice)}
          className="bg-black/5 text-sm"
        >
          {showAdvice ? t.game.hideAdvice : t.game.showAdvice}
        </Button>
      </div>

      {/* Board */}
      <div className={`flex-1 flex items-center justify-center ${gameType === 'canvas' && boardSize === '19x19' ? 'p-0' : 'p-4'}`}>
        <div className="relative">
          {renderBoard()}
          {/* 医嘱叠加层：棋盘正中间的半透明白色背景条 */}
          {showAdvice && (
            <div className={`absolute top-1/2 left-0 right-0 transform -translate-y-1/2 py-3 ${gameType === 'canvas' ? 'bg-[#F5E6D3]/90' : 'bg-white/80'} shadow-lg z-20 ${(gameType === 'canvas' && boardSize === '19x19') || gameType === 'line' ? 'mx-0' : 'mx-3'}`}>
              <div className={`${gameType === 'mono' ? 'text-[21px] md:text-[23px]' : 'text-[22px] md:text-[26px]'} font-bold text-black/80 text-center`} style={{ fontFamily: '"STKaiti", "KaiTi", "楷体", serif' }}>
                {gameType === 'standard' ? t.game.adviceStandard :
                 gameType === 'line' ? t.game.adviceLine :
                 gameType === 'mono' ? t.game.adviceMono :
                 gameType === 'toroid' ? t.game.adviceToroid :
                 gameType === 'magnetic' ? t.game.adviceMagnetic :
                 gameType === 'tricolor' ? t.game.adviceTricolor :
                 gameType === 'amnesia' ? t.game.adviceAmnesia :
                 gameType === 'canvas' ? t.game.adviceCanvas :
                 t.game.adviceStandard}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Result Display */}
      {gameState.status === 'finished' && (
        <div className="bg-card border-t border-border px-4 py-3">
          <div className="text-center p-3 bg-primary/10 rounded-lg max-w-md mx-auto">
            {gameType === 'tricolor' && gameState.score ? (
              <>
                <div className="text-lg font-semibold text-foreground">
                  {t.game.black}: {gameState.score.black}, {t.game.white}: {gameState.score.white}, 绿方: {gameState.score.green}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {gameState.winner === 'black' ? t.game.blackWins : gameState.winner === 'white' ? t.game.whiteWins : gameState.winner === 'green' ? '绿方胜利！' : t.game.draw}
                </div>
              </>
            ) : gameState.result ? (
              <>
                <div className="text-lg font-semibold text-foreground">
                  {t.game.black}: {gameState.result.blackTerritory?.toFixed(1) || 0}, {t.game.white}: {gameState.result.whiteTerritory?.toFixed(1) || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {gameState.result.winner === 'black' ? t.game.blackWins : gameState.result.winner === 'white' ? t.game.whiteWins : t.game.draw}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className={`${gameType === 'canvas' ? 'bg-[#F5E6D3]' : 'bg-card'} border-t border-border p-4`}>
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
                      selectedColor === color ? 'border-[#D4A574] ring-2 ring-[#D4A574]' : 'border-[#E8D4B8]'
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
                      selectedColor === color ? 'border-[#D4A574] ring-2 ring-[#D4A574]' : 'border-[#E8D4B8]'
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
                    onClick={() => { setSelectedShape('circle'); setPendingLineStart(null); }}
                    className="w-[1.875rem] h-[1.875rem] p-0 flex items-center justify-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-current" />
                  </Button>
                  <Button
                    variant={selectedShape === 'square' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setSelectedShape('square'); setPendingLineStart(null); }}
                    className="w-[1.875rem] h-[1.875rem] p-0 flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-current" />
                  </Button>
                  <Button
                    variant={selectedShape === 'cross' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setSelectedShape('cross'); setPendingLineStart(null); }}
                    className="w-[1.875rem] h-[1.875rem] text-xl p-0 flex items-center justify-center leading-none"
                  >
                    ✨
                  </Button>
                  <Button
                    variant={selectedShape === 'line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setSelectedShape('line'); setPendingLineStart(null); }}
                    className="w-[1.875rem] h-[1.875rem] p-0 flex items-center justify-center"
                  >
                    <div className="w-3.5 h-0.5 bg-current" />
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
          <div className={`grid gap-2 ${gameType === 'mono' || gameType === 'amnesia' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {/* 一色围棋特有：显示黑白按钮 */}
            {gameType === 'mono' && gameState.status !== 'marking_dead_stones' && (
              <Button
                variant={showColors ? "default" : "outline"}
                onClick={() => setShowColors(!showColors)}
                className={showColors ? "bg-primary text-primary-foreground" : "text-foreground"}
              >
                {(t.game as any).showColors || '显示黑白'}
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
            ) : gameType === 'mono' ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleUndo}
                  disabled={!canUndo || isAIThinking}
                  className="text-foreground"
                >
                  {t.game.undo}
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePass}
                  disabled={!isPlayerTurn || isAIThinking}
                  className="text-foreground"
                >
                  {t.game.pass}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleJudge}
                  disabled={gameState.status !== 'playing' || isAIThinking}
                  className="text-primary"
                >
                  {t.game.judge}
                </Button>
              </>
            ) : gameType === 'amnesia' ? (
              <>
                <Button
                  variant={showColors ? "default" : "outline"}
                  onClick={() => setShowColors(!showColors)}
                  className={showColors ? "bg-primary text-primary-foreground" : "text-foreground"}
                >
                  {(t.game as any).recallPast || '回忆过去'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUndo}
                  disabled={!canUndo || isAIThinking}
                  className="text-foreground"
                >
                  {t.game.undo}
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePass}
                  disabled={!isPlayerTurn || isAIThinking}
                  className="text-foreground"
                >
                  {t.game.pass}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleJudge}
                  disabled={gameState.status !== 'playing' || isAIThinking}
                  className="text-primary"
                >
                  {t.game.judge}
                </Button>
              </>
            ) : (
              <>
                {gameType !== 'mono' && (
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
                  disabled={(gameType === 'tricolor' || gameType === 'line') ? isAIThinking : (gameState.status !== 'playing' || isAIThinking)}
                  className="text-primary"
                >
                  {t.game.judge}
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
                disabled={(gameType === 'tricolor' ? (gameState.status && gameState.status !== 'playing') : gameState.status !== 'playing') || isAIThinking}
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

      {/* Resign Confirmation Dialog for Tricolor Go */}
      <Dialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认认输</DialogTitle>
            <DialogDescription>
              {gameType === 'tricolor' && gameState.currentPlayer && (
                <span>
                  {gameState.currentPlayer === 'black' ? '黑方' : gameState.currentPlayer === 'white' ? '白方' : '绿方'}认输后，其他两方将继续比赛。确定要认输吗？
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResignDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmResign}>
              确认认输
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
