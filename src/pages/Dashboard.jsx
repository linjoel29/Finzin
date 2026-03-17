import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, QrCode, Smartphone, Plus, PiggyBank, LogOut, 
  TrendingDown, ArrowUpRight, ArrowDownLeft,
  X, Info, Wallet, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import ScanPay from '../components/ScanPay';
import PayContact from '../components/PayContact';
import AddMoney from '../components/AddMoney';
import SavingsPocket from '../components/SavingsPocket';
import BudgetBuddy from '../components/BudgetBuddy';

const MONTHLY_BUDGET = 5000;

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="modal-box glass" 
        onClick={e => e.stopPropagation()}
        style={{ 
          background: 'var(--card-bg)', 
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { transactions, fetchWallet, wallet, savings, setWallet, setSavings, setTransactions } = useWallet();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [budgetRefresh, setBudgetRefresh] = useState(0);

  const { spentThisWeek, topCategory } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekDebits = transactions.filter(t => t.type === 'debit' && new Date(t.date) >= weekAgo);
    const total = weekDebits.reduce((s, t) => s + t.amount, 0);

    const catMap = { Food: 0, Transport: 0, Shopping: 0, Entertainment: 0, Education: 0, Other: 0 };
    weekDebits.forEach(t => {
      const cat = t.category || 'Other';
      if (catMap[cat] !== undefined) catMap[cat] += t.amount;
      else catMap.Other += t.amount;
    });
    const top = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    return {
      spentThisWeek: total,
      topCategory: (top && top[1] > 0) ? top[0] : 'Other'
    };
  }, [transactions]);

  useEffect(() => { if (user) fetchWallet(user.uid); }, [user, fetchWallet]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshWallet = async () => {
    try {
      if (user) {
        await fetchWallet(user.uid);
        setBudgetRefresh(v => v + 1);
      }
    } catch (e) {
      console.error('Wallet refresh failed', e);
    }
  };

  const quickActions = [
    { icon: <QrCode size={26} />, label: 'Scan & Pay', key: 'scan', color: 'var(--secondary)' },
    { icon: <Smartphone size={26} />, label: 'Pay Phone', key: 'pay', color: '#8b5cf6' },
    { icon: <Plus size={26} />, label: 'Add Money', key: 'addmoney', color: 'var(--success)' },
    { icon: <PiggyBank size={26} />, label: 'Savings', key: 'savings', color: 'var(--warning)' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '520px', margin: '0 auto', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#000', fontWeight: 900, fontSize: '1.25rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
          }}>
            {user?.name?.[0]}
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Hello there,</p>
            <h2 style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>{user?.name}</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ 
              background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
              borderRadius: '14px', padding: '0.7rem', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative' 
            }}
          >
            <Bell size={22} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', background: 'var(--error)', borderRadius: '50%', border: '2px solid var(--card-bg)' }} />
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '0.7rem', color: 'var(--error)', cursor: 'pointer' }}>
            <LogOut size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNotifs && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
          >
            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={18} /> Daily Insights</h4>
                <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ background: 'var(--accent-start)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--primary)', display: 'flex', gap: '0.75rem' }}>
                <Info size={18} color="#000" style={{ marginTop: '2px' }} />
                <p style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>
                  You've managed your {topCategory} expenses better than 80% of students this week! 🎯
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Luxe Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        style={{
          background: 'linear-gradient(135deg, #000 0%, #1e293b 100%)',
          borderRadius: '2.5rem', padding: '2.5rem', marginBottom: '2rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Wallet size={18} /> ACCOUNT BALANCE
            </p>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>₹{wallet.toFixed(2)}</h1>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.6rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800, marginBottom: '2px' }}>POCKET</p>
            <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>₹{savings.toFixed(2)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: '45px', height: '28px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px' }} />
            <Sparkles size={24} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '3px', fontWeight: 800 }}>•••• {user?.id?.slice(-4) || '2026'}</p>
        </div>
      </motion.div>

      <BudgetBuddy
        user={user}
        monthlyBudget={MONTHLY_BUDGET}
        spentThisWeek={spentThisWeek}
        remainingBalance={wallet}
        topCategory={topCategory}
        triggerRefresh={budgetRefresh}
      />

      {/* Quick Actions Grid */}
      <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {quickActions.map(({ icon, label, key, color }) => (
          <motion.button 
            key={key} 
            whileTap={{ scale: 0.9 }}
            whileHover={{ y: -8, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            onClick={() => setModal(key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
              background: 'var(--card-bg)', border: '1px solid var(--border-color)',
              borderRadius: '1.75rem', padding: '1.5rem 0.5rem', cursor: 'pointer', color: 'var(--text-primary)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div style={{ color, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>{icon}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>Activity Feed</h3>
          <button onClick={() => navigate('/budget')} style={{ background: 'var(--accent-start)', border: '1px solid var(--primary)', color: '#000', padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>View All</button>
        </div>
        
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>
            <Wallet size={40} style={{ marginBottom: '1rem' }} />
            <p style={{ fontWeight: 700 }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {transactions.slice(0, 5).map(t => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={t.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: t.type === 'credit' ? 'var(--accent-start)' : 'rgba(239,68,68,0.05)', 
                    color: t.type === 'credit' ? 'var(--success)' : 'var(--error)',
                    border: `1px solid ${t.type === 'credit' ? 'var(--primary)' : 'rgba(239,68,68,0.1)'}`
                  }}>
                    {t.type === 'credit' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800 }}>{t.description || 'Transaction'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {t.category || 'Other'}
                    </p>
                  </div>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: t.type === 'credit' ? 'var(--success)' : 'var(--text-primary)' }}>
                  {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setModal('scan')}
        style={{
          position: 'fixed', bottom: '110px', right: '1.5rem',
          width: '65px', height: '65px', borderRadius: '22px',
          background: 'var(--primary)',
          border: 'none', color: '#000', fontSize: '1.5rem', cursor: 'pointer',
          boxShadow: '0 15px 35px rgba(255, 215, 0, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90
        }}
      >
        <QrCode size={32} strokeWidth={3} />
      </motion.button>

      <AnimatePresence>
        {modal === 'scan' && <Modal title="Scan & Pay" onClose={() => setModal(null)}><ScanPay userId={user.uid} onSuccess={(msg) => { refreshWallet(); setModal(null); showToast(msg); }} /></Modal>}
        {modal === 'pay' && <Modal title="Pay Contact" onClose={() => setModal(null)}><PayContact userId={user.uid} onSuccess={(msg) => { refreshWallet(); setModal(null); showToast(msg); }} /></Modal>}
        {modal === 'addmoney' && <Modal title="Add Money" onClose={() => setModal(null)}><AddMoney userId={user.uid} onSuccess={(msg) => { refreshWallet(); setModal(null); showToast(msg); }} /></Modal>}
        {modal === 'savings' && <Modal title="Savings Pocket" onClose={() => setModal(null)}><SavingsPocket userId={user.uid} wallet={wallet} savings={savings} onSuccess={(msg) => { refreshWallet(); setModal(null); showToast(msg); }} /></Modal>}
        {toast && (
          <motion.div 
            initial={{ y: 20, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 20, opacity: 0, x: '-50%' }}
            className="text-glow"
            style={{
              position: 'fixed', bottom: '110px', left: '50%',
              background: toast.type === 'success' ? 'var(--success)' : 'var(--error)',
              color: 'white', padding: '1rem 2.5rem', borderRadius: '1.25rem',
              fontWeight: 900, fontSize: '0.95rem', zIndex: 200,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
