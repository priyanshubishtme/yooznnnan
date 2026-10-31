/**
 * Admin Source Registry & Compliance Gate View
 */

import React, { useEffect, useState } from 'react';
import { Globe2, ShieldAlert, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SourceRecord } from '../../types';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateViews';

export const AdminSourcesPage: React.FC = () => {
  const { t } = useLanguage();
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/admin/sources')
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.data)) {
          setSources(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {t('admin.nav.sources')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Government portal registry, policy approvals, and crawler compliance status.
          </p>
        </div>
      </div>

      {/* Compliance Callout */}
      <div
        className="glass-card"
        style={{
          borderLeft: '4px solid var(--accent-saffron)',
          background: 'var(--accent-saffron-light)',
          padding: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ShieldAlert size={22} style={{ color: 'var(--accent-saffron)' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <strong>Blueprint Section 3.3 Compliance:</strong> myScheme Terms of Use restrict automated tools without express written authorization. myScheme is locked in <code>disabled</code> mode. Only authorized central ministry and state department pages can be scheduled.
          </div>
        </div>
      </div>

      {/* Sources Table / Cards */}
      {loading ? (
        <LoadingSkeleton count={4} height="120px" />
      ) : sources.length === 0 ? (
        <div className="glass-card">No sources registered.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sources.map(s => (
            <div
              key={s.source_id}
              className="glass-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-muted">{s.source_family}</span>
                  <span
                    className={`badge ${
                      s.permission_status === 'approved'
                        ? 'badge-emerald'
                        : s.permission_status === 'written_authorization_required'
                        ? 'badge-danger'
                        : 'badge-saffron'
                    }`}
                  >
                    {s.permission_status}
                  </span>
                  <span className={`badge ${s.automation_status === 'enabled' ? 'badge-emerald' : 'badge-muted'}`}>
                    Automation: {s.automation_status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{s.name}</h3>

                <a
                  href={s.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-primary)',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {s.base_url} <ExternalLink size={12} />
                </a>

                {s.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {s.notes}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Schedule: <code>{s.schedule_cron}</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Adapter: <code>{s.adapter_key}</code>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={s.permission_status !== 'approved'}
                  title={s.permission_status !== 'approved' ? 'Requires human policy approval first' : 'Run discovery now'}
                >
                  Run Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
