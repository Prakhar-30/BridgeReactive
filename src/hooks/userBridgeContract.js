// hooks/userBridgeContract.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getBridgeContract } from '../components/constants/contracts';

const BRIDGE_ABI = [
  "function lockedTokens(address user, address token) view returns (uint256)",
  "function tokenPairs(address originToken) view returns (address)",
  "function getDestinationToken(address originToken) view returns (address)",
  "event TokenPairSet(address indexed originToken, address indexed destinationToken)"
];

export function useBridgeContract(originChainId, destinationChainId, userAddress) {
  const [contract, setContract] = useState(null);
  const [tokenPairs, setTokenPairs] = useState([]);
  const [lockedTokens, setLockedTokens] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const loadTokenPairs = async (bridgeContract) => {
    try {
      setLoading(true);
      
      // Get past TokenPairSet events
      const filter = bridgeContract.filters.TokenPairSet();
      const events = await bridgeContract.queryFilter(filter);
      console.log("Found token pair events:", events);

      const pairs = [];
      const locked = {};

      // Process each event
      for (const event of events) {
        const { originToken, destinationToken } = event.args;
        
        // Verify the pair is still valid
        const currentDestination = await bridgeContract.getDestinationToken(originToken);
        if (currentDestination !== ethers.constants.AddressZero) {
          pairs.push({
            originToken,
            destinationToken: currentDestination,
            originShort: shortenAddress(originToken),
            destinationShort: shortenAddress(currentDestination)
          });

          // Get locked tokens if user is connected
          if (userAddress) {
            const lockedAmount = await bridgeContract.lockedTokens(userAddress, originToken);
            if (!lockedAmount.isZero()) {
              locked[originToken] = lockedAmount;
            }
          }
        }
      }

      console.log("Loaded token pairs:", pairs);
      setTokenPairs(pairs);
      setLockedTokens(locked);
      setError(null);
    } catch (error) {
      console.error('Error loading token pairs:', error);
      setError('Failed to load token pairs');
      setTokenPairs([]);
      setLockedTokens({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initContract = async () => {
      if (!originChainId || !destinationChainId) {
        setLoading(false);
        return;
      }

      const contractAddress = getBridgeContract(originChainId, destinationChainId);
      
      if (!contractAddress) {
        setError('No bridge contract available for selected chain pair');
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const bridgeContract = new ethers.Contract(
          contractAddress,
          BRIDGE_ABI,
          provider
        );
        setContract(bridgeContract);

        // Load token pairs
        await loadTokenPairs(bridgeContract);
        
        // Listen for new token pair events
        bridgeContract.on("TokenPairSet", (originToken, destinationToken) => {
          console.log("New token pair set:", originToken, destinationToken);
          loadTokenPairs(bridgeContract);
        });

        return () => {
          bridgeContract.removeAllListeners();
        };

      } catch (error) {
        console.error('Error initializing bridge contract:', error);
        setError('Failed to initialize contract');
        setContract(null);
        setTokenPairs([]);
        setLockedTokens({});
      } finally {
        setLoading(false);
      }
    };

    initContract();

    // Cleanup function
    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, [originChainId, destinationChainId, userAddress]);

  // Function to manually refresh the data
  const refreshData = async () => {
    if (contract) {
      await loadTokenPairs(contract);
    }
  };

  return {
    contract,
    tokenPairs,
    lockedTokens,
    loading,
    error,
    refreshData
  };
}