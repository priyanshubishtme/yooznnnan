/**
 * Guided Eligibility Questionnaire with Dynamic Backend Questions,
 * Progressive Disclosure, and "Not Sure" Support
 *
 * Enforces Blueprint Section 10.1 & Phase 7:
 * - Dynamic questionnaire populated from verified schema.
 * - Explicit "Not Sure" / "Skip" states triggering 3-valued UNKNOWN.
 * - Bilingual labels and guidance tooltips.
 * - Direct submission to deterministic evaluation engine.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Info,
  RefreshCw,
  Layers,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface QuestionItem {
  id: string;
  field: string;
  category: string;
  type: 'boolean' | 'number' | 'select';
  label_en: string;
  label_hi: string;
  placeholder_en?: string;
  placeholder_hi?: string;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label_en: string; label_hi: string }>;
  required?: boolean;
  official_verification_required?: boolean;
  tooltip_en?: string;
  tooltip_hi?: string;
  depends_on?: { field: string; value: any };
}

export const EligibilityQuestionnairePage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('yojana_profile_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customNumInput, setCustomNumInput] = useState<string>('');

  // Fetch standardized questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:8005/api/v1/eligibility/questions');
        if (resp.ok) {
          const json = await resp.json();
          setQuestions(json.data.questions || []);
        }
      } catch (err) {
        console.error('Failed to load questionnaire questions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Filter questions based on conditional dependencies
  const visibleQuestions = questions.filter(q => {
    if (!q.depends_on) return true;
    return answers[q.depends_on.field] === q.depends_on.value;
  });

  const currentQ = visibleQuestions[currentIdx];
  const progressPercent = visibleQuestions.length > 0
    ? Math.round(((currentIdx + 1) / visibleQuestions.length) * 100)
    : 0;

  const handleSelectAnswer = (value: any) => {
    if (!currentQ) return;
    const updated = { ...answers, [currentQ.field]: value };
    setAnswers(updated);
    localStorage.setItem('yojana_profile_answers', JSON.stringify(updated));
    setCustomNumInput('');

    if (currentIdx < visibleQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleNotSure = () => {
    if (!currentQ) return;
    const updated = { ...answers, [currentQ.field]: 'not_sure' };
    setAnswers(updated);
    localStorage.setItem('yojana_profile_answers', JSON.stringify(updated));
    setCustomNumInput('');

    if (currentIdx < visibleQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true);
    try {
      // Clean answers: map numbers
      const cleanProfile: Record<string, any> = {};
      for (const [k, v] of Object.entries(answers)) {
        if (v === 'not_sure') {
          cleanProfile[k] = null;
        } else {
          cleanProfile[k] = v;
        }
      }

      const resp = await fetch('http://127.0.0.1:8005/api/v1/eligibility/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: cleanProfile })
      });

      if (resp.ok) {
        const json = await resp.json();
        localStorage.setItem('yojana_evaluation_results', JSON.stringify(json.data));
        navigate('/app/recommendations');
      } else {
        alert('Evaluation service error. Please try again.');
      }
    } catch (err) {
      console.error('Evaluation submit error:', err);
      alert('Network error connecting to evaluation service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {language === 'hi' ? 'सत्यापित प्रश्नावली लोड हो रही है...' : 'Loading verified questionnaire...'}
        </span>
      </div>
    );
  }

  const isLastQuestion = currentIdx >= visibleQuestions.length - 1;

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
      {/* Questionnaire Card Header */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-emerald">
              <ShieldCheck size={14} />
              100% Deterministic Python Logic
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'hi' ? 'शून्य मतिभ्रम (Zero Hallucination)' : 'Zero Hallucination Guaranteed'}
            </span>
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {language === 'hi' ? `प्रश्न ${currentIdx + 1} / ${visibleQuestions.length}` : `Question ${currentIdx + 1} of ${visibleQuestions.length}`}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-saffron))',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div
          className="glass-card"
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Category Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: 'var(--accent-saffron)',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {currentQ.category}
            </span>

            {currentQ.official_verification_required && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  background: 'var(--accent-primary-light)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                External Verification Required
              </span>
            )}
          </div>

          {/* Question Title */}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {language === 'hi' ? currentQ.label_hi : currentQ.label_en}
          </h2>

          {/* Tooltip / Guidance */}
          {(currentQ.tooltip_en || currentQ.tooltip_hi) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Info size={16} style={{ color: 'var(--accent-saffron)', flexShrink: 0, marginTop: '2px' }} />
              <span>{language === 'hi' ? currentQ.tooltip_hi : currentQ.tooltip_en}</span>
            </div>
          )}

          {/* Input Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {/* Boolean Yes / No */}
            {currentQ.type === 'boolean' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleSelectAnswer(true)}
                  className="btn"
                  style={{
                    padding: '1.1rem',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    background: answers[currentQ.field] === true ? 'var(--accent-primary)' : 'var(--bg-app)',
                    color: answers[currentQ.field] === true ? '#ffffff' : 'var(--text-primary)',
                    border: `2px solid ${answers[currentQ.field] === true ? 'var(--accent-primary)' : 'var(--border-normal)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {answers[currentQ.field] === true && <Check size={18} />}
                  <span>{language === 'hi' ? 'हाँ (Yes)' : 'Yes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAnswer(false)}
                  className="btn"
                  style={{
                    padding: '1.1rem',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    background: answers[currentQ.field] === false ? 'var(--accent-primary)' : 'var(--bg-app)',
                    color: answers[currentQ.field] === false ? '#ffffff' : 'var(--text-primary)',
                    border: `2px solid ${answers[currentQ.field] === false ? 'var(--accent-primary)' : 'var(--border-normal)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {answers[currentQ.field] === false && <Check size={18} />}
                  <span>{language === 'hi' ? 'नहीं (No)' : 'No'}</span>
                </button>
              </div>
            )}

            {/* Select Options */}
            {currentQ.type === 'select' && currentQ.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectAnswer(opt.value)}
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: answers[currentQ.field] === opt.value ? 'var(--accent-primary)' : 'var(--bg-app)',
                      color: answers[currentQ.field] === opt.value ? '#ffffff' : 'var(--text-primary)',
                      border: `1.5px solid ${answers[currentQ.field] === opt.value ? 'var(--accent-primary)' : 'var(--border-normal)'}`,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{language === 'hi' ? opt.label_hi : opt.label_en}</span>
                    {answers[currentQ.field] === opt.value && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}

            {/* Numeric Input */}
            {currentQ.type === 'number' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="number"
                  min={currentQ.min ?? 0}
                  max={currentQ.max ?? 100000000}
                  placeholder={language === 'hi' ? currentQ.placeholder_hi : currentQ.placeholder_en}
                  value={customNumInput !== '' ? customNumInput : (answers[currentQ.field] ?? '')}
                  onChange={(e) => setCustomNumInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customNumInput) {
                      handleSelectAnswer(Number(customNumInput));
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-app)',
                    border: '1.5px solid var(--border-normal)',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customNumInput) handleSelectAnswer(Number(customNumInput));
                  }}
                  disabled={!customNumInput && answers[currentQ.field] === undefined}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
                >
                  {language === 'hi' ? 'स्वीकार करें' : 'Confirm'}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Actions: Previous, Not Sure, and Submit */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <button
              type="button"
              onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: currentIdx === 0 ? 0.4 : 1
              }}
            >
              <ArrowLeft size={14} />
              <span>{language === 'hi' ? 'पिछला' : 'Previous'}</span>
            </button>

            {/* "Not Sure" Support (Three-Valued UNKNOWN) */}
            <button
              type="button"
              onClick={handleNotSure}
              className="btn btn-ghost btn-sm"
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Leaves this field unknown so the evaluator can note missing criteria"
            >
              <HelpCircle size={15} />
              <span>{language === 'hi' ? 'मुझे पता नहीं / छोड़ें (Not Sure)' : 'Not Sure / Leave Blank'}</span>
            </button>

            {/* Submit or Next */}
            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.5rem',
                  fontWeight: 700
                }}
              >
                {isSubmitting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                <span>{language === 'hi' ? 'पात्रता परिणाम देखें' : 'View Eligibility Results'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>{language === 'hi' ? 'आगे बढ़ें' : 'Next'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Answered Summary Pills */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {language === 'hi' ? 'आपके द्वारा दी गई जानकारी (Live Profile):' : 'Captured Profile Attributes:'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {Object.entries(answers).map(([k, v]) => (
            <span
              key={k}
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: v === 'not_sure' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-app)',
                border: `1px solid ${v === 'not_sure' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-normal)'}`,
                color: v === 'not_sure' ? 'var(--accent-danger)' : 'var(--text-primary)'
              }}
            >
              <strong>{k}:</strong> {String(v)}
            </span>
          ))}
          {Object.keys(answers).length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {language === 'hi' ? 'प्रश्नों के उत्तर देने पर विवरण यहाँ दिखाई देगा।' : 'Answers will appear here as you proceed.'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

