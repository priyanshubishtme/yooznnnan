/**
 * Citizen App Dashboard Overview
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Bookmark,
  MessageSquare,
  Search,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CitizenDashboardPage: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.8))',
          borderColor: 'var(--border-glow)',
          padding: '2rem'
        }}
      >
        <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
          {language === 'hi' ? 'नागरिक सेवा केंद्र' : 'Citizen Intelligence Hub'}
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {language === 'hi' ? 'नमस्ते! आज आप किस योजना की जानकारी चाहते हैं?' : 'Welcome! What schemes would you like to explore today?'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>
          {language === 'hi'
            ? 'अपनी बुनियादी जानकारी दर्ज करके तत्काल अपनी पात्रता जानें या द्विभाषी एआई सहायक से कोई भी प्रश्न पूछें।'
            : 'Check deterministic eligibility with a guided questionnaire or ask the grounded AI assistant in Hindi or English.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Link to="/app/eligibility" className="btn btn-primary">
            <CheckCircle2 size={18} />
            {language === 'hi' ? 'मेरी पात्रता जांचें' : 'Check My Eligibility'}
          </Link>
          <Link to="/app/chat" className="btn btn-secondary">
            <MessageSquare size={18} />
            {language === 'hi' ? 'एआई सहायक से पूछें' : 'Ask AI Assistant'}
          </Link>
          <Link to="/app/discover" className="btn btn-ghost">
            <Search size={18} />
            {language === 'hi' ? 'योजनाएं खोजें' : 'Browse Schemes'}
          </Link>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Link
          to="/app/eligibility"
          className="glass-card"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('app.nav.eligibility')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {language === 'hi' ? 'चरण-दर-चरण प्रश्नावली, बिना किसी जटिलता के।' : 'Step-by-step guided profile questionnaire.'}
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
            Start Now <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          to="/app/chat"
          className="glass-card"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-saffron-light)',
              color: 'var(--accent-saffron)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MessageSquare size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('app.nav.chat')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {language === 'hi' ? 'हिंदी या अंग्रेजी में प्रश्न पूछें, सटीक पीडीएफ उद्धरण पाएं।' : 'Ask questions and receive verifiable cited answers.'}
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-saffron)', fontSize: '0.85rem', fontWeight: 600 }}>
            Open Chat <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          to="/app/saved"
          className="glass-card"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-blue-light)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bookmark size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('app.nav.saved')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {language === 'hi' ? 'सहेजी गई योजनाएं और दस्तावेज़ चेकलिस्ट बिना इंटरनेट भी देखें।' : 'Offline-accessible saved schemes & checklists.'}
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
            View Saved <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Featured Central & State Scheme Spotlight */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {language === 'hi' ? 'प्रमुख सत्यापित योजनाएं' : 'Featured Verified Schemes'}
          </h2>
          <Link to="/app/discover" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
            View All →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>Central Sector</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>PM-KISAN</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              ₹6,000 yearly income support directly to farmer bank accounts.
            </p>
            <Link to="/app/schemes/SCHEME-PM-KISAN" style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
              Inspect Scheme →
            </Link>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>Uttarakhand State</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Nanda Gaura Yojana</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              ₹11,000 on birth + ₹51,000 on passing Class 12 for girl students.
            </p>
            <Link to="/app/schemes/SCHEME-UK-NANDA-GAURA" style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
              Inspect Scheme →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
