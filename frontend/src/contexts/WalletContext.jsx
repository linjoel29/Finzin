import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(0);
  const [savings, setSavings] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const fetchWallet = useCallback(async (userId) => {
    try {
      const [walletRes, txnRes] = await Promise.all([
        api.get(`/api/wallet/${userId}`),
        api.get(`/api/wallet/transactions/${userId}`),
      ]);
      setWallet(walletRes.data.wallet);
      setSavings(walletRes.data.savings);
      setTransactions(txnRes.data.transactions);
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
