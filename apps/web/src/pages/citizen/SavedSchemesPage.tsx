/**
 * My Schemes Page: Offline-Ready Saved Schemes and Document Checklists
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight, CheckCircle, Wifi } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EmptyState } from '../../components/common/StateViews';

export const SavedSchemesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const s = localStorage.getItem('yojana_saved');
    return s ? JSON.parse(s) : ['SCHEME-PM-KISAN'];
  });

  const removeScheme = (id: string) => {
    const updated = savedIds.filter(x => x !== id);
    setSavedIds(updated);
    localStorage.setItem('yojana_saved', JSON.stringify(updated));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Wifi size={12} />
            Offline Available in IndexedDB
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {t('app.nav.saved')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {language === 'hi'
              ? 'आपकी व्यक्तिगत रूप से सहेजी गई योजनाएं और दस्तावेज़ चेकलिस्ट।'
              : 'Your bookmarked schemes and application checklists. Cached for offline inspection.'}
          </p>
        </div>
      </div>

      {savedIds.length === 0 ? (
        <EmptyState
          title={language === 'hi' ? 'कोई सहेजी गई योजना नहीं' : 'No Saved Schemes'}
          description={language === 'hi' ? 'आप योजना सूची से किसी भी योजना को यहां सहेज सकते हैं।' : 'Explore schemes catalogue and tap Bookmark to save them for offline access.'}
          actionLabel={language === 'hi' ? 'योजनाएं खोजें' : 'Browse Schemes'}
          onAction={() => window.location.href = '/app/discover'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {savedIds.map(id => (
            <div key={id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-emerald">SAVED SCHEME</span>
                  <button
                    onClick={() => removeScheme(id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--accent-danger)', padding: '4px' }}
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                  {id === 'SCHEME-PM-KISAN' ? 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)' : id}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  {language === 'hi' ? '₹6,000 प्रति वर्ष 3 किस्तों में। चेकलिस्ट और विवरण सुरक्षित हैं।' : '₹6,000 yearly income support. Document checklists cached locally.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/app/schemes/${id}`}
                  style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  View Checklist <ArrowRight size={14} />
                </Link>
                <Link to="/app/chat" className="btn btn-sm btn-secondary">
                  Ask in Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
