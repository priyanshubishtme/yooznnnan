/**
 * Main Navigation Header with Language & Theme Switchers
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Moon, Sun, Menu, X, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-saffron))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {t('brand.title')}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              INNOVISTA 2026
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem'
          }}
          className="desktop-nav"
        >
          <Link
            to="/"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive('/') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)'
            }}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/how-it-works"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive('/how-it-works') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)'
            }}
          >
            {t('nav.howItWorks')}
          </Link>
          <Link
            to="/schemes"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive('/schemes') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)'
            }}
          >
            {t('nav.schemes')}
          </Link>
          <Link
            to="/app"
            className="btn btn-sm btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <UserCheck size={16} />
            {t('nav.app')}
          </Link>
          <Link
            to="/admin"
            className="btn btn-sm btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <ShieldCheck size={16} />
            {t('nav.admin')}
          </Link>
        </nav>

        {/* Action Controls: Language & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Toggle Pill */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setLanguage('hi')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                background: language === 'hi' ? 'var(--accent-primary)' : 'transparent',
                color: language === 'hi' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                background: language === 'en' ? 'var(--accent-primary)' : 'transparent',
                color: language === 'en' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              display: 'none',
              padding: '0.4rem',
              color: 'var(--text-primary)'
            }}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-normal)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0', fontWeight: 500 }}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0', fontWeight: 500 }}
          >
            {t('nav.howItWorks')}
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0', fontWeight: 500 }}
          >
            {t('nav.schemes')}
          </Link>
          <Link
            to="/app"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <UserCheck size={18} />
            {t('nav.app')}
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-secondary"
            style={{ justifyContent: 'center' }}
          >
            <ShieldCheck size={18} />
            {t('nav.admin')}
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};
