import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from "@playbook/ui";
import {
  ALL_SPORTS,
  SPORT_DESCRIPTIONS,
  SPORT_LABELS,
  type Sport,
} from "@playbook/business-logic/pure";
import { useSettingsStore } from "@/_stores/settings.store";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { settings, platformSport, pickAndSetPlatformFolder, setPlatformSport } =
    useSettingsStore();
  const [submitting, setSubmitting] = useState(false);

  const step: "folder" | "sport" = settings.platformFolder ? "sport" : "folder";

  async function handlePickFolder() {
    try {
      const folder = await pickAndSetPlatformFolder();
      if (folder) toast.success(`Platform folder set to ${folder}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not set platform folder");
    }
  }

  async function handlePickSport(sport: Sport) {
    setSubmitting(true);
    try {
      await setPlatformSport(sport);
      toast.success(`Sport set to ${SPORT_LABELS[sport]}`);
      navigate("/opponents");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not set sport");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            {step === "folder" ? "Welcome to Playbook" : "Choose your sport"}
          </CardTitle>
          <CardDescription>
            {step === "folder"
              ? "Pick a folder where Playbook will store your match data — opponents, video imports, clip metadata, and annotations."
              : "Tags and presets are tailored per sport. This selection is locked once you start tagging clips."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "folder" ? (
            <>
              <Button onClick={handlePickFolder} className="w-full">
                Choose platform folder
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                All data stays on your machine. Nothing is uploaded.
              </p>
            </>
          ) : (
            <div className="grid gap-2">
              {ALL_SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  disabled={submitting}
                  onClick={() => handlePickSport(sport)}
                  className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
                >
                  <span className="text-sm font-medium">{SPORT_LABELS[sport]}</span>
                  <span className="text-xs text-muted-foreground">
                    {SPORT_DESCRIPTIONS[sport]}
                  </span>
                </button>
              ))}
              <p className="mt-2 text-xs text-muted-foreground">
                Folder: <span className="font-mono">{settings.platformFolder}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
