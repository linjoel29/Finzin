import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Sun, Moon, Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AIBudget = lazy(() => import('./pages/AIBudget'));
const Offers = lazy(() => import('./pages/Offers'));
const Opportunities = lazy(() => import('./pages/Opportunities'));

function PageLoader() {
  return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={40} className="animate-spin" color="var(--primary)" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? <ErrorBoundary>{children}</ErrorBoundary> : <Navigate to="/login" replace />;
}

function AppLayout({ children, theme, toggleTheme }) {
  return (
    <div style={{ paddingBottom: '80px', minHeight: '100vh', transition: 'all 0.3s' }}>
      <header style={{ 
        padding: '1rem 1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-1px' }}>
          FIN<span style={{ color: 'var(--secondary)' }}>ZIN</span>
        </h1>
        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>
      {children}
      <Navbar />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AuthProvider>
      <WalletProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout theme={theme} toggleTheme={toggleTheme}>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/budget" element={
                <ProtectedRoute>
                  <AppLayout theme={theme} toggleTheme={toggleTheme}>
                    <AIBudget />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/offers" element={
                <ProtectedRoute>
                  <AppLayout theme={theme} toggleTheme={toggleTheme}>
                    <Offers />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/opportunities" element={
                <ProtectedRoute>
                  <AppLayout theme={theme} toggleTheme={toggleTheme}>
                    <Opportunities />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WalletProvider>
    </AuthProvider>
  );
}
