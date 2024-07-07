export const valorantMaps = ["sunset", "lotus" /*"pearl",*/ /*"fracture"*/ /*"breeze"*/, "icebox", "abyss", "bind", "haven" /*"split"*/, "ascent"] as const;
export type ValorantMap = (typeof valorantMaps)[number];
