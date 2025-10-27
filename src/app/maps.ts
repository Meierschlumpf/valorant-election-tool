export const valorantMaps = [
  "abyss",
  "bind",
  "corrode",
  "haven",
  "pearl",
  "split",
  "sunset",
] as const;
export type ValorantMap = (typeof valorantMaps)[number];
