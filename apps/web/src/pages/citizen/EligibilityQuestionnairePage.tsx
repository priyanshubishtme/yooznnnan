/**
 * Guided Eligibility Questionnaire with Progressive Disclosure & "Not Sure" Support
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Lock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CitizenProfile } from '../../types';

export const EligibilityQuestionnairePage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(0);
  const [profile, setProfile] = useState<CitizenProfile>(() => {
    const saved = localStorage.getItem('yojana_profile');
    return saved ? JSON.parse(saved) : {};
  });

  const questions = [
    {
      id: 'age',
      title_en: 'What is your current age?',
      title_hi: 'आपकी वर्तमान आयु क्या है?',
      why_en: 'Required to check youth scholarships, adult farmer benefits, or senior citizen pensions.',
      why_hi: 'छात्रवृत्ति, किसान योजनाओं या वृद्धावस्था पेंशन की पात्रता तय करने के लिए आवश्यक।',
      type: 'number',
      placeholder: 'e.g. 24'
    },
    {
      id: 'state',
      title_en: 'Which state or union territory do you reside in?',
      title_hi: 'आप किस राज्य या केंद्र शासित प्रदेश के निवासी हैं?',
      why_en: 'State domicile determines eligibility for state-specific schemes like Uttarakhand Nanda Gaura.',
      why_hi: 'राज्य मूल निवास से तय होता है कि आप राज्य सरकार की विशिष्ट योजनाओं के पात्र हैं या नहीं।',
      type: 'select',
      options: [
        { value: 'Uttarakhand', label: 'Uttarakhand (उत्तराखंड)' },
        { value: 'Uttar Pradesh', label: 'Uttar Pradesh (उत्तर प्रदेश)' },
        { value: 'Delhi', label: 'Delhi (दिल्ली)' },
        { value: 'Bihar', label: 'Bihar (बिहार)' },
        { value: 'Other', label: 'Other State / UT (अन्य राज्य)' }
      ]
    },
    {
      id: 'occupation',
      title_en: 'What is your primary occupation?',
      title_hi: 'आपका मुख्य व्यवसाय क्या है?',
      why_en: 'Directly filters farmer schemes (PM-KISAN), student scholarships, or informal workers.',
      why_hi: 'किसान योजनाओं, विद्यार्थी छात्रवृत्तियों या असंगठित कामगार योजनाओं के निर्धारण हेतु।',
      type: 'select',
      options: [
        { value: 'Farmer', label: 'Farmer / Landholder (किसान / भूमिधारक)' },
        { value: 'Student', label: 'Student (विद्यार्थी)' },
        { value: 'Self-employed', label: 'Self-employed / Artisan (स्वरोजगार / कारीगर)' },
        { value: 'Unemployed', label: 'Unemployed / Seeking Work (बेरोजगार)' },
        { value: 'Retired', label: 'Senior / Retired (वरिष्ठ नागरिक / सेवानिवृत्त)' },
        { value: 'Other', label: 'Other (अन्य)' }
      ]
    },
    {
      id: 'annual_income_band',
      title_en: 'What is your total annual family income band?',
      title_hi: 'आपके परिवार की कुल वार्षिक आय किस श्रेणी में है?',
      why_en: 'Schemes like scholarships and pensions have strict statutory income ceilings.',
      why_hi: 'छात्रवृत्तियों और पेंशन योजनाओं में सख्त आय सीमाएं निर्धारित होती हैं।',
      type: 'select',
      options: [
        { value: '< 2.5 Lakhs', label: 'Below ₹2.5 Lakhs (₹2.5 लाख से कम - BPL/Low Income)' },
        { value: '2.5L - 4.5L', label: '₹2.5 Lakhs - ₹4.5 Lakhs (₹2.5 से ₹4.5 लाख)' },
        { value: '4.5L - 8.0L', label: '₹4.5 Lakhs - ₹8.0 Lakhs (₹4.5 से ₹8 लाख)' },
        { value: '> 8.0 Lakhs', label: 'Above ₹8 Lakhs (₹8 लाख से अधिक)' }
      ]
    }
  ];

  const currentQ = questions[step];
  const progressPercent = Math.round(((step + 1) / questions.length) * 100);

  const handleAnswer = (val: any) => {
    const updated = { ...profile, [currentQ.id]: val };
    setProfile(updated);
    localStorage.setItem('yojana_profile', JSON.stringify(updated));

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/app/recommendations');
    }
  };

  const handleSkip = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/app/recommendations');
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          <span>Question {step + 1} of {questions.length}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-saffron))',
              transition: 'width var(--transition-normal)'
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
            Deterministic Evaluation
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
            {language === 'hi' ? currentQ.title_hi : currentQ.title_en}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <HelpCircle size={14} />
            <span>{language === 'hi' ? currentQ.why_hi : currentQ.why_en}</span>
          </div>
        </div>

        {/* Input / Options */}
        {currentQ.type === 'number' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="number"
              placeholder={currentQ.placeholder}
              defaultValue={(profile as any)[currentQ.id] || ''}
              id="numInput"
              style={{
                width: '100%',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-normal)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}
            />
            <button
              onClick={() => {
                const el = document.getElementById('numInput') as HTMLInputElement;
                if (el && el.value) handleAnswer(Number(el.value));
              }}
              className="btn btn-primary"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQ.options?.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.85rem 1.25rem',
                  fontSize: '0.95rem',
                  textAlign: 'left'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Navigation & Skip Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="btn btn-ghost btn-sm">
              <ArrowLeft size={16} />
              {t('btn.back')}
            </button>
          ) : <div />}

          <button onClick={handleSkip} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
            {t('btn.notSure')}
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          justifyContent: 'center'
        }}
      >
        <Lock size={12} />
        <span>Answers are kept on your device. No identity documents or Aadhaar required.</span>
      </div>
    </div>
  );
};
