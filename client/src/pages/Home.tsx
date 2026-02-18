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
type BoardSize = '9x9' | '13x13' | '19x19';

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const [gameType, setGameType] = useState<GameType>('standard');
  const [boardSize, setBoardSize] = useState<BoardSize>('9x9');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');


  const handleGameTypeChange = (type: GameType) => {
    setGameType(type);
    
    // 一根筋和五彩画布默认13路
    if (type === 'line' || type === 'canvas') {
      setBoardSize('13x13');
    }
    
    // 所有模式都只支持pvp
    if (gameMode === 'ai') {
      setGameMode('pvp');
    }
  };

  const handleStartGame = () => {
    setLocation(`/game/${gameType}/${boardSize}/${gameMode}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6 relative">
      {/* 右上角图标组 - 响应式：桌面端横排，移动端竖排+缩小 */}
      <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50 flex flex-col md:flex-row gap-1.5 md:gap-3">
        {/* 院长信箱 */}
        <button
          onClick={() => alert('院长信箱功能开发中...')}
          className="group flex flex-col items-center gap-0.5 hover:scale-105 transition-all duration-200"
          aria-label="院长信箱"
        >
          <img 
            src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/HwbditMyvNwH7QXUbzlhiJ-img-2_1771416714000_na1fn_bWFpbGJveC1pY29u.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0h3YmRpdE15dk53SDdRWFViemxoaUotaW1nLTJfMTc3MTQxNjcxNDAwMF9uYTFmbl9iV0ZwYkdKdmVDMXBZMjl1LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=v0EkEDqWiaw1mxsXH32uj2lka52FfSIDrbRHVL~muCXMmjo5CyhwnLL6MBGFBGwDgsy436abTEoptyDX2ZI0n32odZsgdOrbB-pmOHUX4oIzd21UXnJn7Wqjk9riQJ0Fv85y95SuWKG6xmbAoLE3RmFgQT0EFdPYHbO58K8RMw-~zQAuqlQ9zMihhfoDerlny4tFpK3TNaN43E3~rber3CQ3wZGBVVXGX0xbDGXrTIDGVy51NO9wsjaW-4jtQMN-Yd8Mk0Xc8DdZ1Mdf5nT4E0sx54yk-ecROtsxflvjHf8sT~eQQezok9Itjkz0nZl92tm4um4RD3ctYT4vphEEvw__"
            alt="院长信箱" 
            className="w-8 h-8 md:w-11 md:h-11"
          />
          <span className="text-[9px] md:text-[10px] font-medium text-foreground">院长信箱</span>
        </button>

        {/* 诊费 */}
        <button
          onClick={() => alert('诊费功能开发中...')}
          className="group flex flex-col items-center gap-0.5 hover:scale-105 transition-all duration-200"
          aria-label="诊费"
        >
          <img 
            src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/HwbditMyvNwH7QXUbzlhiJ-img-1_1771416712000_na1fn_ZmVlLWljb24.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0h3YmRpdE15dk53SDdRWFViemxoaUotaW1nLTFfMTc3MTQxNjcxMjAwMF9uYTFmbl9abVZsTFdsamIyNC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Jw2IbKXcs64Wv6RDdC5kLta7LJGV1SOuWCAm10Kr-jxYpQBN~Z6cOypD8IfZ0v3isgPvmDgQEgGQZlAigiHjB9TCh8s~GBtHqu5Zvx2erxERFeNKEhj-xpQu7ttes6qniL742tFllS6PXAENkHpMreD4KkXgy6k7YBeC0Z92dm8zugpOOZj7U7lMS9PIM9I4qX6Bd-LYrbMfVn3yblCXh1PBZn334mp1R-~CT~ppfTf-kR6Nz~elW9rxLhDX63QJzrQ1~pf4~~ne9SuLCv2QVZnpWqHpDxNPh~p6d~fRUOqatshtAQy7wtlRWcYK31xipBOJWXI4wNPS4ZoteUHtfA__"
            alt="诊费" 
            className="w-8 h-8 md:w-11 md:h-11"
          />
          <span className="text-[9px] md:text-[10px] font-medium text-foreground">诊费</span>
        </button>
      </div>


      <div className="flex flex-col items-center justify-start w-full max-w-md gap-5 pt-2 pb-24">
        {/* Logo */}
        <div className="flex items-center mb-2 mt-0">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/dExakWQPIIUJHfMd.jpg" alt="围棋疯人院" className="w-[160px] h-[160px]" />
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
            {gameType !== 'line' && gameType !== 'canvas' && (
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
            {(gameType === 'line' || gameType === 'canvas') && (
              <Button
                variant="outline"
                className={`flex-1 h-12 px-4 rounded-lg border ${
                  boardSize === '19x19' ? 'bg-primary text-background border-primary' : 'border-border text-foreground'
                }`}
                onClick={() => setBoardSize('19x19')}
              >
                19{language === 'zh' ? '路' : ''}
              </Button>
            )}
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
                  className="flex-1 h-12 px-4 rounded-lg border bg-primary text-background border-primary"
                >
                  {gameType === 'canvas' ? t.home.solo : t.home.pvp}
                </Button>
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
          className="w-full h-12 rounded-xl text-lg font-bold mt-2.5 bg-primary text-background"
          onClick={handleStartGame}
        >
          {t.home.startGame}
        </Button>


      </div>
    </div>
  );
}
