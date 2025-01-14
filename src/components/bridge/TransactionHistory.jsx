import React from 'react';
import { ExternalLink } from 'lucide-react';

const getExplorerUrl = (chainId) => {
  const explorers = {
    "11155111": "https://sepolia.etherscan.io",
    "5318008": "https://explorer.kopli.io"
  };
  return explorers[chainId] || "";
};

const TransactionHistory = ({ transactions }) => {
  return (
    <div className="w-full px-6 py-8 bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold mb-6">TRANSACTION HISTORY</h2>
        
        <div className="grid gap-4">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transactions found</div>
          ) : (
            transactions.map((tx, index) => (
              <div 
                key={tx.hash + index}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-700 rounded-lg bg-black/50 hover:bg-black/70 transition-colors ${
                  tx.status === 'confirmed' ? 'border-green-800' : 
                  tx.status === 'failed' ? 'border-red-800' : 
                  'border-gray-700'
                }`}
              >
                <div className="flex flex-col space-y-2 w-full sm:w-2/3">
                  <div className="flex items-center space-x-2">
                    <a 
                      href={`${getExplorerUrl(tx.fromChainId)}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <span className="font-mono">{tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                      <ExternalLink size={16} />
                    </a>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      tx.status === 'confirmed' ? 'bg-green-900/50 text-green-300' :
                      tx.status === 'failed' ? 'bg-red-900/50 text-red-300' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.amount} {tx.tokenSymbol}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 mt-2 sm:mt-0 w-full sm:w-1/3 text-right">
                  <div className="text-sm">
                    <span className="text-gray-500">From:</span> Chain {tx.fromChainId}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">To:</span> Chain {tx.toChainId}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;