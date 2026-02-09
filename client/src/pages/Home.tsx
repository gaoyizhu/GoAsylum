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

  if (gameType === 'tricolor') {
    gameModeOptions.push({ value: 'threePlayers', label: t.home.threePlayers });
  }

  if (gameType === 'canvas') {
    gameModeOptions.push({ value: 'solo', label: t.home.solo });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">{t.home.title}</h1>
        <div className="flex gap-2">
          <Select value={language} onValueChange={(val) => setLanguage(val as 'zh' | 'en')}>
            <SelectTrigger className="w-32">
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
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation('/rules')}
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container py-12 max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t.home.startGame}</CardTitle>
            <CardDescription>{t.home.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">{t.home.gameType}</label>
              <Select value={gameType} onValueChange={(val) => setGameType(val as GameType)}>
                <SelectTrigger>
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

            {gameType !== 'line' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">{t.home.boardSize}</label>
                <Select value={boardSize} onValueChange={(val) => setBoardSize(val as BoardSize)}>
                  <SelectTrigger>
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
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium">{t.home.gameMode}</label>
              <Select value={gameMode} onValueChange={(val) => setGameMode(val as GameMode)}>
                <SelectTrigger>
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

            <Button 
              onClick={handleStartGame}
              className="w-full py-6 text-lg"
              size="lg"
            >
              {t.home.startGame}
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="container py-8 text-center text-sm text-muted-foreground">
        <p>{t.home.version} 1.0.0</p>
      </footer>
    </div>
  );
}
