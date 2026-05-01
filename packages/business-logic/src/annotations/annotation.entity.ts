import { z } from "zod";

const point = z.object({ x: z.number(), y: z.number() });

const arrowShape = z.object({
  type: z.literal("arrow"),
  from: point,
  to: point,
  color: z.string(),
  width: z.number().positive().default(3),
});

const circleShape = z.object({
  type: z.literal("circle"),
  center: point,
  radius: z.number().positive(),
  color: z.string(),
  width: z.number().positive().default(3),
});

const rectShape = z.object({
  type: z.literal("rect"),
  origin: point,
  width: z.number().positive(),
  height: z.number().positive(),
  color: z.string(),
  strokeWidth: z.number().positive().default(3),
});

const textShape = z.object({
  type: z.literal("text"),
  origin: point,
  text: z.string(),
  color: z.string(),
  fontSize: z.number().positive().default(18),
});

const freehandShape = z.object({
  type: z.literal("freehand"),
  points: z.array(point).min(2),
  color: z.string(),
  width: z.number().positive().default(3),
});

export const shapeSchema = z.discriminatedUnion("type", [
  arrowShape,
  circleShape,
  rectShape,
  textShape,
  freehandShape,
]);

export type Shape = z.infer<typeof shapeSchema>;

export const annotationSchema = z.object({
  id: z.string().uuid(),
  matchId: z.string().uuid(),
  clipId: z.string().uuid().nullable(),
  timestampSec: z.number().nonnegative(),
  shapes: z.array(shapeSchema).default([]),
  thumbnailFileName: z.string(),
  note: z.string().default(""),
  createdAt: z.string().datetime(),
});

export type AnnotationEntity = z.infer<typeof annotationSchema>;

export const annotationCreateInputSchema = z.object({
  matchId: z.string().uuid(),
  clipId: z.string().uuid().nullable().optional(),
  timestampSec: z.number().nonnegative(),
  shapes: z.array(shapeSchema).default([]),
  thumbnailFileName: z.string(),
  note: z.string().optional(),
});

export type AnnotationCreateInput = z.infer<typeof annotationCreateInputSchema>;
