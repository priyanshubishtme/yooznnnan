/**
 * Public Scheme Detail View with Full Guidance, Verification Provenance, and Portal Link
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SchemeItem } from '../../types';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateViews';

export const PublicSchemeDetailPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const { language, t } = useLanguage();
  const [scheme, setScheme] = useState<SchemeItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/v1/schemes/${schemeId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Scheme not found (status ${res.status})`);
        return res.json();
      })
      .then(data => {
        if (data.ok && data.data) {
          setScheme(data.data);
        } else {
          throw new Error('Scheme data not available');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [schemeId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <LoadingSkeleton count={3} height="150px" />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <ErrorState
          title="Scheme Not Found"
          message={error || 'The requested scheme could not be retrieved from the verified registry.'}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/schemes" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back to Schemes
          </Link>
        </div>
      </div>
    );
  }

  const name = language === 'hi' ? scheme.name_hi : scheme.name_en;
  const desc = language === 'hi' ? scheme.description_hi : scheme.description_en;
  const benefits = language === 'hi' ? scheme.benefits_summary_hi : scheme.benefits_summary_en;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Back Link */}
      <Link
        to="/schemes"
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
        {language === 'hi' ? 'सभी योजनाओं पर वापस जाएं' : 'Back to Schemes Catalogue'}
      </Link>

      {/* Main Header Card */}
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`badge ${scheme.level === 'central' ? 'badge-emerald' : 'badge-blue'}`}>
            {scheme.level.toUpperCase()} JURISDICTION
          </span>
          <span className="badge badge-muted">{scheme.category}</span>
          {scheme.rag_enabled && <span className="badge badge-emerald">Verified RAG Available</span>}
          {scheme.rules_enabled && <span className="badge badge-saffron">Rule-Enabled Decision Tree</span>}
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25 }}>{name}</h1>

        {scheme.ministry_or_dept && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <Building size={16} />
            <span>{scheme.ministry_or_dept}</span>
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          {desc}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <Link to="/app/eligibility" className="btn btn-primary">
            <CheckCircle2 size={18} />
            {t('btn.checkEligibility')}
          </Link>
          <Link to="/app/chat" className="btn btn-secondary">
            <Sparkles size={18} />
            {language === 'hi' ? 'इस योजना के बारे में पूछें' : 'Ask Question in Chat'}
          </Link>
          {scheme.official_portal_url && (
            <a
              href={scheme.official_portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {t('btn.applyNow')}
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Benefits Breakdown Card */}
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-saffron)' }} />
          {language === 'hi' ? 'दस्तावेजीकृत वित्तीय एवं कल्याणकारी लाभ' : 'Documented Financial & Welfare Benefits'}
        </h2>
        <div
          style={{
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            border: '1px solid var(--border-normal)',
            fontSize: '1rem',
            color: 'var(--text-primary)',
            lineHeight: 1.6
          }}
        >
          {benefits || (language === 'hi' ? 'आधिकारिक लाभ विवरण की पुष्टि की जा रही है।' : 'Benefit details currently undergoing evidence verification.')}
        </div>
      </div>

      {/* Provenance and Integrity Box */}
      <div
        className="glass-card"
        style={{
          borderLeft: '4px solid var(--accent-primary)',
          background: 'var(--accent-primary-light)',
          padding: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ShieldCheck size={22} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {language === 'hi'
              ? 'यह जानकारी आधिकारिक राजपत्र और मंत्रालय के दिशा-निर्देशों से संकलित है। कोई अपुष्ट दावा शामिल नहीं है।'
              : 'Content indexed from verified ministerial gazettes and guidelines. Zero unverified claims.'}
          </span>
        </div>
      </div>
    </div>
  );
};
