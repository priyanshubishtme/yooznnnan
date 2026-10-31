/**
 * Device-Local Citizen Profile with Data Deletion Controls
 */

import React, { useState } from 'react';
import { User, Trash2, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CitizenProfile } from '../../types';

export const CitizenProfilePage: React.FC = () => {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<CitizenProfile>(() => {
    const saved = localStorage.getItem('yojana_profile');
    return saved ? JSON.parse(saved) : {
      age: 28,
      state: 'Uttarakhand',
      occupation: 'Farmer',
      annual_income_band: '< 2.5 Lakhs'
    };
  });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('yojana_profile', JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete your profile data from this device?')) {
      localStorage.removeItem('yojana_profile');
      setProfile({});
    }
  };

  return (
    <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
          Device-Local Storage
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('app.nav.profile')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {language === 'hi'
            ? 'आपकी जानकारी केवल आपके फोन/कंप्यूटर पर संगृहीत है। आप इसे कभी भी बदल या हटा सकते हैं।'
            : 'Your profile stays strictly on your browser. Edit values or delete your data at any time.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            {language === 'hi' ? 'आयु (वर्ष)' : 'Age (Years)'}
          </label>
          <input
            type="number"
            value={profile.age || ''}
            onChange={e => setProfile({ ...profile, age: Number(e.target.value) })}
            style={{
              width: '100%',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            {language === 'hi' ? 'राज्य / केंद्र शासित प्रदेश' : 'State / Domicile'}
          </label>
          <select
            value={profile.state || ''}
            onChange={e => setProfile({ ...profile, state: e.target.value })}
            style={{
              width: '100%',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <option value="Uttarakhand">Uttarakhand (उत्तराखंड)</option>
            <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
            <option value="Delhi">Delhi (दिल्ली)</option>
            <option value="Bihar">Bihar (बिहार)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            {language === 'hi' ? 'व्यवसाय' : 'Primary Occupation'}
          </label>
          <select
            value={profile.occupation || ''}
            onChange={e => setProfile({ ...profile, occupation: e.target.value })}
            style={{
              width: '100%',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <option value="Farmer">Farmer / Landholder</option>
            <option value="Student">Student</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Retired">Senior / Retired</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            {language === 'hi' ? 'वार्षिक पारिवारिक आय श्रेणी' : 'Annual Income Band'}
          </label>
          <select
            value={profile.annual_income_band || ''}
            onChange={e => setProfile({ ...profile, annual_income_band: e.target.value })}
            style={{
              width: '100%',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <option value="< 2.5 Lakhs">Below ₹2.5 Lakhs</option>
            <option value="2.5L - 4.5L">₹2.5 Lakhs - ₹4.5 Lakhs</option>
            <option value="4.5L - 8.0L">₹4.5 Lakhs - ₹8.0 Lakhs</option>
            <option value="> 8.0 Lakhs">Above ₹8.0 Lakhs</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            {savedSuccess ? 'Saved to Device!' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={handleDeleteAll}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-danger)' }}
          >
            <Trash2 size={16} />
            Delete Local Data
          </button>
        </div>
      </form>
    </div>
  );
};
