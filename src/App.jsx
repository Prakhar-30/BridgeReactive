/* eslint-disable react/jsx-no-comment-textnodes */
import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { AsciiArt } from './components/layout/AsciiArt';
import { BridgeInterface } from './components/bridge/BridgeInterface';
import TransactionHistory from './components/bridge/TransactionHistory';
import { useAddress, useBalance } from "@thirdweb-dev/react";

export default function App() {
  const address = useAddress();
  const { data: balance } = useBalance();
  const [transactions, setTransactions] = useState([]);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    if (address) {
      const storedTxns = localStorage.getItem(`transactions_${address}`);
      if (storedTxns) {
        setTransactions(JSON.parse(storedTxns));
      }
    }
  }, [address]);

  // Handle new transaction submissions
  const handleTransactionSubmit = (newTx) => {
    const updatedTx = {
      ...newTx,
      timestamp: new Date().toISOString(),
      userAddress: address
    };

    const updatedTxns = [updatedTx, ...transactions];
    setTransactions(updatedTxns);
    
    if (address) {
      localStorage.setItem(`transactions_${address}`, JSON.stringify(updatedTxns));
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header 
        address={address} 
        balance={balance}
      />

      <div className="flex-grow w-full px-4 py-6 font-mono">
        <main>
          <div className="flex flex-col lg:flex-row justify-between items-start max-w-7xl mx-auto mt-14">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <AsciiArt className="my-0" />
            </div>
            
            <div className="lg:w-1/2 lg:pl-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl mb-2 font-bold">
                  // BRIDGE PLATFORM
                </h1>
                <p className="text-sm md:text-base opacity-70">
                  TRANSFER TOKENS ACROSS CHAINS SECURELY.
                </p>
              </div>
              
              <BridgeInterface 
                isWalletConnected={!!address}
                onTransactionSubmit={handleTransactionSubmit}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Transaction History takes full width at bottom */}
      {address && (
        <div className="w-full mt-8">
          <TransactionHistory transactions={transactions} />
        </div>
      )}

      <footer className="text-center text-xs opacity-50 py-4 bg-black w-full border-t border-gray-800">
        <p>© 2025 Reactive BRIDGE. All rights reserved.</p>
      </footer>
    </div>
  );
}