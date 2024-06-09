import { valorantMaps } from "@/app/maps";
import { Composition, getCompositionAsync } from "@/data/getComposition";
import { db } from "@/db";
import { compositions, mapStates } from "@/db/schema";
import { getCurrentSectionIndex, mapTypeSections } from "@/sections";
import { eq } from "drizzle-orm";
import type * as Party from "partykit/server";
import SuperJSON from "superjson";
import { z } from "zod";
import { messageSchema, roleMessageSchema, voteMessageSchema } from "./messages";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );
  }

  private async handleRoleMessage(message: z.infer<typeof roleMessageSchema>, senderId: string) {
    const composition = await getCompositionAsync(message.compositionId);

    if (!composition) {
      console.error(`Composition ${message.compositionId} not found`);
      return;
    }

    const currentSectionIndex = getCurrentSectionIndex(composition);
    const currentSection = mapTypeSections[composition.type][currentSectionIndex];
    if (currentSection === "ready") {
      console.error("Map selection has been completed");
      return;
    }

    if (currentSection !== "select-role-first" && currentSection !== "select-role-second") {
      console.error("Currently map vote is in progress, unable to select a role");
      return;
    }

    const tokens = await db.query.compositions.findFirst({
      where: eq(compositions.id, message.compositionId),
      columns: {
        tokenTeam1: true,
        tokenTeam2: true,
      },
    });

    if (!tokens) return;

    if (message.token !== tokens.tokenTeam1 && message.token !== tokens.tokenTeam2) {
      console.error("Invalid token provided");
      return;
    }

    const mapState = composition.mapStates.find((state) => state.map === message.data.map);

    if (!mapState) {
      console.error(`Unable to select role on map ${message.data.map} that has not been selected yet`);
      return;
    }

    if (mapState.kind === "ban") {
      console.error(`Unable to select role on banned map ${mapState.map}`);
      return;
    }

    if (mapState.attackerId !== null) {
      console.error(`Role has already been selected for map ${mapState.map}`);
      return;
    }

    const runAsync = async (attackerId: number) => await this.addRoleAndBroadcast(message, mapState.id, attackerId, senderId);

    if (currentSection === "select-role-first" && message.token === tokens.tokenTeam1) {
      await runAsync(message.data.role === "attack" ? composition.team1Id : composition.team2Id);
      return;
    }

    if (currentSection === "select-role-second" && message.token === tokens.tokenTeam2) {
      await runAsync(message.data.role === "attack" ? composition.team2Id : composition.team1Id);
      return;
    }

    console.error(`Invalid operation ${message.data.role} with section ${currentSection} or token of wrong team`);

    this.room.broadcast(SuperJSON.stringify(message), [senderId]); // Send it to all except the one that send it
  }

  private async addRoleAndBroadcast(message: z.infer<typeof roleMessageSchema>, mapStateId: number, attackerId: number, senderId: string) {
    try {
      await db
        .update(mapStates)
        .set({
          attackerId,
        })
        .where(eq(mapStates.id, mapStateId));
      const { token, ...returnData } = message; // Return data without token!
      this.room.broadcast(SuperJSON.stringify(returnData satisfies Omit<z.infer<typeof roleMessageSchema>, "token">), [senderId]); // Send it to all except the one that send it
    } catch (err) {
      console.error(err);
    }
  }

  private async handleVoteMessage(message: z.infer<typeof voteMessageSchema>, senderId: string) {
    const composition = await getCompositionAsync(message.compositionId);

    if (!composition) {
      console.error(`Composition ${message.compositionId} not found`);
      return;
    }

    const currentSectionIndex = getCurrentSectionIndex(composition);
    const currentSection = mapTypeSections[composition.type][currentSectionIndex];
    if (currentSection === "ready") {
      console.error("Map selection has been completed");
      return;
    }

    if (currentSection === "select-role-first" || currentSection === "select-role-second") {
      console.error("Currently role selection is in progress, unable to select a map");
      return;
    }

    const tokens = await db.query.compositions.findFirst({
      where: eq(compositions.id, message.compositionId),
      columns: {
        tokenTeam1: true,
        tokenTeam2: true,
      },
    });

    if (!tokens) return;

    if (message.token !== tokens.tokenTeam1 && message.token !== tokens.tokenTeam2) {
      console.error("Invalid token provided");
      return;
    }

    const runAsync = async () => await this.addVoteAndBroadcast(message, currentSectionIndex, composition, senderId);

    if (currentSection === "ban-first" && message.token === tokens.tokenTeam1 && message.data.kind === "ban") {
      await runAsync();
      return;
    }

    if (currentSection === "ban-second" && message.token === tokens.tokenTeam2 && message.data.kind === "ban") {
      await runAsync();
      return;
    }

    if (currentSection === "select-first" && message.token === tokens.tokenTeam1 && message.data.kind === "selection") {
      await runAsync();
      return;
    }

    if (currentSection === "select-second" && message.token === tokens.tokenTeam2 && message.data.kind === "selection") {
      await runAsync();
      return;
    }

    console.error(`Invalid operation ${message.data.kind} with section ${currentSection} or token of wrong team`);
  }

  private async addVoteAndBroadcast(message: z.infer<typeof voteMessageSchema>, currentSectionIndex: number, composition: Composition, senderId: string) {
    try {
      await db.insert(mapStates).values({
        map: message.data.map,
        kind: message.data.kind,
        compositionId: message.compositionId,
        by: message.data.by,
        attackerId: null,
      });
      const { token, ...returnData } = message; // Return data without token!
      this.room.broadcast(SuperJSON.stringify(returnData satisfies Omit<z.infer<typeof voteMessageSchema>, "token">), [senderId]); // Send it to all except the one that send it
    } catch (err) {
      console.error(err);
    }

    if ((currentSectionIndex === 7 && composition.type === "final") || (currentSectionIndex === 5 && composition.type === "normal")) {
      try {
        const computerMap = valorantMaps.find((map) => !composition.mapStates.some((state) => state.map === map) && message.data.map !== map);
        if (!computerMap) {
          throw "No computer map found!";
        }
        await db.insert(mapStates).values({
          map: computerMap,
          kind: "selection",
          compositionId: message.compositionId,
          by: "computer",
          attackerId: null,
        });
        this.room.broadcast(
          SuperJSON.stringify({
            data: {
              by: "computer",
              kind: "selection",
              map: computerMap,
            },
            compositionId: message.compositionId,
            type: "vote",
          } satisfies Omit<z.infer<typeof voteMessageSchema>, "token">),
          []
        ); // Send it to all as server has added it
      } catch (err) {
        console.error(err);
      }
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const result = messageSchema.safeParse(SuperJSON.parse(message));
    if (!result.success) return;

    switch (result.data.type) {
      case "role":
        this.handleRoleMessage(result.data, sender.id);
        break;
      case "vote":
        this.handleVoteMessage(result.data, sender.id);
        break;
    }

    console.log(`connection ${sender.id} sent message: ${message}`);
  }
}

Server satisfies Party.Worker;
