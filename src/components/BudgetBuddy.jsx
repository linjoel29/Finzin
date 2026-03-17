import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, AlertCircle, Bot, Zap } from 'lucide-react';
import api from '../api';

const NOTIF_STYLES = {
  danger: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' },
  warning: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' },
  success: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)' },
};

export default function BudgetBuddy({ user, monthlyBudget = 5000, spentThisWeek = 0, remainingBalance = 5000, topCategory = 'Food', triggerRefresh }) {
  const [advice, setAdvice] = useState('');
  const [displayedAdvice, setDisplayedAdvice] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [budgetUsedPct, setBudgetUsedPct] = useState(0);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [askMode, setAskMode] = useState(false);
  const typingRef = useRef(null);

  const fetchAdvice = useCallback(async (customQuestion = '') => {
    if (!user) return;
    setLoading(true);

    // Frontend Rule-based Logic (Mirroring backend)
    const usedPct = ((monthlyBudget - remainingBalance) / monthlyBudget) * 100;
    setBudgetUsedPct(Math.round(usedPct * 10) / 10);

    const newNotifications = [];
    if (usedPct >= 70) {
      newNotifications.push({ type: 'warning', message: `⚠️ You have used ${Math.round(usedPct)}% of your monthly budget.` });
    }
    if (remainingBalance < 500) {
      newNotifications.push({ type: 'danger', message: `🔴 Low balance! Only ₹${Math.round(remainingBalance)} remaining this month.` });
    }
    const weeklyPct = (spentThisWeek / monthlyBudget) * 100;
    if (weeklyPct >= 40) {
      newNotifications.push({ type: 'warning', message: `📊 You've spent ${Math.round(weeklyPct)}% of your budget this week (mostly on ${topCategory}).` });
    }
    setNotifications(newNotifications);

    try {
      const res = await api.post('/api/ai-budget-insight', {
        monthly_budget: monthlyBudget,
        spent_this_week: spentThisWeek,
        remaining_balance: remainingBalance,
        top_category: topCategory,
        user_name: user.name || 'Student',
        custom_question: customQuestion,
      });
      setAdvice(res.data.advice);
      // If backend returns more sophisticated notifications, we can merge or prefer them
      if (res.data.notifications?.length) {
        setNotifications(res.data.notifications);
      }
    } catch (e) {
      console.error("AI Insights Error:", e);
      setAdvice(`Hey ${user?.name || 'there'} 👋 Based on your spend of ₹${spentThisWeek} this week, try to stay mindful of your remaining ₹${remainingBalance} budget! 🎯`);
    }
    setLoading(false);
  }, [user, monthlyBudget, spentThisWeek, remainingBalance, topCategory]);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice, triggerRefresh]);

  useEffect(() => {
    if (advice) {
      setDisplayedAdvice('');
      let i = 0;
      clearInterval(typingRef.current);
      typingRef.current = setInterval(() => {
        setDisplayedAdvice((prev) => prev + advice[i]);
        i++;
        if (i >= advice.length) clearInterval(typingRef.current);
      }, 12);
    }
    return () => clearInterval(typingRef.current);
  }, [advice]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    await fetchAdvice(question.trim());
    setQuestion('');
    setAskMode(false);
  };

  const budgetColor = useMemo(() => {
    if (budgetUsedPct > 85) return 'var(--error)';
    if (budgetUsedPct > 60) return 'var(--warning)';
    return 'var(--success)';
  }, [budgetUsedPct]);

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Smart Notifications */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', overflow: 'hidden' }}
          >
            {notifications.slice(0, 2).map((n, i) => {
              const style = NOTIF_STYLES[n.type] || NOTIF_STYLES.warning;
              return (
                <div key={i} className="glass-card" style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  borderLeft: `5px solid ${style.color}`,
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <AlertCircle size={18} color={style.color} />
                  {n.message}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main AI Card */}
      <motion.div 
        layout
        className="glass-card"
        style={{ 
          padding: '1.75rem', 
          border: '1px solid var(--secondary)',
          background: 'var(--card-bg)',
          boxShadow: 'var(--box-shadow)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '18px',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
            color: '#000', flexShrink: 0
          }}>
            <Bot size={28} strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>Budget Buddy</h4>
              {budgetUsedPct > 0 && (
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  style={{ 
                    fontSize: '0.75rem', fontWeight: 900, padding: '5px 12px', borderRadius: '50px',
                    background: `${budgetColor}15`,
                    color: budgetColor,
                    border: `1px solid ${budgetColor}30`
                  }}>
                  {budgetUsedPct}% UTILIZED
                </motion.span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={12} color="var(--success)" fill="var(--success)" />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>AI Active & Analyzing</p>
            </div>
          </div>
        </div>

        {/* Chat Bubble */}
        <div style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '1.5rem',
          borderTopLeftRadius: '0.4rem',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          minHeight: '90px',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {loading ? (
            <div style={{ display: 'flex', gap: '8px', padding: '10px 0' }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: d }}
                  style={{ width: '10px', height: '10px', background: 'var(--secondary)', borderRadius: '50%' }}
                />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 600 }}>
              {displayedAdvice}
              {!displayedAdvice && <span style={{ opacity: 0.2 }}>Initializing insights...</span>}
            </p>
          )}
        </div>

        {/* Interaction Bar */}
        <AnimatePresence mode="wait">
          {!askMode ? (
            <motion.button
              key="ask-btn"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAskMode(true)}
              style={{
                width: '100%', padding: '1.1rem',
                background: 'var(--accent-start)',
                border: '1.5px solid var(--primary)',
                borderRadius: '1.25rem', color: '#000',
                fontSize: '0.9rem', fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Send size={18} /> Ask your Finance Buddy
            </motion.button>
          ) : (
            <motion.form 
              key="ask-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAsk} 
              style={{ display: 'flex', gap: '0.75rem' }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  autoFocus
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="e.g. How to save on rent?"
                  className="input-field"
                  style={{ paddingRight: '3rem' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
                style={{ width: '55px', height: '55px', padding: 0, borderRadius: '18px', flexShrink: 0 }}
              >
                <Send size={22} />
              </button>
              <button 
                type="button" 
                onClick={() => setAskMode(false)}
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '18px', width: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={24} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
