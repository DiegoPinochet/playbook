import type {
  AnnotationCreateInput,
  AnnotationEntity,
  ClipCreateInput,
  ClipEntity,
  ClipUpdateInput,
  CreateCustomTagInput,
  MatchEntity,
  OpponentCreateInput,
  OpponentEntity,
  OpponentUpdateInput,
  PlayerActionReportRow,
  Roster,
  SettingsEntity,
  TagEntity,
} from "@playbook/business-logic";

type CreateMatchPayload = {
  platform: string;
  opponentSlug: string;
  opponentId: string;
  title: string;
  date: string | null;
  venue: string | null;
  sourceVideoPath: string;
};

type ExportClipPayload = {
  platform: string;
  opponentSlug: string;
  matchSlug: string;
  videoFileName: string;
  startSec: number;
  endSec: number;
};

type ExportPlaylistPayload = {
  platform: string;
  opponentSlug: string;
  matchSlug: string;
  videoFileName: string;
  segments: Array<{ startSec: number; endSec: number }>;
};

type ThumbnailPayload = {
  platform: string;
  opponentSlug: string;
  matchSlug: string;
  videoFileName: string;
  timestampSec: number;
  outputFileName: string;
};

export interface PlaybookApi {
  settings: {
    get(): Promise<SettingsEntity>;
    pickPlatformFolder(): Promise<string | null>;
    setPlatformFolder(folder: string): Promise<SettingsEntity>;
  };
  opponents: {
    list(platform: string): Promise<OpponentEntity[]>;
    get(platform: string, id: string): Promise<OpponentEntity | null>;
    create(platform: string, input: OpponentCreateInput): Promise<OpponentEntity>;
    update(platform: string, input: OpponentUpdateInput): Promise<OpponentEntity>;
    delete(platform: string, id: string): Promise<void>;
  };
  matches: {
    list(platform: string, opponentSlug: string): Promise<MatchEntity[]>;
    get(platform: string, opponentSlug: string, matchId: string): Promise<MatchEntity | null>;
    create(payload: CreateMatchPayload): Promise<MatchEntity>;
    delete(platform: string, opponentSlug: string, matchId: string): Promise<void>;
    pickVideoFile(): Promise<string | null>;
  };
  clips: {
    list(platform: string, opponentSlug: string, matchSlug: string): Promise<ClipEntity[]>;
    create(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      input: ClipCreateInput
    ): Promise<ClipEntity>;
    update(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      input: ClipUpdateInput
    ): Promise<ClipEntity>;
    delete(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      clipId: string
    ): Promise<void>;
    listTags(platform: string, opponentSlug: string, matchSlug: string): Promise<TagEntity[]>;
    createCustomTag(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      input: CreateCustomTagInput
    ): Promise<TagEntity>;
  };
  players: {
    list(platform: string, opponentSlug: string, matchSlug: string): Promise<Roster>;
    upsert(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      roster: Roster
    ): Promise<void>;
    report(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      playerNumbers: number[]
    ): Promise<PlayerActionReportRow[]>;
  };
  annotations: {
    list(
      platform: string,
      opponentSlug: string,
      matchSlug: string
    ): Promise<AnnotationEntity[]>;
    save(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      input: AnnotationCreateInput
    ): Promise<AnnotationEntity>;
    delete(
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      id: string
    ): Promise<void>;
  };
  video: {
    exportClip(payload: ExportClipPayload): Promise<string | null>;
    exportPlaylist(payload: ExportPlaylistPayload): Promise<string | null>;
    thumbnail(payload: ThumbnailPayload): Promise<string>;
    probeDuration(absolutePath: string): Promise<number>;
  };
}

declare global {
  interface Window {
    api: PlaybookApi;
  }
}

export {};
