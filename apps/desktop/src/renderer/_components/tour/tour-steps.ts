import type { Step } from "react-joyride";
import { TAG_GROUP_LABELS } from "@playbook/business-logic/pure";

/** Real user actions the tour can wait for. Emitted by the components that own each interaction. */
export type TourSignal =
  | "in-marked"
  | "out-marked"
  | "dialog-opened"
  | "tag-selected"
  | "clip-saved"
  | "notes-opened";

export type TourStepDef = Step & {
  data: {
    /** When set, the step advances only once this signal fires — no Next button. */
    awaits?: TourSignal;
    /** Hint shown in place of the Next button on a gated step. */
    nudge?: string;
  };
};

export const TOUR_STEPS: TourStepDef[] = [
  {
    target: "body",
    placement: "center",
    title: "Your match is in",
    content:
      "Let's cut one clip together — about a minute. You can leave any time with Skip tour.",
    data: {},
  },
  {
    target: '[data-tour="transport"]',
    placement: "top",
    title: "Find something worth keeping",
    content:
      "Play, or jump 10 seconds at a time with ← and →. Space toggles playback. Park the video just before a passage you'd want to show the squad.",
    data: {},
  },
  {
    target: '[data-tour="mark-in"]',
    placement: "top",
    title: "Mark the start",
    content:
      "A clip is only a pair of timestamps — your source video is never touched or re-encoded, so cutting is free and undoable.",
    data: { awaits: "in-marked", nudge: "Press I, or click Mark in" },
  },
  {
    target: '[data-tour="mark-out"]',
    placement: "top",
    title: "Mark the end",
    content:
      "The REC dot up top turns red while a cut is open. Let a few seconds run, then close it.",
    data: { awaits: "out-marked", nudge: "Press O, or click Mark out" },
  },
  {
    target: '[data-tour="add-clip"]',
    placement: "top",
    title: "Open the clip",
    content: "This is where the clip gets its name and its tags.",
    data: { awaits: "dialog-opened", nudge: "Press Enter, or click + Clip" },
  },
  {
    target: '[data-tour="clip-title"]',
    placement: "right",
    title: "Name it like you'd say it",
    content:
      'Titles are searchable later. "Lineout drive off the top" beats "Clip 3" when you\'re building a session at 11pm.',
    data: {},
  },
  {
    target: '[data-tour="clip-tags"]',
    placement: "right",
    title: "Tags are how you find film again",
    content: `Tags come in groups: ${TAG_GROUP_LABELS["set-piece"]}, ${TAG_GROUP_LABELS.phase}, ${TAG_GROUP_LABELS.outcome}, ${TAG_GROUP_LABELS.team}. Stack several on one clip — "Lineout" + "Rivals" + "Turnover" is a question you can ask of a whole season. Colors carry through to the timeline, so a tagged match is readable at a glance.`,
    data: { awaits: "tag-selected", nudge: "Pick at least one tag" },
  },
  {
    target: '[data-tour="clip-players"]',
    placement: "right",
    title: "Who was involved",
    content:
      "Shirt numbers, comma separated. These feed the player report, which totals every action a number appears in across the match.",
    data: {},
  },
  {
    target: '[data-tour="clip-save"]',
    placement: "top",
    title: "Save it",
    content:
      "The clip lands on the timeline in its tag colors and in the list on the right — click either one to jump straight back to it.",
    data: { awaits: "clip-saved", nudge: "Click Save clip" },
  },
  {
    target: '[data-tour="notes-toggle"]',
    placement: "bottom",
    title: "Notes live alongside the film",
    content: "One more thing worth knowing about.",
    data: { awaits: "notes-opened", nudge: "Open notes — click here, or press ⌘J" },
  },
  {
    target: '[data-tour="notes-panel"]',
    placement: "left",
    title: "Scouting notes, per opponent",
    content:
      "Markdown, saved against the opponent rather than this match — so tendencies you spot in October are still here in March. It follows you across every match for this team.",
    data: {},
  },
  {
    target: "body",
    placement: "center",
    title: "That's the loop",
    content:
      "Mark in, mark out, tag, save. Still to find: Player report (top right) totals actions by shirt number · Export playlist stitches every filtered clip into one file · the star icon flags clips for review · search and the tag rail narrow a long match down fast · and I / O / Space / ↵ / S do all of this without the mouse.",
    data: {},
  },
];
