import { db } from "@/db";
import { compositions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getTokensAsync = (compositionId: number) =>
  db.query.compositions.findFirst({
    where: eq(compositions.id, compositionId),
    columns: {
      tokenTeam1: true,
      tokenTeam2: true,
    },
  });
