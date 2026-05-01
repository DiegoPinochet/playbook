import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  toast,
} from "@playbook/ui";
import type { PlayerActionReportRow } from "@playbook/business-logic";
import { AppShell } from "@/_components/app-shell";
import { useSettingsStore } from "@/_stores/settings.store";
import { useOpponentsStore } from "@/_stores/opponents.store";

export function PlayerReportPage() {
  const { opponentSlug, matchSlug } = useParams<{
    opponentSlug: string;
    matchSlug: string;
  }>();
  const { settings } = useSettingsStore();
  const { opponents, load: loadOpponents } = useOpponentsStore();
  const [playersRaw, setPlayersRaw] = useState("7");
  const [report, setReport] = useState<PlayerActionReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const opponent = opponents.find((o) => o.slug === opponentSlug);
  const platform = settings.platformFolder;

  useEffect(() => {
    if (platform && opponents.length === 0) void loadOpponents(platform);
  }, [platform, opponents.length, loadOpponents]);

  const playerNumbers = useMemo(
    () =>
      playersRaw
        .split(/[\s,]+/)
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isFinite(n) && n > 0 && n < 100),
    [playersRaw]
  );

  async function run() {
    if (!platform || !opponentSlug || !matchSlug) return;
    setLoading(true);
    try {
      const rows = await window.api.players.report(platform, opponentSlug, matchSlug, playerNumbers);
      setReport(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Report failed");
    } finally {
      setLoading(false);
    }
  }

  if (!platform || !opponentSlug || !matchSlug) return null;

  return (
    <AppShell
      crumbs={[
        { label: "Opponents", to: "/opponents" },
        { label: opponent?.name ?? opponentSlug, to: `/opponents/${opponentSlug}` },
        { label: "Player report" },
      ]}
    >
      <div className="w-full overflow-auto p-6">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Player action report</CardTitle>
            <CardDescription>
              Enter one or more jersey numbers (comma-separated) to summarize their tagged actions in
              this match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={playersRaw}
                onChange={(e) => setPlayersRaw(e.target.value)}
                placeholder="7, 12, 9"
                className="max-w-xs"
              />
              <Button onClick={run} disabled={loading || playerNumbers.length === 0}>
                {loading ? "Running…" : "Run report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {report.map((row) => (
            <Card key={row.playerNumber}>
              <CardHeader>
                <CardTitle>#{row.playerNumber}</CardTitle>
                <CardDescription>{row.totalClips} clips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(row.countsByTag)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tagId, count]) => (
                      <Badge key={tagId} variant="outline">
                        {tagId} · {count}
                      </Badge>
                    ))}
                  {Object.keys(row.countsByTag).length === 0 && (
                    <span className="text-xs text-muted-foreground">No tagged actions.</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
