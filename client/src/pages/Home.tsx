/**
 * Home Screen - 完全照搬原LineGo app
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Language } from "@/lib/i18n/translations";
import { useLocation } from "wouter";
import { FeedbackForm } from "@/components/FeedbackForm";
import DonationDialog from "@/components/DonationDialog";


type GameMode = 'ai' | 'pvp';
type GameType = 'standard' | 'line' | 'mono' | 'toroid' | 'magnetic' | 'tricolor' | 'amnesia' | 'canvas';
type BoardSize = '9x9' | '13x13' | '19x19';

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const [gameType, setGameType] = useState<GameType>('standard');
  const [boardSize, setBoardSize] = useState<BoardSize>('9x9');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);


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



      <div className="flex flex-col items-center justify-start w-full max-w-md gap-5 pt-0 pb-24">
        {/* Logo */}
        <div className="flex items-center mb-0 mt-0">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/dExakWQPIIUJHfMd.jpg" alt="围棋疯人院" className="w-[160px] h-[160px]" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mt-0 mb-2 h-10 leading-10">
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

        {/* 留言板、院长信箱和诊费随喜按钮 */}
        <div className="flex flex-row gap-4 mt-1 w-full justify-center items-end">
          {/* 留言板 */}
          <button
            onClick={() => setLocation('/message-board')}
            className="group flex flex-col items-center gap-1 hover:scale-105 transition-all duration-200"
            aria-label={t.home.messageBoard}
          >
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/FVdcxqyXFZNIawPb.png"
              alt={t.home.messageBoard} 
              className="w-10 h-10"
            />
            <span className="text-xs font-medium text-foreground text-center w-16 leading-tight h-8 flex items-start justify-center">{t.home.messageBoard}</span>
          </button>

          {/* 院长信箱 */}
          <button
            onClick={() => setFeedbackFormOpen(true)}
            className="group flex flex-col items-center gap-1 hover:scale-105 transition-all duration-200"
            aria-label={t.home.directorMailbox}
          >
            <img 
              src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/r27CSWsjU3cTTcCXsh901N_1771426336585_na1fn_bWFpbGJveC1pY29uLWxhcmdlLXYy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L3IyN0NTV3NqVTNjVFRjQ1hzaDkwMU5fMTc3MTQyNjMzNjU4NV9uYTFmbl9iV0ZwYkdKdmVDMXBZMjl1TFd4aGNtZGxMWFl5LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ZUL77YLLQu9h1s8b6ZmPaHCa3COO~0hcZWiclPI7FZQZ~FHxwfsmAB-gxkat~yeOMFVBUvcczwVl6D53XWQ467sPcAq-3RXvfESloOQicFwmsJi6YS3a4pMvSXljFGMyP7CXBw1bNxoPyB4gdYwGGNRSIlG3WlzLzY1cwx4cs~L1NHSxHBKo48uGN0-BoVEGZkhKZcbrycjL1LjxKpKafJW8l~yj~PiktTY5TdE5pRW8viKgWuKD4Hys-32IbjholWsVuOtH7SpcS9xRciPKo2T7xhPE3RrqqFzPAtgR40xRrNil7B204mLixmjYRQtbsMdzQ7FGc1lw7eCZDQ392A__"
              alt={t.home.directorMailbox} 
              className="w-8 h-8"
            />
            <span className="text-xs font-medium text-foreground text-center w-16 leading-tight h-8 flex items-start justify-center">{t.home.directorMailbox}</span>
          </button>

          {/* 下载APP - 暂时隐藏 */}
          {/* <button
            onClick={() => {
              setDialogMessage(t.home.appDev);
              setDialogOpen(true);
            }}
            className="group flex flex-col items-center gap-1 hover:scale-105 transition-all duration-200"
            aria-label={t.home.downloadApp}
          >
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/rVKaAzMHVINoMZse.png"
              alt={t.home.downloadApp} 
              className="w-8 h-8"
            />
            <span className="text-xs font-medium text-foreground text-center w-16 leading-tight h-8 flex items-start justify-center">{t.home.downloadApp}</span>
          </button> */}

          {/* 诊费随喜 */}
          <button
            onClick={() => setDonationDialogOpen(true)}
            className="group flex flex-col items-center gap-1 hover:scale-105 transition-all duration-200"
            aria-label={t.home.consultation}
          >
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/fRmVGBpxPNZVLvak.png"
              alt={t.home.consultation} 
              className="w-8 h-8"
            />
            <span className="text-xs font-medium text-foreground text-center w-16 leading-tight h-8 flex items-start justify-center">{t.home.consultation}</span>
          </button>
        </div>


      </div>

      {/* 自定义对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card text-card-foreground" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg">提示</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-base">{dialogMessage}</p>
          </div>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => setDialogOpen(false)}
              className="bg-primary text-primary-foreground px-8"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 院长信箱反馈表单 */}
      <FeedbackForm open={feedbackFormOpen} onOpenChange={setFeedbackFormOpen} />

      {/* 诊费随喜对话框 */}
      <DonationDialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen} />
    </div>
  );
}
