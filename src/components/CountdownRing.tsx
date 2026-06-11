const SIZE = 260;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const CX = SIZE / 2;

interface Props {
  progress: number;     // 0 → 1 elapsed
  children: React.ReactNode;
}

export function CountdownRing({ progress, children }: Props) {
  const dash = CIRC * Math.min(1, Math.max(0, progress));
  const gap = CIRC - dash;

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        {/* Track — subtle, like Apple Activity ring background */}
        <circle cx={CX} cy={CX} r={R} fill="none"
          stroke="rgba(255, 255, 255, 0.08)" strokeWidth={STROKE} />

        {/* Progress — clean single-tone amber */}
        <circle cx={CX} cy={CX} r={R} fill="none"
          stroke="#FF9500" strokeWidth={STROKE}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CX})`}
          style={{ transition: 'stroke-dasharray 400ms linear' }} />
      </svg>

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}
