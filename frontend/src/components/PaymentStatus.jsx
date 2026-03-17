import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';

export default function PaymentStatus({ status, amount, receiver, onDone }) {
  useEffect(() => {
    if (status === 'success') {
      const msg = new SpeechSynthesisUtterance(`Payment of ${amount} rupees to ${receiver} was successful`);
      window.speechSynthesis.speak(msg);
    }
  }, [status, amount, receiver]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-color)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '40px',
                background: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 2.5rem',
                boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.4)',
                border: '4px solid #fff'
              }}
            >
              <Check size={64} strokeWidth={3.5} />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontWeight: 900, fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '-1px' }}
            >
              Payment Confirmed
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ marginBottom: '3.5rem' }}
            >
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.25rem' }}>₹{amount}</p>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem' }}>Sent to {receiver}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', opacity: 0.6 }}>{new Date().toLocaleString()}</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="failure"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '40px',
              background: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 2.5rem',
              boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
              border: '4px solid #fff'
            }}>
              <X size={64} strokeWidth={3.5} />
            </div>
            
            <h2 style={{ fontWeight: 900, fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
              Transaction Failed
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3.5rem', fontWeight: 700 }}>Something went wrong. Please try again.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="btn-primary"
        onClick={onDone}
        style={{ width: '220px', padding: '1.1rem' }}
      >
        Return to Dashboard
      </motion.button>
    </motion.div>
  );
}
