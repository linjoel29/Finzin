import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, GraduationCap, Briefcase, Calendar, 
  MapPin, IndianRupee, ChevronRight, Sparkles,
  Heart, Globe, Loader2, ArrowUpRight
} from 'lucide-react';
import api from '../api';

const MOCK_SCHOLARSHIPS = [
  { id: 's1', name: 'HDFC Badhte Kadam Scholarship', eligibility: 'Class 9-12 / UG Students', amount: '₹ 1,00,000', deadline: '31 Mar 2026', link: 'https://www.buddy4study.com/page/hdfc-bank-parivartan-ecss-scholarship' },
  { id: 's2', name: 'Reliance Foundation Undergraduate', eligibility: '1st Year UG Students', amount: '₹ 2,00,000', deadline: '15 Apr 2026', link: 'https://www.reliancefoundation.org/scholarships' },
  { id: 's3', name: 'Google Generation Scholarship', eligibility: 'CS / Tech Students', amount: '₹ 2,50,000', deadline: 'May 2026', link: 'https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship-apac' },
  { id: 's4', name: 'Adobe Women in Technology', eligibility: 'Female CS Students', amount: '₹ 3,00,000', deadline: '15 Jun 2026', link: 'https://www.adobe.com/in/creativecloud/buy/students/scholarships.html' }
];

const MOCK_JOBS = [
  { id: 'j1', title: 'UX Design Intern', type: 'Remote', pay: '₹ 25k/mo', location: 'Zomato', link: 'https://www.zomato.com/careers' },
  { id: 'j2', title: 'Software Engineer Intern', type: 'Hybrid', pay: '₹ 40k/mo', location: 'Swiggy', link: 'https://www.swiggy.com/careers' },
  { id: 'j3', title: 'Content Creator', type: 'Remote', pay: '₹ 15k/mo', location: 'Finzin AI', link: 'https://internshala.com' },
  { id: 'j4', title: 'Content Writer', type: 'Remote', pay: '₹ 10k/mo', location: 'EduTech', link: 'https://internshala.com' }
];

export default function Opportunities() {
  const [tab, setTab] = useState('scholarships');
  const [scholarships, setScholarships] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [scholRes, jobsRes] = await Promise.all([
        api.get('/api/opportunities/scholarships').catch(() => ({ data: { scholarships: MOCK_SCHOLARSHIPS } })),
        api.get('/api/opportunities/jobs').catch(() => ({ data: { jobs: MOCK_JOBS } }))
      ]);
      setScholarships(scholRes.data.scholarships?.length ? scholRes.data.scholarships : MOCK_SCHOLARSHIPS);
      setJobs(jobsRes.data.jobs?.length ? jobsRes.data.jobs : MOCK_JOBS);
    } catch (e) { 
      console.error("Failed to fetch opportunities:", e);
      setScholarships(MOCK_SCHOLARSHIPS);
      setJobs(MOCK_JOBS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '520px', margin: '0 auto', paddingBottom: '120px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Next <span style={{ color: 'var(--secondary)' }}>Steps</span> <Rocket size={24} className="text-glow" />
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Funding and careers tailored for students</p>
      </header>

      {/* Premium Tabs */}
      <div style={{ 
        display: 'flex', gap: '0.5rem', background: 'var(--input-bg)', 
        borderRadius: '1.25rem', padding: '6px', marginBottom: '1.5rem',
        border: '1px solid var(--border-color)'
      }}>
        {[
          { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
          { id: 'jobs', label: 'Student Jobs', icon: Briefcase }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)}
            style={{ 
              flex: 1, padding: '0.85rem', borderRadius: '1rem', border: 'none', 
              cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', position: 'relative',
              background: 'transparent', color: tab === t.id ? '#000' : 'var(--text-secondary)',
              transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            {tab === t.id && (
              <motion.div 
                layoutId="activeTabOpp"
                style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'var(--primary)', 
                  borderRadius: '1rem', zIndex: 0 
                }}
              />
            )}
            <t.icon size={18} style={{ position: 'relative', zIndex: 1 }} />
            <span style={{ position: 'relative', zIndex: 1 }}>{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab + loading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '1rem' }}>
              <Loader2 className="animate-spin" size={32} color="var(--primary)" />
              <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Curating opportunities...</p>
            </div>
          ) : tab === 'scholarships' ? (
            scholarships.map((s, i) => (
              <motion.div 
                key={s.id} 
                className="glass-card" 
                style={{ padding: '1.5rem' }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{s.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>ELIGIBILITY:</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.eligibility}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--secondary)' }}>{s.amount}</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>FUNDING</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Calendar size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Deadline: <strong style={{ color: 'var(--warning)' }}>{s.deadline}</strong></span>
                </div>

                <button 
                  onClick={() => window.open(s.link, '_blank')}
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  Apply Now <ArrowUpRight size={18} />
                </button>
              </motion.div>
            ))
          ) : (
            jobs.map((j, i) => (
              <motion.div 
                key={j.id} 
                className="glass-card" 
                style={{ padding: '1.5rem' }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{j.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.65rem', padding: '3px 10px', borderRadius: '8px', 
                        background: 'var(--accent-start)', color: '#000', 
                        border: '1px solid var(--primary)', fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {j.type}
                      </span>
                      <span style={{ 
                        fontSize: '0.65rem', padding: '3px 10px', borderRadius: '8px', 
                        background: 'var(--input-bg)', color: 'var(--text-secondary)', 
                        border: '1px solid var(--border-color)', fontWeight: 800
                      }}>
                        {j.location}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--secondary)' }}>{j.pay}</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>STIPEND</p>
                  </div>
                </div>

                <button 
                  onClick={() => window.open(j.link, '_blank')}
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  Quick Apply <ArrowUpRight size={18} />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ padding: '1.25rem', background: 'var(--accent-start)', borderRadius: '1.5rem', border: '1px solid var(--primary)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: 'var(--secondary)' }}><Heart size={20} /></div>
          <p style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600, lineHeight: 1.4 }}>
            <strong>UN SDG-1:</strong> Education funding and student income paths are critical for long-term poverty reduction.
          </p>
        </div>
      </div>
    </div>
  );
}
