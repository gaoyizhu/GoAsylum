/**
 * Home Screen - 完全照搬原LineGo app
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Language } from "@/lib/i18n/translations";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type GameMode = 'ai' | 'pvp';
type GameType = 'standard' | 'line' | 'mono' | 'toroid' | 'magnetic' | 'tricolor' | 'amnesia' | 'canvas';
type BoardSize = '9x9' | '13x13' | '19x19';

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const [gameType, setGameType] = useState<GameType>('standard');
  const [boardSize, setBoardSize] = useState<BoardSize>('9x9');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

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
      {/* 意见箱 - 左上角 */}
      <button
        onClick={() => setShowFeedback(true)}
        className="fixed top-4 left-4 z-50 group hover:scale-105 transition-all duration-200"
        aria-label="意见箱"
      >
        <div className="flex flex-col items-center gap-0.5 bg-background px-1.5 py-1 rounded-md">
          <img 
            src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/qwBumg6tipzmXEO3kEggmT_1771410887219_na1fn_ZmVlZGJhY2stYm94LXNpbXBsZQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L3F3QnVtZzZ0aXB6bVhFTzNrRWdnbVRfMTc3MTQxMDg4NzIxOV9uYTFmbl9abVZsWkdKaFkyc3RZbTk0TFhOcGJYQnNaUS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Rt3CTndehFZ3z7FdwaJN3hnot2X3HyFMJeHj1RnKZ6vLfVDeWDVolL1x26BjjURg7YpIop3qe5M~cT7XT9XgOVrblkJlZll84Sq96BH0tFlKN766NWSryKJ-WCIJ0ZHvqnOS1TeeutRB3OMAFIq0vbR3JJ9LR18jRyjwp~uHiGK8WNG6tO9cg0VKX68IdmzfJxNVhmhx3hy8KAmFaUXjXnwiClTErjij-U9aa6fR9j~Cj52Dkiyzu~xUGTsFyL1~S6CAR1d2U-pyjq8eW0d4RaizLjFQC3mGo47EmHYvx12RDyi2KGX~id8c5y7OeMIQ2aqascov~BBvjDGr~5F-CQ__"
            alt="意见箱" 
            className="w-5 h-5 drop-shadow-sm"
          />
          <span className="text-foreground text-[9px] font-bold tracking-wide">
            意见箱
          </span>
        </div>
      </button>

      {/* 意见反馈对话框 */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">💌 意见箱</DialogTitle>
            <DialogDescription>
              欢迎分享您的想法和建议，帮助我们改进围棋疯人院！
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请输入您的意见或建议..."
              className="w-full min-h-[120px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowFeedback(false);
                setFeedback('');
              }}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                if (feedback.trim()) {
                  // TODO: 这里可以添加实际的提交逻辑
                  alert('感谢您的反馈！我们会认真考虑您的建议。');
                  setShowFeedback(false);
                  setFeedback('');
                }
              }}
              disabled={!feedback.trim()}
            >
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
