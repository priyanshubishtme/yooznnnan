/**
 * Admin Document Versions & Extraction Health View
 */

import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDocumentsPage: React.FC = () => {
  const { t } = useLanguage();

  const documents = [
    {
      id: 'doc-pmkisan-v1',
      title: 'PM-KISAN Operational Guidelines 2024',
      scheme_id: 'SCHEME-PM-KISAN',
      version: 1,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      pages: 18,
      status: 'verified',
      parser: 'pymupdf_v1',
      coordinates_captured: true
    },
    {
      id: 'doc-csss-v1',
      title: 'Central Sector Scheme of Scholarship Guidelines',
      scheme_id: 'SCHEME-CSSS',
      version: 1,
      sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      pages: 12,
      status: 'verified',
      parser: 'pymupdf_v1',
      coordinates_captured: true
    },
    {
      id: 'doc-nanda-gaura-v1',
      title: 'Uttarakhand Nanda Gaura Notification 2024',
      scheme_id: 'SCHEME-UK-NANDA-GAURA',
      version: 1,
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      pages: 8,
      status: 'verified',
      parser: 'pymupdf_v1',
      coordinates_captured: true
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {t('admin.nav.documents')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Immutable document versions, cryptographic SHA-256 provenance, and coordinate highlight storage.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Doc ID / Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Scheme</th>
                <th style={{ padding: '0.75rem 1rem' }}>Version</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Pages</th>
                <th style={{ padding: '0.75rem 1rem' }}>Coordinates</th>
                <th style={{ padding: '0.75rem 1rem' }}>SHA-256 Fingerprint</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{d.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.id}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                    {d.scheme_id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>v{d.version}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-emerald">{d.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.pages} pages</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-blue">Captured</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {d.sha256.slice(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
