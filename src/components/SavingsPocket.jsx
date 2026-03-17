import { useState } from 'react';
import api from '../api';

export default function SavingsPocket({ userId, wallet, savings, onSuccess }) {
  const [mode, setMode] = useState('move'); // 'move' | 'withdraw'
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async () => {
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'move' ? '/api/wallet/move-to-savings' : '/api/wallet/withdraw-savings';
      await api.post(endpoint, { user_id: userId, amount: parseFloat(amount) });
      const msg = mode === 'move' ? `🐷 Moved ₹${amount} to Savings!` : `💰 Withdrawn ₹${amount} from Savings!`;
      onSuccess(msg);
    } catch (err) {
      setError(err.response?.data?.detail || 'Action failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Balance display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.15)', borderRadius: '0.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.55)', marginBottom: '0.25rem' }}>Wallet</p>
          <p style={{ fontWeight: 800 }}>₹{wallet.toFixed(2)}</p>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.15)', borderRadius: '0.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.55)', marginBottom: '0.25rem' }}>Savings 🐷</p>
          <p style={{ fontWeight: 800 }}>₹{savings.toFixed(2)}</p>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem', padding: '4px' }}>
        {[['move', '↗️ Move to Savings'], ['withdraw', '↙️ Withdraw']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setError(''); setAmount(''); }}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s',
              background: mode === m ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
              color: mode === m ? 'white' : 'rgba(241,245,249,0.5)', }}>
            {label}
          </button>
        ))}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'rgba(241,245,249,0.7)' }}>Amount (₹)</label>
        <input className="input-field" type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '0.82rem' }}>{error}</p>}
      <button className="btn-primary" onClick={handleAction} disabled={!amount || loading}>
        {loading ? '⏳...' : mode === 'move' ? '💰 Move to Savings' : '🏦 Withdraw to Wallet'}
      </button>
    </div>
  );
}
