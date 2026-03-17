import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, PieChart as PieIcon, BarChart3, 
  Trash2, AlertCircle, Info, Sparkles, 
  Target, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import BudgetBuddy from '../components/BudgetBuddy';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from 'recharts';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Other'];
const CAT_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#8b5cf6', Education: '#10b981', Other: '#64748b',
};

const INSIGHT_STYLES = {
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  danger:  { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  color: '#ef4444' },
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#10b981' },
  info:    { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
  tip:     { bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' },
  sdg:    { bg: 'rgba(20, 184, 166, 0.08)', border: 'rgba(20, 184, 166, 0.2)', color: '#14b8a6' },
};

const MONTHLY_BUDGET = 5000;

export default function AIBudget() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [catTotals, setCatTotals] = useState({});
  const [budgetRefresh, setBudgetRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { getTransactions } = await import('../firebase/db');
      const txns = await getTransactions(user.uid);
      const debits = txns.filter(t => t.type === 'debit');
      setExpenses(debits);
      
      // Calculate category totals
      const totals = {};
      debits.forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
      });
      setCatTotals(totals);

      // Generate Frontend Insights (replacing backend logic)
      const newInsights = [];
      const totalSpent = debits.reduce((s, e) => s + e.amount, 0);
      
      if (debits.length === 0) {
        newInsights.push({ type: 'info', message: 'No expenses recorded yet. Start making payments to get insights!', icon: '💡' });
      } else {
        if (totalSpent > MONTHLY_BUDGET * 0.8) {
          newInsights.push({ type: 'danger', message: `⚠️ You have used ${((totalSpent/MONTHLY_BUDGET)*100).toFixed(0)}% of your monthly budget.`, icon: '⚠️' });
        } else {
          newInsights.push({ type: 'success', message: '✅ Great job! You\'re on track to finish the month within budget.', icon: '✅' });
        }
        
        Object.entries(totals).forEach(([cat, amt]) => {
          if (amt > MONTHLY_BUDGET * 0.3) {
            newInsights.push({ type: 'warning', message: `You spent a lot on ${cat} this month. Consider reducing it.`, icon: '⚠️' });
          }
        });
      }
      setInsights(newInsights);

    } catch (e) {
      console.error('Failed to fetch AI Budget data:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (id) => {
    try {
      const { db } = await import('../firebase/config');
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, "users", user.uid, "transactions", id));
      fetchAll();
      setBudgetRefresh(v => v + 1);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const pieData = useMemo(() => Object.entries(catTotals).map(([name, value]) => ({ name, value })), [catTotals]);
  const barData = useMemo(() => Object.entries(catTotals).map(([name, value]) => ({ name, amount: value })), [catTotals]);
  const totalSpent = useMemo(() => Object.values(catTotals).reduce((a, b) => a + b, 0), [catTotals]);

  const dailyData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, amount: 0 }));
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const day = d.getDate();
        if (days[day - 1]) days[day - 1].amount += e.amount;
      }
    });
    return days;
  }, [expenses]);

  const topCategory = useMemo(() => (
    catTotals && Object.keys(catTotals).length > 0
      ? Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0][0]
      : 'Other'
  ), [catTotals]);

  const spentThisWeek = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => (now - new Date(e.date)) / (1000 * 60 * 60 * 24) <= 7)
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const remainingBalance = Math.max(MONTHLY_BUDGET - totalSpent, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>Analyzing your finances...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '520px', margin: '0 auto', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Visual <span style={{ color: 'var(--secondary)' }}>Analytics</span> <Sparkles size={24} className="text-glow" />
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Deep dive into your financial habits</p>
      </div>

      <BudgetBuddy
        user={user}
        monthlyBudget={MONTHLY_BUDGET}
        spentThisWeek={spentThisWeek}
        remainingBalance={remainingBalance}
        topCategory={topCategory}
        triggerRefresh={budgetRefresh}
      />

      {/* Monthly Spending Trend */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ padding: '1.5rem', marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--secondary)" /> Spending Velocity
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Daily for {new Date().toLocaleDateString('en-IN', { month: 'long' })}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹{totalSpent}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: 800 }}>MONTHLY TOTAL</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="day" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              cursor={{ stroke: 'var(--secondary)', strokeWidth: 2 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ background: '#fff', border: '2px solid var(--secondary)', padding: '0.6rem 1rem', borderRadius: '12px', boxShadow: 'var(--box-shadow)' }}>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Day {payload[0].payload.day}</p>
                      <p style={{ fontSize: '1.1rem', color: '#000', fontWeight: 900 }}>₹{payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="amount" stroke="var(--secondary)" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 7, fill: 'var(--secondary)', stroke: '#fff', strokeWidth: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Categories Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={16} color="#8b5cf6" /> Portfolio
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                {pieData.map(({ name }) => <Cell key={name} fill={CAT_COLORS[name] || '#64748b'} stroke="none" />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v}`, '']} contentStyle={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} color="var(--error)" /> Limit
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', height: '120px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '85px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="85" height="85" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" strokeWidth="12" />
                <circle cx="50" cy="50" r="42" fill="none" 
                  stroke={totalSpent / MONTHLY_BUDGET > 0.8 ? 'var(--error)' : 'var(--secondary)'} 
                  strokeWidth="12" 
                  strokeDasharray={`${(Math.min(totalSpent / MONTHLY_BUDGET, 1)) * 264} 264`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                />
              </svg>
              <span style={{ position: 'absolute', fontWeight: 900, fontSize: '1.2rem' }}>{Math.min((totalSpent / MONTHLY_BUDGET) * 100, 100).toFixed(0)}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--success)" /> Category Intensity
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} layout="vertical" margin={{ left: -10, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--input-bg)', radius: 10 }} contentStyle={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 700 }} />
            <Bar dataKey="amount" radius={[0, 10, 10, 0]} barSize={24}>
              {barData.map(({ name }) => <Cell key={name} fill={CAT_COLORS[name] || '#64748b'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '1.25rem', paddingLeft: '0.25rem' }}>AI Smart Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {insights.map((ins, i) => {
              const style = INSIGHT_STYLES[ins.type] || INSIGHT_STYLES.info;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="glass-card"
                  style={{ 
                    padding: '1.25rem',
                    borderLeft: `6px solid ${style.color}`,
                    display: 'flex', gap: '1rem', alignItems: 'flex-start' 
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: style.bg, color: style.color, flexShrink: 0
                  }}>
                    {ins.icon === '⚠️' ? <AlertCircle size={20} /> : 
                     ins.icon === '💡' ? <Sparkles size={20} /> : 
                     ins.icon === '✅' ? <TrendingUp size={20} /> : <Info size={20} />}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 600 }}>{ins.message}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense History */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Transaction Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><TrendingUp size={24} /></div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>No activity logged yet</p>
            </div>
          ) : (
            expenses.slice(0, 15).map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CAT_COLORS[e.category] || '#64748b' }}>
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800 }}>{e.description || e.category}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{e.category} • {new Date(e.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--error)' }}>-₹{e.amount}</span>
                  <button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
