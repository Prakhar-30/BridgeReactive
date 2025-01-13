import React from 'react';

export function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  className = '',
  disabled = false
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`
        w-full
        rounded-lg
        border
        border-gray-400/30
        bg-transparent
        text-gray-400
        p-2
        focus:outline-none
        focus:ring-2
        focus:ring-gray-400
        disabled:opacity-50
        ${className}
      `}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-black text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}