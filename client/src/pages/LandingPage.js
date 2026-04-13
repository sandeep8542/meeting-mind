import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Brain, Calendar, CheckSquare, FileText, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import styles from './LandingPage.module.css';

const features = [
  { icon: Mic, title: 'Live Voice Recording', desc: 'Real-time speech-to-text with high accuracy across accents and audio environments.' },
  { icon: Brain, title: 'Gemini AI Analysis', desc: 'Powered by Google Gemini to extract meaning, sentiment, and structure from every word.' },
  { icon: CheckSquare, title: 'Auto Task Creation', desc: 'Action items detected and turned into tracked tasks automatically from conversation.' },
  { icon: Calendar, title: 'Calendar Events', desc: 'Mentioned dates, times, and commitments are converted to calendar events instantly.' },
  { icon: FileText, title: 'Smart Meeting Notes', desc: 'Clean, structured notes with key points and executive summaries generated in seconds.' },
  { icon: Zap, title: 'Instant Processing', desc: 'AI processes your transcript in real-time. No waiting, no manual work required.' },
];

const stats = [
  { value: '10x', label: 'Faster note-taking' },
  { value: '98%', label: 'Transcription accuracy' },
  { value: '< 5s', label: 'AI processing time' },
  { value: '∞', label: 'Meetings stored' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.logoIcon}><Mic size={16} /></div>
          <span>MeetingMind</span>
        </div>
        <div className={styles.navActions}>
          <button className={styles.navLink} onClick={() => navigate('/login')}>Sign in</button>
          <button className={styles.navCta} onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={styles.heroContent}
        >
          <div className={styles.badge}>
            <Zap size={12} />
            <span>Powered by Google Gemini AI</span>
          </div>
          <h1 className={styles.heroTitle}>
            Your meetings,<br />
            <span className={styles.heroAccent}>intelligently</span> captured.
          </h1>
          <p className={styles.heroSubtitle}>
            MeetingMind transforms spoken conversations into structured tasks, events, and notes.
            Speak freely — let AI handle the rest.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.primaryBtn} onClick={() => navigate('/register')}>
              Start for free <ArrowRight size={16} />
            </button>
            <button className={styles.ghostBtn} onClick={() => navigate('/login')}>
              Sign in to continue
            </button>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          className={styles.heroVisual}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.mockCard}>
            <div className={styles.mockHeader}>
              <div className={styles.mockDot} style={{ background: '#ff5f5f' }} />
              <div className={styles.mockDot} style={{ background: '#ffbd2e' }} />
              <div className={styles.mockDot} style={{ background: '#28ca41' }} />
              <span className={styles.mockTitle}>Live Recording</span>
            </div>
            <div className={styles.mockWave}>
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.mockBar}
                  animate={{ height: [8, Math.random() * 40 + 10, 8] }}
                  transition={{ duration: 0.8 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </div>
            <div className={styles.mockTranscript}>
              <p>"Let's schedule the product review for Friday at 3pm..."</p>
              <p className={styles.mockFade}>"John will own the API documentation task..."</p>
            </div>
            <div className={styles.mockChips}>
              <span className={styles.mockChip} style={{ borderColor: 'rgba(108,99,255,0.4)', color: '#6c63ff' }}>📅 Calendar Event</span>
              <span className={styles.mockChip} style={{ borderColor: 'rgba(67,233,123,0.4)', color: '#43e97b' }}>✅ Task Created</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className={styles.statItem}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Features */}
      <section className={styles.features}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.sectionTitle}>Everything you need,<br />nothing you don't.</h2>
          <p className={styles.sectionSub}>A complete meeting intelligence suite built for modern teams.</p>
        </motion.div>
        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.featureIcon}><f.icon size={20} /></div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <motion.div
          className={styles.ctaBox}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className={styles.ctaGlow} />
          <Shield size={32} className={styles.ctaIcon} />
          <h2 className={styles.ctaTitle}>Ready to reclaim your time?</h2>
          <p className={styles.ctaSub}>Join teams who let AI handle their meeting admin.</p>
          <button className={styles.primaryBtn} onClick={() => navigate('/register')}>
            Create free account <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <div className={styles.logoIcon}><Mic size={14} /></div>
          <span>MeetingMind</span>
        </div>
        <p className={styles.footerText}>Built with Node.js, React, MongoDB & Gemini AI</p>
      </footer>
    </div>
  );
}
