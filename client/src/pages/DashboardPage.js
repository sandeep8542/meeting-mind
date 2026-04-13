import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, CheckSquare, Calendar, FileText, Clock, Plus, Trash2, ArrowRight, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../components/ui/Sidebar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

const sentimentColor = { positive: '#43e97b', neutral: '#6c63ff', negative: '#ff4d6d' };
const statusColors = { completed: '#43e97b', processing: '#f7b731', recording: '#6c63ff', failed: '#ff4d6d' };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, meetingsRes] = await Promise.all([
          api.get('/meetings/stats'),
          api.get('/meetings?limit=8')
        ]);
        setStats(statsRes.data.stats);
        setMeetings(meetingsRes.data.meetings);
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deleteMeeting = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this meeting?')) return;
    try {
      await api.delete(`/meetings/${id}`);
      setMeetings(prev => prev.filter(m => m._id !== id));
      toast.success('Meeting deleted.');
    } catch {
      toast.error('Failed to delete meeting.');
    }
  };

  const formatDuration = (secs) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const statCards = stats ? [
    { icon: Mic, label: 'Total Meetings', value: stats.totalMeetings, color: '#6c63ff' },
    { icon: CheckSquare, label: 'Tasks Created', value: stats.totalActions, color: '#43e97b' },
    { icon: TrendingUp, label: 'Tasks Done', value: stats.completedTasks, color: '#f7b731' },
    { icon: Calendar, label: 'Calendar Events', value: stats.calendarEvents, color: '#ff6584' },
  ] : [];

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className={styles.pageSubtitle}>Here's what's happening with your meetings</p>
          </div>
          <button className={styles.newMeetingBtn} onClick={() => navigate('/meeting/new')}>
            <Plus size={16} />
            New Meeting
          </button>
        </div>

        {/* Stat Cards */}
        <div className={styles.statsGrid}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.statSkeleton} />)
            : statCards.map((card, i) => (
              <motion.div
                key={card.label}
                className={styles.statCard}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={styles.statIcon} style={{ background: `${card.color}18`, color: card.color }}>
                  <card.icon size={18} />
                </div>
                <div className={styles.statValue}>{card.value}</div>
                <div className={styles.statLabel}>{card.label}</div>
              </motion.div>
            ))
          }
        </div>

        {/* Meetings list */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Meetings</h2>
            <button className={styles.seeAllBtn} onClick={() => navigate('/meeting/new')}>
              Start new <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className={styles.meetingsList}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.meetingSkeleton} />
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><Mic size={28} /></div>
              <h3 className={styles.emptyTitle}>No meetings yet</h3>
              <p className={styles.emptyText}>Record your first meeting and let AI turn it into structured actions.</p>
              <button className={styles.emptyBtn} onClick={() => navigate('/meeting/new')}>
                <Plus size={15} /> Start Recording
              </button>
            </div>
          ) : (
            <div className={styles.meetingsList}>
              {meetings.map((meeting, i) => (
                <motion.div
                  key={meeting._id}
                  className={styles.meetingCard}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => navigate(`/meeting/${meeting._id}`)}
                >
                  <div className={styles.meetingLeft}>
                    <div
                      className={styles.meetingStatus}
                      style={{ background: `${statusColors[meeting.status] || '#6c63ff'}20`, color: statusColors[meeting.status] || '#6c63ff' }}
                    >
                      {meeting.status}
                    </div>
                    <div>
                      <h3 className={styles.meetingTitle}>{meeting.title}</h3>
                      <div className={styles.meetingMeta}>
                        <span><Clock size={12} /> {formatDuration(meeting.duration)}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}</span>
                        {meeting.sentiment && (
                          <>
                            <span>·</span>
                            <span style={{ color: sentimentColor[meeting.sentiment] || 'inherit' }}>
                              {meeting.sentiment}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.meetingRight}>
                    {meeting.actions?.length > 0 && (
                      <span className={styles.actionCount}>
                        <CheckSquare size={12} /> {meeting.actions.length} actions
                      </span>
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={e => deleteMeeting(meeting._id, e)}
                    >
                      <Trash2 size={14} />
                    </button>
                    <ArrowRight size={14} className={styles.arrowIcon} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
