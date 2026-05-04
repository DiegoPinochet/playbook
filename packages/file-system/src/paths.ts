import { join } from "node:path";

export const opponentDir = (platform: string, opponentSlug: string) => join(platform, opponentSlug);

export const opponentMetaFile = (platform: string, opponentSlug: string) =>
  join(opponentDir(platform, opponentSlug), "opponent.json");

export const matchDir = (platform: string, opponentSlug: string, matchSlug: string) =>
  join(opponentDir(platform, opponentSlug), matchSlug);

export const matchMetaFile = (platform: string, opponentSlug: string, matchSlug: string) =>
  join(matchDir(platform, opponentSlug, matchSlug), "match.json");

export const clipsDir = (platform: string, opponentSlug: string, matchSlug: string) =>
  join(matchDir(platform, opponentSlug, matchSlug), "clips");

export const clipFile = (
  platform: string,
  opponentSlug: string,
  matchSlug: string,
  clipId: string
) => join(clipsDir(platform, opponentSlug, matchSlug), `${clipId}.json`);

export const annotationsDir = (platform: string, opponentSlug: string, matchSlug: string) =>
  join(matchDir(platform, opponentSlug, matchSlug), "annotations");

export const annotationFile = (
  platform: string,
  opponentSlug: string,
  matchSlug: string,
  annotationId: string
) => join(annotationsDir(platform, opponentSlug, matchSlug), `${annotationId}.json`);

export const annotationThumbnail = (
  platform: string,
  opponentSlug: string,
  matchSlug: string,
  fileName: string
) => join(annotationsDir(platform, opponentSlug, matchSlug), fileName);

export const playersFile = (platform: string, opponentSlug: string, matchSlug: string) =>
  join(matchDir(platform, opponentSlug, matchSlug), "players.json");

export const platformConfigFile = (platform: string) => join(platform, "platform.json");

export const globalTagsFile = (platform: string) => join(platform, "tags.json");

export const settingsFile = (userDataDir: string) => join(userDataDir, "settings.json");
