import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <Loader2
        className={`${sizeClasses} animate-spin ${light ? 'text-amber-400' : 'text-amber-500'}`}
      />
      {text && (
        <p className={`text-xs font-medium tracking-wide ${light ? 'text-slate-300' : 'text-slate-500'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
