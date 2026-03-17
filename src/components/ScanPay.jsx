import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Upload, ChevronLeft, CreditCard } from 'lucide-react';
import api from '../api';
import jsQR from 'jsqr';
import PaymentStatus from './PaymentStatus';

const BRAND_CATEGORIES = {
  zomato: 'Food',
  swiggy: 'Food',
  uber: 'Transport',
  ola: 'Transport',
  amazon: 'Shopping',
  flipkart: 'Shopping',
  netflix: 'Entertainment',
  hotstar: 'Entertainment'
};

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Other'];

export default function ScanPay({ userId, onSuccess }) {
  const [step, setStep] = useState(1); // 1: scan, 2: context, 3: pay, 4: status
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' or 'failure'
  
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const requestRef = useRef(null);

  const handleScanSuccess = (decodedData) => {
    setReceiverId(decodedData);
    
    // Smart Category Detection
    const nameStr = decodedData.toLowerCase();
    const detected = Object.keys(BRAND_CATEGORIES).find(k => nameStr.includes(k));
    
    if (detected) {
      setCategory(BRAND_CATEGORIES[detected]);
      setStep(3);
    } else {
      setStep(2); // Ask for category
    }
    stopCamera();
  };

  const startCamera = async () => {
    setIsScanning(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      setError('Camera access denied. Use upload instead.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    cancelAnimationFrame(requestRef.current);
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.height = videoRef.current.videoHeight;
      canvas.width = videoRef.current.videoWidth;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) return handleScanSuccess(code.data);
    }
    if (isScanning) requestRef.current = requestAnimationFrame(tick);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadMessage('Processing...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const code = jsQR(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
        if (code) handleScanSuccess(code.data);
        else { setError('QR not found.'); setUploadMessage(''); }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePay = async () => {
    if (!amount || parseFloat(amount) <= 0) return setError('Enter valid amount');
    setError(''); setLoading(true);
    try {
      const { getUserProfile, createUserProfile, addTransaction } = await import('../firebase/db');
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
        category: category || 'Other',
        description: `Paid to ${receiverId}`,
        date: new Date().toISOString()
      });

      setPaymentStatus('success');
      setStep(4);
    } catch (err) {
      console.error(err);
      setError(err.message === 'Insufficient balance' ? 'Insufficient balance' : 'Payment failed');
      setPaymentStatus('failure');
      setStep(4);
    }
    setLoading(false);
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div style={{ minHeight: '300px' }}>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ 
              position: 'relative', background: '#000', borderRadius: '1.5rem', 
              overflow: 'hidden', aspectRatio: '1', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)'
            }}>
              {!isScanning ? (
                <div style={{ textAlign: 'center' }}>
                  <button className="btn-primary" onClick={startCamera}>
                    <Camera size={20} /> Open Scanner
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: '20%', border: '2px solid var(--primary)', borderRadius: '1rem', boxShadow: '0 0 0 1000px rgba(0,0,0,0.6)' }} />
                  <button onClick={stopCamera} style={{ position: 'absolute', bottom: '1rem', background: 'rgba(239,68,68,0.8)', border: 'none', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                </>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ marginTop: '1rem' }}>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button className="btn-secondary" onClick={() => fileInputRef.current.click()} style={{ width: '100%' }}>
                <Upload size={18} /> {uploadMessage || 'Upload QR Screenshot'}
              </button>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {['Zomato', 'Uber', 'Amazon'].map(bh => (
                <button key={bh} onClick={() => handleScanSuccess(bh)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>{bh}</button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="category" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Select Category</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {CATEGORIES.map(c => (
                <button 
                  key={c} 
                  className="btn-secondary" 
                  onClick={() => { setCategory(c); setStep(3); }}
                  style={{ background: category === c ? 'var(--primary)' : 'var(--input-bg)', color: category === c ? '#000' : 'var(--text-primary)' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="pay" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ padding: '1.25rem', background: 'var(--input-bg)', borderRadius: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PAYING TO</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 900 }}>{receiverId}</p>
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--secondary)', color: '#fff', fontWeight: 800 }}>{category}</span>
                <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}>Change</button>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                autoFocus 
                className="input-field" 
                type="number" 
                placeholder="₹ 0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                style={{ fontSize: '2rem', fontWeight: 900, textAlign: 'center', height: '80px' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                className="input-field" 
                placeholder="Add a note..." 
                value={note} 
                onChange={e => setNote(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}><ChevronLeft size={18} /> Back</button>
              <button 
                className="btn-primary" 
                onClick={handlePay} 
                disabled={!amount || loading} 
                style={{ flex: 2 }}
              >
                {loading ? 'Processing...' : <><CreditCard size={18} /> Pay Now</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <PaymentStatus 
            status={paymentStatus} 
            amount={amount} 
            receiver={receiverId} 
            onDone={() => {
              onSuccess(`Paid ₹${amount} to ${receiverId}`);
            }} 
          />
        )}
      </AnimatePresence>
      {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>{error}</p>}
    </div>
  );
}
