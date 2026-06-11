export type StageType = 'cook' | 'flip' | 'baste' | 'rest';

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
}

export interface CookingConfig {
  cutName: string;
  thickness: number;
  stages: Stage[];
}
