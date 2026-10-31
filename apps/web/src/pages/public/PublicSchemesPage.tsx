/**
 * Public Scheme Directory with Search, Filters, and Verified Evidence Badges
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShieldCheck, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SchemeItem } from '../../types';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/common/StateViews';

export const PublicSchemesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const fetchSchemes = () => {
    setLoading(true);
    setError(null);
    let url = 'http://localhost:8000/api/v1/schemes?limit=50';
    if (selectedCategory !== 'all') url += `&category=${encodeURIComponent(selectedCategory)}`;
    if (selectedLevel !== 'all') url += `&level=${encodeURIComponent(selectedLevel)}`;
    if (searchTerm) url += `&q=${encodeURIComponent(searchTerm)}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.ok && Array.isArray(data.data)) {
          setSchemes(data.data);
        } else {
          throw new Error('Invalid response format');
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('API fetch failed, falling back to local seed preview:', err);
        setError('Could not connect to backend server. Make sure the API is running at http://localhost:8000.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  const categories = [
    'all',
    'Agriculture & Rural',
    'Education & Scholarships',
    'Social Security & Pension',
    'Healthcare',
    'Housing & Welfare',
    'Women & Child Development'
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
          Official Scheme Catalogue
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          {language === 'hi' ? 'सरकारी कल्याणकारी योजनाएं' : 'Government Welfare Schemes'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          {language === 'hi'
            ? 'सत्यापित सरकारी अधिसूचनाओं और आधिकारिक दिशानिर्देशों द्वारा समर्थित योजनाएं।'
            : 'Authoritative government schemes grounded in verified gazettes and operational guidelines.'}
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.25rem'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              flex: 1
            }}
          >
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={language === 'hi' ? 'योजना का नाम या कीवर्ड खोजें (उदा. किसान, छात्रवृत्ति, आवास)...' : 'Search schemes by keyword (e.g. farmer, scholarship, pension)...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                width: '100%'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {language === 'hi' ? 'खोजें' : 'Search'}
          </button>
        </form>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`badge ${selectedCategory === cat ? 'badge-emerald' : 'badge-muted'}`}
                style={{ padding: '0.4rem 0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {cat === 'all' ? (language === 'hi' ? 'सभी श्रेणियां' : 'All Categories') : cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Level:</span>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              style={{
                background: 'var(--bg-app)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-normal)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem'
              }}
            >
              <option value="all">All Jurisdictions</option>
              <option value="central">Central Government</option>
              <option value="state">Uttarakhand State</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      {loading ? (
        <LoadingSkeleton count={6} height="180px" />
      ) : error ? (
        <ErrorState
          title="Backend Connection Notice"
          message={error}
          onRetry={fetchSchemes}
        />
      ) : schemes.length === 0 ? (
        <EmptyState
          title={language === 'hi' ? 'कोई योजना नहीं मिली' : 'No schemes match your query'}
          description={language === 'hi' ? 'कृपया अन्य कीवर्ड खोजें या फिल्टर रीसेट करें।' : 'Try refining your search terms or clearing category filters.'}
          actionLabel={language === 'hi' ? 'फिल्टर हटाएं' : 'Reset Filters'}
          onAction={() => { setSelectedCategory('all'); setSelectedLevel('all'); setSearchTerm(''); }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {schemes.map(s => {
            const name = language === 'hi' ? s.name_hi : s.name_en;
            const desc = language === 'hi' ? s.description_hi : s.description_en;
            const benefits = language === 'hi' ? s.benefits_summary_hi : s.benefits_summary_en;

            return (
              <div
                key={s.scheme_id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`badge ${s.level === 'central' ? 'badge-emerald' : 'badge-blue'}`}>
                      {s.level.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {s.rag_enabled && <span className="badge badge-emerald" title="RAG Cited Answers Ready">RAG</span>}
                      {s.rules_enabled && <span className="badge badge-saffron" title="Deterministic Rules Verified">RULES</span>}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.35rem' }}>
                    {name}
                  </h3>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                    {s.ministry_or_dept || s.category}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {desc}
                  </p>

                  {benefits && (
                    <div
                      style={{
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <strong>{language === 'hi' ? 'लाभ:' : 'Benefits:'}</strong> {benefits}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <Link
                    to={`/schemes/${s.scheme_id}`}
                    style={{
                      color: 'var(--accent-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {language === 'hi' ? 'पूरा विवरण' : 'Full Details'}
                    <ArrowRight size={14} />
                  </Link>

                  <Link to="/app/eligibility" className="btn btn-sm btn-primary">
                    {t('btn.checkEligibility')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
