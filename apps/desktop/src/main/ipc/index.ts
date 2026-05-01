import { registerSettingsHandlers } from "./settings.ipc";
import { registerOpponentsHandlers } from "./opponents.ipc";
import { registerMatchesHandlers } from "./matches.ipc";
import { registerClipsHandlers } from "./clips.ipc";
import { registerVideoHandlers } from "./video.ipc";
import { registerPlayersHandlers } from "./players.ipc";
import { registerAnnotationsHandlers } from "./annotations.ipc";

export function registerIpcHandlers(): void {
  registerSettingsHandlers();
  registerOpponentsHandlers();
  registerMatchesHandlers();
  registerClipsHandlers();
  registerVideoHandlers();
  registerPlayersHandlers();
  registerAnnotationsHandlers();
}
