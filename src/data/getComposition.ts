import { db } from "@/db";
import { compositions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCompositionAsync = (id: number) => {
  return db.query.compositions.findFirst({
    where: eq(compositions.id, id),
    with: {
      team1: true,
      team2: true,
      mapStates: {
        with: {
          attacker: true,
        },
      },
    },
    columns: {
      tokenTeam1: false,
      tokenTeam2: false,
    },
  });
};

export type Composition = Exclude<Awaited<ReturnType<typeof getCompositionAsync>>, undefined>;
