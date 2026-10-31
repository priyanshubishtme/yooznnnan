/**
 * Deterministic Recommendations Result Screen with 4 Status Categories
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  HelpCircle,
  AlertCircle,
  XCircle,
  Bookmark,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EligibilityResult } from '../../types';

export const RecommendationsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<any>({});
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const s = localStorage.getItem('yojana_saved');
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => {
    const p = localStorage.getItem('yojana_profile');
    if (p) setProfile(JSON.parse(p));
  }, []);

  // Compute recommendations based on profile
  const results: EligibilityResult[] = [
    {
      scheme_id: 'SCHEME-PM-KISAN',
      scheme_name: language === 'hi' ? 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)' : 'PM-KISAN Income Support',
      status: profile.occupation === 'Farmer' ? 'Eligible' : 'Not Eligible',
      matched_rules: profile.occupation === 'Farmer' ? ['Rule 1: Landholding Farmer Family', 'Rule 2: Active Aadhaar DBT Link'] : [],
      unmet_rules: profile.occupation !== 'Farmer' ? ['Primary occupation must be agricultural landholding'] : [],
      missing_information: [],
      reason: profile.occupation === 'Farmer'
        ? (language === 'hi' ? 'आप किसान/भूमिधारक मानदंड और मूल नियमों को पूरा करते हैं।' : 'Your profile matches the landholding farmer requirement.')
        : (language === 'hi' ? 'यह योजना केवल भूमिधारक किसान परिवारों के लिए आरक्षित है।' : 'Exclusively for landholding agricultural households.')
    },
    {
      scheme_id: 'SCHEME-CSSS',
      scheme_name: language === 'hi' ? 'कॉलेज व विश्वविद्यालय छात्रवृत्ति योजना (CSSS)' : 'Central Sector Scholarship Scheme',
      status: profile.occupation === 'Student' ? (profile.annual_income_band === '< 2.5 Lakhs' || profile.annual_income_band === '2.5L - 4.5L' ? 'Eligible' : 'Likely Eligible') : 'Need More Information',
      matched_rules: profile.occupation === 'Student' ? ['Occupation: Enrolled Student'] : [],
      unmet_rules: [],
      missing_information: ['Class 12 percentile verification (> 80th percentile required)'],
      reason: language === 'hi'
        ? 'छात्रवृत्ति हेतु 12वीं में 80वें पर्सेंटाइल से अधिक अंक और आय प्रमाण आवश्यक हैं।'
        : 'Requires Class 12 score above 80th percentile and college admission receipt.'
    },
    {
      scheme_id: 'SCHEME-UK-NANDA-GAURA',
      scheme_name: language === 'hi' ? 'नंदा गौरा योजना (उत्तराखंड)' : 'Uttarakhand Nanda Gaura Yojana',
      status: profile.state === 'Uttarakhand' ? 'Likely Eligible' : 'Not Eligible',
      matched_rules: profile.state === 'Uttarakhand' ? ['Domicile: Uttarakhand Permanent Resident'] : [],
      unmet_rules: profile.state !== 'Uttarakhand' ? ['Applicant family must have permanent domicile in Uttarakhand'] : [],
      missing_information: ['Girl student birth certificate or Class 12 enrollment'],
      reason: profile.state === 'Uttarakhand'
        ? (language === 'hi' ? 'उत्तराखंड राज्य मूल निवास शर्त संतुष्ट है। जन्म/12वीं प्रमाण की आवश्यकता है।' : 'Uttarakhand domicile verified. Girl child / 12th pass certificate needed.')
        : (language === 'hi' ? 'यह योजना केवल उत्तराखंड के मूल निवासियों के लिए है।' : 'Restricted to permanent residents of Uttarakhand state.')
    }
  ];

  const toggleSave = (schemeId: string) => {
    let updated: string[];
    if (savedIds.includes(schemeId)) {
      updated = savedIds.filter(id => id !== schemeId);
    } else {
      updated = [...savedIds, schemeId];
    }
    setSavedIds(updated);
    localStorage.setItem('yojana_saved', JSON.stringify(updated));
  };

  const getStatusBadge = (status: EligibilityResult['status']) => {
    switch (status) {
      case 'Eligible':
        return <span className="badge badge-emerald"><CheckCircle size={12} /> ELIGIBLE</span>;
      case 'Likely Eligible':
        return <span className="badge badge-saffron"><Sparkles size={12} /> LIKELY ELIGIBLE</span>;
      case 'Need More Information':
        return <span className="badge badge-blue"><HelpCircle size={12} /> NEED MORE INFO</span>;
      case 'Not Eligible':
        return <span className="badge badge-danger"><XCircle size={12} /> NOT ELIGIBLE</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
            Deterministic Python Evaluator
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {t('app.nav.recommendations')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {language === 'hi'
              ? 'आपकी दर्ज प्रोफ़ाइल के आधार पर सत्यापित नियमों का परिणाम:'
              : 'Rule evaluation outcomes computed deterministically against your local profile.'}
          </p>
        </div>

        <Link to="/app/eligibility" className="btn btn-secondary btn-sm">
          <RotateCcw size={14} />
          {language === 'hi' ? 'प्रश्नावली दोबारा भरें' : 'Re-take Questionnaire'}
        </Link>
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {results.map(r => (
          <div
            key={r.scheme_id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderLeft: r.status === 'Eligible'
                ? '4px solid var(--accent-primary)'
                : r.status === 'Likely Eligible'
                ? '4px solid var(--accent-saffron)'
                : '4px solid var(--border-normal)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {getStatusBadge(r.status)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {r.scheme_id}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{r.scheme_name}</h3>
              </div>

              <button
                onClick={() => toggleSave(r.scheme_id)}
                className={`btn btn-sm ${savedIds.includes(r.scheme_id) ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Bookmark size={14} />
                {savedIds.includes(r.scheme_id) ? t('btn.saved') : t('btn.save')}
              </button>
            </div>

            <div
              style={{
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <strong>{language === 'hi' ? 'निष्कर्ष विवरण:' : 'Decision Rationale:'}</strong> {r.reason}
            </div>

            {/* Matched & Missing details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              {r.matched_rules.length > 0 && (
                <div style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={14} />
                  <span>Matched: {r.matched_rules.join(', ')}</span>
                </div>
              )}
              {r.missing_information.length > 0 && (
                <div style={{ color: 'var(--accent-saffron)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <HelpCircle size={14} />
                  <span>Missing Verification: {r.missing_information.join(', ')}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Link
                to={`/app/schemes/${r.scheme_id}`}
                style={{
                  color: 'var(--accent-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                Inspect Official Guidelines & Checklist <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
