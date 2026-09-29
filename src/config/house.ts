/**
 * House parameters in metres (SCOPE §6.2). Placeholder values until client data arrives.
 * Keep this JSON-serialisable: site-specific houses will later be generated from it (SCOPE §17).
 */
export interface HouseParams {
  /** Outer face of the wall frames. Length runs along X, width along Z. */
  footprint: { length: number; width: number };
  /** Slab sits on the ground (y = 0); `edge` is how far it extends beyond the frame. */
  slab: { thickness: number; edge: number };
}

export const defaultHouse: HouseParams = {
  footprint: { length: 16.0, width: 10.0 },
  slab: { thickness: 0.2, edge: 0.1 },
};
