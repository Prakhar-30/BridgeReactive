// /* eslint-disable react/prop-types */

// import { useAddress } from "@thirdweb-dev/react";
// import { useState, useEffect } from 'react';
// import { useChainInfo } from '../../hooks/useChainInfo';
// import { useBridgeContract } from '../../hooks/userBridgeContract';
// import { ChainDisplay } from './ChainDisplay';
// import { ChainSelector } from './ChainSelector';
// import { TokenSelector } from './TokenSelector';
// import { BridgeButton } from './BridgeButton';
// import { TokenDisplay } from './TokenDisplay';
// import { isValidChainPair, getBridgeContract } from '../constants/contracts';

// export function BridgeInterface({ isWalletConnected }) {
//   const [destinationChain, setDestinationChain] = useState('');
//   const { getCurrentChainId, getChainDisplay } = useChainInfo(isWalletConnected);
//   const [originToken, setOriginToken] = useState('');
//   const [selectedPair, setSelectedPair] = useState(null);
//   const address = useAddress();
  
//   const currentChainId = getCurrentChainId();
  
//   const { 
//     contract, 
//     tokenPairs, 
//     lockedTokens, 
//     loading,
//     error 
//   } = useBridgeContract(currentChainId, destinationChain, address);

//   const handleDestinationChainChange = (newChainId) => {
//     console.log('Destination chain changing to:', newChainId);
//     setDestinationChain(newChainId);
//     setOriginToken(''); // Reset token selection
//     setSelectedPair(null);
//   };

//   const handleTokenChange = (newValue, pair) => {
//     setOriginToken(newValue);
//     setSelectedPair(pair);
//   };

//   const handleBridge = async () => {
//     if (!contract) {
//       console.error('Bridge contract not available');
//       return;
//     }
    
//     console.log('Bridging tokens...', {
//       originChain: currentChainId,
//       destinationChain,
//       originToken,
//       contract: contract?.address
//     });
//   };

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="max-w-md mx-auto border border-gray-400/30 p-8 rounded-lg backdrop-blur-sm">
//         <div className="text-center">Loading bridge interface...</div>
//       </div>
//     );
//   }

//   // Check if bridge exists for the chain pair
//   const bridgeExists = isValidChainPair(currentChainId, destinationChain);
//   const bridgeAddress = getBridgeContract(currentChainId, destinationChain);

//   return (
//     <div className="max-w-md mx-auto border border-gray-400/30 p-8 rounded-lg backdrop-blur-sm">
//       {Object.entries(lockedTokens).map(([tokenAddress, amount]) => (
//         <TokenDisplay
//           key={tokenAddress}
//           tokenAddress={tokenAddress}
//           lockedAmount={amount}
//           selectedToken={originToken}
//         />
//       ))}

//       <div className="space-y-24">
//         <div className="grid grid-cols-2 gap-4">
//           <ChainDisplay chainName={getChainDisplay()} />
//           <ChainSelector
//             label="DESTINATION CHAIN"
//             value={destinationChain}
//             onChange={handleDestinationChainChange}
//             excludeChain={currentChainId}
//             disabled={!isWalletConnected}
//           />
//         </div>

//         {bridgeExists && (
//           <div className="grid grid-cols-1 gap-4">
//             <TokenSelector
//               label="SELECT TOKEN"
//               value={originToken}
//               onChange={handleTokenChange}
//               chainId={currentChainId}
//               tokenPairs={tokenPairs}
//               disabled={!isWalletConnected || loading || !destinationChain}
//             />
//           </div>
//         )}

//         <BridgeButton 
//           disabled={!isWalletConnected || !destinationChain || !originToken || loading || !bridgeExists}
//           onClick={handleBridge}
//         >
//           [ BRIDGE ]
//         </BridgeButton>
//       </div>

//       {error && (
//         <div className="mt-4 text-sm text-red-500">
//           {error}
//         </div>
//       )}

//       {isWalletConnected && !error && (
//         <div className="mt-4 text-sm text-gray-400">
//           {loading ? 'Loading...' : 'Ready to bridge'}
//         </div>
//       )}

// {process.env.NODE_ENV === 'development' && (
//   <div className="mt-4 text-xs text-gray-500">
//     <div>Current Chain ID: {currentChainId}</div>
//     <div>Destination Chain ID: {destinationChain}</div>
//     {bridgeExists && selectedPair && (
//       <div className="mt-2">
//         <div>Selected Pair:</div>
//         <div className="ml-2">
//           Origin: {selectedPair.originSymbol} ({selectedPair.originToken})</div>
//         <div className="ml-2">
//           Destination: {selectedPair.destinationSymbol} ({selectedPair.destinationToken})
//         </div>
//       </div>
//     )}
//     {bridgeExists && bridgeAddress && (
//       <div className="mt-2">Bridge Contract: {bridgeAddress}</div>
//     )}
//   </div>
// )}
//     </div>
//   );
// }
import { useAddress } from "@thirdweb-dev/react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useChainInfo } from "../../hooks/useChainInfo";
import { useBridgeContract } from "../../hooks/userBridgeContract";
import { ChainDisplay } from "./ChainDisplay";
import { ChainSelector } from "./ChainSelector";
import { TokenSelector } from "./TokenSelector";
import { BridgeButton } from "./BridgeButton";
import { TokenDisplay } from "./TokenDisplay";
import { isValidChainPair, getBridgeContract } from "../constants/contracts";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
];

