/**
 * Home Screen - 完全照搬原LineGo app
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Language } from "@/lib/i18n/translations";
import { useLocation } from "wouter";

type GameMode = 'ai' | 'pvp';
type GameType = 'standard' | 'line' | 'mono' | 'toroid' | 'magnetic' | 'tricolor' | 'amnesia' | 'canvas';
type BoardSize = '9x9' | '13x13';

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const [gameType, setGameType] = useState<GameType>('standard');
  const [boardSize, setBoardSize] = useState<BoardSize>('9x9');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');

  const handleGameTypeChange = (type: GameType) => {
    // 如果切换到线性围棋、三色围棋或画布模式，自动选择13路
    if (type === 'line' || type === 'tricolor' || type === 'canvas') {
      setGameType(type);
      setBoardSize('13x13');
    }
    // 如果切换到不支持人机对战的模式且当前是人机对战，自动切换到双人对战
    else {
      setGameType(type);
      // 只有line支持AI，其他模式切换为pvp
      if (gameMode === 'ai') {
        setGameMode('pvp');
      }
    }
  };

  const handleStartGame = () => {
    setLocation(`/game/${gameType}/${boardSize}/${gameMode}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6">
      <div className="flex flex-col items-center justify-start w-full max-w-md gap-5 pt-2 pb-24">
        {/* Logo */}
        <div className="flex items-center mb-2 mt-0">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/jULnBYNiDfWotanv.png" alt="围棋疯人院" className="w-[160px] h-[160px]" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mt-0 mb-5 h-10 leading-10">
          {t.home.title}
        </h1>

        {/* Game Type Dropdown */}
        <div className="w-full h-12 flex flex-row items-center gap-2.5">
          <label className="text-base font-medium text-muted-foreground w-24 whitespace-nowrap overflow-hidden text-ellipsis">
            {t.home.gameType}:
          </label>
          <Select value={gameType} onValueChange={(v) => handleGameTypeChange(v as GameType)}>
            <SelectTrigger className="flex-1 bg-card border-primary text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="standard">{t.home.standardGo}</SelectItem>
              <SelectItem value="line">{t.home.lineGo}</SelectItem>
              <SelectItem value="mono">{t.home.monoGo}</SelectItem>
              <SelectItem value="toroid">{t.home.toroidGo}</SelectItem>
              <SelectItem value="magnetic">{t.home.magneticGo}</SelectItem>
              <SelectItem value="tricolor">{t.home.tricolorGo}</SelectItem>
              <SelectItem value="amnesia">{t.home.amnesiaGo}</SelectItem>
              <SelectItem value="canvas">{t.home.canvasGo}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Board Size Selector */}
        <div className="flex flex-row items-center w-full h-12 gap-2.5">
          <label className="text-base font-medium text-muted-foreground w-24">
            {t.home.boardSize}:
          </label>
          <div className="flex flex-row gap-2.5 flex-1">
            {gameType !== 'line' && gameType !== 'tricolor' && gameType !== 'canvas' && (
              <Button
                variant="outline"
                className={`flex-1 h-12 px-4 rounded-lg border ${
                  boardSize === '9x9' ? 'bg-primary text-background border-primary' : 'border-border text-foreground'
                }`}
                onClick={() => setBoardSize('9x9')}
              >
                {t.home.size9x9}
              </Button>
            )}
            <Button
              variant="outline"
              className={`flex-1 h-12 px-4 rounded-lg border ${
                boardSize === '13x13' ? 'bg-primary text-background border-primary' : 'border-border text-foreground'
              }`}
              onClick={() => setBoardSize('13x13')}
            >
              {t.home.size13x13}
            </Button>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="flex flex-row items-center w-full h-12 gap-2.5">
          <label className="text-base font-medium text-muted-foreground w-24">
            {t.home.gameMode}:
          </label>
          <div className="flex flex-row gap-2.5 flex-1">
            {gameType === 'tricolor' ? (
              <Button
                variant="outline"
                className="flex-1 h-12 px-4 rounded-lg border bg-primary text-background border-primary"
              >
                {t.home.threePK}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className={`flex-1 h-12 px-4 rounded-lg border ${
                    gameMode === 'pvp' ? 'bg-primary text-background border-primary' : 'border-border text-foreground'
                  }`}
                  onClick={() => setGameMode('pvp')}
                >
                  {gameType === 'canvas' ? t.home.solo : t.home.pvp}
                </Button>
                {gameType === 'line' && (
                  <Button
                    variant="outline"
                    className={`flex-1 h-12 px-4 rounded-lg border ${
                      gameMode === 'ai' ? 'bg-primary text-background border-primary' : 'border-border text-foreground'
                    }`}
                    onClick={() => setGameMode('ai')}
                  >
                    {t.home.vsAI}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex flex-row items-center w-full h-12 gap-2.5">
          <label className="text-base font-medium text-muted-foreground w-24">
            {t.home.language}:
          </label>
          <div className="flex flex-row gap-2.5 flex-1">
            <Button
              variant="outline"
              className={`flex-1 h-12 px-4 rounded-lg border ${
                language === 'zh' ? 'bg-primary text-background border-primary' : 'border-border text-foreground'
              }`}
              onClick={() => setLanguage('zh')}
            >
              中文
            </Button>
            <Button
              variant="outline"
              className={`flex-1 h-12 px-4 rounded-lg border ${
                language === 'en' ? 'bg-primary text-background border-primary' : 'border-border text-foreground'
              }`}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
          </div>
        </div>

        {/* Start Game Button */}
        <Button
          className="w-full py-4 rounded-xl text-lg font-bold mt-2.5 bg-primary text-background"
          onClick={handleStartGame}
        >
          {t.home.startGame}
        </Button>

        {/* Version */}
        <p className="text-xs text-muted-foreground mt-2.5">
          {t.home.version} 1.0.0
        </p>
      </div>
    </div>
  );
}
