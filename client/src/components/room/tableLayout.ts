// Room canvas: 680px × 380px (landscape, matches room-bg.png aspect ratio)
export const WALL = 24;
export const ROOM_W = 632;
export const ROOM_H = 332;
export const CANVAS_W = ROOM_W + WALL * 2; // 680
export const CANVAS_H = ROOM_H + WALL * 2; // 380

// Five column centers (interior coordinates)
export const COL_X = [63, 173, 316, 459, 569] as const;

// Row centers (interior coordinates)
export const RECT_ROW_Y  = [55, 120] as const;   // 2 rows of rect tables
export const ROUND_ROW_Y = [200, 268] as const;  // 2 rows of round tables

// Player spawn (entrance at bottom center)
export const SPAWN_X = 316;
export const SPAWN_Y = 318;

export type TableType = 'rect' | 'round';

export interface TableDef {
  index: number;
  type: TableType;
  cx: number; // interior coordinate
  cy: number;
}

// All 20 table definitions
export const TABLE_DEFS: TableDef[] = [
  ...RECT_ROW_Y.flatMap((cy, row) =>
    COL_X.map((cx, col) => ({
      index: row * 5 + col,
      type: 'rect' as TableType,
      cx,
      cy,
    }))
  ),
  ...ROUND_ROW_Y.flatMap((cy, row) =>
    COL_X.map((cx, col) => ({
      index: 10 + row * 5 + col,
      type: 'round' as TableType,
      cx,
      cy,
    }))
  ),
];

// Table surface dimensions
export const RECT_W = 48;
export const RECT_H = 30;
export const ROUND_R = 20; // radius

// Seat positions around a rect table (up to 6 seats: 3 top, 3 bottom)
export function getRectSeats(cx: number, cy: number): { x: number; y: number }[] {
  const gap = 26;
  return [
    { x: cx - 14, y: cy - RECT_H / 2 - gap },
    { x: cx,      y: cy - RECT_H / 2 - gap },
    { x: cx + 14, y: cy - RECT_H / 2 - gap },
    { x: cx - 14, y: cy + RECT_H / 2 + gap },
    { x: cx,      y: cy + RECT_H / 2 + gap },
    { x: cx + 14, y: cy + RECT_H / 2 + gap },
  ];
}

// Seat positions around a round table (up to 6 evenly spaced)
export function getRoundSeats(cx: number, cy: number, count = 6): { x: number; y: number }[] {
  const r = ROUND_R + 22;
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    };
  });
}

export function getSeatsForTable(def: TableDef, n = 6): { x: number; y: number }[] {
  return def.type === 'rect'
    ? getRectSeats(def.cx, def.cy).slice(0, n)
    : getRoundSeats(def.cx, def.cy, Math.min(n, 6));
}

// Avatar color palette (10 distinct colors)
export const AVATAR_COLORS = [
  '#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#8338ec',
  '#06d6a0', '#ef476f', '#ffd166', '#118ab2', '#ff6b6b',
] as const;

export function getAvatarColor(nickname: string): string {
  let h = 5381;
  for (let i = 0; i < nickname.length; i++) {
    h = ((h << 5) + h) ^ nickname.charCodeAt(i);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// Convert interior coords → canvas coords (adds wall offset)
export function toCanvas(x: number, y: number): { left: number; top: number } {
  return { left: x + WALL, top: y + WALL };
}
