// components/bridge/BridgeButton.jsx
import { Button } from '../ui/Button';

export function BridgeButton({ 
  disabled, 
  onClick, 
  children 
}) {
  return (
    <Button 
       className="w-full px-3 py-2 text-gray-400 bg-black   hover:shadow-none transition-all duration-200"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
