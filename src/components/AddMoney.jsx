import { useState, memo } from 'react';
import api from '../api';

export default memo(function AddMoney({ userId, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [100, 200, 500, 1000];

  const handleAdd = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    setError(''); setLoading(true);
    try {
      const res = await api.post('/api/transactions', {
        user_id: userId,
        amount: parseFloat(amount),
        category: 'Income',
        note: 'Added money to wallet'
      });

      if (res.data) {
        onSuccess(`✅ Added ₹${amount} to wallet!`);
      }
    } catch (err) {
      console.error("Add money error:", err);
      const msg = err.response?.data?.message || err.message || 'Failed to add money. Please try again.';
      setError(msg);
      alert("Failed to add transaction");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'rgba(241,245,249,0.5)', fontSize: '0.82rem' }}>Select or enter amount:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {quickAmounts.map(a => (
          <button key={a} onClick={() => setAmount(String(a))} className="btn-secondary"
            style={{ padding: '0.5rem', fontSize: '0.85rem', background: amount === String(a) ? 'rgba(99,102,241,0.3)' : undefined, borderColor: amount === String(a) ? '#6366f1' : undefined }}>
            ₹{a}
          </button>
        ))}
      </div>
      <input className="input-field" type="number" placeholder="Or enter custom amount" value={amount} onChange={e => setAmount(e.target.value)} />
      {error && <p style={{ color: '#f87171', fontSize: '0.82rem' }}>{error}</p>}
      <button className="btn-primary" onClick={handleAdd} disabled={!amount || loading}>
        {loading ? '⏳...' : '💳 Add to Wallet'}
      </button>
    </div>
  );
});
