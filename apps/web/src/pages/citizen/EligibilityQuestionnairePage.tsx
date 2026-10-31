/**
 * Yojana Sahayak — Complete 7-Category Progressive Eligibility Questionnaire
 *
 * Implements Priority 1 & GovTech Blueprint:
 * 1. 7 Progressive Categories:
 *    - Step 1: Personal Information
 *    - Step 2: Residential Information
 *    - Step 3: Financial Information
 *    - Step 4: Employment & Occupation
 *    - Step 5: Agricultural Information
 *    - Step 6: Education & Academics
 *    - Step 7: Documents & Identification
 *    - Step 8: Review & Edit Summary
 * 2. Visual Stepper UX with step indicator, progress %, and direct jump.
 * 3. Conditional field visibility (farmer, disability, student).
 * 4. Skip / "Not sure right now" (Kleene 3-valued UNKNOWN logic).
 * 5. Server-Side Persistence: Prefills from database, Save & Resume anywhere,
 *    and deterministic server-side evaluation with 4-tier output.
 * 6. Full Dark Mode & Bilingual Hindi/English Localization.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Home,
  Landmark,
  Briefcase,
  Sprout,
  GraduationCap,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Info,
  Edit3,
  Check,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryMeta {
  id: string;
  step: number;
  title_en: string;
  title_hi: string;
  desc_en: string;
  desc_hi: string;
  icon: React.ElementType;
}

interface QuestionItem {
  id: string;
  field: string;
  category: string;
  type: 'boolean' | 'number' | 'select' | 'text';
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

const CATEGORY_DEFINITIONS: CategoryMeta[] = [
  {
    id: 'personal',
    step: 1,
    title_en: 'Personal Information',
    title_hi: 'व्यक्तिगत जानकारी',
    desc_en: 'Age, gender, social category and personal profile attributes.',
    desc_hi: 'आयु, लिंग, सामाजिक श्रेणी और व्यक्तिगत विवरण।',
    icon: User
  },
  {
    id: 'residential',
    step: 2,
    title_en: 'Residential Information',
    title_hi: 'निवास संबंधी जानकारी',
    desc_en: 'Permanent state domicile, district, and rural/urban classification.',
    desc_hi: 'स्थायी निवास राज्य, जिला एवं ग्रामीण/शहरी क्षेत्र।',
    icon: Home
  },
  {
    id: 'financial',
    step: 3,
    title_en: 'Financial Information',
    title_hi: 'वित्तीय जानकारी',
    desc_en: 'Annual family income, BPL status, and tax payer declarations.',
    desc_hi: 'पारिवारिक वार्षिक आय, बीपीएल राशन कार्ड और आयकर स्थिति।',
    icon: Landmark
  },
  {
    id: 'employment',
    step: 4,
    title_en: 'Employment & Occupation',
    title_hi: 'रोजगार और व्यवसाय',
    desc_en: 'Work category, primary trade, and unorganized labor status.',
    desc_hi: 'रोजगार का प्रकार, प्रमुख पेशा और असंगठित श्रमिक स्थिति।',
    icon: Briefcase
  },
  {
    id: 'agricultural',
    step: 5,
    title_en: 'Agricultural Information',
    title_hi: 'कृषि संबंधी जानकारी',
    desc_en: 'Cultivable farmland ownership, landholding size, and land tenure.',
    desc_hi: 'कृषि भूमि स्वामित्व, जोत का आकार और काश्तकारी प्रकार।',
    icon: Sprout
  },
  {
    id: 'education',
    step: 6,
    title_en: 'Education & Academics',
    title_hi: 'शिक्षा और अकादमिक जानकारी',
    desc_en: 'Highest qualification, student enrollment, and board percentiles.',
    desc_hi: 'उच्चतम शैक्षणिक योग्यता, वर्तमान नामांकन और मेरिट प्रतिशत।',
    icon: GraduationCap
  },
  {
    id: 'documents',
    step: 7,
    title_en: 'Documents & Identification',
    title_hi: 'दस्तावेज और पहचान',
    desc_en: 'Aadhaar DBT linking, Jan Dhan account, and certified documents.',
    desc_hi: 'आधार डीबीटी लिंकिंग, जन धन खाता और प्रमाणित दस्तावेज।',
    icon: FileCheck2
  }
];

export const EligibilityQuestionnairePage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHindi = language === 'hi';

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Load questions schema & prefill answers from database
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Question Catalog
        const qResp = await fetch('http://127.0.0.1:8005/api/v1/eligibility/questions');
        if (qResp.ok) {
          const qJson = await qResp.json();
          setQuestions(qJson.data.questions || []);
        }

        // 2. Load In-Progress or Existing Profile Data from Server
        const loadResp = await fetch('http://127.0.0.1:8005/api/v1/citizen/assessment/load');
        if (loadResp.ok) {
          const loadJson = await loadResp.json();
          const savedAnswers = loadJson.data.answers || {};
          setAnswers(savedAnswers);
          if (loadJson.data.current_step && loadJson.data.current_step >= 1 && loadJson.data.current_step <= 7) {
            setCurrentStep(loadJson.data.current_step);
          }
        }
      } catch (err) {
        console.error('Failed to load questionnaire data from backend:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Filter current category questions and conditional visibility
  const currentCategory = CATEGORY_DEFINITIONS[currentStep - 1];

  const visibleCategoryQuestions = useMemo(() => {
    if (!currentCategory) return [];
    return questions.filter(q => {
      if (q.category !== currentCategory.id) return false;
      if (!q.depends_on) return true;
      return answers[q.depends_on.field] === q.depends_on.value;
    });
  }, [questions, currentCategory, answers]);

  // Overall progress percentage across all 7 categories
  const progressPercent = Math.min(100, Math.round(((currentStep - 1) / 7) * 100));

  // Handle single question input change
  const handleInputChange = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  // Handle Skip / "Not sure right now"
  const handleNotSure = (field: string) => {
    setAnswers(prev => ({ ...prev, [field]: 'not_sure' }));
  };

  // Server-side Save & Resume
  const handleSaveProgress = async () => {
    setIsSaving(true);
    setSaveToast(null);
    try {
      const resp = await fetch('http://127.0.0.1:8005/api/v1/citizen/assessment/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: 'citizen-default',
          current_step: currentStep,
          answers: answers
        })
      });

      if (resp.ok) {
        setSaveToast(isHindi ? 'प्रगति सर्वर डेटाबेस में सुरक्षित सहेजी गई!' : 'Progress successfully saved to database!');
        setTimeout(() => setSaveToast(null), 4000);
      } else {
        setSaveToast(isHindi ? 'सहेजने में त्रुटि आई।' : 'Failed to save progress.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveToast(isHindi ? 'सहेजने में नेटवर्क त्रुटि।' : 'Network error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step Navigation Handlers
  const handleNextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Evaluation Submission to Server
  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const resp = await fetch('http://127.0.0.1:8005/api/v1/citizen/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: 'citizen-default',
          answers: answers
        })
      });

      if (resp.ok) {
        const json = await resp.json();
        // Cache evaluation results locally for instant access and navigate
        localStorage.setItem('yojana_evaluation_results', JSON.stringify(json.data));
        navigate('/app/recommendations');
      } else {
        alert(isHindi ? 'मूल्यांकन सेवा में त्रुटि आई। कृपया पुनः प्रयास करें।' : 'Evaluation service error. Please try again.');
      }
    } catch (err) {
      console.error('Assessment submit error:', err);
      alert(isHindi ? 'नेटवर्क त्रुटि: मूल्यांकन सर्वर से कनेक्ट नहीं हो सका।' : 'Network error connecting to evaluation service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {isHindi ? '7-चरणीय सत्यापित पात्रता प्रश्नावली लोड हो रही है...' : 'Loading 7-Step Verified Eligibility Questionnaire...'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {isHindi ? 'सर्वर से आधिकारिक प्रश्न और पूर्व-भरी प्रोफाइल सिंक्रनाइज़ की जा रही है...' : 'Syncing official schema & existing citizen profile from database...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* HEADER & SAVED STATUS BANNER */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {isHindi ? 'प्राधिकृत पात्रता इंजन V2' : 'Deterministic Rules Engine V2'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  {isHindi ? '100% सटीक कानूनी नियम' : '100% Deterministic Kleene Logic'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isHindi ? 'सरकारी योजना पात्रता निर्धारण' : 'Government Scheme Eligibility Assessment'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isHindi
                  ? '7 चरणों में अपने विवरण दर्ज करें। हमारा सिस्टम बिना किसी पूर्वाग्रह के आपकी सटीक पात्रता जांचेगा।'
                  : 'Complete 7 progressive categories to receive fully verified, ranked welfare recommendations.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {isHindi ? 'सहेजें व बाद में करें' : 'Save & Resume'}
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {saveToast && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{saveToast}</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PROGRESS STEPPER BAR */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {currentStep <= 7 ? (
                <>
                  {isHindi ? `चरण ${currentStep} / 7: ${currentCategory?.title_hi}` : `Step ${currentStep} of 7: ${currentCategory?.title_en}`}
                </>
              ) : (
                <>
                  {isHindi ? 'चरण 8 / 8: अंतिम समीक्षा और संपादन' : 'Step 8 of 8: Final Review & Submission'}
                </>
              )}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {currentStep === 8 ? '100%' : `${progressPercent}%`} {isHindi ? 'पूर्ण' : 'Completed'}
            </span>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-6">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${currentStep === 8 ? 100 : progressPercent}%` }}
            />
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {CATEGORY_DEFINITIONS.map(cat => {
              const IconComp = cat.icon;
              const isPast = currentStep > cat.step;
              const isCurrent = currentStep === cat.step;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCurrentStep(cat.step)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all border ${
                    isCurrent
                      ? 'border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold'
                      : isPast
                      ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      : 'border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  <div className="relative mb-1">
                    <IconComp size={18} />
                    {isPast && (
                      <span className="absolute -top-1 -right-2 bg-emerald-600 text-white rounded-full p-0.5">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium leading-tight line-clamp-1">
                    {isHindi ? cat.title_hi.split(' ')[0] : cat.title_en.split(' ')[0]}
                  </span>
                </button>
              );
            })}

            {/* Step 8: Review Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(8)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all border ${
                currentStep === 8
                  ? 'border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600'
              }`}
            >
              <CheckCircle2 size={18} className="mb-1" />
              <span className="text-[11px] font-medium leading-tight">
                {isHindi ? 'समीक्षा' : 'Review'}
              </span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP CONTENT: CATEGORIES 1 TO 7 */}
        {/* ------------------------------------------------------------- */}
        {currentStep <= 7 && currentCategory && (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-300 dark:border-emerald-800">
                  {React.createElement(currentCategory.icon, { size: 24 })}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {isHindi ? currentCategory.title_hi : currentCategory.title_en}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isHindi ? currentCategory.desc_hi : currentCategory.desc_en}
                  </p>
                </div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="space-y-6">
              {visibleCategoryQuestions.map(q => {
                const currentValue = answers[q.field];
                const isNotSure = currentValue === 'not_sure';

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                  >
                    {/* Question Header & Tooltip */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-base font-semibold text-slate-900 dark:text-white">
                            {isHindi ? q.label_hi : q.label_en}
                          </label>
                          {q.required && (
                            <span className="text-red-500 font-bold" title="Mandatory field">*</span>
                          )}
                          {q.official_verification_required && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              {isHindi ? 'सरकारी सत्यापन' : 'Official Verification'}
                            </span>
                          )}
                        </div>
                        {q.tooltip_en && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <Info size={13} className="text-slate-400 flex-shrink-0" />
                            {isHindi ? q.tooltip_hi : q.tooltip_en}
                          </p>
                        )}
                      </div>

                      {/* Not Sure Button */}
                      {!q.required && (
                        <button
                          type="button"
                          onClick={() => handleNotSure(q.field)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                            isNotSure
                              ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200 font-bold'
                              : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isHindi ? 'अभी निश्चित नहीं' : 'Not sure'}
                        </button>
                      )}
                    </div>

                    {/* Question Control: Boolean */}
                    {q.type === 'boolean' && (
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleInputChange(q.field, true)}
                          className={`flex-1 sm:flex-initial min-w-[120px] py-2.5 px-4 rounded-lg font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                            currentValue === true
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {currentValue === true && <Check size={16} />}
                          {isHindi ? 'हाँ (Yes)' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange(q.field, false)}
                          className={`flex-1 sm:flex-initial min-w-[120px] py-2.5 px-4 rounded-lg font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                            currentValue === false
                              ? 'bg-slate-800 dark:bg-slate-700 border-slate-900 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {currentValue === false && <Check size={16} />}
                          {isHindi ? 'नहीं (No)' : 'No'}
                        </button>
                      </div>
                    )}

                    {/* Question Control: Number */}
                    {q.type === 'number' && (
                      <div className="pt-1 max-w-sm">
                        <div className="relative">
                          <input
                            type="number"
                            min={q.min ?? 0}
                            max={q.max}
                            value={currentValue !== undefined && currentValue !== 'not_sure' ? currentValue : ''}
                            onChange={e => handleInputChange(q.field, e.target.value === '' ? null : Number(e.target.value))}
                            placeholder={isHindi ? q.placeholder_hi : q.placeholder_en}
                            className="w-full px-4 py-2.5 text-base rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Question Control: Select */}
                    {q.type === 'select' && q.options && (
                      <div className="pt-1 max-w-md">
                        <select
                          value={currentValue !== undefined && currentValue !== 'not_sure' ? currentValue : ''}
                          onChange={e => handleInputChange(q.field, e.target.value || null)}
                          className="w-full px-4 py-2.5 text-base rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none transition-colors"
                        >
                          <option value="">{isHindi ? '-- कृपया विकल्प चुनें --' : '-- Select an option --'}</option>
                          {q.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {isHindi ? opt.label_hi : opt.label_en}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Question Control: Text */}
                    {q.type === 'text' && (
                      <div className="pt-1 max-w-md">
                        <input
                          type="text"
                          value={currentValue !== undefined && currentValue !== 'not_sure' ? currentValue : ''}
                          onChange={e => handleInputChange(q.field, e.target.value || null)}
                          placeholder={isHindi ? q.placeholder_hi : q.placeholder_en}
                          className="w-full px-4 py-2.5 text-base rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none transition-colors"
                        />
                      </div>
                    )}

                    {isNotSure && (
                      <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        {isHindi
                          ? 'आपने "निश्चित नहीं" चुना है। नियम मूल्यांकनकर्ता इस मानदंड को UNKNOWN मानेगा और आवश्यकता पड़ने पर स्पष्टीकरण मांगेगा।'
                          : 'Marked as "Not Sure". Evaluator will evaluate this condition using Kleene UNKNOWN logic without hard rejection.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft size={16} />
                {isHindi ? 'पिछला चरण' : 'Previous Step'}
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-slate-900 dark:border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
              >
                {currentStep === 7 ? (
                  <>
                    {isHindi ? 'समीक्षा देखें' : 'Review Summary'}
                    <ChevronRight size={18} />
                  </>
                ) : (
                  <>
                    {isHindi ? 'अगला चरण' : 'Next Step'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 8: REVIEW & EDIT SUMMARY SCREEN */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 8 && (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {isHindi ? 'अंतिम चरण' : 'Step 8 of 8'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'प्रश्नावली सारांश एवं अंतिम समीक्षा' : 'Review & Verify Your Profile Inputs'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi
                    ? 'कृपया अपने सभी उत्तरों की जांच करें। किसी भी श्रेणी को बदलने के लिए "संपादित करें" पर क्लिक करें।'
                    : 'Check your submitted details below before executing the deterministic eligibility engine.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmitAssessment}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-900 dark:border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    {isHindi ? 'मूल्यांकन जारी है...' : 'Evaluating Rules...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {isHindi ? 'पात्रता की आधिकारिक जांच करें' : 'Run Eligibility Check'}
                  </>
                )}
              </button>
            </div>

            {/* Category Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CATEGORY_DEFINITIONS.map(cat => {
                const IconComp = cat.icon;
                const catQuestions = questions.filter(q => q.category === cat.id);

                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <IconComp size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {isHindi ? cat.title_hi : cat.title_en}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(cat.step)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <Edit3 size={13} />
                        {isHindi ? 'संपादित करें' : 'Edit'}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {catQuestions.slice(0, 4).map(q => {
                        const val = answers[q.field];
                        let displayVal = isHindi ? 'अनुत्तरित' : 'Not Answered';

                        if (val === true) displayVal = isHindi ? 'हाँ' : 'Yes';
                        else if (val === false) displayVal = isHindi ? 'नहीं' : 'No';
                        else if (val === 'not_sure') displayVal = isHindi ? 'निश्चित नहीं' : 'Not Sure';
                        else if (val !== null && val !== undefined && val !== '') displayVal = String(val);

                        return (
                          <div key={q.id} className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[60%]">
                              {isHindi ? q.label_hi : q.label_en}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {displayVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeft size={16} />
                {isHindi ? 'दस्तावेज चरण पर वापस जाएं' : 'Back to Documents'}
              </button>

              <button
                type="button"
                onClick={handleSubmitAssessment}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-slate-900 dark:border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    {isHindi ? 'मूल्यांकन चल रहा है...' : 'Evaluating Rules...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {isHindi ? 'पात्रता की आधिकारिक जांच करें' : 'Run Eligibility Check'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
