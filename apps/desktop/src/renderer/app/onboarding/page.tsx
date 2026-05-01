import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, toast } from "@playbook/ui";
import { useSettingsStore } from "@/_stores/settings.store";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { pickAndSetPlatformFolder } = useSettingsStore();

  async function handlePick() {
    try {
      const folder = await pickAndSetPlatformFolder();
      if (folder) {
        toast.success(`Platform folder set to ${folder}`);
        navigate("/opponents");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not set platform folder");
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Playbook</CardTitle>
          <CardDescription>
            Pick a folder where Playbook will store your match data — opponents, video imports, clip
            metadata, and annotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePick} className="w-full">
            Choose platform folder
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            All data stays on your machine. Nothing is uploaded.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
