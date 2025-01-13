export function ChainDisplay({ chainName }) {
  return (
    <div className="space-y-2">
      <label className="text-xs opacity-70">ORIGIN CHAIN</label>
      <div className="p-1.5 border border-gray-400/30 rounded-md">
        {chainName}
      </div>
    </div>
  );
}