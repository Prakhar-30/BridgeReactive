/* eslint-disable react/jsx-no-comment-textnodes */
// App.jsx
import { Header } from './components/layout/Header';
import { AsciiArt } from './components/layout/AsciiArt';
import { BridgeInterface } from './components/bridge/BridgeInterface';
import { useAddress, useBalance } from "@thirdweb-dev/react";

export default function App() {
  const address = useAddress();
  const { data: balance } = useBalance();

  return (
    <div className="min-h-screen bg-black flex flex-col pt-16">
      <Header 
        address={address}
        balance={balance}
      />

      <div className="flex-grow w-full px-0 py-6 font-mono">
        <main className="">
          <div className="flex flex-col sm:flex-row">
            <AsciiArt className="my-0 sm:w-1/2" />
            <div className="sm:w-1/4">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl mb-2 font-bold">
                  // BRIDGE PLATFORM
                </h1>
                <p className="text-sm md:text-base opacity-70">
                  TRANSFER TOKENS ACROSS CHAINS SECURELY.
                </p>
              </div>
              <BridgeInterface isWalletConnected={!!address} />
            </div>
          </div>
        </main>
      </div>

      <footer className="text-center text-xs opacity-50 mt-8 py-4 bg-black w-full">
        <p>© 2025 Reactive BRIDGE. All rights reserved.</p>
      </footer>
    </div>
  );
}