import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, IndianRupee, Tag, Briefcase } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Wallet' },
  { path: '/budget', icon: IndianRupee, label: 'Budget' },
  { path: '/offers', icon: Tag, label: 'Offers' },
  { path: '/opportunities', icon: Briefcase, label: 'Jobs' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', zIndex: 100,
      background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '1.5rem',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '0.75rem 0.5rem', height: '70px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
    }}>
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button key={path} onClick={() => navigate(path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? '#3b82f6' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease', padding: '0.25rem 0.75rem',
              position: 'relative'
            }}>
            {active && (
              <motion.div 
                layoutId="nav-glow"
                style={{
                  position: 'absolute', inset: 0, 
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px', zIndex: -1
                }} 
              />
            )}
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
