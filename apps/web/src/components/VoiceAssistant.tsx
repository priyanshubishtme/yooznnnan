/**
 * Floating Voice Assistant Component
 * Provides speech-to-text toggle and accessibility audio support.
 */

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const VoiceAssistant: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem'
      }}
    >
      {isOpen && (
        <div
          className="glass-card"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            width: '280px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-normal)',
            background: 'var(--bg-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Volume2 size={16} style={{ color: 'var(--accent-saffron)' }} />
              {language === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px', minWidth: 'auto' }}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
            {language === 'hi'
              ? 'योजना सहायक से बोलकर प्रश्न पूछें या उत्तर सुनें।'
              : 'Speak questions aloud in Hindi or English to query verified schemes.'}
          </p>
          <button
            onClick={() => setIsListening(!isListening)}
            className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
            style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            {isListening ? (
              <>
                <MicOff size={14} style={{ marginRight: '0.35rem' }} />
                {language === 'hi' ? 'माइक्रोफ़ोन बंद करें' : 'Stop Listening'}
              </>
            ) : (
              <>
                <Mic size={14} style={{ marginRight: '0.35rem' }} />
                {language === 'hi' ? 'बोलना शुरू करें' : 'Start Speaking'}
              </>
            )}
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: 'var(--radius-full)',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-saffron))',
          border: 'none',
          color: '#ffffff'
        }}
        title="Voice Assistant"
      >
        <Mic size={22} />
      </button>
    </div>
  );
};
