import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./lib/i18n/language-context";
import Home from "./pages/Home";
import GameStandard from "./pages/GameStandard";
import GameLine from "./pages/GameLine";
import GameMono from "./pages/GameMono";
import GameToroid from "./pages/GameToroid";
import GameMagnetic from "./pages/GameMagnetic";
import GameTricolor from "./pages/GameTricolor";
import GameAmnesia from "./pages/GameAmnesia";
import GameCanvas from "./pages/GameCanvas";
import Settings from "./pages/Settings";
import Rules from "./pages/Rules";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/game/standard/:size/:mode" component={GameStandard} />
      <Route path="/game/line/:size/:mode" component={GameLine} />
      <Route path="/game/mono/:size/:mode" component={GameMono} />
      <Route path="/game/toroid/:size/:mode" component={GameToroid} />
      <Route path="/game/magnetic/:size/:mode" component={GameMagnetic} />
      <Route path="/game/tricolor/:size/:mode" component={GameTricolor} />
      <Route path="/game/amnesia/:size/:mode" component={GameAmnesia} />
      <Route path="/game/canvas/:size/:mode" component={GameCanvas} />
      <Route path="/settings" component={Settings} />
      <Route path="/rules" component={Rules} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
