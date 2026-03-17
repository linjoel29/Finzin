import { createContext, useContext, useState, useCallback } from 'react';
import { getUserProfile, getTransactions } from '../firebase/db';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(0);
  const [savings, setSavings] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const fetchWallet = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const profile = await getUserProfile(userId);
      const txns = await getTransactions(userId);
      
      if (profile) {
        setWallet(profile.wallet || 0);
        setSavings(profile.savings || 0);
      }
      setTransactions(txns || []);
    } catch (err) { console.error('Wallet fetch error', err); }
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, savings, transactions, setWallet, setSavings, setTransactions, fetchWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => useContext(WalletContext);
