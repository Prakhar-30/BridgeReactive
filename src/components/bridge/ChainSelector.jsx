// import { Select } from '../ui/Select';
// import { SUPPORTED_CHAINS } from '../constants/chain';

// export function ChainSelector({
//   label,
//   value,
//   onChange,
//   disabled = false,
//   className = '',
//   excludeChain = null // Optional: to exclude a chain from options (e.g., same as source)
// }) {
//   const chainOptions = Object.entries(SUPPORTED_CHAINS)
//     .filter(([chainId]) => chainId !== excludeChain)
//     .map(([chainId, chain]) => ({
//       value: chainId,
//       label: chain.name
//     }));

//   return (
//     <div className={`space-y-2 ${className}`}>
//       <label className="text-xs opacity-70">
//         {label}
//       </label>
//       <Select
//         value={value}
//         onChange={onChange}
//         options={chainOptions}
//         placeholder="Select Chain"
//         disabled={disabled}
//       />
//     </div>
//   );
// }
// components/bridge/ChainSelector.jsx
import { Select } from '../ui/Select';
import { SUPPORTED_CHAINS } from '../constants/chain';

export function ChainSelector({
  label,
  value,
  onChange,
  disabled = false,
  className = '',
  excludeChain = null
}) {
  const chainOptions = Object.entries(SUPPORTED_CHAINS)
    .filter(([chainId]) => chainId !== excludeChain)
    .map(([_, chain]) => ({
      value: chain.id.toString(), // Ensure chain ID is a string
      label: chain.name
    }));

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs opacity-70">
        {label}
      </label>
      <Select
        value={value}
        onChange={(selectedValue) => {
          console.log('Chain selected:', selectedValue);
          onChange(selectedValue);
        }}
        options={chainOptions}
        placeholder="Select Chain"
        disabled={disabled}
      />
    </div>
  );
}