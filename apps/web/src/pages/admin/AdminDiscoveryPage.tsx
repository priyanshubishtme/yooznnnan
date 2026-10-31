/**
 * Admin Discovery Jobs and APScheduler Telemetry View
 */

import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DiscoveryJob } from '../../types';

export const AdminDiscoveryPage: React.FC = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<DiscoveryJob[]>([
    {
      id: 'job-pmkisan-initial',
      source_id: 'SRC-MIN-AGRI',
      trigger_type: 'manual',
      status: 'completed',
      pages_discovered: 12,
      pages_fetched: 4,
      candidates_created: 1,
      started_at: '2026-10-31 03:00:00 IST',
      completed_at: '2026-10-31 03:01:14 IST'
    },
    {
      id: 'job-uk-social-wel',
      source_id: 'SRC-UK-SOCIAL-WELFARE',
      trigger_type: 'scheduled',
      status: 'completed',
      pages_discovered: 18,
      pages_fetched: 6,
      candidates_created: 2,
      started_at: '2026-10-31 01:00:00 IST',
      completed_at: '2026-10-31 01:02:05 IST'
    }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {t('admin.nav.discovery')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Dedicated single-instance APScheduler process tracking and manual run execution.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => alert('Discovery job enqueued for policy-approved sources.')}>
          <Play size={16} />
          Trigger All Scheduled Sources
        </button>
      </div>

      {/* Discovery Pipeline Architecture Card */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Discovery Execution Architecture</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          In accordance with Blueprint Section 4 & 16.2, scraping and scheduled discovery run in a dedicated, single-process instance of APScheduler to guarantee idempotent executions and prevent overlapping worker deadlocks.
        </p>
      </div>

      {/* Jobs History Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>
          Recent Job Executions
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Job ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Source ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Trigger</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Discovered</th>
                <th style={{ padding: '0.75rem 1rem' }}>Fetched</th>
                <th style={{ padding: '0.75rem 1rem' }}>Candidates</th>
                <th style={{ padding: '0.75rem 1rem' }}>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{j.id}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-primary)' }}>{j.source_id}</td>
                  <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>{j.trigger_type}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-emerald">{j.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{j.pages_discovered}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{j.pages_fetched}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{j.candidates_created}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{j.completed_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
