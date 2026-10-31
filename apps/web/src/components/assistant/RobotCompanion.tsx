/**
 * Yojana AI Assistant Experience Overhaul — Complete Interactive Government Scheme Advisor
 *
 * Implements:
 * 1. Branded Assistant Identity using authentic official robot companion asset (/assistant-robot.jpg).
 * 2. Real Web Audio API Frequency Waveform & Speech-to-Text (STT) Capture.
 * 3. Robust Sentence-Queued Text-to-Speech (TTS) with Play, Pause, Resume, Stop, and Replay.
 * 4. Speed Rate controls (0.75x, 1x, 1.25x) & Auto-Speak toggle.
 * 5. Grounded Scheme Advisor with interactive scheme cards, eligibility assessment brief, and gazette citations.
 * 6. Dual-mode support (Compact Floating Bubble & Expanded / Fullscreen Window).
 * 7. 100% Light Mode & Dark Mode design token contrast consistency.
 * 8. Comprehensive Hindi and English translation with seamless runtime switching.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Bookmark,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  FileText,
  ShieldCheck,
  Pause,
  Play,
  Square,
  Info,
  ChevronRight,
  UserCheck,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCitizenStore } from '../../utils/citizenStore';
import { useAudioWaveform } from '../../hooks/useAudioWaveform';
import { PdfEvidenceViewerModal } from '../PdfEvidenceViewerModal';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface SchemeSummary {
  scheme_id: string;
  code: string;
  name_en: string;
  name_hi: string;
  category: string;
  ministry_or_dept?: string;
  benefits_summary_en?: string;
  benefits_summary_hi?: string;
  official_portal_url?: string;
}

interface EligibilityBrief {
  scheme_id: string;
  scheme_name: string;
  status: string;
  matched_criteria: string[];
  missing_criteria: string[];
  action_prompt: string;
}

interface CitationItem {
  id: string;
  title: string;
  page: number;
  scheme_id?: string;
  document_version_id?: string;
  ministry?: string;
  excerpt?: string;
  verification_status?: string;
  link: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  speechText?: string;
  navigation?: { path: string; label: string };
  suggestedQuestions?: string[];
  schemesFound?: SchemeSummary[];
  eligibilityBrief?: EligibilityBrief;
  citations?: CitationItem[];
  timestamp: string;
  feedback?: 'helpful' | 'unhelpful';
}

const STORAGE_KEY = 'yojana_assistant_conversation_v2';

export const RobotCompanion: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { settings, saveSettings } = useCitizenStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isHindi = language === 'hi';

  // Audio Waveform Hook
  const { isCapturing, audioLevels, startCapturing, stopCapturing } = useAudioWaveform();

  // Widget states
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [mode, setMode] = useState<'simple' | 'advanced'>(() => (settings as any)?.assistant_mode || 'simple');

  // Audio Playback Settings & State
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => settings?.voice_auto_speak ?? true);
  const [speechRate, setSpeechRate] = useState<number>(() => settings?.voice_speech_rate || 1.0);
  const [showSpeedControls, setShowSpeedControls] = useState<boolean>(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Citation inspection modal
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);

  // Feedback & Copy Toasts
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Voice Input (STT)
  const [inputQuery, setInputQuery] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechLang, setSpeechLang] = useState<'hi-IN' | 'en-IN'>(isHindi ? 'hi-IN' : 'en-IN');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync speech language when global language changes
  useEffect(() => {
    setSpeechLang(isHindi ? 'hi-IN' : 'en-IN');
  }, [isHindi]);

  // Initial welcome message generator
  const getWelcomeMessage = (): Message => ({
    id: 'msg-welcome',
    role: 'assistant',
    content: isHindi
      ? `### नमस्ते! मैं **योजना एआई** हूँ — आपका आधिकारिक सरकारी कल्याण मार्गदर्शक।\n\nमैं आपको भारत सरकार एवं राज्य सरकारों की कल्याणकारी योजनाओं को खोजने, पात्रता नियमों को समझने, आवश्यक दस्तावेज जानने और सीधे आवेदन करने में सहायता करता हूँ।\n\nआप मुझसे बोलकर या लिखकर पूछ सकते हैं:`
      : `### Namaste! I am **Yojana AI** — your verified Government Welfare Advisor.\n\nI assist citizens in discovering central and state government schemes, checking eligibility rules, identifying mandatory documents, and navigating applications.\n\nFeel free to speak or type your question below:`,
    speechText: isHindi
      ? 'नमस्ते! मैं योजना एआई हूँ। आप मुझसे किसी भी सरकारी योजना, पात्रता नियमों और दस्तावेजों के बारे में पूछ सकते हैं।'
      : 'Namaste! I am Yojana AI. You can speak or type to ask about any government welfare scheme, eligibility rules, and required documents.',
    suggestedQuestions: isHindi
      ? [
          '🌾 किसान सम्मान निधि (PM-KISAN) की जानकारी दें',
          '🏥 आयुष्मान भारत में 5 लाख का इलाज कैसे मिलता है?',
          '📋 मेरी योजना पात्रता की जांच करें',
          '🎓 कॉलेज छात्रों के लिए छात्रवृत्ति योजनाएं',
          '📍 मेरे नज़दीकी जन सेवा केंद्र (CSC) कहाँ हैं?'
        ]
      : [
          '🌾 Tell me about PM-KISAN scheme for farmers',
          '🏥 How to get free treatment under Ayushman Bharat?',
          '📋 Check my government scheme eligibility',
          '🎓 Scholarships for college students',
          '📍 Where is the nearest CSC Seva Kendra?'
        ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  // Conversation history loaded from storage or default
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved assistant messages:', e);
    }
    return [getWelcomeMessage()];
  });

  // Save conversation history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save assistant conversation:', e);
    }
  }, [messages]);

  // Check online connectivity to backend
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8005/health');
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 15000);
    return () => clearInterval(interval);
  }, []);

  // Initialize SpeechSynthesis and voice list
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      synthRef.current.onvoiceschanged = () => {
        synthRef.current?.getVoices();
      };
    }
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, assistantState]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = speechLang;

      rec.onstart = () => {
        setAssistantState('listening');
        setErrorMessage(null);
        stopSpeaking();
      };

      rec.onresult = (event: any) => {
        let currentInterim = '';
        let finalized = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalized += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        if (finalized) {
          setInputQuery(prev => (prev ? `${prev.trim()} ${finalized.trim()}` : finalized.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        stopCapturing();
        setAssistantState('idle');
        if (event.error === 'not-allowed') {
          setErrorMessage(
            isHindi
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें या नीचे लिखकर पूछें।'
              : 'Microphone permission denied. Please allow microphone access or type below.'
          );
        } else if (event.error !== 'no-speech') {
          setErrorMessage(
            isHindi
              ? 'आवाज़ पहचान में रुकावट आई। कृपया पुनः प्रयास करें।'
              : 'Speech recognition error. Please try again.'
          );
        }
      };

      rec.onend = () => {
        // Stop audio capture gracefully, preserve transcribed input for user review/edit
        stopCapturing();
        setInterimTranscript('');
        if (assistantState === 'listening') {
          setAssistantState('idle');
        }
      };

      recognitionRef.current = rec;
    } catch (e) {
      console.warn('Speech recognition initialization error:', e);
    }
  }, [speechLang, isHindi]);

  // Robust Sentence-Queued Text-to-Speech Engine
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    speechQueueRef.current = [];
    setActiveSpeakingMsgId(null);
    setIsPaused(false);
    if (assistantState === 'speaking') {
      setAssistantState('idle');
    }
  };

  const speakMessage = (messageId: string, textToSpeak: string) => {
    if (!synthRef.current) {
      alert(isHindi ? 'ब्राउज़र में वॉयस आउटपुट समर्थित नहीं है।' : 'Text-to-speech is not supported in this browser.');
      return;
    }

    // Toggle pause/resume if already speaking this message
    if (activeSpeakingMsgId === messageId) {
      if (isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
        setAssistantState('speaking');
      } else {
        synthRef.current.pause();
        setIsPaused(true);
        setAssistantState('idle');
      }
      return;
    }

    // Cancel existing speech
    synthRef.current.cancel();
    setActiveSpeakingMsgId(messageId);
    setIsPaused(false);
    setAssistantState('speaking');

    // Split text into clean sentences for Chromium reliability
    const sentences = textToSpeak
      .replace(/\[C\d+(?:,\s*C\d+)*\]/g, '')
      .replace(/[#*_`]/g, '')
      .split(/(?<=[.?!|।])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) {
      stopSpeaking();
      return;
    }

    speechQueueRef.current = [...sentences];

    const playNextSentence = () => {
      if (!synthRef.current || speechQueueRef.current.length === 0) {
        stopSpeaking();
        return;
      }

      const sentence = speechQueueRef.current.shift()!;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      // Select natural voice
      const voices = synthRef.current.getVoices();
      const targetLangPrefix = isHindi ? 'hi' : 'en';
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        if (speechQueueRef.current.length > 0) {
          playNextSentence();
        } else {
          stopSpeaking();
        }
      };

      utterance.onerror = (e) => {
        console.warn('TTS sentence error:', e);
        stopSpeaking();
      };

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    };

    playNextSentence();
  };

  const replayMessage = (messageId: string, textToSpeak: string) => {
    stopSpeaking();
    setTimeout(() => {
      speakMessage(messageId, textToSpeak);
    }, 80);
  };

  // Start real microphone capture and speech recognition
  const startListening = async () => {
    stopSpeaking();
    setErrorMessage(null);
    setInterimTranscript('');

    const captureSuccess = await startCapturing();
    if (!recognitionRef.current) {
      setErrorMessage(
        isHindi
          ? 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया नीचे लिखकर पूछें।'
          : 'Speech recognition is not supported in this browser. Please type below.'
      );
      stopCapturing();
      return;
    }

    try {
      recognitionRef.current.lang = speechLang;
      recognitionRef.current.start();
      setAssistantState('listening');
    } catch (err: any) {
      console.warn('Recognition start exception:', err);
      if (!captureSuccess) {
        setErrorMessage(
          isHindi
            ? 'माइक्रोफ़ोन एक्सेस विफल। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
            : 'Microphone access failed. Please enable permissions in your browser.'
        );
      }
    }
  };

  // Stop listening gracefully (optionally discard transcript)
  const stopListening = (keepQuery: boolean = true) => {
    stopCapturing();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setInterimTranscript('');
    setAssistantState('idle');
    if (!keepQuery) {
      setInputQuery('');
    }
  };

  // Speed Rate Change Handler
  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    saveSettings({ voice_speech_rate: newRate });
    setShowSpeedControls(false);
    if (activeSpeakingMsgId && synthRef.current) {
      const activeMsg = messages.find(m => m.id === activeSpeakingMsgId);
      if (activeMsg) {
        replayMessage(activeMsg.id, activeMsg.speechText || activeMsg.content);
      }
    }
  };

  // Auto-Speak Toggle
  const toggleAutoSpeak = () => {
    const nextVal = !autoSpeak;
    setAutoSpeak(nextVal);
    saveSettings({ voice_auto_speak: nextVal });
    if (!nextVal) {
      stopSpeaking();
    }
  };

  // Submit query to conversational API
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    stopSpeaking();
    stopListening(true);
    setInputQuery('');
    setInterimTranscript('');
    setErrorMessage(null);

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setAssistantState('thinking');

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('http://127.0.0.1:8005/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: language,
          mode: mode,
          history: historyPayload,
          current_path: location.pathname,
          user_identifier: 'citizen-default'
        })
      });

      if (!res.ok) {
        throw new Error(`Assistant error: ${res.statusText}`);
      }

      const json = await res.json();
      const replyData = json.data;

      const assistantMsg: Message = {
        id: `asst-${Date.now() + 1}`,
        role: 'assistant',
        content: replyData.reply,
        speechText: replyData.speech_text,
        navigation: replyData.navigation,
        suggestedQuestions: replyData.suggested_questions || [],
        schemesFound: replyData.schemes_found || [],
        eligibilityBrief: replyData.eligibility_brief || null,
        citations: replyData.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setAssistantState('idle');

      // Auto-speak if enabled
      if (autoSpeak) {
        speakMessage(assistantMsg.id, replyData.speech_text || replyData.reply);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setAssistantState('error');
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: isHindi
          ? 'क्षमा करें, उत्तर प्राप्त करने में तकनीकी समस्या आई। कृपया पुनः प्रयास करें या नीचे दिए गए त्वरित प्रश्नों में से चुनें।'
          : 'I encountered an issue connecting to the official scheme intelligence engine. Please ask again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  // Reset conversation
  const handleResetConversation = () => {
    stopSpeaking();
    stopListening(false);
    const welcome = getWelcomeMessage();
    setMessages([welcome]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Copy message text
  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Record feedback (thumbs up / down)
  const handleFeedback = async (msgId: string, query: string, helpful: boolean) => {
    try {
      await fetch('http://127.0.0.1:8005/api/v1/assistant/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: msgId,
          query: query,
          helpful: helpful
        })
      });

      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, feedback: helpful ? 'helpful' : 'unhelpful' } : m))
      );

      setFeedbackToast(isHindi ? 'प्रतिक्रिया दर्ज करने के लिए धन्यवाद!' : 'Thank you for your feedback!');
      setTimeout(() => setFeedbackToast(null), 2500);
    } catch (e) {
      console.warn('Feedback submission error:', e);
    }
  };

  // Save scheme bookmark directly from embedded card
  const handleSaveScheme = async (schemeId: string) => {
    try {
      const resp = await fetch('http://127.0.0.1:8005/api/v1/citizen/schemes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: 'citizen-default',
          scheme_id: schemeId
        })
      });
      if (resp.ok) {
        setFeedbackToast(isHindi ? 'योजना आपकी सहेजी गई सूची में जोड़ी गई!' : 'Scheme saved to your citizen profile!');
        setTimeout(() => setFeedbackToast(null), 3000);
      }
    } catch (e) {
      console.warn('Save scheme error:', e);
    }
  };

  // Extract latest suggested questions from most recent assistant turn
  const latestSuggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].suggestedQuestions && messages[i].suggestedQuestions!.length > 0) {
        return messages[i].suggestedQuestions!;
      }
    }
    return [
      isHindi ? '🌾 किसान सम्मान निधि (PM-KISAN)' : '🌾 Tell me about PM-KISAN',
      isHindi ? '📋 मेरी पात्रता जांचें' : '📋 Check my eligibility',
      isHindi ? '🎓 छात्रवृत्ति योजनाएं' : '🎓 Scholarship schemes',
      isHindi ? '📍 सेवा केंद्र खोजें' : '📍 Find nearest CSC Kendra'
    ];
  }, [messages, isHindi]);

  return (
    <>
      {/* ------------------------------------------------------------------- */}
      {/* FLOATING ACTION LAUNCHER (COMPACT MODE)                             */}
      {/* ------------------------------------------------------------------- */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Attention Tooltip Bubble */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white border-2 border-emerald-500 shadow-xl text-xs font-bold animate-bounce">
            <Sparkles size={14} className="text-amber-400" />
            <span>{isHindi ? 'योजना सहायता चाहिए? मुझसे पूछें!' : 'Need scheme guidance? Ask Yojana AI!'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 dark:bg-slate-800 border-2 border-emerald-500 shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-none"
            aria-label="Open Yojana AI Assistant"
            title="Yojana AI Citizen Assistant"
          >
            {/* Pulsing Emerald Halo */}
            <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping group-hover:bg-emerald-500/50" />

            {/* Official Pixel Robot Companion Avatar */}
            <img
              src="/assistant-robot.jpg"
              alt="Yojana AI Robot"
              className="relative w-12 h-12 object-contain rounded-full shadow-inner"
            />

            {/* Live Online Badge */}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              title={isOnline ? 'Connected to AI Engine' : 'Offline'}
            />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* EXPANDED ASSISTANT WINDOW                                           */}
      {/* ------------------------------------------------------------------- */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-2xl transition-all duration-300 ease-out overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-6 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[470px] h-[85vh] sm:h-[680px] max-h-[760px] rounded-2xl'
          }`}
        >
          {/* HEADER */}
          <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b-2 border-slate-800">
            {/* Assistant Identity */}
            <div className="flex items-center gap-3">
              <div className={`relative w-10 h-10 rounded-xl bg-slate-800 border p-1 flex items-center justify-center shadow-md transition-all ${
                assistantState === 'listening'
                  ? 'border-red-500 ring-2 ring-red-500/50'
                  : assistantState === 'speaking'
                  ? 'border-emerald-400 ring-2 ring-emerald-400/50 animate-pulse'
                  : assistantState === 'thinking'
                  ? 'border-amber-400 animate-pulse'
                  : 'border-emerald-500/60'
              }`}>
                <img
                  src="/assistant-robot.jpg"
                  alt="Yojana AI"
                  className="w-full h-full object-contain rounded-lg"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    isOnline ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                    Yojana AI
                    <span className="text-xs font-normal text-slate-300">| योजना एआई</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    GovTech RAG
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {assistantState === 'listening'
                    ? (isHindi ? '🎙️ आपकी आवाज़ सुन रहा हूँ...' : '🎙️ Listening to you...')
                    : assistantState === 'speaking'
                    ? (isHindi ? '🔊 उत्तर बोल रहा हूँ...' : '🔊 Speaking response...')
                    : assistantState === 'thinking'
                    ? (isHindi ? '⚡ सरकारी नियमों की जांच जारी है...' : '⚡ Searching official gazettes...')
                    : (isHindi ? 'आधिकारिक कल्याण साथी • ऑनलाइन' : 'Official Welfare Advisor • Online')}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5 text-slate-300">
              {/* Interaction Mode Switcher: Simple vs Advanced */}
              <button
                type="button"
                onClick={() => {
                  const nextMode = mode === 'simple' ? 'advanced' : 'simple';
                  setMode(nextMode);
                  saveSettings({ assistant_mode: nextMode } as any);
                }}
                className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-colors flex items-center gap-1 ${
                  mode === 'advanced'
                    ? 'bg-purple-950 text-purple-200 border-purple-600 shadow-sm'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm'
                }`}
                title={
                  mode === 'simple'
                    ? (isHindi ? 'सरल मोड (नागरिक) — क्लिक करके उन्नत मोड में बदलें' : 'Simple Mode (Citizen) — Click to switch to Advanced Mode')
                    : (isHindi ? 'उन्नत मोड (विशेषज्ञ) — क्लिक करके सरल मोड में बदलें' : 'Advanced Mode (Specialist) — Click to switch to Simple Mode')
                }
              >
                <span>{mode === 'simple' ? '🌱' : '🔬'}</span>
                <span>{mode === 'simple' ? (isHindi ? 'सरल' : 'Simple') : (isHindi ? 'उन्नत' : 'Adv')}</span>
              </button>

              {/* Language Switch */}
              <button
                type="button"
                onClick={() => setLanguage(isHindi ? 'en' : 'hi')}
                className="px-2 py-1 text-xs font-bold rounded-md bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
              >
                {isHindi ? 'EN' : 'हिन्दी'}
              </button>

              {/* Speed Rate Control Dropdown Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSpeedControls(!showSpeedControls)}
                  className="px-2 py-1 text-[11px] font-bold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                  title="Speech Playback Speed"
                >
                  <Sliders size={12} />
                  <span>{speechRate}x</span>
                </button>

                {showSpeedControls && (
                  <div className="absolute right-0 mt-1 w-24 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 p-1 flex flex-col gap-1">
                    {[0.75, 1.0, 1.25].map(rate => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleRateChange(rate)}
                        className={`text-xs px-2 py-1 rounded text-left ${
                          speechRate === rate ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {rate}x {rate === 1.0 ? '(Normal)' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-Speak Toggle */}
              <button
                type="button"
                onClick={toggleAutoSpeak}
                className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                  autoSpeak ? 'text-emerald-400' : 'text-slate-400'
                }`}
                title={autoSpeak ? 'Auto-Speak ON (Click to disable)' : 'Auto-Speak OFF (Click to enable)'}
              >
                {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Reset Conversation */}
              <button
                type="button"
                onClick={handleResetConversation}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title={isHindi ? 'वार्तालाप रीसेट करें' : 'Reset Conversation'}
              >
                <RotateCcw size={16} />
              </button>

              {/* Expand to Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title={isExpanded ? 'Restore Size' : 'Expand Fullscreen'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  stopListening(false);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-md hover:bg-red-900/60 text-slate-300 hover:text-red-200 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* GLOBAL FEEDBACK TOAST */}
          {feedbackToast && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
              <CheckCircle2 size={14} />
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* CONVERSATION MESSAGE STREAM */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-slate-950/70">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              const isSpeakingThis = activeSpeakingMsgId === msg.id && !isPaused;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 border border-emerald-500/60 p-0.5 flex-shrink-0 self-start shadow-sm mt-0.5">
                      <img
                        src="/assistant-robot.jpg"
                        alt="Yojana AI"
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className={`max-w-[85%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl shadow-sm text-sm border-2 leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white border-slate-900 dark:border-slate-800 rounded-br-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 rounded-bl-sm'
                      }`}
                    >
                      {/* Markdown Structured Body */}
                      <div className="prose dark:prose-invert max-w-none text-sm space-y-2">
                        {msg.content.split('\n\n').map((paragraph, pIdx) => {
                          if (paragraph.startsWith('### ')) {
                            return (
                              <h4 key={pIdx} className="font-extrabold text-base text-emerald-700 dark:text-emerald-400 mt-2 mb-1">
                                {paragraph.replace('### ', '')}
                              </h4>
                            );
                          }
                          if (paragraph.startsWith('|')) {
                            // Render Markdown Table
                            const rows = paragraph.split('\n').filter(r => r.includes('|') && !r.includes('---'));
                            return (
                              <div key={pIdx} className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-xs text-left">
                                  <tbody>
                                    {rows.map((row, rIdx) => (
                                      <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'border-t border-slate-100 dark:border-slate-800'}>
                                        {row.split('|').filter(c => c.trim().length > 0).map((cell, cIdx) => (
                                          <td key={cIdx} className="p-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                                            {cell.trim()}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                          return (
                            <p key={pIdx} className="whitespace-pre-line leading-relaxed">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>

                      {/* EMBEDDED INTERACTIVE SCHEME CARDS */}
                      {msg.schemesFound && msg.schemesFound.length > 0 && (
                        <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-amber-500" />
                            {isHindi ? 'प्रासंगिक सरकारी योजनाएं' : 'Matched Government Schemes'}
                          </span>

                          <div className="grid grid-cols-1 gap-2.5">
                            {msg.schemesFound.map(s => (
                              <div
                                key={s.scheme_id}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:border-emerald-500 dark:hover:border-emerald-600 transition-all space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                                      {isHindi ? s.name_hi : s.name_en}
                                    </h5>
                                    {s.ministry_or_dept && (
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                        {s.ministry_or_dept}
                                      </span>
                                    )}
                                  </div>
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0">
                                    {s.category}
                                  </span>
                                </div>

                                {(s.benefits_summary_en || s.benefits_summary_hi) && (
                                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                                    {isHindi ? s.benefits_summary_hi : s.benefits_summary_en}
                                  </p>
                                )}

                                {/* Interactive Action Buttons */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsOpen(false);
                                      navigate(`/eligibility?scheme=${s.scheme_id}`);
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm"
                                  >
                                    <UserCheck size={12} />
                                    {isHindi ? 'पात्रता जांचें' : 'Check Eligibility'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsOpen(false);
                                      navigate(`/schemes/${s.scheme_id}`);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                  >
                                    <Info size={12} />
                                    {isHindi ? 'विवरण' : 'Details'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSaveScheme(s.scheme_id)}
                                    className="px-2 py-1 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                                    title="Save to My Profile"
                                  >
                                    <Bookmark size={12} />
                                  </button>

                                  {s.official_portal_url && (
                                    <a
                                      href={s.official_portal_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 text-xs font-medium rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 ml-auto"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* EMBEDDED ELIGIBILITY ADVISOR BRIEF */}
                      {msg.eligibilityBrief && (
                        <div className="mt-3.5 p-3.5 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <ShieldCheck size={16} className="text-emerald-600" />
                              {isHindi ? 'प्रोफ़ाइल पात्रता विश्लेषण' : 'Citizen Eligibility Status'}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-emerald-600 text-white shadow-sm">
                              {msg.eligibilityBrief.status}
                            </span>
                          </div>

                          {msg.eligibilityBrief.matched_criteria.length > 0 && (
                            <div className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                              <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                {isHindi ? 'संतुष्ट शर्तें (Matched):' : 'Satisfied Conditions:'}
                              </span>
                              {msg.eligibilityBrief.matched_criteria.map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <Check size={13} className="text-emerald-600 flex-shrink-0" />
                                  <span>{c}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.eligibilityBrief.missing_criteria.length > 0 && (
                            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200 pt-1">
                              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                {isHindi ? 'जांच आवश्यक (Pending):' : 'Verification Required:'}
                              </span>
                              {msg.eligibilityBrief.missing_criteria.map((m, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <AlertCircle size={13} className="text-amber-600 flex-shrink-0" />
                                  <span>{m}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/eligibility?scheme=${msg.eligibilityBrief?.scheme_id}`);
                            }}
                            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <UserCheck size={14} />
                            {isHindi ? 'आधिकारिक 7-चरणीय मूल्यांकन खोलें' : 'Launch Full 7-Step Evaluation'}
                          </button>
                        </div>
                      )}

                      {/* VERIFIED SOURCE CITATION CARDS */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3.5 space-y-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <FileText size={13} className="text-emerald-600" />
                            {isHindi ? 'सत्यापित आधिकारिक स्रोत एवं गजट' : 'Verified Official Gazette Citations'}
                          </span>

                          <div className="space-y-1.5">
                            {msg.citations.map((cite, cIdx) => (
                              <div
                                key={cIdx}
                                onClick={() => setSelectedCitation(cite)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/70 hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between gap-2 group"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                      Page {cite.page}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600">
                                      {cite.title}
                                    </span>
                                  </div>
                                  {cite.excerpt && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                      "{cite.excerpt}"
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 flex-shrink-0">
                                  {isHindi ? 'दस्तावेज़ देखें' : 'Inspect'} <ChevronRight size={13} />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* NAVIGATION ACTION PILL */}
                      {msg.navigation && (
                        <div className="mt-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              navigate(msg.navigation!.path);
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-sm"
                          >
                            <span>{msg.navigation.label}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* MESSAGE FOOTER & ACTIONS */}
                    {!isUser && (
                      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          {/* Audio Listen / Pause Button */}
                          <button
                            type="button"
                            onClick={() => speakMessage(msg.id, msg.speechText || msg.content)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors ${
                              isSpeakingThis
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400 animate-pulse'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                            title="Listen to response aloud"
                          >
                            {isSpeakingThis ? <Pause size={12} /> : <Play size={12} />}
                            <span>{isSpeakingThis ? (isHindi ? 'रुकें' : 'Pause') : (isHindi ? 'सुनें' : 'Listen')}</span>
                          </button>

                          {/* Replay Audio Button */}
                          <button
                            type="button"
                            onClick={() => replayMessage(msg.id, msg.speechText || msg.content)}
                            className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 p-1 rounded-md transition-colors"
                            title={isHindi ? 'शुरू से दोबारा सुनें' : 'Replay from start'}
                          >
                            <RotateCcw size={12} />
                          </button>

                          {/* Stop Audio Button if currently playing */}
                          {isSpeakingThis && (
                            <button
                              type="button"
                              onClick={stopSpeaking}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60"
                              title="Stop audio playback"
                            >
                              <Square size={11} />
                              <span>{isHindi ? 'बंद करें' : 'Stop'}</span>
                            </button>
                          )}

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 text-[11px]"
                            title="Copy response text"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-600 font-bold">{isHindi ? 'कॉपी हो गया' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>{isHindi ? 'कॉपी' : 'Copy'}</span>
                              </>
                            )}
                          </button>

                          {/* Feedback Thumbs */}
                          <div className="flex items-center gap-1 ml-2 border-l border-slate-200 dark:border-slate-800 pl-2">
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, msg.content, true)}
                              className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
                                msg.feedback === 'helpful' ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                              title="Helpful response"
                            >
                              <ThumbsUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, msg.content, false)}
                              className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
                                msg.feedback === 'unhelpful' ? 'text-red-500' : 'text-slate-400'
                              }`}
                              title="Unhelpful response"
                            >
                              <ThumbsDown size={12} />
                            </button>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>
                    )}

                    {isUser && (
                      <div className="text-right text-[10px] text-slate-400 px-1">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* THINKING LIVE INDICATOR */}
            {assistantState === 'thinking' && (
              <div className="flex items-center gap-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 border border-emerald-500/60 p-0.5 flex-shrink-0 flex items-center justify-center">
                  <img src="/assistant-robot.jpg" alt="Yojana AI" className="w-full h-full object-contain rounded-md" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 shadow-sm">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{isHindi ? 'आधिकारिक गजट एवं नियमों का विश्लेषण...' : 'Grounding with official guidelines...'}</span>
                </div>
              </div>
            )}

            {/* LIVE VOICE RECORDING & WAVEFORM DISPLAY */}
            {assistantState === 'listening' && (
              <div className="p-3.5 bg-emerald-950/20 dark:bg-emerald-950/50 border-2 border-emerald-500/60 rounded-2xl space-y-2 animate-fadeIn shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Live pulsating recording indicator */}
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      {isHindi ? 'माइक सक्रिय (सुन रहा है...)' : 'Microphone Live (Listening...)'}
                    </span>
                  </div>

                  {/* Frequency Waveform Visualizer */}
                  <div className="flex items-center gap-1 h-6 px-2.5 py-1 bg-slate-900 rounded-full border border-emerald-500/40">
                    {audioLevels.map((lvl, idx) => (
                      <span
                        key={idx}
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${lvl}px` }}
                      />
                    ))}
                  </div>

                  {/* Speech Language Switcher Badge */}
                  <button
                    type="button"
                    onClick={() => setSpeechLang(speechLang === 'hi-IN' ? 'en-IN' : 'hi-IN')}
                    className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500"
                    title="Toggle Speech Recognition Language"
                  >
                    {speechLang === 'hi-IN' ? 'HI-IN' : 'EN-IN'}
                  </button>
                </div>

                {/* Real-time transcribed text preview */}
                <div className="p-2.5 bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-xl text-xs text-slate-800 dark:text-slate-200 min-h-[38px] flex items-center">
                  {interimTranscript || inputQuery ? (
                    <span className="italic">
                      "{inputQuery ? inputQuery + ' ' : ''}{interimTranscript}"
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {isHindi ? 'कृपया स्पष्ट आवाज़ में बोलें...' : 'Please speak clearly into your microphone...'}
                    </span>
                  )}
                </div>

                {/* Voice Action Controls: Cancel, Keep/Edit, Send */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => stopListening(false)}
                    className="px-3 py-1 text-xs font-bold rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 transition-colors"
                  >
                    <X size={13} />
                    <span>{isHindi ? 'रद्द करें' : 'Cancel'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => stopListening(true)}
                    className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors shadow-sm"
                    title={isHindi ? 'माइक बंद कर संपादन करें' : 'Stop mic and edit text'}
                  >
                    <Check size={13} />
                    <span>{isHindi ? 'सहेजें (Edit)' : 'Done (Edit)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputQuery.trim() && !interimTranscript.trim()}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={13} />
                    <span>{isHindi ? 'तुरंत भेजें' : 'Send Now'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ERROR TOAST */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* DYNAMIC SUGGESTED QUESTION CHIPS */}
          {latestSuggestions.length > 0 && (
            <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
                {isHindi ? 'सुझाव:' : 'Suggested:'}
              </span>
              {latestSuggestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 whitespace-nowrap flex-shrink-0 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* INPUT BAR */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t-2 border-slate-900 dark:border-slate-800 flex items-center gap-2">
            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={() => {
                if (assistantState === 'listening') {
                  stopListening(true);
                } else {
                  startListening();
                }
              }}
              className={`p-2.5 rounded-xl border-2 transition-all flex-shrink-0 ${
                assistantState === 'listening'
                  ? 'bg-red-600 border-red-700 text-white animate-pulse shadow-lg ring-4 ring-red-200 dark:ring-red-900'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
              }`}
              title={assistantState === 'listening' ? 'Stop Listening' : 'Speak your query'}
            >
              {assistantState === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputQuery}
              onChange={e => {
                stopSpeaking();
                setInputQuery(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isHindi
                  ? 'योजना, पात्रता, या दस्तावेज़ के बारे में पूछें...'
                  : 'Ask about any scheme, eligibility, or documents...'
              }
              className="flex-1 px-4 py-2 text-sm rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || assistantState === 'thinking'}
              className="p-2.5 rounded-xl border-2 border-slate-900 dark:border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex-shrink-0"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SOURCE CITATION INSPECTION MODAL (PDF EVIDENCE)                     */}
      {/* ------------------------------------------------------------------- */}
      {selectedCitation && (
        <PdfEvidenceViewerModal
          versionId={selectedCitation.document_version_id || selectedCitation.id || 'ver-pm_kisan-ae82cac8'}
          initialPage={selectedCitation.page || 1}
          documentTitle={selectedCitation.title}
          quoteSnippet={selectedCitation.excerpt}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </>
  );
};
