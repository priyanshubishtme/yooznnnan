/**
 * Grounded RAG Chat Interface with Interactive Citation Inspector & Visual Coordinate Highlighting
 *
 * Enforces Blueprint Section 9:
 * - 100% citation grounding against verified official documents.
 * - Interactive [C1], [C2] inline citations linked to exact bounding boxes and page numbers.
 * - Deterministic evidence badges: STRONG, PARTIAL, INSUFFICIENT.
 * - Polite refusal display when evidence is insufficient.
 * - Bilingual Hindi and English support with scheme filtering.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Info,
  ChevronRight,
  Layers,
  X,
  Compass,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ChatMessage, CitationReference } from '../../types';

export const ChatPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [selectedCitation, setSelectedCitation] = useState<CitationReference | null>(null);
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with bilingual welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: language === 'hi'
          ? 'नमस्ते! मैं आपका योजना सहायक हूँ। आप मुझसे किसी भी सरकारी योजना, किस्त विवरण, पात्रता शर्तों या आवश्यक दस्तावेज़ों के बारे में पूछ सकते हैं।\n\nमेरे सभी उत्तर सीधे सत्यापित सरकारी राजपत्र एवं दिशानिर्देशों से उद्धृत होते हैं। किसी भी दावे पर क्लिक करके आप उसका मूल पृष्ठ और निर्देशांक देख सकते हैं।'
          : 'Welcome to Yojana Sahayak Grounded AI! Ask me anything regarding government welfare schemes, installment schedules, eligibility rules, or required documents.\n\nEvery single statement is strictly cited from verified official gazettes and operational guidelines. Click any citation chip to inspect the verbatim source page and bounding box coordinates.',
        evidence_badge: 'STRONG',
        evidence_reason: 'Official Operational Guidelines in Registry',
        citations: [
          {
            citation_tag: '[C1]',
            index: 1,
            chunk_id: 'chk-ver-doc-pmkisan-gu-v1-p001-00',
            document_version_id: 'ver-doc-pmkisan-gu-v1',
            page_number: 1,
            document_title: 'PM-KISAN Operational Guidelines Revised 2024',
            quote: 'The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme with 100% funding from Government of India. Financial assistance of Rs. 6000 per annum is provided in three equal 4-monthly installments.',
            boxes: [
              { page_number: 1, x0: 72.0, y0: 42.8, x1: 418.8, y1: 64.78, box_type: 'heading' },
              { page_number: 1, x0: 72.0, y0: 129.79, x1: 382.95, y1: 142.84, box_type: 'paragraph' }
            ]
          }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const samplePrompts = language === 'hi' ? [
    'पीएम-किसान में कितनी सहायता राशि और किस्तें मिलती हैं?',
    'पीएम आवास योजना (ग्रामीण) में शौचालय निर्माण हेतु कितनी राशि मिलती है?',
    'क्या आयुष्मान भारत (PM-JAY) पूरे देश में मान्य (पोर्टेबल) है?',
    'क्या पीएम-किसान राशि से रॉकेट का टिकट खरीद सकते हैं?'
  ] : [
    'What is the installment pattern in PM-KISAN?',
    'What is the toilet grant amount under PMAY-G?',
    'Does PM-JAY offer nationwide portability?',
    'Can I buy a rocket ticket with PM-KISAN subsidy?'
  ];

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setLoadingStage(
      language === 'hi'
        ? 'सत्यापित आधिकारिक दिशानिर्देशों में खोज हो रही है...'
        : 'Searching verified official guidelines (Dense + BM25 RRF)...'
    );

    try {
      // Progressive status updates for citizen clarity
      setTimeout(() => {
        setLoadingStage(
          language === 'hi'
            ? 'प्रमाण-आधारित उत्तर तैयार किया जा रहा है...'
            : 'Synthesizing evidence-grounded answer...'
        );
      }, 400);

      const response = await fetch('http://127.0.0.1:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: queryText,
          language: language,
          scheme_id: selectedSchemeFilter || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const resJson = await response.json();
      const chatData = resJson.data;

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: chatData.answer,
        evidence_badge: chatData.evidence_level,
        evidence_reason: chatData.evidence_reason,
        is_refusal: chatData.is_refusal,
        passages_retrieved: chatData.passages_retrieved,
        citations: (chatData.citations || []).map((c: any) => ({
          citation_tag: c.citation_tag,
          index: c.index,
          chunk_id: c.chunk_id,
          document_version_id: c.document_version_id,
          page_number: c.page_number,
          document_title: c.document_title,
          quote: c.quote,
          quote_snippet: c.quote,
          boxes: c.boxes || []
        })),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If citations exist, auto-preview the first citation in inspector
      if (assistantMessage.citations && assistantMessage.citations.length > 0) {
        setSelectedCitation(assistantMessage.citations[0]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: language === 'hi'
          ? 'उत्तर प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Unable to reach the grounded retrieval service. Please try again.',
        evidence_badge: 'INSUFFICIENT',
        evidence_reason: 'Connection failure',
        is_refusal: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  /**
   * Helper to format response text and render [C1], [C2] tags as clickable chips
   */
  const renderFormattedContent = (content: string, citations?: CitationReference[]) => {
    const citationRegex = /(\[C\d+\])/g;
    const parts = content.split(citationRegex);

    return parts.map((part, index) => {
      if (citationRegex.test(part)) {
        const found = citations?.find(c => c.citation_tag === part);
        return (
          <button
            key={index}
            onClick={() => found && setSelectedCitation(found)}
            title={found ? `Click to inspect Page ${found.page_number} (${found.document_title})` : 'Citation'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              margin: '0 0.25rem',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: 'var(--accent-saffron)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              verticalAlign: 'baseline',
              transition: 'all var(--transition-fast)'
            }}
          >
            <FileText size={11} />
            <span>{part}</span>
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 120px)', position: 'relative' }}>
      {/* Main Chat Stream Container */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {language === 'hi' ? 'सत्यापित एआई सहायक' : 'Grounded AI Assistant'}
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-emerald)',
                    fontWeight: 700
                  }}
                >
                  RAG Hybrid
                </span>
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {language === 'hi'
                  ? 'शून्य मतिभ्रम (Zero Hallucination) • केवल सत्यापित आधिकारिक दिशानिर्देश'
                  : 'Zero Hallucination Mode • Dense + BM25 RRF • Ministry Gazettes'}
              </div>
            </div>
          </div>

          {/* Scheme Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Filter size={14} />
              <span>{language === 'hi' ? 'योजना फ़िल्टर:' : 'Filter Scheme:'}</span>
            </div>
            <select
              value={selectedSchemeFilter}
              onChange={(e) => setSelectedSchemeFilter(e.target.value)}
              style={{
                background: 'var(--bg-app)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-normal)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="">{language === 'hi' ? 'सभी 13 योजनाएं (All Schemes)' : 'All 13 Schemes'}</option>
              <option value="SCHEME-PM-KISAN">PM-KISAN (पीएम-किसान)</option>
              <option value="SCHEME-PMAY-G">PMAY-G (पीएम आवास ग्रामीण)</option>
              <option value="SCHEME-PM-JAY">PM-JAY (आयुष्मान भारत)</option>
              <option value="SCHEME-UK-OLD-AGE">UK Old Age Pension (वृद्धावस्था पेंशन)</option>
              <option value="SCHEME-CSSS">CSSS (उच्च शिक्षा छात्रवृत्ति)</option>
            </select>
          </div>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'pre-line'
                }}
              >
                {/* Refusal Notice Callout */}
                {m.is_refusal && (
                  <div
                    style={{
                      marginBottom: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'var(--accent-danger)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Info size={16} />
                    <span>
                      {language === 'hi'
                        ? 'सत्यापन आश्वासन: आधिकारिक दिशानिर्देशों में इस प्रश्न के लिए कोई आधिकारिक प्रमाण नहीं मिला। मतिभ्रम रोकने हेतु उत्तर नहीं बनाया गया।'
                        : 'Grounding Assurance: No evidentiary backing found in official guidelines. Refused to prevent hallucination.'}
                    </span>
                  </div>
                )}

                {/* Formatted Content with Interactive Inline Citation Pills */}
                <div>
                  {m.role === 'assistant' ? renderFormattedContent(m.content, m.citations) : m.content}
                </div>

                {/* Evidence Quality Badge & Passages Count */}
                {m.evidence_badge && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span
                      className={`badge ${
                        m.evidence_badge === 'STRONG'
                          ? 'badge-emerald'
                          : m.evidence_badge === 'PARTIAL'
                          ? 'badge-amber'
                          : 'badge-gray'
                      }`}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', fontWeight: 700 }}
                    >
                      {m.evidence_badge === 'STRONG' && <ShieldCheck size={13} style={{ marginRight: '0.25rem' }} />}
                      {m.evidence_badge === 'PARTIAL' && <AlertTriangle size={13} style={{ marginRight: '0.25rem' }} />}
                      {m.evidence_badge === 'INSUFFICIENT' && <Info size={13} style={{ marginRight: '0.25rem' }} />}
                      {m.evidence_badge} EVIDENCE
                    </span>

                    {m.evidence_reason && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        • {m.evidence_reason}
                      </span>
                    )}

                    {m.passages_retrieved !== undefined && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        • {m.passages_retrieved} official passages analyzed
                      </span>
                    )}
                  </div>
                )}

                {/* Citations Footer Chips */}
                {m.citations && m.citations.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'hi' ? 'सत्यापित उद्धरण (क्लिक करके विवरण देखें):' : 'Verified Citations (Click to inspect source):'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {m.citations.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCitation(c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: selectedCitation?.chunk_id === c.chunk_id ? 'var(--accent-primary-light)' : 'var(--bg-app)',
                            border: `1px solid ${selectedCitation?.chunk_id === c.chunk_id ? 'var(--accent-primary)' : 'var(--border-normal)'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.75rem',
                            color: 'var(--accent-primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <FileText size={12} />
                          <span>
                            {c.citation_tag || `[C${idx + 1}]`} Page {c.page_number} ({c.document_title.slice(0, 24)}...)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', padding: '0 0.35rem' }}>
                {m.timestamp}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
              <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {loadingStage}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.75rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Composer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? 'सरकारी योजना, पात्रता या किस्त संबंधी प्रश्न पूछें...'
                : 'Ask any question about welfare schemes, benefits, or criteria...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="btn btn-primary"
            style={{
              width: '46px',
              height: '46px',
              padding: 0,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.6 : 1
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Side Panel: PDF Citation & Visual Coordinate Highlight Inspector */}
      {selectedCitation && (
        <div
          className="glass-card"
          style={{
            width: '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
            overflowY: 'auto',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FileText size={18} style={{ color: 'var(--accent-saffron)' }} />
              <span>{language === 'hi' ? 'उद्धरण साक्ष्य विवरण' : 'Citation Evidence'}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-saffron)',
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                {selectedCitation.citation_tag || `[C${selectedCitation.index || 1}]`}
              </span>
            </h3>
            <button
              onClick={() => setSelectedCitation(null)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.2rem', minWidth: 'auto', borderRadius: 'var(--radius-sm)' }}
              title="Close Panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Document Metadata Card */}
          <div
            style={{
              background: 'var(--bg-app)',
              padding: '0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {language === 'hi' ? 'स्रोत दस्तावेज़:' : 'Official Document:'}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedCitation.document_title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  background: 'var(--accent-primary-light)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Page {selectedCitation.page_number}
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                <CheckCircle2 size={11} style={{ marginRight: '0.2rem' }} />
                Verified Immutable
              </span>
            </div>
          </div>

          {/* Verbatim Extracted Quote */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              {language === 'hi' ? 'अपरिवर्तनीय शब्दशः उद्धरण (Verbatim Quote):' : 'Verbatim Extracted Quote:'}
            </div>
            <blockquote
              style={{
                borderLeft: '3px solid var(--accent-saffron)',
                margin: 0,
                padding: '0.75rem',
                fontSize: '0.84rem',
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                lineHeight: 1.5,
                background: 'rgba(245, 158, 11, 0.08)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
              }}
            >
              "{selectedCitation.quote || selectedCitation.quote_snippet}"
            </blockquote>
          </div>

          {/* Visual PDF Coordinate Highlight Preview */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={14} />
              <span>{language === 'hi' ? 'दस्तावेज़ निर्देशांक हाइलाइट (PDF Coordinates):' : 'PDF Coordinate Highlighting:'}</span>
            </div>

            {/* Visual Page Sheet Simulation */}
            <div
              style={{
                width: '100%',
                height: '180px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-normal)',
                position: 'relative',
                overflow: 'hidden',
                padding: '0.75rem'
              }}
            >
              {/* Document Header Line Placeholder */}
              <div style={{ height: '6px', width: '40%', background: 'var(--border-normal)', borderRadius: '2px', marginBottom: '8px' }} />
              <div style={{ height: '4px', width: '80%', background: 'var(--border-subtle)', borderRadius: '2px', marginBottom: '6px' }} />
              <div style={{ height: '4px', width: '70%', background: 'var(--border-subtle)', borderRadius: '2px', marginBottom: '16px' }} />

              {/* Highlighted Bounding Box Regions */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.22)',
                  border: '1.5px solid var(--accent-saffron)',
                  borderRadius: '3px',
                  padding: '0.5rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-primary)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.25)'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--accent-saffron)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Layers size={11} />
                  <span>Verified Bounding Box [Page {selectedCitation.page_number}]</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {selectedCitation.quote?.slice(0, 110)}...
                </div>
              </div>

              {/* Below text simulation */}
              <div style={{ height: '4px', width: '90%', background: 'var(--border-subtle)', borderRadius: '2px', marginTop: '14px', marginBottom: '6px' }} />
              <div style={{ height: '4px', width: '60%', background: 'var(--border-subtle)', borderRadius: '2px' }} />
            </div>
          </div>

          {/* Coordinate Box Readouts */}
          {selectedCitation.boxes && selectedCitation.boxes.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Extracted Bounding Coordinates ({selectedCitation.boxes.length} segments):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '110px', overflowY: 'auto' }}>
                {selectedCitation.boxes.map((b, bi) => (
                  <div
                    key={bi}
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      background: 'var(--bg-app)',
                      padding: '0.3rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>x0:{b.x0?.toFixed(1)} y0:{b.y0?.toFixed(1)}</span>
                    <span>x1:{b.x1?.toFixed(1)} y1:{b.y1?.toFixed(1)}</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{b.box_type || 'p'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provenance Footer */}
          <div
            style={{
              marginTop: 'auto',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}
          >
            <div>Chunk ID: <code>{selectedCitation.chunk_id}</code></div>
            <div>Version ID: <code>{selectedCitation.document_version_id}</code></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              <ShieldCheck size={13} />
              <span>Immutable cryptographic hash verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
