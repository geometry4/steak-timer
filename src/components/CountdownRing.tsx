const SIZE = 240;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const CX = SIZE / 2;

interface Props {
  progress: number;   // 0→1 elapsed fraction
  children: React.ReactNode;
}

export function CountdownRing({ progress, children }: Props) {
  const dash = CIRC * Math.min(1, Math.max(0, progress));
  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <circle cx={CX} cy={CX} r={R} fill="none" stroke="#1c1c1c" strokeWidth={STROKE} />
        <circle
          cx={CX} cy={CX} r={R} fill="none"
          stroke="#FF8C00" strokeWidth={STROKE}
          strokeDasharray={`${dash} ${CIRC - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CX})`}
          style={{ transition: 'stroke-dasharray 0.4s linear' }}
        />
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
