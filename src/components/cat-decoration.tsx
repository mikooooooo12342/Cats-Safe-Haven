
import React from 'react';
import { Cat, Heart, Fish } from 'lucide-react';

interface CatDecorationProps {
  variant?: 'standard' | 'minimal' | 'playful';
  className?: string;
}

export const CatDecoration: React.FC<CatDecorationProps> = ({ 
  variant = 'standard',
  className = '' 
}) => {
  // Different decoration styles
  if (variant === 'minimal') {
    return (
      <div className={`absolute w-full h-full pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute top-10 right-12 text-catOrange opacity-20 animate-pulse">
          <Cat size={24} />
        </div>
        <div className="absolute bottom-12 left-10 text-primary opacity-20 animate-pulse" style={{ animationDelay: '0.7s' }}>
          <Heart size={20} />
        </div>
      </div>
    );
  }
  
  if (variant === 'playful') {
    return (
      <div className={`absolute w-full h-full pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute top-16 right-[10%] text-catOrange opacity-20 animate-float">
          <Cat size={28} />
        </div>
        <div className="absolute top-32 left-[15%] text-primary opacity-20 animate-float" style={{ animationDelay: '1.2s' }}>
          <Heart size={32} />
        </div>
        <div className="absolute bottom-24 right-[20%] text-primary opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>
          <Heart size={24} />
        </div>
        <div className="absolute bottom-40 left-[25%] text-catOrange opacity-20 animate-float" style={{ animationDelay: '0.8s' }}>
          <Cat size={26} style={{ transform: 'rotate(15deg)' }} />
        </div>
        <div className="absolute top-[40%] right-[8%] text-catOrange/30 animate-float" style={{ animationDelay: '1.5s' }}>
          <Fish size={20} />
        </div>
      </div>
    );
  }
  
  // Standard decoration (default)
  return (
    <div className={`absolute w-full h-full pointer-events-none overflow-hidden ${className}`}>
      <div className="absolute top-14 right-[12%] text-catOrange opacity-20 animate-pulse">
        <Cat size={26} />
      </div>
      <div className="absolute bottom-20 left-[14%] text-catOrange opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
        <Cat size={24} style={{ transform: 'rotate(15deg)' }} />
      </div>
      <div className="absolute top-[30%] right-[18%] text-primary opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}>
        <Heart size={28} />
      </div>
      <div className="absolute bottom-[35%] left-[20%] text-primary opacity-20 animate-pulse" style={{ animationDelay: '0.7s' }}>
        <Heart size={22} />
      </div>
    </div>
  );
};
