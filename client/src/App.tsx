import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./lib/i18n/language-context";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Settings from "./pages/Settings";
import Rules from "./pages/Rules";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/game/:type/:size/:mode" component={Game} />
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
