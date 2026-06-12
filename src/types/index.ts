export type StageType = 'cook' | 'flip' | 'baste' | 'rest';

export type Doneness = 'rare' | 'medium-rare' | 'medium' | 'well-done';

export const DONENESS_LABELS: Record<Doneness, string> = {
  'rare':        '三分熟',
  'medium-rare': '五分熟',
  'medium':      '七分熟',
  'well-done':   '全熟',
};

// Multiplier applied to cook + flip stages only
export const DONENESS_MULT: Record<Doneness, number> = {
  'rare':        0.72,
  'medium-rare': 1.00,
  'medium':      1.32,
  'well-done':   1.65,
};

export interface Stage {
  id: string;
  type: StageType;
  label: string;
  duration: number;       // seconds
  isOptional: boolean;
}

export interface ThicknessPreset {
  id: string;
  thickness: number;
  stages: Stage[];
}

export interface Cut {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  presets: ThicknessPreset[];
  hideDoneness?: boolean;   // for non-steak items where doneness doesn't apply
}

export interface CookingConfig {
  cutName: string;
  thickness: number;
  doneness: Doneness;
  stages: Stage[];
}

export interface HistoryEntry {
  id: string;
  date: number;
  cutName: string;
  thickness: number;
  doneness: Doneness;
  totalSeconds: number;
}
