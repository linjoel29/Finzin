import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, Loader2, ArrowUpRight, AlertTriangle, ExternalLink, X } from 'lucide-react';
import api from '../api';

const MOCK_OFFERS = [
  { id: 'o1', title: 'Apple Student Discount', description: 'Save up to ₹10,000 on Mac or iPad with education pricing.', platform: 'Apple Education Store', discount: '10', expiry: 'Ongoing', link: 'https://www.apple.com/in-edu/store', emoji: '💻', tag: '🔥 Trending', color: '#000' },
  { id: 'o2', title: 'Spotify Premium Student', description: '50% off Premium for Students. Cancel anytime.', platform: 'Spotify', discount: '50', expiry: 'Ongoing', link: 'https://www.spotify.com/student', emoji: '🎵', tag: '🎧 Must Have', color: '#1DB954' },
  { id: 'o3', title: 'Adobe Creative Cloud', description: 'Save over 60% on 20+ creative apps for students.', platform: 'Adobe', discount: '60', expiry: 'Ongoing', link: 'https://www.adobe.com/creativecloud/buy/students.html', emoji: '🎨', tag: '🖌️ Creative', color: '#FF0000' },
  { id: 'o4', title: 'Amazon Prime Student', description: '50% off Prime Membership for 1 year.', platform: 'Amazon', discount: '50', expiry: '2026-08-15', link: 'https://www.amazon.in/joinstudent', emoji: '📦', tag: '🚚 Fast Delivery', color: '#FF9900' },
  { id: 'o5', title: 'YouTube Premium Student', description: 'Ad-free YouTube and Music at a student-friendly price.', platform: 'YouTube', discount: '40', expiry: 'Ongoing', link: 'https://www.youtube.com/premium/student', emoji: '📺', tag: '🎬 Ad-Free', color: '#FF0000' },
  { id: 'o6', title: 'Samsung Student Perks', description: 'Additional 10% off on Galaxy smartphones and tablets.', platform: 'Samsung Shop', discount: '10', expiry: '2026-12-25', link: 'https://www.samsung.com/in/microsite/student-advantage/', emoji: '📱', tag: '📱 Tech Deals', color: '#1428a0' },
];

function RedirectionModal({ offer, onConfirm, onCancel }) {
  if (!offer) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(8px)', zIndex: 3000, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
          borderRadius: '2rem', padding: '2.5rem', maxWidth: '440px', width: '100%',
          boxShadow: 'var(--box-shadow)', textAlign: 'center'
        }}
      >
        <div style={{
          width: '70px', height: '70px', background: 'rgba(245, 158, 11, 0.1)', 
          borderRadius: '22px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--warning)'
        }}>
          <AlertTriangle size={36} />
        </div>
        
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          External Link
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          You are leaving <strong style={{ color: 'var(--primary)' }}>Finzin</strong> and being redirected to <strong style={{ color: 'var(--text-primary)' }}>{offer.platform}</strong>. We are not responsible for content on external sites.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onCancel}
            style={{ 
              flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)', 
              background: 'var(--input-bg)', color: 'var(--text-secondary)', 
              fontWeight: 800, cursor: 'pointer' 
            }}
          >
            Go Back
          </button>
          <button 
            onClick={onConfirm}
            className="btn-primary"
            style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            Continue <ExternalLink size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/api/offers')
      .then(r => setOffers(r.data.offers?.length > 0 ? r.data.offers : MOCK_OFFERS))
      .catch((err) => {
        console.error("Failed to fetch offers:", err);
        console.error(err);
        setOffers(MOCK_OFFERS);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenLink = (offer) => {
    if (!offer.link || offer.link === '#') return;
    setSelectedOffer(offer);
  };

  const confirmRedirection = () => {
    if (selectedOffer) {
      window.open(selectedOffer.link, '_blank', 'noopener,noreferrer');
      setSelectedOffer(null);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '520px', margin: '0 auto', paddingBottom: '120px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-2px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Real <span style={{ color: 'var(--secondary)' }}>Deals</span> <Sparkles size={28} className="text-glow" />
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 700 }}>Exclusive student rewards, verified daily</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1.25rem' }}
            >
              <div style={{ position: 'relative' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} color="var(--primary)" fill="var(--primary)" />
                </div>
              </div>
              <p style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Fetching best student offers...</p>
            </motion.div>
          ) : offers.length > 0 ? (
            offers.map((o, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                key={o.id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', flexDirection: 'column', padding: '1.75rem', gap: '1.25rem',
                  border: '1px solid var(--border-color)', boxShadow: 'var(--box-shadow)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ 
                    width: '70px', height: '70px', borderRadius: '22px', 
                    background: o.color || 'var(--accent-start)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '2.2rem', flexShrink: 0, color: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {o.emoji || '🎁'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <p style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{o.title}</p>
                      {o.tag && (
                        <span style={{ 
                          fontSize: '0.65rem', padding: '4px 10px', borderRadius: '12px', 
                          background: 'var(--accent-start)', color: '#000', 
                          border: '1px solid var(--primary)', fontWeight: 900, whiteSpace: 'nowrap'
                        }}>
                          {o.tag}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>{o.platform}</p>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 600, marginBottom: '1.25rem' }}>{o.description}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--secondary)' }}>{o.discount}% OFF</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Expires: {o.expiry}</span>
                    </div>
                    <button 
                      onClick={() => handleOpenLink(o)}
                      className="btn-primary" 
                      style={{ padding: '0.8rem 1.5rem', borderRadius: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      View Offer <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 800, fontSize: '1.1rem' }}>No offers available right now. Check back soon!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginTop: '4rem', padding: '1.75rem', 
          background: 'var(--accent-start)', 
          border: '1.5px solid var(--primary)', 
          borderRadius: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center'
        }}
      >
        <div style={{ 
          width: '50px', height: '50px', borderRadius: '16px', background: '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: 'var(--secondary)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', flexShrink: 0
        }}>
          <ShoppingBag size={24} />
        </div>
        <div>
          <h4 style={{ color: '#000', fontWeight: 900, fontSize: '1rem', marginBottom: '0.2rem' }}>Responsible Consumption</h4>
          <p style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.6, fontWeight: 600 }}>
            <strong>UN SDG-12:</strong> Verified student discounts help you save money while supporting ethical brands.
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedOffer && (
          <RedirectionModal 
            offer={selectedOffer} 
            onConfirm={confirmRedirection} 
            onCancel={() => setSelectedOffer(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
