/**
 * Admin Eligibility Rules Review & Lifecycle Invalidation Console
 */

import React, { useState } from 'react';
import { Scale, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminRulesPage: React.FC = () => {
  const { t } = useLanguage();
  const [rules, setRules] = useState([
    {
      id: 'rule-pmkisan-landholder',
      scheme_id: 'SCHEME-PM-KISAN',
      code: 'R_LANDHOLDING_FARMER',
      version: 1,
      status: 'active',
      evidence_quote: 'All landholding farmer families having cultivable landholding in their names are eligible.',
      page_ref: 3,
      doc_version: 'doc-pmkisan-v1'
    },
    {
      id: 'rule-csss-percentile',
      scheme_id: 'SCHEME-CSSS',
      code: 'R_PERCENTILE_80_ABOVE',
      version: 1,
      status: 'active',
      evidence_quote: 'Students who are above 80th percentile of successful candidates in the relevant stream from a Board.',
      page_ref: 2,
      doc_version: 'doc-csss-v1'
    },
    {
      id: 'rule-nanda-gaura-domicile',
      scheme_id: 'SCHEME-UK-NANDA-GAURA',
      code: 'R_UK_PERMANENT_RESIDENT',
      version: 1,
      status: 'active',
      evidence_quote: 'आवेदक परिवार उत्तराखंड राज्य का स्थायी / मूल निवासी होना अनिवार्य है।',
      page_ref: 1,
      doc_version: 'doc-nanda-gaura-v1'
    }
  ]);

  const simulateSourceChange = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, status: 'needs_review' } : r))
    );
    alert('Governing document changed! Rule immediately invalidated and set to `needs_review`. It cannot produce eligibility results until re-approved.');
  };

  const reApproveRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, status: 'active' } : r))
    );
    alert('Rule verified against new document version and re-approved for live deterministic evaluation.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {t('admin.nav.rules')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Human review, evidence quote anchoring, and automatic lifecycle invalidation for eligibility rules.
        </p>
      </div>

      {/* Invalidation Rule Notice */}
      <div
        className="glass-card"
        style={{
          borderLeft: '4px solid var(--accent-saffron)',
          background: 'var(--accent-saffron-light)',
          padding: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <AlertTriangle size={22} style={{ color: 'var(--accent-saffron)' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <strong>Integrity Rule 4:</strong> Never let a changed document's previously approved rules remain silently active. Any source version change marks dependent rules <code>needs_review</code>.
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {rules.map(r => (
          <div key={r.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${r.status === 'active' ? 'badge-emerald' : 'badge-danger'}`}>
                  {r.status.toUpperCase()}
                </span>
                <span className="badge badge-muted">v{r.version}</span>
                <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{r.code}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {r.status === 'active' ? (
                  <button
                    onClick={() => simulateSourceChange(r.id)}
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--accent-saffron)', border: '1px dashed var(--accent-saffron)' }}
                    title="Simulate upstream source change"
                  >
                    Simulate Source Update
                  </button>
                ) : (
                  <button onClick={() => reApproveRule(r.id)} className="btn btn-sm btn-primary">
                    <CheckCircle size={14} /> Re-Approve Rule
                  </button>
                )}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scheme: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{r.scheme_id}</span> • Document Version: <code>{r.doc_version}</code> (Page {r.page_ref})
            </div>

            <div
              style={{
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                color: 'var(--text-primary)'
              }}
            >
              "{r.evidence_quote}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
