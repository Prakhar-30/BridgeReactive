import React, { useState, useEffect } from "react";
import { ConnectWallet, useConnectionStatus, useChain } from "@thirdweb-dev/react";
import { ethers } from "ethers";

export function Header() {
  const connectionStatus = useConnectionStatus();
  const chain = useChain(); // thirdweb's chain hook
  const [fallbackChainInfo, setFallbackChainInfo] = useState(null);

  const fetchFallbackChainInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setFallbackChainInfo({
        name: network.name === "unknown" ? null : network.name,
        chainId: network.chainId,
      });
    } catch (error) {
      console.error("Error fetching fallback chain info:", error);
      setFallbackChainInfo(null);
    }
  };

  useEffect(() => {
    // Only fetch fallback info if connected but chain is unknown
    if (connectionStatus === "connected" && (!chain || chain.name === "unknown")) {
      fetchFallbackChainInfo();
    }

    // Reset fallback info when disconnected
    if (connectionStatus === "disconnected") {
      setFallbackChainInfo(null);
    }

    const handleChainChanged = () => {
      // When chain changes, let thirdweb hooks update first
      setTimeout(() => {
        if (!chain || chain.name === "unknown") {
          fetchFallbackChainInfo();
        }
      }, 100);
    };

    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [connectionStatus, chain]);

  const getChainDisplay = () => {
    if (connectionStatus === "disconnected") return "Not Connected";
    
    // First try to use thirdweb chain info
    if (chain && chain.name !== "unknown") {
      return chain.name;
    }
    
    // Fall back to ethers chain info if available
    if (fallbackChainInfo) {
      return fallbackChainInfo.name || `Chain ID: ${fallbackChainInfo.chainId}`;
    }
    
    return "Unknown Chain";
  };

  return (
    <header className="flex justify-between items-center py-4 px-6 w-full fixed top-0 left-0 z-10">
      <div className="text-lg">Reactive Network | BRIDGE</div>
      <div className="flex items-center gap-4">
        <span className="text-xs opacity-70">{getChainDisplay()}</span>
        <ConnectWallet
          theme="dark"
          btnTitle="Connect Wallet"
          className="!bg-transparent hover:!bg-gray-800"
          style={{
            backgroundColor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      </div>
    </header>
  );
}