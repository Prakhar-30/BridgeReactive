// constants/contracts.js

// Helper function to create chain pair key
const createChainPairKey = (originChainId, destinationChainId) => 
  `${originChainId}-${destinationChainId}`;

// Bridge contract addresses mapped to specific chain pairs
export const BRIDGE_CONTRACTS = {
  // Sepolia -> Kopli
  [createChainPairKey("11155111", "5318008")]: "0xf4840dC0E53Dc6BD48e5E115CEe645022c63ad72",
};

// Function to get contract address for a specific chain pair
export const getBridgeContract = (originChainId, destinationChainId) => {
  // Convert chain IDs to strings for consistent comparison
  const originChainStr = originChainId?.toString();
  const destinationChainStr = destinationChainId?.toString();
  
  console.log('Looking for bridge contract:', {
    originChain: originChainStr,
    destinationChain: destinationChainStr
  });

  const pairKey = createChainPairKey(originChainStr, destinationChainStr);
  const contractAddress = BRIDGE_CONTRACTS[pairKey];
  
  console.log('Contract lookup result:', {
    pairKey,
    contractAddress
  });
  
  return contractAddress || null;
};

// Add validation helper
export const isValidChainPair = (originChainId, destinationChainId) => {
  return !!getBridgeContract(originChainId, destinationChainId);
};