import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster, TooltipProvider } from "@playbook/ui";
import { useSettingsStore } from "./_stores/settings.store";
import { OnboardingPage } from "./app/onboarding/page";
import { OpponentsPage } from "./app/opponents/page";
import { OpponentDetailPage } from "./app/opponents/opponent-detail.page";
import { MatchEditorPage } from "./app/matches/match-editor.page";
import { PlayerReportPage } from "./app/matches/player-report.page";

export function App() {
  const { load, ready, settings } = useSettingsStore();

  useEffect(() => {
    void load();
  }, [load]);

  if (!ready) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              settings.platformFolder ? (
                <Navigate to="/opponents" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/opponents" element={<OpponentsPage />} />
          <Route path="/opponents/:opponentSlug" element={<OpponentDetailPage />} />
          <Route
            path="/opponents/:opponentSlug/matches/:matchSlug"
            element={<MatchEditorPage />}
          />
          <Route
            path="/opponents/:opponentSlug/matches/:matchSlug/players"
            element={<PlayerReportPage />}
          />
        </Routes>
      </HashRouter>
      <Toaster />
    </TooltipProvider>
  );
}
