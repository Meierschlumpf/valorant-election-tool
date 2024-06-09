import { valorantMaps } from "@/app/maps";
import { z } from "zod";

export const voteMessageSchema = z.object({
  type: z.literal("vote"),
  token: z.string(),
  compositionId: z.number(),
  data: z.object({
    kind: z.enum(["ban", "selection"]),
    by: z.enum(["first", "second", "computer"]),
    map: z.enum(valorantMaps),
  }),
});

export const roleMessageSchema = z.object({
  type: z.literal("role"),
  token: z.string(),
  compositionId: z.number(),
  data: z.object({
    role: z.enum(["attack", "defense"]),
    map: z.enum(valorantMaps),
    by: z.enum(["first", "second"]),
  }),
});

export const messageSchema = voteMessageSchema.or(roleMessageSchema);
export const fromServerMessageSchema = voteMessageSchema.omit({ token: true }).or(roleMessageSchema.omit({ token: true }));
