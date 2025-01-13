// hooks/useChainInfo.js
import { useState, useEffect } from 'react';
import { useChain } from "@thirdweb-dev/react";
import { ethers } from "ethers";

export function useChainInfo(isWalletConnected) {
  const chain = useChain();
  const [fallbackChainInfo, setFallbackChainInfo] = useState(null);

  const fetchFallbackChainInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setFallbackChainInfo({
        name: network.name === "unknown" ? null : network.name,
        chainId: network.chainId.toString(),
      });
    } catch (error) {
      console.error("Error fetching fallback chain info:", error);
      setFallbackChainInfo(null);
    }
  };

  useEffect(() => {
    if (isWalletConnected && (!chain || chain.name === "unknown")) {
      fetchFallbackChainInfo();
    }

    const handleChainChanged = () => {
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
  }, [isWalletConnected, chain]);

  const getCurrentChainId = () => {
    if (chain && chain.chainId) {
      return chain.chainId.toString();
    }
    if (fallbackChainInfo) {
      return fallbackChainInfo.chainId;
    }
    return '';
  };

  const getChainDisplay = () => {
    if (!isWalletConnected) return "Not Connected";
    
    if (chain && chain.name !== "unknown") {
      return chain.name;
    }
    
    if (fallbackChainInfo) {
      return fallbackChainInfo.name || `Chain ID: ${fallbackChainInfo.chainId}`;
    }
    
    return "Unknown Chain";
  };

  return {
    getCurrentChainId,
    getChainDisplay,
  };
}