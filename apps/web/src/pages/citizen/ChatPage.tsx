/**
 * Bilingual Grounded Chat Interface with Citation Inspector & Evidence Badges
 */

import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  ShieldCheck,
  FileText,
  ExternalLink,
  Info,
  ChevronRight,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ChatMessage, CitationReference } from '../../types';

export const ChatPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: language === 'hi'
        ? 'नमस्ते! मैं आपका योजना सहायक हूँ। आप मुझसे किसी भी सरकारी योजना, पात्रता शर्तों या आवश्यक दस्तावेज़ों के बारे में पूछ सकते हैं। मेरे सभी उत्तर आधिकारिक सरकारी दिशा-निर्देशों से सत्यापित होते हैं।'
        : 'Hello! I am your Yojana Sahayak assistant. Ask me anything about welfare schemes, eligibility rules, or required documents. Every factual claim is backed by verified official guidelines.',
      evidence_badge: 'STRONG',
      citations: [
        {
          chunk_id: 'chk-seed-01',
          document_version_id: 'doc-pmkisan-v1',
          page_number: 3,
          document_title: 'PM-KISAN Operational Guidelines 2024',
          quote_snippet: 'Under PM-KISAN, financial assistance of Rs. 6000 per annum is provided to all landholding farmer families.'
        }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [selectedCitation, setSelectedCitation] = useState<CitationReference | null>(null);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);

  const samplePrompts = [
    language === 'hi' ? 'पीएम-किसान में किसे ₹6000 मिलते हैं?' : 'Who is eligible for PM-KISAN ₹6000?',
    language === 'hi' ? 'उत्तराखंड वृद्धावस्था पेंशन की पात्रता क्या है?' : 'What is the eligibility for UK Old Age Pension?',
    language === 'hi' ? 'कॉलेज छात्रों के लिए CSSS छात्रवृत्ति के नियम?' : 'What are the rules for Central Sector Scholarship?'
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulated grounded RAG response for prototype shell
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: language === 'hi'
          ? `आपके प्रश्न "${q}" के संबंध में: आधिकारिक दिशा-निर्देशों के अनुसार, पात्रता शर्तों को पूरा करने वाले नागरिक इस योजना का लाभ प्राप्त कर सकते हैं [सत्यापित प्रमाण: पृष्ठ 3]।`
          : `Regarding your query "${q}": According to verified ministry operational guidelines, beneficiaries meeting landholding and income criteria are entitled to benefits [Verified Source: Page 3].`,
        evidence_badge: 'STRONG',
        citations: [
          {
            chunk_id: 'chk-demo-02',
            document_version_id: 'doc-pmkisan-v1',
            page_number: 3,
            document_title: 'Ministry Operational Circular 2024',
            quote_snippet: 'Operational criteria state that all landholding farmer families with cultivable landholding in their names are eligible.'
          }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    }, 700);
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 120px)', position: 'relative' }}>
      {/* Main Chat Area */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-saffron))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {language === 'hi' ? 'सत्यापित एआई सहायक' : 'Grounded AI Assistant'}
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Groq API • Zero Hallucination Mode • Hindi / English
              </div>
            </div>
          </div>

          <span className="badge badge-emerald">
            <ShieldCheck size={14} />
            100% Citation Grounded
          </span>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
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
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '0.925rem',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {m.content}

                {/* Evidence Badge */}
                {m.evidence_badge && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className="badge badge-emerald"
                      style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
                    >
                      {m.evidence_badge} EVIDENCE
                    </span>
                  </div>
                )}

                {/* Citations Chips */}
                {m.citations && m.citations.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem'
                    }}
                  >
                    {m.citations.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCitation(c)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-normal)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.75rem',
                          color: 'var(--accent-primary)',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={12} />
                        <span>p. {c.page_number} ({c.document_title.slice(0, 18)}...)</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                {m.timestamp}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Suggestions */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.75rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
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
            placeholder={language === 'hi' ? 'अपनी भाषा में सरकारी योजना संबंधी प्रश्न पूछें...' : 'Ask any government welfare scheme question...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />

          {/* Voice Input Toggle Button */}
          <button
            onClick={() => setVoiceActive(!voiceActive)}
            className="btn btn-secondary"
            style={{
              width: '44px',
              height: '44px',
              padding: 0,
              borderRadius: 'var(--radius-md)',
              color: voiceActive ? 'var(--accent-danger)' : 'var(--text-secondary)'
            }}
            title={voiceActive ? 'Microphone Active' : 'Speech Input'}
          >
            {voiceActive ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            className="btn btn-primary"
            style={{ width: '44px', height: '44px', padding: 0, borderRadius: 'var(--radius-md)' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Side Panel: PDF Citation & Coordinate Highlight Inspector */}
      {selectedCitation && (
        <div
          className="glass-card"
          style={{
            width: '340px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
              Citation Evidence
            </h3>
            <button
              onClick={() => setSelectedCitation(null)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Close
            </button>
          </div>

          <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Document:</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedCitation.document_title}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
              Page {selectedCitation.page_number}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Verbatim Extracted Quote:
            </div>
            <blockquote
              style={{
                borderLeft: '3px solid var(--accent-primary)',
                paddingLeft: '0.75rem',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                lineHeight: 1.5,
                background: 'var(--accent-primary-light)',
                padding: '0.75rem',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
              }}
            >
              "{selectedCitation.quote_snippet}"
            </blockquote>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <div>Chunk ID: <code>{selectedCitation.chunk_id}</code></div>
            <div>Doc Version: <code>{selectedCitation.document_version_id}</code></div>
            <div>Status: <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Verified Immutable</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
