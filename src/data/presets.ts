import type { Cut, Stage, ThicknessPreset } from '../types';

/**
 * Timing references:
 *  - J. Kenji López-Alt (Serious Eats): high-heat pan sear, single flip
 *  - Gordon Ramsay: ~3 min/side for 2.5cm, butter baste 1-2 min, rest ≥ cook time
 *  - Internal temp targets: rare 52°C / med-rare 57°C / medium 63°C / well-done 71°C
 *
 * All times assume: hot cast-iron or stainless pan, steak at room temperature.
 * Baseline doneness = 五分熟 (medium-rare). Doneness multipliers applied in Setup.
 */

let _n = 0;
const uid = () => `${++_n}`;

function stage(type: Stage['type'], label: string, duration: number, isOptional = false): Stage {
  return { id: uid(), type, label, duration, isOptional };
}

function preset(thickness: number, stages: Stage[]): ThicknessPreset {
  return { id: uid(), thickness, stages };
}

function std(first: number, second: number, baste: number, rest: number): Stage[] {
  return [
    stage('cook',  '第一面',      first),
    stage('flip',  '第二面',      second),
    stage('baste', '黄油 Baste',  baste, true),
    stage('rest',  '醒肉',        rest),
  ];
}

export const CUTS: Cut[] = [
  {
    id: 'flat-iron', name: '板腱', nameEn: 'Flat Iron', emoji: '🥩',
    description: '肉质细嫩，中间一条筋，性价比之王',
    presets: [
      preset(2,   std(180, 150, 55, 300)),   // 3:00 / 2:30 / 0:55 / 5:00
      preset(2.5, std(210, 175, 65, 330)),   // 3:30 / 2:55 / 1:05 / 5:30
      preset(3,   std(240, 200, 75, 360)),   // 4:00 / 3:20 / 1:15 / 6:00
      preset(3.5, std(270, 215, 85, 420)),   // 4:30 / 3:35 / 1:25 / 7:00
      preset(4,   std(300, 240, 90, 480)),   // 5:00 / 4:00 / 1:30 / 8:00
    ],
  },
  {
    id: 'sirloin', name: '西冷', nameEn: 'Sirloin', emoji: '🍖',
    description: '外侧一圈油脂，嚼劲十足，牛味浓郁',
    presets: [
      preset(2,   std(190, 150, 60, 300)),   // 脂肪边第一面多15s
      preset(2.5, std(225, 175, 65, 330)),
      preset(3,   std(255, 200, 75, 360)),
      preset(3.5, std(285, 220, 85, 420)),
      preset(4,   std(315, 250, 90, 480)),
    ],
  },
  {
    id: 'tenderloin', name: '里脊', nameEn: 'Tenderloin', emoji: '✨',
    description: '全身最嫩的部位，口感如黄油，脂肪少',
    presets: [
      preset(2.5, std(190, 155, 60, 300)),   // 无脂肪，稍快约10%
      preset(3,   std(215, 180, 65, 330)),
      preset(3.5, std(245, 200, 75, 390)),
      preset(4,   std(270, 215, 80, 450)),
    ],
  },
  {
    id: 'ribeye', name: '肋眼', nameEn: 'Ribeye', emoji: '🔥',
    description: '大理石花纹丰富，入口即化，香气四溢',
    presets: [
      preset(2,   std(195, 160, 60, 300)),   // 脂肪多，稍长
      preset(2.5, std(225, 185, 70, 330)),
      preset(3,   std(255, 210, 80, 390)),
      preset(3.5, std(285, 230, 85, 420)),
      preset(4,   std(315, 260, 90, 480)),
    ],
  },
  {
    id: 'tomahawk', name: '战斧', nameEn: 'Tomahawk', emoji: '🪓',
    description: '带长骨肋眼，视觉震撼',
    presets: [
      preset(3.5, std(300, 240, 90,  540)),  // 5:00 / 4:00 / 1:30 / 9:00
      preset(4,   std(360, 300, 100, 600)),  // 6:00 / 5:00 / 1:40 / 10:00
      preset(4.5, std(420, 360, 110, 660)),
      preset(5,   std(480, 420, 120, 720)),  // 8:00 / 7:00 / 2:00 / 12:00
    ],
  },
  {
    id: 'lamb-soup', name: '羊肠汤', nameEn: 'Lamb Intestine Soup', emoji: '🍲',
    description: '清炖慢煮，汤白肉嫩',
    hideDoneness: true,
    presets: [
      {
        id: uid(), thickness: 1,
        stages: [
          stage('cook',  '大火煮沸', 1200),       // 20 min — 下锅煮沸，撇去浮沫
          stage('flip',  '小火慢炖', 4500),       // 75 min — 转小火慢炖至软烂
          stage('baste', '加调料',   300, true),  //  5 min — 加盐、胡椒、香菜（可选）
          stage('rest',  '收汁焖煮', 600),        // 10 min — 大火收汁，出锅前调整口味
        ],
      },
    ],
  },
  {
    id: 'chuck-roll', name: '上脑', nameEn: 'Chuck Roll', emoji: '💪',
    description: '肌间脂肪多，煎后焦香，价格亲民',
    presets: [
      preset(2,   std(180, 150, 55, 300)),
      preset(2.5, std(210, 175, 60, 330)),
      preset(3,   std(240, 195, 70, 360)),
      preset(3.5, std(270, 215, 80, 420)),
    ],
  },
];

export const getCut = (id: string) => CUTS.find(c => c.id === id);
