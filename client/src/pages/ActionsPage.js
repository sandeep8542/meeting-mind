import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Calendar, FileText, Clock, Zap, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../components/ui/Sidebar';
import api from '../utils/api';
import styles from './ActionsPage.module.css';

const typeIcon = { task: CheckSquare, calendar_event: Calendar, meeting_note: FileText, reminder: Clock, decision: Zap };
const typeColor = { task: '#6c63ff', calendar_event: '#43e97b', meeting_note: '#f7b731', reminder: '#4ecdc4', decision: '#ff6584' };

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Tasks', value: 'task' },
  { label: 'Calendar', value: 'calendar_event' },
  { label: 'Notes', value: 'meeting_note' },
  { label: 'Decisions', value: 'decision' },
  { label: 'Reminders', value: 'reminder' },
];

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '50');
      const res = await api.get(`/actions?${params.toString()}`);
      setActions(res.data.actions);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error('Failed to load actions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActions(); }, [typeFilter, statusFilter]);

  const toggleStatus = async (action) => {
    const newStatus = action.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.put(`/actions/${action._id}`, { status: newStatus });
      setActions(prev => prev.map(a => a._id === action._id ? { ...a, status: newStatus } : a));
    } catch { toast.error('Update failed.'); }
  };

  const deleteAction = async (id) => {
    try {
      await api.delete(`/actions/${id}`);
      setActions(prev => prev.filter(a => a._id !== id));
      toast.success('Action deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const completedCount = actions.filter(a => a.status === 'completed').length;
  const progress = actions.length ? Math.round((completedCount / actions.length) * 100) : 0;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Actions</h1>
            <p className={styles.pageSubtitle}>
              {total} total · {completedCount} completed
            </p>
          </div>
          {actions.length > 0 && (
            <div className={styles.progressWrap}>
              <div className={styles.progressLabel}>{progress}% complete</div>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <Filter size={14} className={styles.filterIcon} />
            <div className={styles.filterBtns}>
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  className={`${styles.filterBtn} ${typeFilter === f.value ? styles.filterBtnActive : ''}`}
                  onClick={() => setTypeFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterBtns}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                className={`${styles.filterBtn} ${statusFilter === f.value ? styles.filterBtnActive : ''}`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions List */}
        {loading ? (
          <div className={styles.skeletonList}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : actions.length === 0 ? (
          <div className={styles.empty}>
            <CheckSquare size={32} />
            <h3>No actions found</h3>
            <p>Record a meeting to automatically generate tasks, events, and notes.</p>
          </div>
        ) : (
          <div className={styles.actionsList}>
            {actions.map((action, i) => {
              const Icon = typeIcon[action.type] || FileText;
              const color = typeColor[action.type] || '#6c63ff';
              const isCompleted = action.status === 'completed';

              return (
                <motion.div
                  key={action._id}
                  className={`${styles.actionRow} ${isCompleted ? styles.actionRowDone : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  layout
                >
                  {/* Type indicator */}
                  <div className={styles.typeCol}>
                    <div className={styles.typeIcon} style={{ background: `${color}18`, color }}>
                      <Icon size={14} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={styles.contentCol}>
                    <div className={styles.actionTitle}>{action.title}</div>
                    {action.description && (
                      <div className={styles.actionDesc}>{action.description}</div>
                    )}
                    <div className={styles.actionMeta}>
                      <span className={styles.typeLabel} style={{ color }}>{action.type.replace('_', ' ')}</span>
                      {action.meeting?.title && (
                        <span className={styles.metaItem}>from "{action.meeting.title}"</span>
                      )}
                      {action.dueDate && (
                        <span className={styles.metaItem}>
                          <Clock size={10} /> {format(new Date(action.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      {action.assignee && (
                        <span className={styles.metaItem}>→ {action.assignee}</span>
                      )}
                      {action.startTime && (
                        <span className={styles.metaItem}>
                          <Calendar size={10} /> {format(new Date(action.startTime), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right controls */}
                  <div className={styles.controlsCol}>
                    {action.priority && (
                      <span className={`${styles.priorityBadge} ${styles[`p_${action.priority}`]}`}>
                        {action.priority}
                      </span>
                    )}
                    {action.type === 'task' && (
                      <button
                        className={`${styles.doneBtn} ${isCompleted ? styles.doneBtnActive : ''}`}
                        onClick={() => toggleStatus(action)}
                      >
                        {isCompleted ? '✓' : '○'}
                      </button>
                    )}
                    <button className={styles.deleteBtn} onClick={() => deleteAction(action._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
