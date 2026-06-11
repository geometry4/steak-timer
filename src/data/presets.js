let _n = 0;
const uid = () => `${++_n}`;
function stage(type, label, duration, isOptional = false) {
    return { id: uid(), type, label, duration, isOptional };
}
function preset(thickness, stages) {
    return { id: uid(), thickness, stages };
}
function std(first, second, baste, rest) {
    return [
        stage('cook', '第一面', first),
        stage('flip', '第二面', second),
        stage('baste', '黄油 Baste', baste, true),
        stage('rest', '醒肉', rest),
    ];
}
export const CUTS = [
    {
        id: 'flat-iron', name: '板腱', nameEn: 'Flat Iron', emoji: '🥩',
        description: '肉质细嫩，中间一条筋，性价比之王',
        presets: [
            preset(2, std(90, 75, 40, 240)),
            preset(2.5, std(120, 100, 45, 270)),
            preset(3, std(150, 120, 45, 300)),
            preset(3.5, std(180, 150, 55, 330)),
            preset(4, std(210, 180, 60, 360)),
        ],
    },
    {
        id: 'sirloin', name: '西冷', nameEn: 'Sirloin', emoji: '🍖',
        description: '外侧一圈油脂，嚼劲十足，牛味浓郁',
        presets: [
            preset(2, std(90, 75, 45, 240)),
            preset(2.5, std(135, 115, 55, 300)),
            preset(3, std(180, 150, 60, 360)),
            preset(3.5, std(210, 180, 70, 390)),
            preset(4, std(240, 210, 75, 420)),
        ],
    },
    {
        id: 'tenderloin', name: '里脊', nameEn: 'Tenderloin', emoji: '✨',
        description: '全身最嫩的部位，口感如黄油，脂肪少',
        presets: [
            preset(2.5, std(135, 115, 40, 270)),
            preset(3, std(180, 150, 45, 300)),
            preset(3.5, std(210, 180, 55, 330)),
            preset(4, std(240, 210, 60, 360)),
        ],
    },
    {
        id: 'ribeye', name: '肋眼', nameEn: 'Ribeye', emoji: '🔥',
        description: '大理石花纹丰富，入口即化，香气四溢',
        presets: [
            preset(2, std(90, 90, 50, 240)),
            preset(2.5, std(135, 120, 55, 300)),
            preset(3, std(180, 150, 60, 360)),
            preset(3.5, std(210, 180, 70, 390)),
            preset(4, std(240, 210, 75, 420)),
        ],
    },
    {
        id: 'tomahawk', name: '战斧', nameEn: 'Tomahawk', emoji: '🪓',
        description: '带长骨肋眼，视觉震撼',
        presets: [
            preset(3.5, std(270, 240, 80, 540)),
            preset(4, std(300, 270, 90, 600)),
            preset(4.5, std(330, 285, 90, 600)),
            preset(5, std(360, 300, 90, 600)),
        ],
    },
    {
        id: 'chuck-roll', name: '上脑', nameEn: 'Chuck Roll', emoji: '💪',
        description: '肌间脂肪多，煎后焦香，价格亲民',
        presets: [
            preset(2, std(90, 75, 40, 240)),
            preset(2.5, std(120, 100, 45, 270)),
            preset(3, std(150, 120, 50, 300)),
            preset(3.5, std(180, 145, 55, 330)),
        ],
    },
];
export const getCut = (id) => CUTS.find(c => c.id === id);
