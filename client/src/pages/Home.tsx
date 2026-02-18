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

        {/* 院长信箱、诊费随喜和下载APP按钮 */}
        <div className="flex flex-row gap-4 mt-1 w-full justify-center items-end">
          {/* 院长信箱 */}
          <button
            onClick={() => alert('院长信箱功能开发中...')}
            className="group flex flex-col items-center gap-1 hover:scale-105 transition-all duration-200"
            aria-label="院长信箱"
          >
            <img 
              src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/r27CSWsjU3cTTcCXsh901N_1771426336585_na1fn_bWFpbGJveC1pY29uLWxhcmdlLXYy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L3IyN0NTV3NqVTNjVFRjQ1hzaDkwMU5fMTc3MTQyNjMzNjU4NV9uYTFmbl9iV0ZwYkdKdmVDMXBZMjl1TFd4aGNtZGxMWFl5LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ZUL77YLLQu9h1s8b6ZmPaHCa3COO~0hcZWiclPI7FZQZ~FHxwfsmAB-gxkat~yeOMFVBUvcczwVl6D53XWQ467sPcAq-3RXvfESloOQicFwmsJi6YS3a4pMvSXljFGMyP7CXBw1bNxoPyB4gdYwGGNRSIlG3WlzLzY1cwx4cs~L1NHSxHBKo48uGN0-BoVEGZkhKZcbrycjL1LjxKpKafJW8l~yj~PiktTY5TdE5pRW8viKgWuKD4Hys-32IbjholWsVuOtH7SpcS9xRciPKo2T7xhPE3RrqqFzPAtgR40xRrNil7B204mLixmjYRQtbsMdzQ7FGc1lw7eCZDQ392A__"
              alt="院长信箱" 
              className="w-8 h-8"
            />
            <span className="text-xs font-medium text-foreground">院长信箱</span>
          </button>

          {/* 诊费随喜 */}
          <button
            onClick={() => alert('诊费功能开发中...')}
            className="group flex flex-col items-center gap-1 hover:scale-105 transition-all duration-200"
            aria-label="诊费随喜"
          >
            <img 
              src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/Bc1EQgiPRRTckxsyqh4BBn_1771424462933_na1fn_eXVhbi1pY29uLXNsYXRl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0JjMUVRZ2lQUlJUY2t4c3lxaDRCQm5fMTc3MTQyNDQ2MjkzM19uYTFmbl9lWFZoYmkxcFkyOXVMWE5zWVhSbC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=kjC37bG0cQ83LXoU2te0t9JWQGQVSNy8F-q8Z~8LkZr1CV6zRYhvf40fWqhnDfAwFX2dXn0jf6U8ICkHzhNXCdCRbqfC~ETs0UuEEygAcz6DCuyY-NMI2hUmjMG0fmF8dk4lwzokq6zo8DUg-RNxPofrNztwMoiZnM2DGAgU1bmTY-oZbk4LU7GkJ7XY2-7Y5tlhBRHVeAoUI9U56B7bCp3d6Q6wMN8QIpICSxrFY0xAwF9BLyGgNk8mYpZHB09rKWnnCuU0b4R~SCeFYC5hNKTGmiv5Wbrt~HE1fBxfe78gbzF0LFJN7LmHJG7K3RK4Sp6nTILNRLB-cz9JMp4Hyw__"
              alt="诊费随喜" 
              className="w-8 h-8"
            />
            <span className="text-xs font-medium text-foreground">诊费随喜</span>
          </button>

          {/* 下载APP */}
          <button
            onClick={() => alert('下载APP功能开发中...')}
            className="group flex flex-col items-center gap-1 hover:scale-105 transition-all duration-200"
            aria-label="下载APP"
          >
            <img 
              src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/G76S8Xct6E99qGstkHizxy_1771429689100_na1fn_ZG93bmxvYWQtYXBwLWljb24tdjM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0c3NlM4WGN0NkU5OXFHc3RrSGl6eHlfMTc3MTQyOTY4OTEwMF9uYTFmbl9aRzkzYm14dllXUXRZWEJ3TFdsamIyNHRkak0ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=LOloUkQVLYwerV-hUrxN5Y2aUXoTdR4s2u4jJafuH5K5tbqu5w276jDBgr3k2VP4jGu2lTDO4~G58pul6rBNOQRNOdMfTNSj6eLm5psEJCgnyRIksDXgYzRX~xkeWBGdwPdVoqCK0-EkijNtsaPk0zxykP7mux7fBI0knsqb6cqQHmLGlJdjIJlidIjkCko8aYpZMwWDMGvsbdiUNuNuoqJf11A~CgGKgf5xb2HEc1ZHpY3LziiVfiQ4i~UZvDTnmc9EU19g1rBcc4YTNP6Hri4VxIyiAX5bwtM~fG8J58Coc801EKzjIiosBzCRZ7LV4dOp0BhSL6vVHlaiq7~AWA__"
              alt="下载APP" 
              className="w-8 h-8"
            />
            <span className="text-xs font-medium text-foreground">下载APP</span>
          </button>
        </div>


      </div>
    </div>
  );
}
