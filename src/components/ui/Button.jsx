// import React from 'react';

// const variants = {
//   default: 'hover:bg-gray-300',
//   outline: 'border border-gray-400 text-gray-400 hover:bg-gray-400/10',
// };

// const sizes = {
//   default: 'h-10 px-4 py-2',
//   sm: 'h-8 px-3 py-1',
//   lg: 'h-12 px-6 py-3',
// };

// export function Button({
//   className = '',
//   variant = 'default',
//   size = 'default',
//   disabled = false,
//   children,
//   ...props
// }) {
//   return (
//     <button
//       className={`
//         inline-flex items-center justify-center
//         rounded-lg
//         font-medium
//         transition-colors
//         focus-visible:outline-none
//         focus-visible:ring-2
//         focus-visible:ring-gray-400
//         disabled:pointer-events-none
//         disabled:opacity-50
//         ${variants[variant]}
//         ${sizes[size]}
//         ${className}
//       `}
//       disabled={disabled}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }
import React from 'react';

const variants = {
  default: 'hover:text-white hover:glow',
  outline: 'border border-gray-400 text-gray-400 hover:text-white hover:glow',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 py-1',
  lg: 'h-12 px-6 py-3',
};

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-lg
        font-medium
        transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-gray-400
        disabled:pointer-events-none
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
