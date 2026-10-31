/**
 * Bilingual (Hindi / English) Internationalization Context
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  hi: {
    // Brand & Header
    'brand.title': 'योजना सहायक',
    'brand.tagline': 'नागरिक कल्याण एवं प्रमाण-आधारित मार्गदर्शन',
    'nav.home': 'होम',
    'nav.howItWorks': 'यह कैसे काम करता है',
    'nav.schemes': 'सरकारी योजनाएं',
    'nav.app': 'नागरिक पोर्टल',
    'nav.admin': 'प्रशासक कंसोल',
    
    // Citizen App Nav
    'app.nav.overview': 'अवलोकन',
    'app.nav.chat': 'एआई सहायक (चैट)',
    'app.nav.discover': 'योजना खोजें',
    'app.nav.eligibility': 'पात्रता जांच',
    'app.nav.recommendations': 'अनुशंसित योजनाएं',
    'app.nav.saved': 'मेरी सहेजी योजनाएं',
    'app.nav.profile': 'मेरी प्रोफाइल',
    'app.nav.settings': 'सेटिंग्स',

    // Admin Nav
    'admin.nav.overview': 'प्रशासक डैशबोर्ड',
    'admin.nav.sources': 'स्रोत रजिस्ट्री',
    'admin.nav.discovery': 'डिस्कवरी जॉब्स',
    'admin.nav.reviewQueue': 'समीक्षा कतार',
    'admin.nav.documents': 'दस्तावेज़ प्रबंधन',
    'admin.nav.rules': 'पात्रता नियम समीक्षा',
    'admin.nav.audit': 'ऑडिट लॉग',

    // Hero & Landing
    'hero.badge': 'इनोविस्टा 2026 • समस्या विवरण 03',
    'hero.title': 'सरकारी योजनाएं, अब आपकी समझ और अधिकार में',
    'hero.subtitle': 'आधिकारिक सरकारी अधिसूचनाओं और दिशा-निर्देशों से सीधे सत्यापित, सटीक जानकारी। हिंदी और अंग्रेजी में सवाल पूछें और अपनी सटीक पात्रता जानें।',
    'hero.cta.discover': 'मेरी योजनाएं खोजें',
    'hero.cta.chat': 'एआई सहायक से पूछें',
    'hero.stats.schemes': '13 प्रारंभिक योजनाएं',
    'hero.stats.evidence': '100% प्रमाण-आधारित RAG',
    'hero.stats.rules': 'मानव-सत्यापित पात्रता नियम',
    'hero.stats.offline': 'PWA ऑफलाइन समर्थन',

    // Pillars / Trust
    'trust.pillar1.title': 'सख्त प्रमाण-आधारित उत्तर',
    'trust.pillar1.desc': 'एआई कोई मनगढ़ंत उत्तर नहीं देता। हर वाक्य आधिकारिक सरकारी पीडीएफ और अधिसूचना से जुड़ा होता है।',
    'trust.pillar2.title': 'गणितीय पात्रता निर्धारण',
    'trust.pillar2.desc': 'पात्रता का निर्णय एआई ब्लैक-बॉक्स नहीं, बल्कि पारदर्शी, मानव-स्वीकृत पायथन नियम करते हैं।',
    'trust.pillar3.title': 'गोपनीयता और स्थानीय डेटा',
    'trust.pillar3.desc': 'आपकी प्रोफाइल आपके फोन पर सुरक्षित रहती है। कोई आधार या व्यक्तिगत पहचान सर्वर पर जमा नहीं होती।',

    // Common Buttons & States
    'btn.save': 'योजना सहेजें',
    'btn.saved': 'सहेजा गया',
    'btn.applyNow': 'आधिकारिक पोर्टल पर जाएं',
    'btn.checkEligibility': 'पात्रता जांचें',
    'btn.retry': 'पुनः प्रयास करें',
    'btn.clear': 'हटाएं',
    'btn.submit': 'प्रस्तुत करें',
    'btn.next': 'आगे बढ़ें',
    'btn.back': 'पीछे जाएं',
    'btn.notSure': 'पता नहीं / निश्चित नहीं',

    // Statuses
    'status.verified': 'सत्यापित प्रमाण',
    'status.pending': 'समीक्षा लंबित',
    'status.disabled': 'स्वचालन अक्षम',
    'status.ragEnabled': 'RAG सक्षम',
    'status.rulesEnabled': 'पात्रता नियम सक्रिय',
    'status.offlineBanner': 'आप ऑफलाइन हैं। सहेजी गई योजनाएं उपलब्ध हैं; लाइव चैट और पात्रता के लिए इंटरनेट चाहिए।'
  },
  en: {
    // Brand & Header
    'brand.title': 'Yojana Sahayak',
    'brand.tagline': 'Civic Welfare & Evidence-Grounded Guidance',
    'nav.home': 'Home',
    'nav.howItWorks': 'How It Works',
    'nav.schemes': 'Schemes Directory',
    'nav.app': 'Citizen App',
    'nav.admin': 'Admin Console',

    // Citizen App Nav
    'app.nav.overview': 'Overview',
    'app.nav.chat': 'AI Assistant (Chat)',
    'app.nav.discover': 'Discover Schemes',
    'app.nav.eligibility': 'Eligibility Check',
    'app.nav.recommendations': 'Recommendations',
    'app.nav.saved': 'My Schemes',
    'app.nav.profile': 'My Profile',
    'app.nav.settings': 'Settings',

    // Admin Nav
    'admin.nav.overview': 'Admin Overview',
    'admin.nav.sources': 'Source Registry',
    'admin.nav.discovery': 'Discovery Jobs',
    'admin.nav.reviewQueue': 'Review Queue',
    'admin.nav.documents': 'Document Versions',
    'admin.nav.rules': 'Rule Reviews',
    'admin.nav.audit': 'Audit History',

    // Hero & Landing
    'hero.badge': 'INNOVISTA 2026 • Problem Statement 03',
    'hero.title': 'Government Welfare Schemes, Grounded in Verifiable Evidence',
    'hero.subtitle': 'Authoritative guidance retrieved directly from verified ministry guidelines and gazette notifications. Ask questions in Hindi or English and check deterministic eligibility.',
    'hero.cta.discover': 'Discover My Schemes',
    'hero.cta.chat': 'Ask AI Assistant',
    'hero.stats.schemes': '13 Seed Schemes',
    'hero.stats.evidence': '100% Grounded RAG',
    'hero.stats.rules': 'Human-Approved Rules',
    'hero.stats.offline': 'PWA Offline Ready',

    // Pillars / Trust
    'trust.pillar1.title': 'Grounded Citations',
    'trust.pillar1.desc': 'No hallucinated scheme benefits or criteria. Every factual sentence cites specific verified pages in official PDFs.',
    'trust.pillar2.title': 'Deterministic Rules',
    'trust.pillar2.desc': 'LLMs never decide eligibility. Decisions are computed transparently in Python using human-approved logic trees.',
    'trust.pillar3.title': 'Local-First Privacy',
    'trust.pillar3.desc': 'Your profile stays on your device in IndexedDB. No Aadhaar or identity docs required.',

    // Common Buttons & States
    'btn.save': 'Save Scheme',
    'btn.saved': 'Saved',
    'btn.applyNow': 'Official Portal',
    'btn.checkEligibility': 'Check Eligibility',
    'btn.retry': 'Retry',
    'btn.clear': 'Clear',
    'btn.submit': 'Submit',
    'btn.next': 'Next',
    'btn.back': 'Back',
    'btn.notSure': 'Not sure / Skip',

    // Statuses
    'status.verified': 'Verified Evidence',
    'status.pending': 'Review Pending',
    'status.disabled': 'Automation Disabled',
    'status.ragEnabled': 'RAG Enabled',
    'status.rulesEnabled': 'Rule-Enabled',
    'status.offlineBanner': 'You are offline. Saved schemes remain accessible; live chat and eligibility require network connection.'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'hi',
  setLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('yojana_language');
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('yojana_language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
