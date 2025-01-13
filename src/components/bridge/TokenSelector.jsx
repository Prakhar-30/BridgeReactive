
import { Select } from '../ui/Select';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function TokenSelector({ 
  label, 
  value, 
  onChange, 
  chainId, 
  tokenPairs,
  disabled = false,
  loading = false,
  error = null
}) {
  const [tokenSymbols, setTokenSymbols] = useState({});

  useEffect(() => {
    const fetchTokenSymbols = async () => {
      if (!tokenPairs || tokenPairs.length === 0) return;

      // Create providers for origin and destination chains
      const originProvider = new ethers.providers.Web3Provider(window.ethereum);
      const destProvider = new ethers.providers.JsonRpcProvider("https://5318008.rpc.thirdweb.com"); // Kopli RPC
      
      const symbols = {};

      for (const pair of tokenPairs) {
        const pairKey = pair.originToken;
        
        try {
          const originContract = new ethers.Contract(pair.originToken, ERC20_ABI, originProvider);
          const destContract = new ethers.Contract(pair.destinationToken, ERC20_ABI, destProvider);
          
          const [originSymbol, originName, destSymbol, destName] = await Promise.all([
            originContract.symbol(),
            originContract.name(),
            destContract.symbol(),
            destContract.name()
          ]);

          symbols[pairKey] = {
            originToken: pair.originToken,
            destinationToken: pair.destinationToken,
            originSymbol,
            destinationSymbol: destSymbol,
            originName,
            destinationName: destName,
            originShort: shortenAddress(pair.originToken),
            destinationShort: shortenAddress(pair.destinationToken)
          };
        } catch (error) {
          console.warn('Error fetching token details for pair:', pair, error);
          symbols[pairKey] = {
            originToken: pair.originToken,
            destinationToken: pair.destinationToken,
            originShort: shortenAddress(pair.originToken),
            destinationShort: shortenAddress(pair.destinationToken)
          };
        }
      }

      setTokenSymbols(symbols);
    };

    fetchTokenSymbols();
  }, [tokenPairs]);

  const getTokenOptions = () => {
    if (!chainId || !tokenPairs) return [];
    
    return tokenPairs.map(({ originToken, destinationToken }) => {
      const symbols = tokenSymbols[originToken] || {
        originShort: shortenAddress(originToken),
        destinationShort: shortenAddress(destinationToken)
      };

      return {
        value: originToken,
        label: (
          <div className="flex flex-col w-full">
            <div className="flex justify-between w-full">
              <div title={symbols.originName}>
                {symbols.originSymbol || 'Loading...'}
              </div>
              <div className="mx-2">→</div>
              <div title={symbols.destinationName}>
                {symbols.destinationSymbol || 'Loading...'}
              </div>
            </div>
            {/* <div className="flex justify-between w-full text-xs text-gray-500">
              <div title={originToken}>{symbols.originShort}</div>
              <div title={destinationToken}>{symbols.destinationShort}</div>
            </div> */}
          </div>
        ),
        pairInfo: {
          originToken,
          destinationToken,
          originSymbol: symbols.originSymbol,
          destinationSymbol: symbols.destinationSymbol,
          originName: symbols.originName,
          destinationName: symbols.destinationName
        }
      };
    });
  };

  const handleChange = (newValue) => {
    const selectedOption = getTokenOptions().find(option => option.value === newValue);
    if (selectedOption) {
      onChange(newValue, selectedOption.pairInfo);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs opacity-70">{label}</label>
      <Select
        value={value}
        onChange={handleChange}
        placeholder={loading ? "Loading..." : error ? "Error loading tokens" : "Select Token"}
        options={getTokenOptions()}
        disabled={disabled || loading}
      />
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
}