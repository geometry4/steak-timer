import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCut } from '../data/presets';
import { initAudio } from '../utils/audio';
import type { Stage, CookingConfig } from '../types';

const ICONS: Record<Stage['type'], string> = { cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️' };

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

  if (!cut) return null;

  function selectPreset(i: number) {
    setPresetIdx(i);
    setStages(JSON.parse(JSON.stringify(cut!.presets[i].stages)));
  }

  function openEdit(idx: number) {
    setPicMin(Math.floor(stages[idx].duration / 60));
    setPicSec(stages[idx].duration % 60);
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
    initAudio();   // must be in user gesture
    const active = useBaste ? stages : stages.filter(s => s.type !== 'baste');
    const config: CookingConfig = {
      cutName: cut!.name,
      thickness: cut!.presets[presetIdx].thickness,
      stages: active,
    };
    sessionStorage.setItem('cookingConfig', JSON.stringify(config));
    nav('/timer');
  }

  const visible = stages.filter(s => s.type !== 'baste' || useBaste);

  return (
    <div style={s.page}>
      {/* Back */}
      <button style={s.back} onClick={() => nav(-1)}>← 返回</button>
      <h2 style={s.heading}>{cut.emoji} {cut.name} · 设置</h2>

      {/* Thickness */}
      <label style={s.label}>厚度</label>
      <div style={s.row}>
        {cut.presets.map((p, i) => (
          <button
            key={p.id}
            style={{ ...s.thickBtn, ...(i === presetIdx ? s.thickBtnOn : {}) }}
            onClick={() => selectPreset(i)}
          >
            {p.thickness}cm
          </button>
        ))}
      </div>

      {/* Baste toggle */}
      <div style={s.card}>
        <div>
          <div style={s.cardTitle}>黄油 Baste</div>
          <div style={s.cardSub}>黄油 + 大蒜 + 香草，增香提味</div>
        </div>
        <button
          style={{ ...s.toggle, background: useBaste ? '#FF8C00' : '#333' }}
          onClick={() => setUseBaste(v => !v)}
        >
          <div style={{ ...s.toggleKnob, transform: useBaste ? 'translateX(22px)' : 'translateX(2px)' }} />
        </button>
      </div>

      {/* Stages */}
      <label style={s.label}>计时阶段（点时间可修改）</label>
      <div style={s.stageList}>
        {visible.map((stage, i) => (
          <div key={stage.id}>
            <div style={s.stageRow}>
              <span style={{ fontSize: 20, width: 28 }}>{ICONS[stage.type]}</span>
              <span style={s.stageName}>{stage.label}</span>
              <button style={s.durationBtn} onClick={() => openEdit(stages.indexOf(stage))}>
                {fmt(stage.duration)}
              </button>
            </div>
            {i < visible.length - 1 && <div style={s.divider} />}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Start */}
      <button style={s.startBtn} onClick={start}>开始计时</button>

      {/* Duration modal */}
      {editIdx !== null && (
        <div style={s.backdrop}>
          <div style={s.modal}>
            <h3 style={{ margin: '0 0 20px', color: '#fff' }}>{stages[editIdx].label}</h3>
            <div style={s.steppers}>
              <Stepper label="分" value={picMin} min={0} max={30} onChange={setPicMin} />
              <Stepper label="秒" value={picSec} min={0} max={55} step={5} onChange={setPicSec} />
            </div>
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setEditIdx(null)}>取消</button>
              <button style={s.confirmBtn} onClick={confirmEdit}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number;
  step?: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <button style={sp.btn} onClick={() => onChange(Math.min(max, value + step))}>＋</button>
      <div style={sp.val}>{value}<span style={sp.unit}> {label}</span></div>
      <button style={sp.btn} onClick={() => onChange(Math.max(min, value - step))}>－</button>
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
    minHeight: '100dvh', background: '#000', color: '#fff',
    display: 'flex', flexDirection: 'column', gap: 14,
    padding: '0 16px',
    paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
  },
  back: { background: 'none', border: 'none', color: '#FF8C00', fontSize: 16, padding: 0, cursor: 'pointer', textAlign: 'left' },
  heading: { fontSize: 22, fontWeight: 700, margin: 0 },
  label: { fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 1 },
  row: { display: 'flex', gap: 10 },
  thickBtn: { flex: 1, height: 50, borderRadius: 12, border: 'none', background: '#151515', color: '#fff', fontSize: 17, fontWeight: 600, cursor: 'pointer' },
  thickBtnOn: { background: '#FF8C00', color: '#000' },
  card: { background: '#111', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: 600 },
  cardSub: { fontSize: 12, color: '#555', marginTop: 2 },
  toggle: { width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleKnob: { position: 'absolute', top: 3, width: 22, height: 22, borderRadius: 11, background: '#fff', transition: 'transform 0.2s' },
  stageList: { background: '#111', borderRadius: 16, overflow: 'hidden' },
  stageRow: { display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 },
  stageName: { flex: 1, fontSize: 16, fontWeight: 600 },
  durationBtn: { background: 'none', border: 'none', color: '#FF8C00', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  divider: { height: 1, background: '#1e1e1e', margin: '0 16px' },
  startBtn: { width: '100%', height: 64, borderRadius: 18, border: 'none', background: '#FF8C00', color: '#000', fontSize: 20, fontWeight: 700, cursor: 'pointer' },
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end' },
  modal: { width: '100%', background: '#111', borderRadius: '24px 24px 0 0', padding: '24px 24px calc(env(safe-area-inset-bottom) + 24px)' },
  steppers: { display: 'flex', justifyContent: 'space-around', marginBottom: 24 },
  modalBtns: { display: 'flex', gap: 12 },
  cancelBtn: { flex: 1, height: 52, borderRadius: 14, border: 'none', background: '#1c1c1c', color: '#555', fontSize: 16, cursor: 'pointer' },
  confirmBtn: { flex: 1, height: 52, borderRadius: 14, border: 'none', background: '#FF8C00', color: '#000', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};

const sp: Record<string, React.CSSProperties> = {
  btn: { width: 48, height: 48, borderRadius: 24, border: 'none', background: '#1c1c1c', color: '#fff', fontSize: 24, cursor: 'pointer' },
  val: { fontSize: 36, fontWeight: 700, color: '#fff', minWidth: 80, textAlign: 'center' },
  unit: { fontSize: 16, fontWeight: 400, color: '#555' },
};
