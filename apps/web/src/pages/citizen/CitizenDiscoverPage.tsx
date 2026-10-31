/**
 * Citizen Scheme Discovery View
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SchemeItem } from '../../types';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';

export const CitizenDiscoverPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/schemes?limit=50')
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.data)) {
          setSchemes(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSchemes = schemes.filter(s => {
    const text = `${s.name_en} ${s.name_hi} ${s.category} ${s.description_en} ${s.description_hi}`.toLowerCase();
    return text.includes(filter.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {t('app.nav.discover')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {language === 'hi'
            ? 'अपनी पसंद और आवश्यकता के अनुसार सत्यापित योजनाएं खोजें और सहेजें।'
            : 'Find welfare schemes tailored to your occupation, region, and family circumstances.'}
        </p>
      </div>

      {/* Filter Input */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem'
        }}
      >
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={language === 'hi' ? 'योजना या मंत्रालय खोजें...' : 'Filter schemes by name or keywords...'}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="160px" />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState
          title="No Schemes Found"
          description="Try modifying your search term."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredSchemes.map(s => (
            <div key={s.scheme_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-emerald">{s.level.toUpperCase()}</span>
                  <span className="badge badge-muted">{s.category}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {language === 'hi' ? s.name_hi : s.name_en}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  {language === 'hi' ? s.description_hi : s.description_en}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/app/schemes/${s.scheme_id}`}
                  style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Inspect Scheme <ArrowRight size={14} />
                </Link>
                <Link to="/app/eligibility" className="btn btn-sm btn-primary">
                  Check Eligibility
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
