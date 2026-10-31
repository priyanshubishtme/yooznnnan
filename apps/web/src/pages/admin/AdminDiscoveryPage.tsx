/**
 * Admin Discovery Jobs and APScheduler Telemetry View
 * Real-time dedicated single-instance APScheduler process tracking, run logs, and controls.
 */

import React, { useEffect, useState } from 'react';
import { 
  Cpu, Play, CheckCircle2, Clock, AlertCircle, Pause, 
  RotateCcw, RefreshCw, XCircle, ChevronRight, Activity, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DiscoveryJob } from '../../types';
import { LoadingSkeleton } from '../../components/common/StateViews';

interface SchedulerTelemetry {
  running: boolean;
  paused: boolean;
  active_jobs_count: number;
  jobs: Array<{ job_id: string; name: string; next_run_time: string | null }>;
  heartbeat: string;
  process_mode: string;
}

export const AdminDiscoveryPage: React.FC = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<DiscoveryJob[]>([]);
  const [telemetry, setTelemetry] = useState<SchedulerTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<DiscoveryJob | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, schedRes] = await Promise.all([
        fetch('http://127.0.0.1:8005/api/v1/admin/discovery/jobs'),
        fetch('http://127.0.0.1:8005/api/v1/admin/scheduler/status')
      ]);

      const jobsData = await jobsRes.json();
      const schedData = await schedRes.json();

      if (jobsData.ok && Array.isArray(jobsData.data)) {
        setJobs(jobsData.data);
      }
      if (schedData.ok && schedData.data) {
        setTelemetry(schedData.data);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Failed to fetch telemetry: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handlePauseResume = async () => {
    if (!telemetry) return;
    const action = telemetry.paused ? 'resume' : 'pause';
    setActionLoading(action);
    setStatusMsg(null);
    try {
      const res = await fetch(`http://127.0.0.1:8005/api/v1/admin/scheduler/${action}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMsg({
          type: 'success',
          text: `Scheduler successfully ${action}d.`
        });
        fetchData();
      } else {
        setStatusMsg({
          type: 'error',
          text: `Action failed: ${data.error?.message || 'Scheduler control error'}`
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {t('admin.nav.discovery')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Dedicated single-instance APScheduler process tracking, job telemetry, and run history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchData} title="Refresh Telemetry">
            <RefreshCw size={16} />
            Refresh
          </button>
          {telemetry && (
            <button
              className={`btn ${telemetry.paused ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handlePauseResume}
              disabled={actionLoading !== null}
              id="btn-scheduler-pause-resume"
            >
              {telemetry.paused ? <Play size={16} /> : <Pause size={16} />}
              {telemetry.paused ? 'Resume Scheduler' : 'Pause Scheduler'}
            </button>
          )}
        </div>
      </div>

      {/* Live Status Toast */}
      {statusMsg && (
        <div
          className="glass-card"
          style={{
            borderLeft: `4px solid ${statusMsg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-danger)'}`,
            background: statusMsg.type === 'success' ? 'var(--accent-emerald-light)' : 'rgba(239, 68, 68, 0.1)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          ) : (
            <XCircle size={20} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {statusMsg.text}
          </span>
        </div>
      )}

      {/* Telemetry Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Mode */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Cpu size={18} style={{ color: 'var(--accent-primary)' }} />
            Process Architecture
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            Single-Instance
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            PID Lock Enforced
          </div>
        </div>

        {/* Status */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Activity size={18} style={{ color: telemetry?.paused ? 'var(--accent-saffron)' : 'var(--accent-emerald)' }} />
            Scheduler State
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {telemetry?.paused ? 'Paused' : telemetry?.running ? 'Active Running' : 'Stopped'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            APScheduler 3.x
          </div>
        </div>

        {/* Scheduled Jobs */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
            Reconciled Cron Jobs
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {telemetry?.active_jobs_count ?? 0} Active
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Syncs with Approved Sources
          </div>
        </div>

        {/* Heartbeat */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
            Last Heartbeat
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {telemetry?.heartbeat ? new Date(telemetry.heartbeat).toLocaleTimeString() : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Live Health Verified
          </div>
        </div>
      </div>

      {/* Active Jobs List */}
      {telemetry && telemetry.jobs.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Active Scheduled Jobs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {telemetry.jobs.map(j => (
              <div
                key={j.job_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.85rem',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <strong>{j.name}</strong> <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>({j.job_id})</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Next Run: {j.next_run_time ? new Date(j.next_run_time).toLocaleString() : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs History Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>Discovery Run Logs & Audited Telemetry</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{jobs.length} Runs Recorded</span>
        </div>

        {loading && jobs.length === 0 ? (
          <div style={{ padding: '1.5rem' }}>
            <LoadingSkeleton count={3} height="60px" />
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No discovery jobs recorded yet. Trigger a "Run Now" from the Source Registry to begin.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Run ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Source</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Trigger</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Discovered</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Fetched</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Candidates</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Execution Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => {
                  const isSuccess = j.status === 'completed';
                  const isFailed = j.status === 'failed';

                  return (
                    <tr
                      key={j.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isFailed ? 'rgba(239, 68, 68, 0.04)' : undefined
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{j.id}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {j.source_id}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>
                        <span className="badge badge-muted">{j.trigger_type}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${isSuccess ? 'badge-emerald' : isFailed ? 'badge-danger' : 'badge-saffron'}`}>
                          {j.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{j.pages_discovered}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{j.pages_fetched}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: j.candidates_created > 0 ? 'var(--accent-emerald)' : 'inherit' }}>
                        {j.candidates_created}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                        {j.completed_at ? new Date(j.completed_at).toLocaleTimeString() : 'In Progress'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {j.error_message ? (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', border: 'none', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => setSelectedJob(j)}
                            title="View failure cause"
                          >
                            View Error
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => setSelectedJob(j)}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'var(--bg-surface)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                Discovery Job Details
              </h2>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><strong>Run ID:</strong> <code>{selectedJob.id}</code></div>
              <div><strong>Source:</strong> <code>{selectedJob.source_id}</code></div>
              <div><strong>Trigger:</strong> {selectedJob.trigger_type}</div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`badge ${selectedJob.status === 'completed' ? 'badge-emerald' : 'badge-danger'}`}>
                  {selectedJob.status}
                </span>
              </div>
              <div><strong>Pages Discovered:</strong> {selectedJob.pages_discovered}</div>
              <div><strong>Pages Fetched:</strong> {selectedJob.pages_fetched}</div>
              <div><strong>Review Candidates Created:</strong> {selectedJob.candidates_created}</div>
              {selectedJob.started_at && <div><strong>Started:</strong> {new Date(selectedJob.started_at).toLocaleString()}</div>}
              {selectedJob.completed_at && <div><strong>Completed:</strong> {new Date(selectedJob.completed_at).toLocaleString()}</div>}

              {selectedJob.error_message && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--accent-danger)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    color: 'var(--accent-danger)',
                    marginTop: '0.5rem'
                  }}
                >
                  <strong>Failure / Compliance Block Reason:</strong>
                  <div style={{ marginTop: '0.25rem', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {selectedJob.error_message}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

