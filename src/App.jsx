import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { Sun, Moon } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AIBudget from './pages/AIBudget';
import Offers from './pages/Offers';
import Opportunities from './pages/Opportunities';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
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
        </BrowserRouter>
      </WalletProvider>
    </AuthProvider>
  );
}
