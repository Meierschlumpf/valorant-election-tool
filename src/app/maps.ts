export const valorantMaps = [
  "sunset",
  "lotus" /*"pearl",*/ /*"fracture"*/ /*"breeze"*/,
  "icebox",
  /*"abyss",*/ "bind",
  "haven" /*"split"*/,
  "ascent",
  "corrode",
] as const;
export type ValorantMap = (typeof valorantMaps)[number];
