// components/bridge/TokenDisplay.jsx
import { ethers } from 'ethers';

function shortenAddress(address, chars = 4) {
  if (!address) return '';
  const prefix = address.substring(0, 2 + chars);
  const suffix = address.substring(address.length - chars);
  return `${prefix}...${suffix}`;
}

export function TokenDisplay({ tokenAddress, lockedAmount, selectedToken }) {
  // Only show the token display if it matches the selected token
  if (!selectedToken || tokenAddress !== selectedToken) {
    return null;
  }

  return (
    <div className="p-4 mb-6 border border-gray-400/30 rounded-lg">
      <div className="text-sm opacity-70">
        Locked Balance for {shortenAddress(tokenAddress)}
      </div>
      <div className="text-lg font-bold">
        {ethers.utils.formatUnits(lockedAmount || '0', 18)}
      </div>
    </div>
  );
}

