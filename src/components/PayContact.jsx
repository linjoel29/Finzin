import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, User, ChevronLeft } from 'lucide-react';
import api from '../api';
import PaymentStatus from './PaymentStatus';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Other'];

export default function PayContact({ userId, onSuccess }) {
  const [step, setStep] = useState(1); // 1: input, 2: category, 3: status
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePay = async () => {
    if (!phone || !amount || !category) return setError('Missing fields');
    setError(''); setLoading(true);
    try {
      const { getUserProfile, addTransaction } = await import('../firebase/db');
      const profile = await getUserProfile(userId);
      const amt = parseFloat(amount);

      if (!profile || profile.wallet < amt) {
        throw new Error('Insufficient balance');
      }

      // Update wallet balance
      const { doc, updateDoc, db } = await import('firebase/firestore');
      await updateDoc(doc(db, "users", userId), {
        wallet: profile.wallet - amt
      });

      // Record transaction
      await addTransaction(userId, {
        amount: amt,
        type: 'debit',
        category,
        description: `Sent to ${phone}`,
        date: new Date().toISOString()
      });

      setReceiverName(phone);
      setPaymentStatus('success');
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.message === 'Insufficient balance' ? 'Insufficient balance' : 'Payment failed');
      setPaymentStatus('failure');
      setStep(3);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '300px' }}>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--accent-start)', borderRadius: '1rem', border: '1px solid var(--primary)' }}>
              <p style={{ color: '#000', fontSize: '0.8rem', fontWeight: 700 }}>💡 Demo hint: 9123456789</p>
            </div>
            
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  className="input-field" 
                  type="tel" 
                  placeholder="Recipient's 10-digit phone" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  maxLength={10} 
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Amount (₹)</label>
              <input 
                className="input-field" 
                type="number" 
                placeholder="₹ 0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                style={{ fontSize: '1.5rem', fontWeight: 900 }}
              />
            </div>

            <button className="btn-primary" onClick={() => setStep(2)} disabled={phone.length < 10 || !amount}>
              Continue to Select Category
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="category" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <ChevronLeft size={16} /> Back to details
            </button>
            <h4 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>What's this for?</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {CATEGORIES.map(c => (
                <button 
                  key={c} 
                  className="btn-secondary" 
                  onClick={() => { setCategory(c); }}
                  style={{ 
                    border: category === c ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                    background: category === c ? 'var(--accent-start)' : 'var(--input-bg)',
                    color: '#000'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <button 
              className="btn-primary" 
              onClick={handlePay} 
              disabled={!category || loading} 
              style={{ width: '100%', marginTop: '2rem' }}
            >
              {loading ? 'Sending...' : <><Send size={18} /> Send ₹{amount} Now</>}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <PaymentStatus 
            status={paymentStatus} 
            amount={amount} 
            receiver={receiverName || phone} 
            onDone={() => onSuccess(`Sent ₹${amount} to ${receiverName || phone}`)} 
          />
        )}
      </AnimatePresence>
      {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>{error}</p>}
    </div>
  );
}
