import { createContext, useContext, useState, useCallback, useRef } from 'react';
import api from '../api';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(0);
  const [savings, setSavings] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const fetchPromise = useRef(null);
  const lastFetchTime = useRef(0);

  const fetchWallet = useCallback(async (userId, force = false) => {
    if (!userId) return;

    const now = Date.now();
    // Cache data for 10 seconds to avoid spamming the backend
    if (!force && lastFetchTime.current > 0 && now - lastFetchTime.current < 10000) {
      return; 
    }

    if (fetchPromise.current) return fetchPromise.current;

    fetchPromise.current = (async () => {
      try {
        const [walletRes, txnsRes] = await Promise.all([
          api.get(`/api/wallet/${userId}`).catch(() => ({ data: { wallet: 0, savings: 0 } })),
          api.get(`/api/wallet/transactions/${userId}`).catch(() => ({ data: { transactions: [] } }))
        ]);
        
        setWallet(walletRes.data.wallet || 0);
        setSavings(walletRes.data.savings || 0);
        setTransactions(txnsRes.data.transactions || []);
        lastFetchTime.current = Date.now();
      } catch (err) { 
        console.error('Wallet fetch error', err); 
      } finally {
        fetchPromise.current = null;
      }
    })();
    return fetchPromise.current;
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, savings, transactions, setWallet, setSavings, setTransactions, fetchWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => useContext(WalletContext);
