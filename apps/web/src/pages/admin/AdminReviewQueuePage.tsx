/**
 * Admin Discovery & Document Review Queue
 */

import React, { useState } from 'react';
import { FileCheck, CheckCircle2, XCircle, ArrowRight, ExternalLink, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ResourceCandidate } from '../../types';
import { EmptyState } from '../../components/common/StateViews';

export const AdminReviewQueuePage: React.FC = () => {
  const { t } = useLanguage();
  const [candidates, setCandidates] = useState<ResourceCandidate[]>([
    {
      id: 'cand-pmkisan-circ-2024',
      source_id: 'SRC-MIN-AGRI',
      canonical_url: 'https://pmkisan.gov.in/documents/guidelines_2024.pdf',
      original_url: 'https://pmkisan.gov.in/documents/guidelines_2024.pdf',
      content_type: 'application/pdf',
      binary_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      title: 'PM-KISAN Operational Guidelines Revised Edition',
      issuer: 'Ministry of Agriculture & Farmers Welfare',
      detected_date: '2026-10-15',
      classification: 'new_resource',
      review_status: 'pending_review',
      assigned_scheme_id: 'SCHEME-PM-KISAN',
      created_at: '2026-10-31 03:01:14 IST'
    }
  ]);

  const handleDecision = (id: string, decision: 'approved' | 'rejected') => {
    alert(`Candidate ${id} marked as ${decision}. Triggering shared PDF ingestion and indexing pipeline.`);
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {t('admin.nav.reviewQueue')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Review and approve newly discovered government resources before they can be ingested or indexed.
        </p>
      </div>

      {/* Review Gate Integrity Banner */}
      <div
        className="glass-card"
        style={{
          borderLeft: '4px solid var(--accent-primary)',
          background: 'var(--accent-primary-light)',
          padding: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ShieldAlert size={22} style={{ color: 'var(--accent-primary)' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <strong>Gate Rule:</strong> A newly discovered candidate never becomes public or searchable prior to human approval. Approving enqueues the resource into the shared coordinate-preserving ingestion service.
          </div>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="Review Queue is Clean"
          description="All discovered documents and guideline revisions have been processed."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {candidates.map(c => (
            <div key={c.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-saffron">PENDING REVIEW</span>
                    <span className="badge badge-muted">{c.classification}</span>
                    <span className="badge badge-blue">{c.content_type}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Issuer: {c.issuer} • Detected: {c.detected_date}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleDecision(c.id, 'approved')} className="btn btn-sm btn-primary">
                    <CheckCircle2 size={16} /> Approve & Ingest
                  </button>
                  <button onClick={() => handleDecision(c.id, 'rejected')} className="btn btn-sm btn-ghost" style={{ color: 'var(--accent-danger)' }}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <strong>URL:</strong>{' '}
                  <a href={c.canonical_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                    {c.canonical_url} <ExternalLink size={10} />
                  </a>
                </div>
                <div>
                  <strong>SHA-256 Fingerprint:</strong> <code>{c.binary_sha256}</code>
                </div>
                <div>
                  <strong>Assigned Scheme:</strong> <span className="badge badge-emerald">{c.assigned_scheme_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
