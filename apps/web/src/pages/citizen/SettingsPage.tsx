/**
 * Citizen Settings: Language, Theme, Voice, and Storage Reset
 */

import React from 'react';
import { Globe, Moon, Sun, Mic, ShieldAlert, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleClearCache = () => {
    if (window.confirm('Clear all offline cache and saved data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {t('app.nav.settings')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Language, theme, and accessibility preferences.
        </p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Language Selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={20} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Interface Language</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hindi or English</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setLanguage('hi')}
              className={`btn btn-sm ${language === 'hi' ? 'btn-primary' : 'btn-secondary'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {theme === 'dark' ? <Moon size={20} style={{ color: 'var(--accent-primary)' }} /> : <Sun size={20} style={{ color: 'var(--accent-saffron)' }} />}
            <div>
              <div style={{ fontWeight: 600 }}>Color Theme</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current: {theme === 'dark' ? 'Obsidian Dark' : 'Paper Light'}</div>
            </div>
          </div>

          <button onClick={toggleTheme} className="btn btn-secondary btn-sm">
            Toggle to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Voice Feature Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mic size={20} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Browser Speech Recognition</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Native browser voice input</div>
            </div>
          </div>

          <span className="badge badge-emerald">Ready (hi-IN / en-IN)</span>
        </div>

        {/* Data Reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>Reset Browser Storage</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Removes all local scheme bookmarks and profile entries</div>
          </div>

          <button onClick={handleClearCache} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-danger)' }}>
            Reset Storage
          </button>
        </div>
      </div>
    </div>
  );
};
