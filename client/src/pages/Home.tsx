/*
 * Wabi-Sabi Design Philosophy Applied:
 * - Asymmetric layout with golden ratio spacing
 * - Natural textures and warm earth tones
 * - Generous whitespace for contemplative experience
 * - Gentle hover effects reflecting impermanence
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n/language-context";
import { Settings, BookOpen } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type GameType = 'standard' | 'line' | 'mono' | 'toroid' | 'magnetic' | 'tricolor' | 'amnesia' | 'canvas';
type BoardSize = '9x9' | '13x13';
type GameMode = 'vsAI' | 'pvp' | 'solo' | 'threePlayers' | 'threePK';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [gameType, setGameType] = useState<GameType>('standard');
  const [boardSize, setBoardSize] = useState<BoardSize>('9x9');
  const [gameMode, setGameMode] = useState<GameMode>('vsAI');

  const handleStartGame = () => {
    // Route to appropriate game screen based on selections
    const route = `/game/${gameType}/${boardSize}/${gameMode}`;
    setLocation(route);
  };

  const gameTypeOptions: { value: GameType; label: string }[] = [
    { value: 'standard', label: t.home.standardGo },
    { value: 'line', label: t.home.lineGo },
    { value: 'mono', label: t.home.monoGo },
    { value: 'toroid', label: t.home.toroidGo },
    { value: 'magnetic', label: t.home.magneticGo },
    { value: 'tricolor', label: t.home.tricolorGo },
    { value: 'amnesia', label: t.home.amnesiaGo },
    { value: 'canvas', label: t.home.canvasGo },
  ];

  const boardSizeOptions: { value: BoardSize; label: string }[] = [
    { value: '9x9', label: t.home.size9x9 },
    { value: '13x13', label: t.home.size13x13 },
  ];

  const gameModeOptions: { value: GameMode; label: string }[] = [
    { value: 'vsAI', label: t.home.vsAI },
    { value: 'pvp', label: t.home.pvp },
  ];

  // Add threePlayers mode for tricolor
  if (gameType === 'tricolor') {
    gameModeOptions.push({ value: 'threePlayers', label: t.home.threePlayers });
  }

  // Add solo mode for canvas
  if (gameType === 'canvas') {
    gameModeOptions.push({ value: 'solo', label: t.home.solo });
  }

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
      <header className="container py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/Iz4HeWdS0k5BbrvPTSHBXR_1770622226814_na1fn_aW5rLXNwbGFzaC1ibGFjaw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0l6NEhlV2RTMGs1QmJydlBUU0hCWFJfMTc3MDYyMjIyNjgxNF9uYTFmbl9hVzVyTFhOd2JHRnphQzFpYkdGamF3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=C2qH4HTJz-RWTel7x~Cv-FyBgL1jveAmB0nVad6fke6~BdgeJDfEON59B-hTEaonPDnXLaBZN8tSk1BUj8DqMSS8rZrnQNIkCqDrj-LgTLP98DG-SvSJhzrH7qrCQPDy7xucNqqPAGDkq-0pCsB6fd93uTd-ekdjO5GjtgOH-NL78Ot5fDrPbgDv6dObI7jUvHCE19nqFr1f1T07qJUTTjQQ-k~GzAced1z3qkyQlGPO48-isxF9zqtq2QCNkvd0tLBlQa0X0b15Jr6asRBdARlPSuwa0SCuHO44Ag9yE2Se1-AEhtLK7jELMDHlK2kgV2RXq3VOHB7LYOqRCGbsBA__"
            alt="Ink splash"
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-3xl font-medium">{t.home.title}</h1>
        </div>
        <div className="flex gap-2">
          <Select value={language} onValueChange={(val) => setLanguage(val as 'zh' | 'en')}>
            <SelectTrigger className="w-32 ink-transition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation('/settings')}
            className="ink-transition hover:bg-accent/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation('/rules')}
            className="ink-transition hover:bg-accent/10"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content - Asymmetric Layout */}
      <main className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left side - Game Configuration (3/5 width on large screens) */}
          <div className="lg:col-span-3 space-y-8">
            <Card className="wabi-shadow-lg ink-transition hover:wabi-shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{t.home.startGame}</CardTitle>
                <CardDescription>{t.home.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Game Type Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t.home.gameType}
                  </label>
                  <Select value={gameType} onValueChange={(val) => setGameType(val as GameType)}>
                    <SelectTrigger className="ink-transition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gameTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Board Size Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t.home.boardSize}
                  </label>
                  <Select value={boardSize} onValueChange={(val) => setBoardSize(val as BoardSize)}>
                    <SelectTrigger className="ink-transition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {boardSizeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Game Mode Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t.home.gameMode}
                  </label>
                  <Select value={gameMode} onValueChange={(val) => setGameMode(val as GameMode)}>
                    <SelectTrigger className="ink-transition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gameModeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={handleStartGame}
                  className="w-full py-6 text-lg ink-transition hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {t.home.startGame}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Decorative Element (2/5 width on large screens) */}
          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center items-center space-y-8">
            <img 
              src="https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/Iz4HeWdS0k5BbrvPTSHBXR-img-4_1770622215000_na1fn_emVuLXN0b25lcw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0l6NEhlV2RTMGs1QmJydlBUU0hCWFItaW1nLTRfMTc3MDYyMjIxNTAwMF9uYTFmbl9lbVZ1TFhOMGIyNWxjdy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iAPZgu~Fh3lQDblo9TbYKDM6vhhGI6RoitvLUKD937OIsTf~cvq~I9ClVBGHTiAv9Hbm-F2pPCSU1XMAg9ait2UaO8xESfdO245WMezenKEggcR3dS2FeTv2vzamPr-1HRNxp7zyniGML19zX2LWpTC8WsRlmCOA6c4vqB9SMyii9bhwVWy77WXiXpniciPaKkLNNK9XFw7bQoTmYV9FG9ipS43XsplF84~VusMhhRVFqFj4g7cwrN5sNGNiLF5zpzAh4fMSiViynJpl7c9c55x2XLde8IRRLBCz67CmBb66z6n7q0vRBRjAcenzvYMr5duLGAb3c--h1dQtjcYzIg__"
              alt="Zen stones"
              className="w-48 h-48 object-contain opacity-60 ink-transition hover:opacity-80"
            />
            <p className="text-center text-muted-foreground text-sm max-w-xs leading-relaxed">
              {language === 'zh' 
                ? '在不完美中寻找美，在变化中感受永恒。'
                : 'Finding beauty in imperfection, sensing eternity in change.'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-8 text-center text-sm text-muted-foreground">
        <p>{t.home.version} 1.0.0</p>
      </footer>
    </div>
  );
}
