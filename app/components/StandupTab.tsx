'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useHistory } from '../context/HistoryContext';

// ── Types ──────────────────────────────────────────────────────────────────────
type Task = { text: string; hours: string };

type StandupEntry = {
  id: string;
  date: string;
  project: string;
  yesterdayTasks: Task[];
  todayTasks: Task[];
  blockers: string;
  format: string;
  formatted: string;
  savedAt: number;
};

type FormatOption = { id: string; label: string; emoji: string; desc: string };

// ── Constants ──────────────────────────────────────────────────────────────────
const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'standard', label: 'Standard DSM',  emoji: '💼', desc: 'Bullet points + action verbs' },
  { id: 'detailed', label: 'Detailed',      emoji: '📝', desc: 'Full sentences for portals' },
  { id: 'concise',  label: 'Concise',       emoji: '⚡', desc: 'Super brief, Slack-ready' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0]; }
function weekAgoStr() { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().split('T')[0]; }
function fmtDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDay(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
}
function sumHours(tasks: Task[]) {
  return tasks.reduce((s, t) => s + (parseFloat(t.hours) || 0), 0);
}
function migrateTask(t: Task | string): Task {
  if (typeof t === 'string') return { text: t, hours: '' };
  return t;
}

// ── Timesheet HTML ─────────────────────────────────────────────────────────────
function generateTimesheetHTML(entries: StandupEntry[], start: string, end: string): string {
  const grandTotal = entries.reduce((s, e) => s + sumHours(e.yesterdayTasks), 0);
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Standup Timesheet</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1a1a1a;padding:24px}
  .hdr{margin-bottom:20px;border-bottom:2px solid #7c3aed;padding-bottom:12px}
  .hdr h1{font-size:20px;color:#7c3aed}.hdr p{color:#666;font-size:10px;margin-top:4px}
  table{width:100%;border-collapse:collapse}
  thead th{background:#7c3aed;color:#fff;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.4px}
  tbody td{padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top;font-size:10.5px}
  tbody tr:nth-child(even){background:#f9fafb}
  .task-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:3px}
  .task-desc{flex:1}.task-hrs{color:#7c3aed;font-weight:700;white-space:nowrap;min-width:30px;text-align:right}
  .subtotal{border-top:1px solid #e5e7eb;margin-top:4px;padding-top:4px;display:flex;justify-content:space-between;font-weight:700;color:#4c1d95;font-size:10px}
  .red{color:#dc2626}
  .date-cell{white-space:nowrap;font-weight:600;color:#1e1b4b}
  .day-cell{color:#6b7280}
  tfoot td{padding:8px 10px;font-weight:700;background:#f5f3ff}
  .tfoot-label{text-align:right;color:#7c3aed}
  .tfoot-val{color:#7c3aed;font-size:13px;font-weight:800;text-align:right}
  @media print{thead th,tfoot td{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="hdr"><h1>Daily Standup Timesheet</h1>
<p>Period: ${fmtDate(start)} — ${fmtDate(end)} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p></div>
<table><thead><tr>
  <th>Date</th><th>Day</th><th>Project</th>
  <th>Yesterday Completed (Actual)</th><th>Today's Plan (Est.)</th>
  <th>Blockers</th><th style="text-align:right">Hours</th>
</tr></thead><tbody>
${entries.map(e => {
  const yTotal = sumHours(e.yesterdayTasks);
  const tTotal = sumHours(e.todayTasks);
  return `<tr>
  <td class="date-cell">${e.date}</td><td class="day-cell">${fmtDay(e.date)}</td>
  <td>${e.project || '—'}</td>
  <td>${e.yesterdayTasks.map(t => `<div class="task-row"><span class="task-desc">${t.text}</span><span class="task-hrs">${t.hours ? t.hours + 'h' : '—'}</span></div>`).join('')}${yTotal > 0 ? `<div class="subtotal"><span>Total</span><span>${yTotal}h</span></div>` : ''}</td>
  <td>${e.todayTasks.map(t => `<div class="task-row"><span class="task-desc">${t.text}</span><span class="task-hrs" style="color:#6d28d9">${t.hours ? t.hours + 'h est.' : '—'}</span></div>`).join('')}${tTotal > 0 ? `<div class="subtotal" style="color:#6d28d9"><span>Estimated</span><span>${tTotal}h</span></div>` : ''}</td>
  <td class="${e.blockers ? 'red' : ''}">${e.blockers || 'None'}</td>
  <td style="text-align:right;font-weight:700;color:#7c3aed">${yTotal > 0 ? yTotal + 'h' : '—'}</td>
</tr>`;}).join('\n')}
</tbody><tfoot><tr>
  <td colspan="6" class="tfoot-label">Grand Total (Actual Hours Logged)</td>
  <td class="tfoot-val">${grandTotal}h</td>
</tr></tfoot></table>
<p style="margin-top:16px;font-size:9px;color:#9ca3af">Generated by Chat Optimiser</p>
</body></html>`;
}

// ── TaskList component ─────────────────────────────────────────────────────────
function TaskList({
  tasks, onChange, dotColor, isToday = false,
}: {
  tasks: Task[]; onChange: (t: Task[]) => void; dotColor: string; isToday?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const updateText  = (i: number, text: string)  => { const n = [...tasks]; n[i] = { ...n[i], text };  onChange(n); };
  const updateHours = (i: number, hours: string) => { const n = [...tasks]; n[i] = { ...n[i], hours }; onChange(n); };
  const add = () => { onChange([...tasks, { text: '', hours: '' }]); setTimeout(() => refs.current[tasks.length]?.focus(), 50); };
  const remove = (i: number) => {
    if (tasks.length === 1) { onChange([{ text: '', hours: '' }]); return; }
    onChange(tasks.filter((_, idx) => idx !== i));
  };
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && tasks[i].text === '' && tasks.length > 1) {
      e.preventDefault(); remove(i); setTimeout(() => refs.current[i - 1]?.focus(), 50);
    }
  };
  const total = sumHours(tasks);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">
        <span className="flex-1">Task description</span>
        <span className="w-14 text-center">{isToday ? 'Est.' : 'Actual'}</span>
        <span className="w-4" />
      </div>
      {tasks.map((task, i) => (
        <div key={i} className="flex items-center gap-2 group/task">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <input
            ref={el => { refs.current[i] = el; }}
            value={task.text} onChange={e => updateText(i, e.target.value)} onKeyDown={e => onKeyDown(e, i)}
            placeholder={`Task ${i + 1}…`}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none border-b border-transparent focus:border-slate-300 transition py-0.5 min-w-0"
          />
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <input
              type="number" value={task.hours} onChange={e => updateHours(i, e.target.value)}
              placeholder="0" min="0" max="24" step="0.5"
              className={`w-12 text-center text-xs font-semibold rounded-lg border py-1.5 focus:outline-none focus:ring-1 transition
                ${task.hours
                  ? (isToday ? 'border-violet-300 bg-violet-50 text-violet-700 focus:ring-violet-300' : 'border-indigo-300 bg-indigo-50 text-indigo-700 focus:ring-indigo-300')
                  : 'border-slate-200 bg-slate-100 text-slate-500 focus:ring-purple-300'}`}
            />
            <span className={`text-xs font-medium ${task.hours ? (isToday ? 'text-violet-500' : 'text-indigo-500') : 'text-slate-400'}`}>h</span>
          </div>
          <button onClick={() => remove(i)} className="opacity-0 group-hover/task:opacity-100 text-slate-300 hover:text-red-400 transition text-base leading-none flex-shrink-0 w-4">×</button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={add}
          className={`flex items-center gap-1 text-xs font-semibold transition ${dotColor.includes('indigo') ? 'text-indigo-400 hover:text-indigo-600' : 'text-violet-400 hover:text-violet-600'}`}
        >
          <span className="text-base leading-none">+</span> Add task
        </button>
        {total > 0 && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isToday ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {total}h {isToday ? 'est.' : 'logged'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StandupTab() {
  const { entries, saveEntry, deleteEntry } = useHistory();

  // Derive standup history from the global HistoryContext (type='standup').
  const history: StandupEntry[] = useMemo(() =>
    entries
      .filter(e => e.type === 'standup')
      .map(e => {
        const d = e.data as Record<string, unknown>;
        return {
          id:             e.id,
          date:           d.date           as string,
          project:        d.project        as string,
          yesterdayTasks: (d.yesterdayTasks as (Task | string)[]).map(migrateTask),
          todayTasks:     (d.todayTasks     as (Task | string)[]).map(migrateTask),
          blockers:       d.blockers        as string,
          format:         d.format          as string,
          formatted:      d.formatted       as string,
          savedAt:        d.savedAt         as number,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );

  const [view, setView]   = useState<'form' | 'timesheet'>('form');
  const [date, setDate]   = useState(todayStr());
  const [project, setProject] = useState('');
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([{ text: '', hours: '' }]);
  const [todayTasks,     setTodayTasks]     = useState<Task[]>([{ text: '', hours: '' }]);
  const [blockers, setBlockers] = useState('');
  const [format, setFormat]     = useState<'standard' | 'detailed' | 'concise'>('standard');
  const [formatted, setFormatted] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);
  const [savedId, setSavedId]   = useState<string | null>(null);
  const [exportStart, setExportStart] = useState(weekAgoStr());
  const [exportEnd, setExportEnd]     = useState(todayStr());
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  const yTotal = sumHours(yesterdayTasks);
  const tTotal = sumHours(todayTasks);

  const handleGenerate = useCallback(async () => {
    const yT = yesterdayTasks.filter(t => t.text.trim());
    const tT = todayTasks.filter(t => t.text.trim());
    if (!yT.length && !tT.length) { setError('Add at least one task.'); return; }
    setError(''); setLoading(true); setFormatted(''); setSavedId(null);
    try {
      const res = await fetch('/api/standup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yesterdayTasks: yT, todayTasks: tT, blockers, project, dateLabel: fmtDate(date), format }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setFormatted(data.formatted);

      // Delete any existing entry for the same date (no duplicates per day).
      const existing = entries.find(e => e.type === 'standup' && (e.data as Record<string, unknown>).date === date);
      if (existing) deleteEntry(existing.id);

      // Save to global history (persisted to DB via HistoryContext).
      const saved = await saveEntry({
        type:    'standup',
        emoji:   '📋',
        label:   fmtDate(date),
        preview: (yT[0]?.text || tT[0]?.text || 'Standup').slice(0, 60),
        data: {
          date, project,
          yesterdayTasks: yT, todayTasks: tT,
          blockers, format,
          formatted: data.formatted,
          savedAt: Date.now(),
        },
      });
      setSavedId(saved.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [yesterdayTasks, todayTasks, blockers, project, date, format, entries, saveEntry, deleteEntry]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const loadEntry = (e: StandupEntry) => {
    setDate(e.date); setProject(e.project);
    setYesterdayTasks(e.yesterdayTasks.length ? e.yesterdayTasks : [{ text: '', hours: '' }]);
    setTodayTasks    (e.todayTasks.length     ? e.todayTasks     : [{ text: '', hours: '' }]);
    setBlockers(e.blockers);
    setFormat((e.format as 'standard' | 'detailed' | 'concise') || 'standard');
    setFormatted(e.formatted); setSavedId(e.id); setView('form');
  };

  const handleDelete = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    deleteEntry(id); // uses HistoryContext → fires DB DELETE
    if (savedId === id) setSavedId(null);
  };

  const filteredEntries = history.filter(e => e.date >= exportStart && e.date <= exportEnd);

  const exportCSV = () => {
    if (!filteredEntries.length) { alert('No entries in the selected date range.'); return; }
    const header = ['Date', 'Day', 'Project', 'Type', 'Task Description', 'Hours', 'Status'];
    const rows: string[][] = [];
    filteredEntries.forEach(e => {
      e.yesterdayTasks.forEach(t => rows.push([e.date, fmtDay(e.date), e.project || '', 'Yesterday', t.text, t.hours || '', 'Completed']));
      e.todayTasks.forEach(t =>     rows.push([e.date, fmtDay(e.date), e.project || '', 'Today',     t.text, t.hours || '', 'Planned']));
    });
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `standup-${exportStart}-to-${exportEnd}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const printTimesheet = () => {
    if (!filteredEntries.length) { alert('No entries in the selected date range.'); return; }
    const win = window.open('', '_blank');
    if (win) { win.document.write(generateTimesheetHTML(filteredEntries, exportStart, exportEnd)); win.document.close(); setTimeout(() => win.print(), 400); }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* View toggle */}
      <div className="flex gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
        {(['form', 'timesheet'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === v ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
            {v === 'form' ? '📝' : '📊'} <span className="capitalize">{v === 'form' ? 'New Standup' : 'Timesheet'}</span>
            {v === 'timesheet' && history.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${view === 'timesheet' ? 'bg-white/20' : 'bg-purple-100 text-purple-700'}`}>{history.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── FORM VIEW ── */}
      {view === 'form' && (
        <div className="space-y-4 sm:space-y-5 fade-in-up">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Project / Team</label>
                <input type="text" value={project} onChange={e => setProject(e.target.value)} placeholder="e.g. Platform, Mobile…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hours Summary</label>
                <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2.5 flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-black text-purple-700 leading-tight">{yTotal || '—'}<span className="text-xs font-medium ml-0.5">h</span></div>
                    <div className="text-[9px] text-purple-400 uppercase font-bold tracking-wide">Logged</div>
                  </div>
                  <div className="h-8 w-px bg-purple-200" />
                  <div className="text-center">
                    <div className="text-lg font-black text-violet-600 leading-tight">{tTotal || '—'}<span className="text-xs font-medium ml-0.5">h</span></div>
                    <div className="text-[9px] text-violet-400 uppercase font-bold tracking-wide">Planned</div>
                  </div>
                  <div className="h-8 w-px bg-purple-200" />
                  <div className="text-center">
                    <div className="text-lg font-black text-indigo-700 leading-tight">{yTotal + tTotal || '—'}<span className="text-xs font-medium ml-0.5">h</span></div>
                    <div className="text-[9px] text-indigo-400 uppercase font-bold tracking-wide">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">✅</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Yesterday</span>
              </div>
              <TaskList tasks={yesterdayTasks} onChange={setYesterdayTasks} dotColor="bg-indigo-400" isToday={false} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎯</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Plan</span>
              </div>
              <TaskList tasks={todayTasks} onChange={setTodayTasks} dotColor="bg-violet-400" isToday={true} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🚧</span>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Blockers <span className="normal-case font-normal">(optional)</span></label>
            </div>
            <input type="text" value={blockers} onChange={e => setBlockers(e.target.value)}
              placeholder="Waiting on design review, blocked by infra issue…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">DSM Format Style</label>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id as typeof format)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 sm:p-4 text-center transition-all duration-150 ${
                    format === f.id ? 'border-purple-500 bg-purple-50 scale-[1.03] shadow-md' : 'border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-purple-50'
                  }`}>
                  <span className="text-xl sm:text-2xl">{f.emoji}</span>
                  <span className={`text-[11px] sm:text-xs font-bold leading-tight ${format === f.id ? 'text-purple-700' : 'text-slate-700'}`}>{f.label}</span>
                  <span className="text-[9px] text-slate-400 leading-tight hidden sm:block">{f.desc}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400 flex items-start gap-1.5">
              <span>ℹ️</span>
              <span>
                {format === 'standard' && 'Professional bullet points with action verbs — good for most DSM portals.'}
                {format === 'detailed' && 'Full sentences with context — ideal for HR/formal portals requiring detail.'}
                {format === 'concise'  && 'Ultra-brief format — great for Slack standup bots or short text fields.'}
              </span>
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2 fade-in-up">
              <span>⚠️</span> {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Rephrasing & formatting…
              </span>
            ) : '✨ Rephrase & Generate DSM'}
          </button>

          {loading && <div className="skeleton h-44 w-full" />}

          {formatted && (
            <div className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden fade-in-up">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-purple-700">📋 DSM Ready — Copy to Portal</span>
                  {savedId && <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">✓ Saved</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleCopy}
                    className={`text-xs font-bold px-4 py-2 rounded-xl border-2 transition ${copied ? 'bg-green-100 border-green-400 text-green-700' : 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'}`}>
                    {copied ? '✓ Copied!' : '📋 Copy for Portal'}
                  </button>
                  <button onClick={() => setView('timesheet')} className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                    Timesheet →
                  </button>
                </div>
              </div>
              <pre className="px-4 sm:px-5 py-4 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{formatted}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── TIMESHEET VIEW ── */}
      {view === 'timesheet' && (
        <div className="space-y-4 sm:space-y-5 fade-in-up">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Export Date Range</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium whitespace-nowrap">From</label>
                <input type="date" value={exportStart} onChange={e => setExportStart(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium whitespace-nowrap">To</label>
                <input type="date" value={exportEnd} onChange={e => setExportEnd(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${filteredEntries.length ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                {filteredEntries.length} entries · {filteredEntries.reduce((s, e) => s + sumHours(e.yesterdayTasks), 0)}h logged
              </span>
              <div className="flex gap-2 sm:ml-auto flex-wrap">
                <button onClick={exportCSV} disabled={!filteredEntries.length}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow">
                  📊 Export CSV
                </button>
                <button onClick={printTimesheet} disabled={!filteredEntries.length}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow">
                  🖨️ Print / PDF
                </button>
              </div>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-slate-500 font-medium">No standup entries yet.</p>
              <button onClick={() => setView('form')} className="mt-4 px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition">Create Standup →</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Yesterday (Actual)</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Today (Est.)</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Blockers</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Hours</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((entry, i) => {
                      const inRange = entry.date >= exportStart && entry.date <= exportEnd;
                      const yHrs = sumHours(entry.yesterdayTasks);
                      return (
                        <>
                          <tr key={entry.id} onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            className={`cursor-pointer group transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-purple-50 ${!inRange ? 'opacity-40' : ''}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-bold text-slate-800 text-xs">{entry.date}</div>
                              <div className="text-[10px] text-slate-400">{fmtDay(entry.date)}</div>
                            </td>
                            <td className="px-4 py-3"><span className="text-xs text-slate-600">{entry.project || '—'}</span></td>
                            <td className="px-4 py-3 max-w-[200px]">
                              {entry.yesterdayTasks.slice(0, 3).map((t, j) => (
                                <div key={j} className="flex items-start justify-between gap-2 mb-0.5">
                                  <span className="text-xs text-slate-600 flex items-start gap-1 truncate"><span className="text-indigo-400 flex-shrink-0">•</span> {t.text}</span>
                                  {t.hours && <span className="text-xs font-bold text-indigo-600 flex-shrink-0">{t.hours}h</span>}
                                </div>
                              ))}
                              {entry.yesterdayTasks.length > 3 && <div className="text-[10px] text-slate-400">+{entry.yesterdayTasks.length - 3} more</div>}
                              {yHrs > 0 && <div className="text-[10px] font-bold text-indigo-700 mt-1 pt-1 border-t border-slate-100">Total: {yHrs}h</div>}
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              {entry.todayTasks.slice(0, 3).map((t, j) => (
                                <div key={j} className="flex items-start justify-between gap-2 mb-0.5">
                                  <span className="text-xs text-slate-600 flex items-start gap-1 truncate"><span className="text-violet-400 flex-shrink-0">•</span> {t.text}</span>
                                  {t.hours && <span className="text-xs font-bold text-violet-600 flex-shrink-0">{t.hours}h</span>}
                                </div>
                              ))}
                              {entry.todayTasks.length > 3 && <div className="text-[10px] text-slate-400">+{entry.todayTasks.length - 3} more</div>}
                            </td>
                            <td className="px-4 py-3">
                              {entry.blockers ? <span className="text-xs text-red-500">{entry.blockers}</span> : <span className="text-xs text-slate-400">None</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-black text-purple-700">{yHrs > 0 ? `${yHrs}h` : '—'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={ev => { ev.stopPropagation(); loadEntry(entry); }} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition">Edit</button>
                                <button onClick={ev => handleDelete(entry.id, ev)} className="text-xs text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100">Del</button>
                              </div>
                            </td>
                          </tr>
                          {expandedId === entry.id && (
                            <tr key={`${entry.id}-exp`} className="bg-purple-50 border-t border-purple-100">
                              <td colSpan={7} className="px-4 py-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Formatted DSM</p>
                                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl p-3 border border-purple-100">{entry.formatted}</pre>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                  {filteredEntries.length > 0 && (
                    <tfoot>
                      <tr className="bg-purple-50 border-t-2 border-purple-200">
                        <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-purple-700 uppercase tracking-wide">
                          Total ({filteredEntries.length} days in range)
                        </td>
                        <td className="px-4 py-3 text-center text-base font-black text-purple-700">
                          {filteredEntries.reduce((s, e) => s + sumHours(e.yesterdayTasks), 0)}h
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
