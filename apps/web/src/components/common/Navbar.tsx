/**
 * Main Navigation Header with Language & Theme Switchers
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, ShieldCheck, UserCheck, MessageSquare, Layers, WifiOff, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Monitor network online/offline transitions
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: 'var(--text-primary)'
              }}
            >
              {language === 'hi' ? 'योजना सहायक' : 'Yojana Sahayak'}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              {language === 'hi' ? 'सरकारी योजना सेवा' : 'Gov Scheme Intelligence'}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}
          className="desktop-nav"
        >
          <Link
            to="/schemes"
            style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/schemes') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              textDecoration: 'none'
            }}
          >
            {language === 'hi' ? 'योजनाएं' : 'Schemes'}
          </Link>

          <Link
            to="/compare"
            style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/compare') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Layers size={14} />
            <span>{language === 'hi' ? 'योजना तुलना' : 'Compare'}</span>
          </Link>

          <Link
            to="/chat"
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/chat') ? 'var(--accent-primary)' : 'var(--accent-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-primary-light)'
            }}
          >
            <MessageSquare size={15} />
            <span>{language === 'hi' ? 'AI चैटबॉट (RAG)' : 'AI Chatbot (RAG)'}</span>
          </Link>

          <Link
            to="/how-it-works"
            style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/how-it-works') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              textDecoration: 'none'
            }}
          >
            {t('nav.howItWorks')}
          </Link>

          <Link
            to="/app"
            className="btn btn-sm btn-primary"
            style={{ textDecoration: 'none', fontSize: '0.82rem', height: '34px', padding: '0 12px' }}
          >
            <UserCheck size={15} />
            <span>{t('nav.app')}</span>
          </Link>

          <Link
            to="/admin"
            className="btn btn-sm btn-secondary"
            style={{ textDecoration: 'none', fontSize: '0.82rem', height: '34px', padding: '0 12px' }}
          >
            <span>{t('nav.admin')}</span>
          </Link>
        </nav>

        {/* Global Controls: Language & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="btn btn-secondary"
            style={{
              padding: '0 10px',
              height: '34px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
            title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            {language === 'hi' ? 'EN' : 'हिन्दी'}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{
              width: '34px',
              height: '34px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-toggle btn btn-secondary"
            style={{ width: '34px', height: '34px', padding: 0 }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.4rem 0', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {language === 'hi' ? 'योजनाएं' : 'Schemes Directory'}
          </Link>

          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.4rem 0', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {language === 'hi' ? 'योजना तुलना' : 'Compare Schemes'}
          </Link>

          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.4rem 0', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none' }}
          >
            {language === 'hi' ? 'AI चैटबॉट (RAG Assistant)' : 'AI Chatbot (RAG Assistant)'}
          </Link>

          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.4rem 0', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {t('nav.howItWorks')}
          </Link>

          <Link
            to="/app"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{ justifyContent: 'center', textDecoration: 'none' }}
          >
            <UserCheck size={16} />
            {t('nav.app')}
          </Link>

          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-secondary"
            style={{ justifyContent: 'center', textDecoration: 'none' }}
          >
            {t('nav.admin')}
          </Link>
        </div>
      )}
          {/* Global PWA Offline Banner */}
      {isOffline && (
        <div
          style={{
            background: 'var(--accent-amber)',
            color: '#78350f',
            padding: '0.45rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <WifiOff size={15} />
          <span>
            {language === 'hi'
              ? 'ऑफ़लाइन मोड सक्रिय: सुरक्षित की गई योजनाएं व चेकलिस्ट ऑफ़लाइन उपलब्ध हैं। लाइव चैट एवं पात्रता गणना के लिए इंटरनेट आवश्यक है।'
              : 'Offline Mode Active: Saved schemes & checklists are accessible offline. Live AI chat and eligibility evaluation require internet.'}
          </span>
        </div>
      )}
    </header>
  );
};
