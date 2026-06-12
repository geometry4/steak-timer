// Graceful no-op on browsers that don't support vibration (Safari desktop)
const v = (pattern: number | number[]) => navigator.vibrate?.(pattern);

export const vibrateStageChange = () => v([120, 60, 120]);   // 翻面 / 阶段切换
export const vibrateDone        = () => v([200, 80, 200, 80, 400]); // 完成
