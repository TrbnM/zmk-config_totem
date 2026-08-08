export interface KeyBinding {
  value: string; // The raw binding string, e.g. "&kp A" or "&mt LCTRL DEL"
  behavior: string; // e.g. "&kp", "&mt"
  param1?: string; 
  param2?: string;
}

export interface Layer {
  name: string;
  bindings: string[]; // We will keep it simple as string array for now, then parse to KeyBinding in the UI
}

export interface Combo {
  name: string;
  timeout: number;
  keyPositions: number[];
  binding: string;
}

export interface KeymapData {
  macros: { [key: string]: string };
  layers: Layer[];
  combos: Combo[];
}

export const TOTEM_KEY_COUNT = 38;

// Map logical index to physical positions
export const KEY_POSITIONS = [
  // Left half             Right half
  // Row 1 (5 left, 5 right)
  0, 1, 2, 3, 4,           5, 6, 7, 8, 9,
  // Row 2 (5 left, 5 right)
  10, 11, 12, 13, 14,      15, 16, 17, 18, 19,
  // Row 3 (6 left, 6 right) - includes outer pinky
  20, 21, 22, 23, 24, 25,  26, 27, 28, 29, 30, 31,
  // Thumbs (3 left, 3 right)
  32, 33, 34,              35, 36, 37
];
