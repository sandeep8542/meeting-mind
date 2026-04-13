import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Square, Brain, CheckSquare,
  Calendar, FileText, Clock, AlertTriangle, ArrowLeft, Loader, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/ui/Sidebar';
import useSpeechToText from '../hooks/useSpeechToText';
import api from '../utils/api';
import styles from './MeetingPage.module.css';

const typeIcon = { task: CheckSquare, calendar_event: Calendar, meeting_note: FileText, reminder: Clock, decision: Zap };
const typeColor = { task: '#6c63ff', calendar_event: '#43e97b', meeting_note: '#f7b731', reminder: '#4ecdc4', decision: '#ff6584' };

export default function MeetingPage() {
  const navigate = useNavigate();
  const {
    isListening, transcript, interimTranscript,
    error: speechError, duration, isSupported,
    startListening, stopListening, resetTranscript
  } = useSpeechToText();

  const [phase, setPhase] = useState('idle'); // idle | recording | processing | done
  const [manualTranscript, setManualTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [useManual, setUseManual] = useState(false);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartRecording = () => {
    if (!isSupported && !useManual) {
      toast.error('Speech recognition not supported. Please use the manual input below.');
      setUseManual(true);
      return;
    }
    resetTranscript();
    startListening();
    setPhase('recording');
  };

  const handleStopAndProcess = async () => {
    let finalTranscript = '';
    let finalDuration = 0;

    if (isListening) {
      const res = stopListening();
      finalTranscript = res.transcript;
      finalDuration = res.duration;
    } else {
      finalTranscript = manualTranscript;
      finalDuration = 0;
    }

    const text = finalTranscript || transcript || manualTranscript;

    if (!text || text.trim().length < 20) {
      toast.error('Transcript is too short. Please speak more or type a longer transcript.');
      setPhase('idle');
      return;
    }

    setPhase('processing');

    try {
      // Create meeting first
      const meetingRes = await api.post('/meetings', {
        title: 'Processing...',
        transcript: text,
        duration: finalDuration || duration
      });
      const newMeetingId = meetingRes.data.meeting._id;
      setMeetingId(newMeetingId);

      // Process with AI
      const aiRes = await api.post('/ai/process-transcript', {
        transcript: text,
        meetingId: newMeetingId
      });

      setResult(aiRes.data);
      setPhase('done');
      toast.success('AI processing complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI processing failed.');
      setPhase('idle');
    }
  };

  const handleCancel = () => {
    if (isListening) stopListening();
    setPhase('idle');
    resetTranscript();
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className={styles.pageTitle}>New Meeting</h1>
        </div>

        <div className={styles.content}>
          {/* Left: Recording Panel */}
          <div className={styles.recordPanel}>
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div
                  key="idle"
                  className={styles.idlePanel}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <div className={styles.micRing}>
                    <div className={styles.micIcon}><Mic size={32} /></div>
                  </div>
                  <h2 className={styles.recordTitle}>Ready to record</h2>
                  <p className={styles.recordSubtitle}>
                    Click start to begin recording your meeting. AI will automatically extract tasks, events, and notes.
                  </p>
                  {!isSupported && (
                    <div className={styles.warningBox}>
                      <AlertTriangle size={14} />
                      <span>Your browser doesn't support speech recognition. Use manual input below.</span>
                    </div>
                  )}
                  <button className={styles.startBtn} onClick={handleStartRecording}>
                    <Mic size={18} /> Start Recording
                  </button>
                </motion.div>
              )}

              {phase === 'recording' && (
                <motion.div
                  key="recording"
                  className={styles.recordingPanel}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <div className={styles.recordingTop}>
                    <div className={styles.recDot} />
                    <span className={styles.recLabel}>LIVE</span>
                    <span className={styles.timer}>{formatTime(duration)}</span>
                  </div>

                  {/* Waveform animation */}
                  <div className={styles.waveform}>
                    {Array.from({ length: 40 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={styles.waveBar}
                        animate={{ height: isListening ? [6, Math.random() * 48 + 8, 6] : 6 }}
                        transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.04 }}
                      />
                    ))}
                  </div>

                  <div className={styles.liveTranscript}>
                    <div className={styles.liveTranscriptInner}>
                      {transcript && <span>{transcript}</span>}
                      {interimTranscript && (
                        <span className={styles.interim}>{interimTranscript}</span>
                      )}
                      {!transcript && !interimTranscript && (
                        <span className={styles.placeholder}>Listening... start speaking</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.recordActions}>
                    <button className={styles.cancelBtn} onClick={handleCancel}>
                      <Square size={16} /> Cancel
                    </button>
                    <button
                      className={styles.stopBtn}
                      onClick={handleStopAndProcess}
                      disabled={!transcript && !interimTranscript}
                    >
                      <Brain size={18} /> Stop & Analyze
                    </button>
                  </div>
                </motion.div>
              )}

              {phase === 'processing' && (
                <motion.div
                  key="processing"
                  className={styles.processingPanel}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <div className={styles.processingIcon}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Brain size={36} />
                    </motion.div>
                  </div>
                  <h2 className={styles.recordTitle}>Gemini is analyzing...</h2>
                  <p className={styles.recordSubtitle}>
                    Extracting tasks, events, notes, and insights from your transcript.
                  </p>
                  <div className={styles.processingSteps}>
                    {['Parsing transcript', 'Extracting actions', 'Detecting sentiment', 'Generating summary'].map((step, i) => (
                      <motion.div
                        key={step}
                        className={styles.processingStep}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.4 }}
                      >
                        <Loader size={14} className={styles.stepLoader} />
                        <span>{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {phase === 'done' && result && (
                <motion.div
                  key="done"
                  className={styles.donePanel}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={styles.doneHeader}>
                    <div className={styles.doneCheck}>✓</div>
                    <div>
                      <h2 className={styles.doneTitle}>{result.parsed?.title || 'Meeting Analyzed'}</h2>
                      <p className={styles.doneSub}>AI analysis complete · {result.actions?.length || 0} actions created</p>
                    </div>
                  </div>

                  {result.parsed?.summary && (
                    <div className={styles.summary}>
                      <h4 className={styles.summaryLabel}>Summary</h4>
                      <p className={styles.summaryText}>{result.parsed.summary}</p>
                    </div>
                  )}

                  {result.parsed?.keyPoints?.length > 0 && (
                    <div className={styles.keyPoints}>
                      <h4 className={styles.summaryLabel}>Key Points</h4>
                      {result.parsed.keyPoints.map((kp, i) => (
                        <div key={i} className={styles.keyPoint}>
                          <span className={styles.kpDot} />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.doneActions}>
                    <button className={styles.viewMeetingBtn} onClick={() => navigate(`/meeting/${meetingId}`)}>
                      View Full Meeting
                    </button>
                    <button className={styles.newMeetingBtn} onClick={() => { setPhase('idle'); setResult(null); resetTranscript(); }}>
                      New Recording
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual transcript input */}
            {(phase === 'idle' || useManual) && phase !== 'processing' && phase !== 'done' && (
              <div className={styles.manualSection}>
                <div className={styles.divider}><span>or paste transcript manually</span></div>
                <textarea
                  className={styles.manualInput}
                  placeholder="Paste your meeting transcript here..."
                  value={manualTranscript}
                  onChange={e => setManualTranscript(e.target.value)}
                  rows={6}
                />
                {manualTranscript.trim().length > 20 && (
                  <button
                    className={styles.analyzeBtn}
                    onClick={() => { setPhase('processing'); handleStopAndProcess(); }}
                  >
                    <Brain size={16} /> Analyze with AI
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions Panel */}
          <div className={styles.actionsPanel}>
            <h3 className={styles.actionsPanelTitle}>
              <Zap size={16} /> Extracted Actions
            </h3>
            {phase !== 'done' || !result?.actions?.length ? (
              <div className={styles.actionsEmpty}>
                <Brain size={24} />
                <p>Actions will appear here after AI analysis</p>
              </div>
            ) : (
              <div className={styles.actionsList}>
                {result.actions.map((action, i) => {
                  const Icon = typeIcon[action.type] || FileText;
                  const color = typeColor[action.type] || '#6c63ff';
                  return (
                    <motion.div
                      key={action._id}
                      className={styles.actionCard}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div className={styles.actionIcon} style={{ background: `${color}18`, color }}>
                        <Icon size={14} />
                      </div>
                      <div className={styles.actionContent}>
                        <div className={styles.actionType} style={{ color }}>{action.type.replace('_', ' ')}</div>
                        <div className={styles.actionTitle}>{action.title}</div>
                        {action.description && (
                          <div className={styles.actionDesc}>{action.description}</div>
                        )}
                        <div className={styles.actionMeta}>
                          {action.priority && (
                            <span className={`${styles.priorityBadge} ${styles[`priority_${action.priority}`]}`}>
                              {action.priority}
                            </span>
                          )}
                          {action.dueDate && (
                            <span className={styles.metaItem}>
                              <Clock size={10} /> {new Date(action.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {action.assignee && (
                            <span className={styles.metaItem}>→ {action.assignee}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
