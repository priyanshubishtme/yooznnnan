/**
 * Citizen Scheme Detail View with Interactive Document Checklist
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  CheckSquare,
  Square,
  FileText,
  ExternalLink,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SchemeItem } from '../../types';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateViews';

export const CitizenSchemeDetailPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const { language, t } = useLanguage();
  const [scheme, setScheme] = useState<SchemeItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`checklist_${schemeId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const defaultDocuments = [
    { id: 'aadhaar', label_en: 'Aadhaar Card linked to Bank Account', label_hi: 'बैंक खाते से लिंक आधार कार्ड' },
    { id: 'bank_passbook', label_en: 'Bank Passbook with IFSC Code', label_hi: 'बैंक पासबुक (IFSC कोड सहित)' },
    { id: 'land_record', label_en: 'Land Ownership Record / Khasra-Khatauni (for farmers)', label_hi: 'भूमि अभिलेख / खसरा-खतौनी (किसानों हेतु)' },
    { id: 'income_cert', label_en: 'Income Certificate issued by Tehsildar', label_hi: 'तहसीलदार द्वारा जारी आय प्रमाण पत्र' }
  ];

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/schemes/${schemeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) setScheme(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [schemeId]);

  const toggleCheck = (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] };
    setChecklist(updated);
    localStorage.setItem(`checklist_${schemeId}`, JSON.stringify(updated));
  };

  if (loading) return <LoadingSkeleton count={3} height="140px" />;
  if (!scheme) return <ErrorState title="Scheme Not Found" />;

  const name = language === 'hi' ? scheme.name_hi : scheme.name_en;
  const desc = language === 'hi' ? scheme.description_hi : scheme.description_en;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <Link
        to="/app/discover"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          fontWeight: 500
        }}
      >
        <ArrowLeft size={16} />
        {language === 'hi' ? 'योजना सूची पर वापस' : 'Back to Discover'}
      </Link>

      {/* Main Details Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
              {scheme.level.toUpperCase()} LEVEL
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{name}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{scheme.ministry_or_dept}</div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/app/chat" className="btn btn-sm btn-secondary">
              <MessageSquare size={16} />
              Ask in Chat
            </Link>
            {scheme.official_portal_url && (
              <a href={scheme.official_portal_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                Official Portal <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>{desc}</p>
      </div>

      {/* Document Preparation Checklist */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {language === 'hi' ? 'आवेदन दस्तावेज़ चेकलिस्ट' : 'Application Document Checklist'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {language === 'hi'
              ? 'यह चेकलिस्ट आपकी व्यक्तिगत तैयारी के लिए है, सरकारी सत्यापन नहीं।'
              : 'For citizen preparation tracking only. Checking a document is not government approval.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {defaultDocuments.map(doc => {
            const isChecked = !!checklist[doc.id];
            return (
              <button
                key={doc.id}
                onClick={() => toggleCheck(doc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isChecked ? 'var(--accent-primary-light)' : 'var(--bg-app)',
                  border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {isChecked ? (
                  <CheckSquare size={20} style={{ color: 'var(--accent-primary)' }} />
                ) : (
                  <Square size={20} style={{ color: 'var(--text-muted)' }} />
                )}
                <span style={{ fontSize: '0.9rem', fontWeight: isChecked ? 600 : 400 }}>
                  {language === 'hi' ? doc.label_hi : doc.label_en}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
