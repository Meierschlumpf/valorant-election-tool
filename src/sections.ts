import { MatchType, Section } from "./components/ban/types";
import { Composition } from "./data/getComposition";

export const mapTypeSections = {
  final: ["ban-first", "ban-second", "select-first", "select-role-second", "select-second", "select-role-first", "ban-first", "ban-second", "select-role-first", "ready"],
  normal: ["ban-first", "ban-second", "ban-first", "ban-second", "ban-first", "ban-second", "select-role-first", "ready"],
} satisfies Record<MatchType, Section[]>;

export const getCurrentSectionIndex = (composition: Pick<Composition, "type" | "mapStates">) => {
  if (composition.mapStates.length <= 2) return composition.mapStates.length; // first two bans
  if (composition.type === "normal" && composition.mapStates.length <= 5) {
    return composition.mapStates.length; // For first 6 items it's only bans
  }
  if (composition.type === "normal" && composition.mapStates.length === 6) {
    return 5;
  }
  if (composition.type === "normal" && composition.mapStates.length === 7 && composition.mapStates.at(6)?.attackerId === null) {
    return 6;
  }
  if (composition.type === "normal" && composition.mapStates.length === 7 && composition.mapStates.at(6)?.attackerId !== null) {
    return 7;
  }
  if (composition.type === "normal") return 7;

  if (composition.mapStates.length === 3 && composition.mapStates.at(2)?.attackerId === null) {
    return 3;
  }

  if (composition.mapStates.length === 3 && composition.mapStates.at(2)?.attackerId !== null) {
    return 4;
  }
  if (composition.mapStates.length === 4 && composition.mapStates.at(3)?.attackerId === null) {
    return 5;
  }

  if (composition.mapStates.length === 4 && composition.mapStates.at(3)?.attackerId !== null) {
    return 6;
  }
  if (composition.mapStates.length <= 6) {
    // computer selection does not matter
    return 7;
  }
  if (composition.mapStates.length === 7 && composition.mapStates.at(6)?.attackerId === null) {
    return 8;
  }

  return 9;
};
