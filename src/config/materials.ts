/** PBR material parameters. Colours are sRGB; procedural textures multiply them. */
export interface MaterialSpec {
  color: string;
  roughness: number;
  metalness: number;
  /** Real-world size in metres covered by one repeat of the procedural texture. */
  tileSize?: number;
}

export const materialSpecs = {
  ground: { color: '#9c8166', roughness: 1, metalness: 0, tileSize: 3 },
  concrete: { color: '#a9a7a1', roughness: 0.9, metalness: 0, tileSize: 4 },
} satisfies Record<string, MaterialSpec>;
