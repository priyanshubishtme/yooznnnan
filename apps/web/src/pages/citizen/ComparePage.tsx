/**
 * Scheme Side-by-Side Comparison Interface
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Check, X, ShieldCheck, ExternalLink, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SchemeItem } from '../../types';

export const ComparePage: React.FC = () => {
  const { language } = useLanguage();
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['SCHEME-PM-KISAN', 'SCHEME-PMAY-G']);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/v1/schemes?limit=50');
        if (resp.ok) {
          const json = await resp.json();
          setSchemes(json.data.schemes || []);
        }
      } catch (e) {
        console.error('Failed to load schemes for comparison:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const comparedSchemes = schemes.filter(s => selectedIds.includes(s.scheme_id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-emerald">
            <ShieldCheck size={14} />
            Verified Comparison
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          {language === 'hi' ? 'योजनाओं की परस्पर तुलना' : 'Scheme Side-by-Side Comparison'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          {language === 'hi'
            ? 'पात्रता शर्तों, वित्तीय लाभों और आवश्यक दस्तावेज़ों की सीधी तुलना करें।'
            : 'Compare statutory criteria, financial benefits, and operational modes across schemes.'}
        </p>
      </div>

      {/* Scheme Selectors */}
      <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
          {language === 'hi' ? 'तुलना हेतु योजनाएं चुनें (अधिकतम 3):' : 'Select Schemes to Compare (Up to 3):'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {schemes.map(s => {
            const isSelected = selectedIds.includes(s.scheme_id);
            return (
              <button
                key={s.scheme_id}
                onClick={() => {
                  if (isSelected) {
                    if (selectedIds.length > 1) {
                      setSelectedIds(selectedIds.filter(id => id !== s.scheme_id));
                    }
                  } else {
                    if (selectedIds.length < 3) {
                      setSelectedIds([...selectedIds, s.scheme_id]);
                    }
                  }
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--accent-primary)' : 'var(--bg-app)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-normal)'}`,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>{language === 'hi' ? s.name_hi : s.name_en}</span>
                {isSelected && <Check size={13} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparedSchemes.length}, 1fr)`, gap: '1.25rem' }}>
        {comparedSchemes.map(s => (
          <div
            key={s.scheme_id}
            className="glass-card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--accent-saffron)',
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  textTransform: 'uppercase'
                }}
              >
                {s.category}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.5rem 0 0.2rem 0', color: 'var(--text-primary)' }}>
                {language === 'hi' ? s.name_hi : s.name_en}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.level} • {s.ministry_or_dept}</div>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>OPERATIONAL MODE</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                {s.initial_mode}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                {language === 'hi' ? 'योजना का विवरण' : 'Scheme Description'}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                {language === 'hi' ? s.description_hi : s.description_en}
              </p>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <a
                href={s.official_portal_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <span>{language === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

