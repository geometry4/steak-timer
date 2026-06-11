import { useState, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiquidGlass from 'liquid-glass-react';
import { getCut } from '../data/presets';
import { initAudio } from '../utils/audio';
import type { Stage, CookingConfig } from '../types';

const ICONS: Record<Stage['type'], string> = {
  cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️',
};

export function Setup() {
  const { cutId } = useParams<{ cutId: string }>();
  const nav = useNavigate();
  const cut = getCut(cutId!);

  const [presetIdx, setPresetIdx] = useState(0);
  const [stages, setStages] = useState<Stage[]>(() =>
    JSON.parse(JSON.stringify(cut!.presets[0].stages))
  );
  const [useBaste, setUseBaste] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [picMin, setPicMin] = useState(0);
  const [picSec, setPicSec] = useState(0);

  const segRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLDivElement>(null);

  function moveIndicator(idx: number, animate: boolean) {
    const seg = segRef.current, ind = indRef.current;
    if (!seg || !ind) return;
    const btns = seg.querySelectorAll('button');
    const btn = btns[idx] as HTMLElement;
    if (!btn) return;
    const cr = seg.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const x = br.left - cr.left;
    const w = br.width;

    if (!animate) {
      ind.style.transition = 'none';
      ind.style.setProperty('--ind-x', `${x}px`);
      ind.style.setProperty('--ind-w', `${w}px`);
      ind.style.setProperty('--ind-scale', '1');
      requestAnimationFrame(() => { ind.style.transition = ''; });
    } else {
      ind.style.setProperty('--ind-x', `${x}px`);
      ind.style.setProperty('--ind-w', `${w}px`);
      ind.style.setProperty('--ind-scale', '1.18');
      setTimeout(() => ind.style.setProperty('--ind-scale', '0.96'), 280);
      setTimeout(() => ind.style.setProperty('--ind-scale', '1'),    480);
    }
    btns.forEach((b, i) => b.classList.toggle('active', i === idx));
  }

  useLayoutEffect(() => { moveIndicator(presetIdx, false); }, []);

  function selectPreset(i: number) {
    setPresetIdx(i);
    setStages(JSON.parse(JSON.stringify(cut!.presets[i].stages)));
    moveIndicator(i, true);
  }

  function openEdit(idx: number) {
    const d = stages[idx].duration;
    setPicMin(Math.floor(d / 60));
    setPicSec(d % 60);
    setEditIdx(idx);
  }

  function confirmEdit() {
    if (editIdx === null) return;
    setStages(prev => prev.map((st, i) =>
      i === editIdx ? { ...st, duration: picMin * 60 + picSec } : st
    ));
    setEditIdx(null);
  }

  function start() {
    initAudio();
    const active = useBaste ? stages : stages.filter(st => st.type !== 'baste');
    const config: CookingConfig = {
      cutName: cut!.name,
      thickness: cut!.presets[presetIdx].thickness,
      stages: active,
    };
    sessionStorage.setItem('cookingConfig', JSON.stringify(config));
    nav('/timer');
  }

  if (!cut) return null;
  const visible = stages.filter(st => st.type !== 'baste' || useBaste);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <LiquidGlass
          displacementScale={40}
          blurAmount={0.06}
          saturation={140}
          aberrationIntensity={1}
          elasticity={0.25}
          cornerRadius={19}
          padding="9px 14px"
          onClick={() => nav(-1)}
          style={{ cursor: 'pointer' }}
        >
          <span style={s.backArrow}>←</span>
        </LiquidGlass>
        <div style={{ flex: 1 }}>
          <h2 style={s.title}>{cut.name}</h2>
          <p style={s.subtitle}>{cut.nameEn}</p>
        </div>
      </header>

      <div style={s.scroll}>
        {/* Thickness — keep CSS glass (segmented control has internal animated indicator) */}
        <section>
          <p className="sec-label">厚度</p>
          <div ref={segRef} className="liquid-seg glass" style={{ borderRadius: 14 }}>
            <div ref={indRef} className="seg-indicator" />
            {cut.presets.map((p, i) => (
              <button
                key={p.id}
                className={i === presetIdx ? 'active' : ''}
                onClick={() => selectPreset(i)}
              >
                {p.thickness}cm
              </button>
            ))}
          </div>
        </section>

        {/* Butter baste */}
        <section>
          <LiquidGlass
            displacementScale={50}
            blurAmount={0.08}
            saturation={150}
            aberrationIntensity={1.5}
            elasticity={0.15}
            cornerRadius={20}
            padding="14px 18px"
            style={{ width: '100%' }}
          >
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <div style={s.rowTitle}>黄油 Baste</div>
                <div style={s.rowSub}>黄油 · 大蒜 · 香草</div>
              </div>
              <button
                className={`toggle ${useBaste ? 'on' : 'off'}`}
                onClick={() => setUseBaste(v => !v)}
                aria-label="butter baste"
              />
            </div>
          </LiquidGlass>
        </section>

        {/* Stage list */}
        <section>
          <p className="sec-label">阶段时间</p>
          <LiquidGlass
            displacementScale={50}
            blurAmount={0.08}
            saturation={150}
            aberrationIntensity={1.5}
            elasticity={0.1}
            cornerRadius={20}
            padding="0"
            style={{ width: '100%' }}
          >
            <div style={s.stageList}>
              {visible.map((stage, i) => (
                <div key={stage.id}>
                  <button style={s.stageRow} onClick={() => openEdit(stages.indexOf(stage))}>
                    <span style={{ fontSize: 18, width: 26 }}>{ICONS[stage.type]}</span>
                    <span style={s.stageName}>{stage.label}</span>
                    <span style={s.durationLabel}>{fmt(stage.duration)}</span>
                    <span style={s.chevron}>›</span>
                  </button>
                  {i < visible.length - 1 && <div className="divider" />}
                </div>
              ))}
            </div>
          </LiquidGlass>
        </section>

        <div style={{ height: 90 }} />
      </div>

      <div style={s.footer}>
        <button className="btn-primary" onClick={start}>开始计时</button>
      </div>

      {editIdx !== null && (
        <div className="sheet-backdrop" onClick={() => setEditIdx(null)}>
          <div className="glass sheet" onClick={e => e.stopPropagation()}>
            <p style={s.sheetTitle}>{stages[editIdx].label}</p>
            <div style={s.steppers}>
              <Stepper label="分" value={picMin} min={0} max={30} onChange={setPicMin} />
              <Stepper label="秒" value={picSec} min={0} max={55} step={5} onChange={setPicSec} />
            </div>
            <div style={s.sheetBtns}>
              <button style={s.cancelBtn} onClick={() => setEditIdx(null)}>取消</button>
              <button className="btn-primary" style={{ flex: 1, height: 48 }} onClick={confirmEdit}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="stepper">
      <button className="stepper-btn" onClick={() => onChange(Math.min(max, value + step))}>＋</button>
      <div className="stepper-val">{value}<span className="stepper-unit"> {label}</span></div>
      <button className="stepper-btn" onClick={() => onChange(Math.max(min, value - step))}>－</button>
    </div>
  );
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m && s) return `${m}分${s}秒`;
  if (m) return `${m}分钟`;
  return `${s}秒`;
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    padding: '0 20px',
    paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 14,
    marginBottom: 28, flexShrink: 0,
  },
  backArrow: { color: '#fff', fontSize: 18, fontWeight: 500, lineHeight: 1, display: 'inline-block' },
  title: { fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 13, color: 'rgba(235, 235, 245, 0.5)',
    margin: '2px 0 0', fontWeight: 400, letterSpacing: -0.1,
  },
  scroll: { flex: 1, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' },
  row: { display: 'flex', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: -0.2 },
  rowSub: { fontSize: 13, color: 'rgba(235, 235, 245, 0.5)', marginTop: 2, fontWeight: 400 },
  stageList: { width: '100%' },
  stageRow: {
    width: '100%', background: 'none', border: 'none',
    display: 'flex', alignItems: 'center', padding: '14px 18px', gap: 12,
    color: '#fff', textAlign: 'left', cursor: 'pointer',
  },
  stageName: { flex: 1, fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: -0.2 },
  durationLabel: { fontSize: 15, fontWeight: 400, color: 'rgba(235, 235, 245, 0.55)', letterSpacing: -0.2 },
  chevron: { fontSize: 18, color: 'rgba(235, 235, 245, 0.3)', marginLeft: 4 },
  footer: {
    padding: '12px 0',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
    flexShrink: 0,
  },
  sheetTitle: {
    fontSize: 16, fontWeight: 600, color: '#fff',
    textAlign: 'center', margin: '0 0 24px', letterSpacing: -0.2,
  },
  steppers: { display: 'flex', justifyContent: 'space-around', marginBottom: 24 },
  sheetBtns: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: 14, border: 'none',
    background: 'rgba(255, 255, 255, 0.10)',
    color: '#fff', fontSize: 16, fontWeight: 500,
  },
};
