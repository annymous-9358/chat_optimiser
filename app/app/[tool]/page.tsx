'use client';

import { use } from 'react';
import Link from 'next/link';
import { TOOL_COMPONENTS } from '../toolComponents';
import { useSessionBridge } from '../SessionBridge';

export default function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = use(params);
  const entry = TOOL_COMPONENTS[tool];
  const { loadedSession, clearLoadedSession } = useSessionBridge();

  if (!entry) {
    return (
      <div className="tc-view">
        <div className="tc-view-header">
          <h1 className="tc-heading">Tool not found</h1>
          <p className="tc-desc">
            &quot;{tool}&quot; isn&apos;t a tool in Convey. <Link href="/app/rephrase" style={{ color: 'var(--tc-accent)' }}>Go to Rephrase</Link> or pick one from the sidebar.
          </p>
        </div>
      </div>
    );
  }

  const { Component, type } = entry;

  return (
    <Component
      loadSession={loadedSession?.type === type ? loadedSession : null}
      onSessionLoaded={clearLoadedSession}
    />
  );
}
