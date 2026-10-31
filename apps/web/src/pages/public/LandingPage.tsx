/**
 * Public Landing Page with Dynamic Interactive 3D Knowledge Canvas & Trust Pillars
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Scale,
  FileText,
  Lock,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Interactive 3D particle & knowledge network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 480);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 480;
    };
    window.addEventListener('resize', handleResize);

    // Nodes representing schemes, evidence documents, and citizen circumstances
    const nodeCount = 38;
    const nodes = Array.from({ length: nodeCount }).map((_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: i % 5 === 0 ? 4.5 : 2.5,
      color: i % 4 === 0 ? '#f59e0b' : '#10b981',
      glow: i % 6 === 0
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines (representing grounded document links)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.25;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        if (node.glow) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = node.color;
        } else {
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const categories = [
    { id: 'all', label: language === 'hi' ? 'सभी श्रेणियां' : 'All Categories', count: 13 },
    { id: 'Agriculture & Rural', label: language === 'hi' ? 'कृषि एवं ग्रामीण' : 'Agriculture & Rural', count: 3 },
    { id: 'Education & Scholarships', label: language === 'hi' ? 'शिक्षा एवं छात्रवृत्ति' : 'Education & Scholarships', count: 3 },
    { id: 'Social Security & Pension', label: language === 'hi' ? 'सामाजिक सुरक्षा एवं पेंशन' : 'Social Security & Pension', count: 3 },
    { id: 'Healthcare', label: language === 'hi' ? 'स्वास्थ्य सेवा' : 'Healthcare', count: 1 },
    { id: 'Housing & Welfare', label: language === 'hi' ? 'आवास एवं कल्याण' : 'Housing & Welfare', count: 1 },
    { id: 'Women & Child Development', label: language === 'hi' ? 'महिला एवं बाल विकास' : 'Women & Child Development', count: 1 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* Hero Section with 3D Canvas Background */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '3rem 0 4rem 0',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.65
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="badge badge-emerald" style={{ width: 'fit-content' }}>
              <Sparkles size={14} />
              {t('hero.badge')}
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em'
              }}
            >
              {t('hero.title')}
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}
            >
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
              <Link to="/app/eligibility" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <CheckCircle size={18} />
                {t('hero.cta.discover')}
                <ArrowRight size={18} />
              </Link>
              <Link to="/app/chat" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
                <Sparkles size={18} />
                {t('hero.cta.chat')}
              </Link>
              <Link to="/schemes" className="btn btn-ghost" style={{ padding: '0.85rem 1.25rem' }}>
                <Search size={18} />
                {t('nav.schemes')}
              </Link>
            </div>

            {/* Key Platform Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>13</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('hero.stats.schemes')}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-saffron)' }}>100%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('hero.stats.evidence')}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Python 3-Val</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('hero.stats.rules')}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>IndexedDB</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('hero.stats.offline')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architectural Pillars */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {language === 'hi' ? 'विश्वसनीयता एवं सुरक्षा के तीन आधारस्तम्भ' : 'Core Trust & Governance Pillars'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {language === 'hi'
              ? 'योजना सहायक सामान्य भाषा मॉडल पर नहीं, बल्कि कठोर प्रशासनिक नियमों और सत्यापित सरकारी अधिसूचनाओं पर कार्य करता है।'
              : 'Yojana Sahayak replaces AI hallucinations with traceable PDF citations, strict policy compliance gates, and human rule approvals.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{t('trust.pillar1.title')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('trust.pillar1.desc')}
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-saffron-light)',
                color: 'var(--accent-saffron)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scale size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{t('trust.pillar2.title')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('trust.pillar2.desc')}
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{t('trust.pillar3.title')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('trust.pillar3.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Scheme Categories Showcase */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {language === 'hi' ? 'उपलब्ध सरकारी योजनाएं' : 'Explore Welfare Schemes'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {language === 'hi' ? 'केंद्रीय और उत्तराखंड राज्य की सत्यापित जनकल्याण योजनाएं' : 'Central and Uttarakhand State verified schemes'}
            </p>
          </div>
          <Link to="/schemes" className="btn btn-secondary btn-sm">
            {language === 'hi' ? 'सभी 13 योजनाएं देखें' : 'View All 13 Schemes'}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`badge ${activeCategory === c.id ? 'badge-emerald' : 'badge-muted'}`}
              style={{ padding: '0.45rem 0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {c.label} ({c.count})
            </button>
          ))}
        </div>

        {/* Highlighted Schemes Grid Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1: PM-KISAN */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-emerald">Central • RAG & Rules</span>
              <span className="badge badge-saffron">₹6,000 / Yr</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
              {language === 'hi' ? 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)' : 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1 }}>
              {language === 'hi'
                ? 'भूमिधारक किसान परिवारों को प्रति वर्ष 6,000 रुपये की वित्तीय सहायता तीन समान किस्तों में प्रत्यक्ष लाभ अंतरण (DBT) द्वारा।'
                : 'Direct income support of Rs. 6,000 per year in 3 equal installments to landholding farmer families across India.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Link to="/schemes/SCHEME-PM-KISAN" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {language === 'hi' ? 'विवरण एवं नियम' : 'Details & Rules'} <ArrowRight size={14} />
              </Link>
              <Link to="/app/eligibility" className="btn btn-sm btn-primary">
                {t('btn.checkEligibility')}
              </Link>
            </div>
          </div>

          {/* Card 2: Central Sector Scholarship */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-emerald">Central • Higher Edu</span>
              <span className="badge badge-saffron">₹12k - 20k / Yr</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
              {language === 'hi' ? 'कॉलेज व विश्वविद्यालय छात्रवृत्ति योजना (CSSS)' : 'Central Sector Scholarship Scheme (CSSS)'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1 }}>
              {language === 'hi'
                ? '12वीं कक्षा में 80वें पर्सेंटाइल से ऊपर तथा 4.5 लाख से कम पारिवारिक आय वाले स्नातक और स्नातकोत्तर मेधावी छात्रों हेतु।'
                : 'Merit-cum-means scholarship for students above 80th percentile in Class 12 with family income under Rs. 4.5 Lakhs.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Link to="/schemes/SCHEME-CSSS" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {language === 'hi' ? 'विवरण एवं नियम' : 'Details & Rules'} <ArrowRight size={14} />
              </Link>
              <Link to="/app/eligibility" className="btn btn-sm btn-primary">
                {t('btn.checkEligibility')}
              </Link>
            </div>
          </div>

          {/* Card 3: Nanda Gaura Uttarakhand */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-blue">Uttarakhand State</span>
              <span className="badge badge-saffron">₹11k + ₹51k</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
              {language === 'hi' ? 'नंदा गौरा योजना (उत्तराखंड)' : 'Nanda Gaura Yojana (Uttarakhand)'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1 }}>
              {language === 'hi'
                ? 'बालिका जन्म पर ₹11,000 तथा 12वीं उत्तीर्ण करने पर ₹51,000 की वित्तीय सहायता। उत्तराखंड के मूल निवासी परिवारों हेतु।'
                : 'Financial assistance of Rs. 11,000 on birth and Rs. 51,000 upon passing Class 12 for Uttarakhand permanent residents.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Link to="/schemes/SCHEME-UK-NANDA-GAURA" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {language === 'hi' ? 'विवरण एवं नियम' : 'Details & Rules'} <ArrowRight size={14} />
              </Link>
              <Link to="/app/eligibility" className="btn btn-sm btn-primary">
                {t('btn.checkEligibility')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RAG & Provenance Demonstration Callout */}
      <section className="container">
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(5, 150, 105, 0.15))',
            borderColor: 'var(--border-glow)',
            padding: '2.5rem'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span className="badge badge-emerald">Verified RAG Intelligence</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                {language === 'hi'
                  ? 'हर उत्तर का आधिकारिक प्रमाण'
                  : 'Every Answer Backed by Official Document Coordinates'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {language === 'hi'
                  ? 'जब आप एआई सहायक से कोई प्रश्न पूछते हैं, तो उत्तर के साथ सटीक पृष्ठ संख्या और हाइलाइट किया गया अंश प्रदर्शित होता है। आप एक क्लिक में मूल सरकारी पीडीएफ खोल सकते हैं।'
                  : 'When you ask a question in Hindi or English, every factual claim is anchored to exact coordinates in verified government PDFs. Click any citation chip to inspect the original text.'}
              </p>
              <div>
                <Link to="/app/chat" className="btn btn-primary">
                  <Sparkles size={18} />
                  {language === 'hi' ? 'एआई सहायक के साथ चैट करें' : 'Try the Grounded Assistant'}
                </Link>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                minWidth: '280px',
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid var(--border-normal)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Sample Verified Chat Response</span>
                <span className="badge badge-emerald">STRONG EVIDENCE</span>
              </div>
              <div style={{ color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {language === 'hi'
                  ? 'पीएम-किसान योजना के अंतर्गत सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष 3 समान किस्तों में प्रदान किए जाते हैं [दस्तावेज़: PM-KISAN दिशानिर्देश 2024, पृ. 3]।'
                  : 'Under PM-KISAN, eligible landholding farmer families receive Rs. 6,000 annually in three 4-monthly installments of Rs. 2,000 [Citation: PM-KISAN Guidelines 2024, Page 3].'}
              </div>
              <div
                style={{
                  background: 'var(--accent-primary-light)',
                  border: '1px dashed var(--accent-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--accent-primary)'
                }}
              >
                📍 Highlight Coordinates: Box [x: 54.2, y: 142.0, w: 480.5, h: 22.8] on Page 3
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
