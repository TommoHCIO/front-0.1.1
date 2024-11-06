import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl p-2 relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            CTE
          </div>
        </div>
      </div>
      <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full shadow-lg" />
      <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-white rounded-full shadow-lg" />
    </div>
  );
};