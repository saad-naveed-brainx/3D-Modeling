/** Touch-first devices get lighter render settings (pixel ratio, shadow map size; SCOPE §10). */
export const isCoarsePointer =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