export function BridgeInterface({ isWalletConnected }) {
  const [destinationChain, setDestinationChain] = useState("");
  const { getCurrentChainId, getChainDisplay } = useChainInfo(isWalletConnected);
  const [originToken, setOriginToken] = useState("");
  const [selectedPair, setSelectedPair] = useState(null);
  const [amount, setAmount] = useState(""); // Added for input field
  const [approving, setApproving] = useState(false); // Approval state
  const address = useAddress();

  const currentChainId = getCurrentChainId();
  const { contract, tokenPairs, lockedTokens, loading, error } =
    useBridgeContract(currentChainId, destinationChain, address);

  const handleDestinationChainChange = (newChainId) => {
    setDestinationChain(newChainId);
    setOriginToken(""); // Reset token selection
    setSelectedPair(null);
  };

  const handleTokenChange = (newValue, pair) => {
    setOriginToken(newValue);
    setSelectedPair(pair);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleBridge = async () => {
    if (!contract || !originToken || !amount || !destinationChain) {
      console.error("Invalid bridge parameters");
      return;
    }

    try {
      setApproving(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(originToken, ERC20_ABI, signer);

      // Fetch token decimals
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.utils.parseUnits(amount, decimals);

      // Approve the bridge contract to spend tokens
      const bridgeAddress = getBridgeContract(currentChainId, destinationChain);
      const tx = await tokenContract.approve(bridgeAddress, parsedAmount);
      console.log("Approval transaction sent:", tx.hash);

      await tx.wait();
      console.log("Tokens approved for bridge contract");

      // After approval, you can proceed with your bridge logic here.
      console.log("Initiating bridge...", {
        originChain: currentChainId,
        destinationChain,
        originToken,
        amount: parsedAmount.toString(),
        contract: contract?.address,
      });

    } catch (err) {
      console.error("Error during bridge operation:", err);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto border border-gray-400/30 p-8 rounded-lg backdrop-blur-sm">
        <div className="text-center">Loading bridge interface...</div>
      </div>
    );
  }

  const bridgeExists = isValidChainPair(currentChainId, destinationChain);
  const bridgeAddress = getBridgeContract(currentChainId, destinationChain);

  return (
    <div className="max-w-md mx-auto border border-gray-400/30 p-8 rounded-lg backdrop-blur-sm">
      {Object.entries(lockedTokens).map(([tokenAddress, amount]) => (
        <TokenDisplay
          key={tokenAddress}
          tokenAddress={tokenAddress}
          lockedAmount={amount}
          selectedToken={originToken}
        />
      ))}

      <div className="space-y-24">
        <div className="grid grid-cols-2 gap-4">
          <ChainDisplay chainName={getChainDisplay()} />
          <ChainSelector
            label="DESTINATION CHAIN"
            value={destinationChain}
            onChange={handleDestinationChainChange}
            excludeChain={currentChainId}
            disabled={!isWalletConnected}
          />
        </div>

        {bridgeExists && (
          <div className="grid grid-cols-1 gap-4">
            <TokenSelector
              label="SELECT TOKEN"
              value={originToken}
              onChange={handleTokenChange}
              chainId={currentChainId}
              tokenPairs={tokenPairs}
              disabled={!isWalletConnected || loading || !destinationChain}
            />
            <div className="space-y-2">
              <label className="text-xs opacity-70">Amount</label>
              <input
  type="number"
  className="w-full px-3 py-2 border border-gray-500 rounded-md bg-black text-gray-400"
  value={amount}
  onChange={handleAmountChange}
  placeholder="Enter amount to bridge"
  disabled={!isWalletConnected || loading || !bridgeExists}
/>

            </div>
          </div>
        )}

        <BridgeButton
          disabled={
            !isWalletConnected ||
            !destinationChain ||
            !originToken ||
            !amount ||
            approving ||
            loading ||
            !bridgeExists
          }
          onClick={handleBridge}
        >
          {approving ? "Approving..." : "[ BRIDGE ]"}
        </BridgeButton>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {isWalletConnected && !error && (
        <div className="mt-4 text-sm text-gray-400">
          {loading ? "Loading..." : "Ready to bridge"}
          <div className="mt-2 text-xs">
            <div>Current Chain ID: {currentChainId}</div>
            <div>Destination Chain ID: {destinationChain}</div>
            {bridgeExists && selectedPair && (
              <div className="mt-2">
                <div>Selected Pair:</div>
                <div className="ml-2">
                  Origin: {selectedPair.originSymbol} ({selectedPair.originToken})
                </div>
                <div className="ml-2">
                  Destination: {selectedPair.destinationSymbol} ({selectedPair.destinationToken})
                </div>
              </div>
            )}
            {bridgeExists && bridgeAddress && (
              <div className="mt-2">Bridge Contract: {bridgeAddress}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
