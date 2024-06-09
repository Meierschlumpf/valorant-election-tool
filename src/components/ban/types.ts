import { ValorantMap } from "@/app/maps";

export type By = "first" | "second" | "computer";

export interface Vote {
  kind: "ban" | "selection";
  by: By;
  map: ValorantMap;
}

export interface Role {
  role: "attack" | "defense";
  map: ValorantMap;
  by: Omit<By, "computer">;
}

export type MatchType = "normal" | "final";

export type Section = "select-first" | "select-second" | "ban-first" | "ban-second" | "ready" | "select-role-second" | "select-role-first";
