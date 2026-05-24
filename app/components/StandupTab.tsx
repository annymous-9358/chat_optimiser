'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
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

type FormatOption = { id: string; label: string; desc: string };

// ── Constants ──────────────────────────────────────────────────────────────────
const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'standard', label: 'Standard',  desc: 'Bullet points + action verbs' },
  { id: 'detailed', label: 'Detailed',  desc: 'Full sentences for portals' },
  { id: 'concise',  label: 'Concise',   desc: 'Super brief, Slack-ready' },
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
  .hdr{margin-bottom:20px;border-bottom:2px solid #4f46e5;padding-bottom:12px}
  .hdr h1{font-size:20px;color:#1e1b4b}.hdr p{color:#666;font-size:10px;margin-top:4px}
  table{width:100%;border-collapse:collapse}
  thead th{background:#1e293b;color:#fff;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.4px}
  tbody td{padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top;font-size:10.5px}
  tbody tr:nth-child(even){background:#f9fafb}
  .task-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:3px}
  .task-desc{flex:1}.task-hrs{color:#4f46e5;font-weight:700;white-space:nowrap;min-width:30px;text-align:right}
  .subtotal{border-top:1px solid #e5e7eb;margin-top:4px;padding-top:4px;display:flex;justify-content:space-between;font-weight:700;color:#312e81;font-size:10px}
  .red{color:#dc2626}
  .date-cell{white-space:nowrap;font-weight:600;color:#1e1b4b}
  .day-cell{color:#6b7280}
  tfoot td{padding:8px 10px;font-weight:700;background:#eef2ff}
  .tfoot-label{text-align:right;color:#4f46e5}
  .tfoot-val{color:#4f46e5;font-size:13px;font-weight:800;text-align:right}
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
  <td style="text-align:right;font-weight:700;color:#4f46e5">${yTotal > 0 ? yTotal + 'h' : '—'}</td>
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
  tasks, onChange, isToday = false,
}: {
  tasks: Task[]; onChange: (t: Task[]) => void; isToday?: boolean;
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
      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wide px-0.5">
        <span className="flex-1">Task description</span>
        <span className="w-14 text-center">{isToday ? 'Est.' : 'Actual'}</span>
        <span className="w-4" />
      </div>
      {tasks.map((task, i) => (
        <div key={i} className="flex items-center gap-2 group/task">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isToday ? 'bg-violet-400' : 'bg-indigo-400'}`} />
          <input
            ref={el => { refs.current[i] = el; }}
            value={task.text}
            onChange={e => updateText(i, e.target.value)}
            onKeyDown={e => onKeyDown(e, i)}
            placeholder={`Task ${i + 1}…`}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none border-b border-transparent focus:border-slate-300 transition py-0.5 min-w-0"
          />
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <input
              type="number"
              value={task.hours}
              onChange={e => updateHours(i, e.target.value)}
              placeholder="0"
              min="0"
              max="24"
              step="0.5"
              className={`w-12 text-center text-xs font-medium rounded-md border py-1.5 focus:outline-none focus:ring-1 transition
                ${task.hours
                  ? (isToday ? 'border-violet-200 bg-violet-50 text-violet-700 focus:ring-violet-300' : 'border-indigo-200 bg-indigo-50 text-indigo-700 focus:ring-indigo-300')
                  : 'border-slate-200 bg-slate-100 text-slate-500 focus:ring-slate-300'}`}
            />
            <span className="text-xs text-slate-400 font-medium">h</span>
          </div>
          <button
            onClick={() => remove(i)}
            className="opacity-0 group-hover/task:opacity-100 text-slate-300 hover:text-red-400 transition flex-shrink-0 w-4"
            aria-label="Remove task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={add}
          className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-indigo-600 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
        {total > 0 && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isToday ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
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

  const [view,           setView]           = useState<'form' | 'timesheet'>('form');
  const [date,           setDate]           = useState(todayStr());
  const [project,        setProject]        = useState('');
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([{ text: '', hours: '' }]);
  const [todayTasks,     setTodayTasks]     = useState<Task[]>([{ text: '', hours: '' }]);
  const [blockers,       setBlockers]       = useState('');
  const [format,         setFormat]         = useState<'standard' | 'detailed' | 'concise'>('standard');
  const [formatted,      setFormatted]      = useState('');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [copied,         setCopied]         = useState(false);
  const [savedId,        setSavedId]        = useState<string | null>(null);
  const [exportStart,    setExportStart]    = useState(weekAgoStr());
  const [exportEnd,      setExportEnd]      = useState(todayStr());
  const [expandedId,     setExpandedId]     = useState<string | null>(null);

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

      const existing = entries.find(e => e.type === 'standup' && (e.data as Record<string, unknown>).date === date);
      if (existing) deleteEntry(existing.id);

      const saved = await saveEntry({
        type: 'standup', emoji: '📋', label: fmtDate(date),
        preview: (yT[0]?.text || tT[0]?.text || 'Standup').slice(0, 60),
        data: {
          date, project, yesterdayTasks: yT, todayTasks: tT,
          blockers, format, formatted: data.formatted, savedAt: Date.now(),
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
    setTodayTasks(e.todayTasks.length         ? e.todayTasks     : [{ text: '', hours: '' }]);
    setBlockers(e.blockers);
    setFormat((e.format as 'standard' | 'detailed' | 'concise') || 'standard');
    setFormatted(e.formatted); setSavedId(e.id); setView('form');
  };

  const handleDelete = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    deleteEntry(id);
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
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-1.5 bg-white rounded-2xl border border-slate-200/70 p-1.5" style={{ boxShadow: 'var(--shadow-card)' }}>
        {(['form', 'timesheet'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              view === v ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {v === 'form' ? 'New Standup' : 'Timesheet'}
            {v === 'timesheet' && history.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${view === 'timesheet' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {history.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── FORM VIEW ── */}
      {view === 'form' && (
        <div className="space-y-4 fade-in-up">
          {/* Date / Project / Hours summary */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Date</label>
                <input
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Project / Team</label>
                <input
                  type="text" value={project} onChange={e => setProject(e.target.value)} placeholder="e.g. Platform, Mobile…"
                  className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Hours summary</label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-base font-bold text-indigo-600 leading-tight">{yTotal || '—'}<span className="text-xs font-normal ml-0.5">h</span></div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wide">Logged</div>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-base font-bold text-violet-600 leading-tight">{tTotal || '—'}<span className="text-xs font-normal ml-0.5">h</span></div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wide">Planned</div>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-700 leading-tight">{yTotal + tTotal || '—'}<span className="text-xs font-normal ml-0.5">h</span></div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wide">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-slate-700">Yesterday</span>
                <span className="text-[10px] text-slate-400">What did you complete?</span>
              </div>
              <TaskList tasks={yesterdayTasks} onChange={setYesterdayTasks} isToday={false} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-slate-700">Today</span>
                <span className="text-[10px] text-slate-400">What's your plan?</span>
              </div>
              <TaskList tasks={todayTasks} onChange={setTodayTasks} isToday={true} />
            </div>
          </div>

          {/* Blockers */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Blockers <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text" value={blockers} onChange={e => setBlockers(e.target.value)}
              placeholder="Waiting on design review, blocked by infra issue…"
              className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
            />
          </div>

          {/* Format */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <label className="block text-xs font-medium text-slate-500 mb-3">DSM format style</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as typeof format)}
                  className={`flex flex-col gap-1 rounded-lg border px-3 py-3 text-left transition-all duration-150 ${
                    format === f.id
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className={`text-xs font-semibold ${format === f.id ? 'text-indigo-700' : 'text-slate-700'}`}>{f.label}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{f.desc}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs text-slate-400">
              {format === 'standard' && 'Bullet points with action verbs — good for most standup portals.'}
              {format === 'detailed' && 'Full sentences with context — ideal for formal HR portals.'}
              {format === 'concise'  && 'Ultra-brief — great for Slack standup bots or short text fields.'}
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Generating standup…
              </span>
            ) : 'Generate standup'}
          </button>

          {loading && <div className="skeleton h-44 w-full" />}

          {/* Result */}
          {formatted && (
            <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden fade-in-up" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">Standup ready</span>
                  {savedId && (
                    <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      Saved
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md border transition ${
                      copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy to clipboard'}
                  </button>
                  <button
                    onClick={() => setView('timesheet')}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    View timesheet
                  </button>
                </div>
              </div>
              <pre className="px-4 sm:px-5 py-4 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {formatted}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── TIMESHEET VIEW ── */}
      {view === 'timesheet' && (
        <div className="space-y-4 fade-in-up">
          {/* Export controls */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-xs font-medium text-slate-500 mb-3">Export date range</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
                <input
                  type="date" value={exportStart} onChange={e => setExportStart(e.target.value)}
                  className="rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
                <input
                  type="date" value={exportEnd} onChange={e => setExportEnd(e.target.value)}
                  className="rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
                />
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${filteredEntries.length ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                {filteredEntries.length} entries · {filteredEntries.reduce((s, e) => s + sumHours(e.yesterdayTasks), 0)}h
              </span>
              <div className="flex gap-2 sm:ml-auto">
                <button
                  onClick={exportCSV}
                  disabled={!filteredEntries.length}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 transition disabled:opacity-50"
                >
                  Export CSV
                </button>
                <button
                  onClick={printTimesheet}
                  disabled={!filteredEntries.length}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Print / PDF
                </button>
              </div>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p className="text-slate-500 font-medium text-sm">No standup entries yet.</p>
              <p className="text-xs text-slate-400 mt-1">Create your first standup to see it here.</p>
              <button
                onClick={() => setView('form')}
                className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition"
              >
                Create standup
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Yesterday (Actual)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Today (Est.)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Blockers</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Hours</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((entry, i) => {
                      const inRange = entry.date >= exportStart && entry.date <= exportEnd;
                      const yHrs    = sumHours(entry.yesterdayTasks);
                      return (
                        <React.Fragment key={entry.id}>
                          <tr
                            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            className={`cursor-pointer group transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-indigo-50 ${!inRange ? 'opacity-40' : ''}`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-slate-800 text-xs">{entry.date}</div>
                              <div className="text-[10px] text-slate-400">{fmtDay(entry.date)}</div>
                            </td>
                            <td className="px-4 py-3"><span className="text-xs text-slate-600">{entry.project || '—'}</span></td>
                            <td className="px-4 py-3 max-w-[200px]">
                              {entry.yesterdayTasks.slice(0, 3).map((t, j) => (
                                <div key={j} className="flex items-start justify-between gap-2 mb-0.5">
                                  <span className="text-xs text-slate-600 truncate">· {t.text}</span>
                                  {t.hours && <span className="text-xs font-semibold text-indigo-600 flex-shrink-0">{t.hours}h</span>}
                                </div>
                              ))}
                              {entry.yesterdayTasks.length > 3 && <div className="text-[10px] text-slate-400">+{entry.yesterdayTasks.length - 3} more</div>}
                              {yHrs > 0 && <div className="text-[10px] font-semibold text-indigo-700 mt-1 pt-1 border-t border-slate-100">Total: {yHrs}h</div>}
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              {entry.todayTasks.slice(0, 3).map((t, j) => (
                                <div key={j} className="flex items-start justify-between gap-2 mb-0.5">
                                  <span className="text-xs text-slate-600 truncate">· {t.text}</span>
                                  {t.hours && <span className="text-xs font-semibold text-violet-600 flex-shrink-0">{t.hours}h</span>}
                                </div>
                              ))}
                              {entry.todayTasks.length > 3 && <div className="text-[10px] text-slate-400">+{entry.todayTasks.length - 3} more</div>}
                            </td>
                            <td className="px-4 py-3">
                              {entry.blockers
                                ? <span className="text-xs text-red-500">{entry.blockers}</span>
                                : <span className="text-xs text-slate-400">None</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-bold text-indigo-600">{yHrs > 0 ? `${yHrs}h` : '—'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={ev => { ev.stopPropagation(); loadEntry(entry); }}
                                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={ev => handleDelete(entry.id, ev)}
                                  className="text-xs text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedId === entry.id && (
                            <tr className="bg-slate-50 border-t border-slate-100">
                              <td colSpan={7} className="px-4 py-4">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-2">Formatted standup</p>
                                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-slate-200">
                                  {entry.formatted}
                                </pre>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  {filteredEntries.length > 0 && (
                    <tfoot>
                      <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                        <td colSpan={5} className="px-4 py-3 text-right text-xs font-semibold text-indigo-600">
                          Total ({filteredEntries.length} days in range)
                        </td>
                        <td className="px-4 py-3 text-center text-base font-bold text-indigo-600">
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
