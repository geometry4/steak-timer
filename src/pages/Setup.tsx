import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCut } from '../data/presets';
import { initAudio } from '../utils/audio';
import type { Stage, CookingConfig } from '../types';
import '../index.css';

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

  // Move liquid indicator to the selected preset button
  function moveIndicator(idx: number, animate: boolean) {
    const el = segRef.current;
    if (!el) return;
    const btns = el.querySelectorAll('button');
    const btn = btns[idx] as HTMLElement;
    if (!btn) return;
    const cr = el.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const x = br.left - cr.left;
    const w = br.width;

    if (!animate) {
      el.style.setProperty('transition', 'none');
      el.style.setProperty('--ind-x', `${x}px`);
      el.style.setProperty('--ind-w', `${w}px`);
      el.style.setProperty('--ind-scale', '1');
      requestAnimationFrame(() => el.style.removeProperty('transition'));
    } else {
      el.style.setProperty('--ind-x', `${x}px`);
      el.style.setProperty('--ind-w', `${w}px`);
      el.style.setProperty('--ind-scale', '1.18');
      setTimeout(() => el.style.setProperty('--ind-scale', '0.96'), 280);
      setTimeout(() => el.style.setProperty('--ind-scale', '1'), 480);
    }
    // Update active class
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
    setStages(prev => prev.map((s, i) =>
      i === editIdx ? { ...s, duration: picMin * 60 + picSec } : s
    ));
    setEditIdx(null);
  }

  function start() {
    initAudio();
    const active = useBaste ? stages : stages.filter(s => s.type !== 'baste');
    const config: CookingConfig = {
      cutName: cut!.name,
      thickness: cut!.presets[presetIdx].thickness,
      stages: active,
    };
    sessionStorage.setItem('cookingConfig', JSON.stringify(config));
    nav('/timer');
  }

  if (!cut) return null;
  const visible = stages.filter(s => s.type !== 'baste' || useBaste);

  return (
    <div style={s.page}>
      {/* Glass top bar */}
      <header className="glass" style={s.topbar}>
        <button style={s.backBtn} onClick={() => nav(-1)}>←</button>
        <span style={s.topbarTitle}>{cut.emoji} {cut.name}</span>
      </header>

      <div style={s.scroll}>
        {/* Thickness — liquid segmented control */}
        <div>
          <p className="sec-label">厚度</p>
          <div ref={segRef} className="liquid-seg glass" style={s.seg}>
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
        </div>

        {/* Butter baste toggle */}
        <div className="glass" style={s.row}>
          <div>
            <div style={s.rowTitle}>黄油 Baste</div>
            <div style={s.rowSub}>黄油 · 大蒜 · 香草</div>
          </div>
          <button
            className={`toggle-wrap ${useBaste ? 'on' : 'off'}`}
            onClick={() => setUseBaste(v => !v)}
            aria-label="黄油baste开关"
          />
        </div>

        {/* Stage list */}
        <div>
          <p className="sec-label">计时阶段（点时间修改）</p>
          <div className="glass" style={s.stageList}>
            {visible.map((stage, i) => (
              <div key={stage.id}>
                <div style={s.stageRow}>
                  <span style={{ fontSize: 20, width: 28 }}>{ICONS[stage.type]}</span>
                  <span style={s.stageName}>{stage.label}</span>
                  <button style={s.durationBtn} onClick={() => openEdit(stages.indexOf(stage))}>
                    {fmt(stage.duration)}
                  </button>
                </div>
                {i < visible.length - 1 && <div className="stage-divider" />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>

      {/* Sticky start button */}
      <div style={s.footer}>
        <button className="btn-primary" onClick={start}>开始计时</button>
      </div>

      {/* Duration editor sheet */}
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
              <button className="btn-primary" style={{ flex: 1, height: 52 }} onClick={confirmEdit}>确定</button>
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
    padding: '0 16px',
    paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
  },
  topbar: {
    borderRadius: 16, padding: '12px 18px',
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 20, flexShrink: 0,
  },
  backBtn: {
    background: 'none', border: 'none',
    color: '#FF8C00', fontSize: 20, padding: '0 4px', lineHeight: 1,
  },
  topbarTitle: { fontSize: 17, fontWeight: 700, color: '#f5f0eb' },
  scroll: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' },
  seg: { borderRadius: 14 },
  row: {
    borderRadius: 16, padding: '14px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  rowTitle: { fontSize: 15, fontWeight: 600, color: '#f5f0eb' },
  rowSub: { fontSize: 12, color: 'rgba(245,240,235,0.38)', marginTop: 2 },
  stageList: { borderRadius: 16, overflow: 'hidden' },
  stageRow: {
    display: 'flex', alignItems: 'center',
    padding: '14px 18px', gap: 12,
  },
  stageName: { flex: 1, fontSize: 15, fontWeight: 600, color: '#f5f0eb' },
  durationBtn: {
    background: 'none', border: 'none',
    color: '#FF8C00', fontSize: 15, fontWeight: 600,
  },
  footer: {
    padding: '12px 0',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
    flexShrink: 0,
  },
  sheetTitle: {
    fontSize: 17, fontWeight: 700, color: '#f5f0eb',
    textAlign: 'center', margin: '0 0 20px',
  },
  steppers: { display: 'flex', justifyContent: 'space-around', marginBottom: 24 },
  sheetBtns: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1, height: 52, borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(245,240,235,0.5)', fontSize: 15,
  },
};
