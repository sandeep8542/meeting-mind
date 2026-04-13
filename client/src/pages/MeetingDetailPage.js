import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckSquare, Calendar, FileText, Clock, Zap, Trash2, Tag } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../components/ui/Sidebar';
import api from '../utils/api';
import styles from './MeetingDetailPage.module.css';

const typeIcon = { task: CheckSquare, calendar_event: Calendar, meeting_note: FileText, reminder: Clock, decision: Zap };
const typeColor = { task: '#6c63ff', calendar_event: '#43e97b', meeting_note: '#f7b731', reminder: '#4ecdc4', decision: '#ff6584' };
const sentimentEmoji = { positive: '😊', neutral: '😐', negative: '😟' };

export default function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get(`/meetings/${id}`)
      .then(res => setMeeting(res.data.meeting))
      .catch(() => { toast.error('Meeting not found.'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleActionStatus = async (action) => {
    const newStatus = action.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.put(`/actions/${action._id}`, { status: newStatus });
      setMeeting(prev => ({
        ...prev,
        actions: prev.actions.map(a => a._id === action._id ? { ...a, status: newStatus } : a)
      }));
    } catch { toast.error('Failed to update action.'); }
  };

  const deleteAction = async (actionId) => {
    try {
      await api.delete(`/actions/${actionId}`);
      setMeeting(prev => ({
        ...prev,
        actions: prev.actions.filter(a => a._id !== actionId)
      }));
      toast.success('Action deleted.');
    } catch { toast.error('Failed to delete action.'); }
  };

  if (loading) return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}><div className={styles.loadingBar} /></main>
    </div>
  );

  if (!meeting) return null;

  const tasks = meeting.actions?.filter(a => a.type === 'task') || [];
  const events = meeting.actions?.filter(a => a.type === 'calendar_event') || [];
  const notes = meeting.actions?.filter(a => a.type === 'meeting_note') || [];
  const others = meeting.actions?.filter(a => !['task', 'calendar_event', 'meeting_note'].includes(a.type)) || [];

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} /> Back
          </button>

          <div className={styles.headerInfo}>
            <h1 className={styles.meetingTitle}>{meeting.title || "Untitled Meeting"}</h1>

            <div className={styles.meetingMeta}>
              {meeting.createdAt && !isNaN(new Date(meeting.createdAt)) && (
                <span>{format(new Date(meeting.createdAt), 'MMMM d, yyyy · h:mm a')}</span>
              )}

              {meeting.duration > 0 && (
                <span>· {Math.floor(meeting.duration / 60)}m {meeting.duration % 60}s</span>
              )}

              {meeting.sentiment && (
                <span>· {sentimentEmoji[meeting.sentiment]} {meeting.sentiment}</span>
              )}

              {meeting.participants?.length > 0 && (
                <span>· 👥 {meeting.participants.join(', ')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {meeting.tags?.length > 0 && (
          <div className={styles.tags}>
            <Tag size={12} />
            {meeting.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          {['overview', 'actions', 'transcript'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'actions' && meeting.actions?.length > 0 && (
                <span className={styles.tabBadge}>{meeting.actions.length}</span>
              )}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className={styles.overviewGrid}>
              {meeting.summary && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.cardTitle}>Summary</h3>
                  <p className={styles.cardText}>{meeting.summary}</p>
                </div>
              )}

              {meeting.keyPoints?.length > 0 && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.cardTitle}>Key Points</h3>
                  {meeting.keyPoints.map((kp, i) => (
                    <div key={i} className={styles.keyPoint}>
                      <span className={styles.kpNum}>{i + 1}</span>
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.statsRow}>
                {[
                  { label: 'Tasks', value: tasks.length, color: '#6c63ff' },
                  { label: 'Events', value: events.length, color: '#43e97b' },
                  { label: 'Notes', value: notes.length, color: '#f7b731' },
                  { label: 'Decisions', value: others.length, color: '#ff6584' },
                ].map(s => (
                  <div key={s.label} className={styles.miniStat} style={{ borderColor: `${s.color}30` }}>
                    <div className={styles.miniStatValue} style={{ color: s.color }}>{s.value}</div>
                    <div className={styles.miniStatLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          {activeTab === 'actions' && (
            <div className={styles.actionsGrid}>
              {meeting.actions?.length === 0 && (
                <div className={styles.empty}>No actions extracted from this meeting.</div>
              )}

              {meeting.actions
              ?.filter(a => a?._id)
              .map((action, i) => {
                const safeType = action?.type || "task";
                const Icon = typeIcon[safeType] || FileText;
                const color = typeColor[safeType] || '#6c63ff';
                const isCompleted = action.status === 'completed';

                return (
                  <motion.div
                    key={action._id}
                    className={`${styles.actionCard} ${isCompleted ? styles.actionCompleted : ''}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className={styles.actionHeader}>
                      <div className={styles.actionType} style={{ background: `${color}15`, color }}>
                        <Icon size={13} />
                        <span>{safeType.replace('_', ' ')}</span>
                      </div>

                      <div className={styles.actionHeaderRight}>
                        {safeType === 'task' && (
                          <button
                            className={`${styles.checkBtn} ${isCompleted ? styles.checkBtnDone : ''}`}
                            onClick={() => {
  if (!action?._id) {
    console.log("Invalid action:", action);
    return;
  }
  toggleActionStatus(action);
}}
                          >
                            {isCompleted ? '✓ Done' : 'Mark done'}
                          </button>
                        )}

                        <button className={styles.deleteActionBtn} onClick={() => {
  if (!action?._id) {
    console.log("Invalid delete:", action);
    return;
  }
  deleteAction(action._id);
}}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h4 className={styles.actionTitle}>{action.title || "Untitled"}</h4>

                    {action.description && (
                      <p className={styles.actionDesc}>{action.description}</p>
                    )}

                    <div className={styles.actionFooter}>
                      {action.priority && (
                        <span className={`${styles.priorityBadge} ${styles[`p_${action.priority}`]}`}>
                          {action.priority}
                        </span>
                      )}

                      {action.dueDate && !isNaN(new Date(action.dueDate)) && (
                        <span className={styles.metaChip}>
                          <Clock size={11} /> {format(new Date(action.dueDate), 'MMM d')}
                        </span>
                      )}

                      {action.assignee && (
                        <span className={styles.metaChip}>→ {action.assignee}</span>
                      )}

                      {action.startTime && !isNaN(new Date(action.startTime)) && (
                        <span className={styles.metaChip}>
                          <Calendar size={11} /> {format(new Date(action.startTime), 'MMM d, h:mm a')}
                        </span>
                      )}

                      {action.location && (
                        <span className={styles.metaChip}>📍 {action.location}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className={styles.transcriptBox}>
              {meeting.transcript ? (
                <p className={styles.transcriptText}>{meeting.transcript}</p>
              ) : (
                <p className={styles.empty}>No transcript available.</p>
              )}
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}