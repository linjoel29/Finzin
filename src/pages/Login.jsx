import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Wallet2, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../firebase/auth';
import { createUserProfile } from '../firebase/db';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login clicked");
    setError(''); 

    // Validation
    if (!form.email || !form.password) {
      return setError('Please fill all fields');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (!isLogin) {
      if (!form.name || !form.phone) return setError('Please fill all fields');
      if (form.phone.length < 10) return setError('Enter a valid phone number');
    }

    setLoading(true);
    try {
      if (isLogin) {
        const userCred = await loginUser(form.email, form.password);
        login(userCred.user);
        navigate('/dashboard');
      } else {
        const userCred = await registerUser(form.email, form.password);
        await createUserProfile(userCred.user.uid, {
          name: form.name,
          email: form.email,
          phone: form.phone
        });
        
        console.log("Registration successful for:", userCred.user.email);
        alert("Registration successful! Please login to continue.");
        setIsLogin(true); 
        setForm({ ...form, password: '' });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const message = err.message || "Something went wrong. Please try again.";
      setError(message);
      if (!isLogin) alert(message);    
    } finally {
      // 🔥 ALWAYS stop loading
      setLoading(false);
      console.log("Loading state cleared");
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      background: 'var(--bg-color)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Dynamic Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--accent-start) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0.4 }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '440px', zIndex: 1 }}
      >
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              width: '85px', height: '85px', borderRadius: '28px', margin: '0 auto 1.5rem',
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 40px -10px rgba(255, 215, 0, 0.5)',
              border: '2px solid #fff'
            }}>
            <Wallet2 size={45} color="#000" strokeWidth={2.5} />
          </motion.div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-2.5px', color: 'var(--text-primary)' }}>
            Finzin
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Elevate Your Student Life <Sparkles size={18} color="var(--primary)" />
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--box-shadow)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', background: 'var(--input-bg)', borderRadius: '18px', padding: '6px' }}>
            {['Login', 'Register'].map((tab, i) => {
              const active = isLogin ? i === 0 : i === 1;
              return (
                <button 
                  key={tab} 
                  onClick={() => { setIsLogin(i === 0); setError(''); }}
                  style={{
                    flex: 1, padding: '0.85rem', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#000' : 'var(--text-secondary)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: active ? '0 8px 15px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AnimatePresence mode="wait">
              {!isLogin ? (
                <motion.div 
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}
                >
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input className="input-field" name="name" placeholder="Student Name" value={form.name} onChange={handleChange} required={!isLogin} style={{ paddingLeft: '3.25rem' }} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input className="input-field" name="phone" placeholder="Contact Number" value={form.phone} onChange={handleChange} required={!isLogin} style={{ paddingLeft: '3.25rem' }} />
                  </div>
                </motion.div>
              ) : null}

              <div key="common-fields" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input className="input-field" name="email" type="email" placeholder="Edu Mail Address" value={form.email} onChange={handleChange} required style={{ paddingLeft: '3.25rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input className="input-field" name="password" type="password" placeholder="Secure Password" value={form.password} onChange={handleChange} required style={{ paddingLeft: '3.25rem' }} />
                </div>
              </div>
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '1rem', color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700 }}>
                {error}
              </motion.div>
            )}

            <button className="btn-primary" type="button" onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem' }}>
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⚡</motion.div> : isLogin ? 'Secure Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={22} />}
            </button>
          </form>

        </div>

        {/* UN SDG Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['SDG-1', 'SDG-8', 'SDG-12'].map(s => (
            <motion.span 
              whileHover={{ scale: 1.1, backgroundColor: 'var(--primary)', color: '#000' }}
              key={s} 
              style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '50px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 800, transition: '0.3s' }}>
              {s} Support
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
