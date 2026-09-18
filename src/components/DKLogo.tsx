import React from 'react';

interface DKLogoProps {
  size?: 'font' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textColor?: 'light' | 'dark';
  className?: string;
}

export const DKLogo: React.FC<DKLogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'light',
  className = ''
}) => {
  // Dimensionamento do monograma DK sem caixas ou linhas em volta
  const getDimensions = () => {
    if (typeof size === 'number') {
      return `h-[${size}px] w-auto`;
    }
    switch (size) {
      case 'font':
        return 'h-[1.1em] w-auto';
      case 'xs':
        return 'h-4 w-auto';
      case 'sm':
        return 'h-6 w-auto';
      case 'lg':
        return 'h-10 w-auto';
      case 'xl':
        return 'h-14 w-auto';
      case 'md':
      default:
        return 'h-8 w-auto';
    }
  };

  const titleSizes = {
    font: 'text-[1em]',
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const titleClass = typeof size === 'string' ? titleSizes[size] || 'text-base' : 'text-base';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* SVG puro do Monograma DK em ouro nobre, sem linhas ou molduras em volta */}
      <svg 
        viewBox="18 18 64 62" 
        className={`${getDimensions()} shrink-0 transition-transform duration-200`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(180, 83, 9, 0.3))'
        }}
      >
        <defs>
          <linearGradient id="dkGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="dkGoldAccent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Letra D com arco serifado clássico */}
        <path 
          d="M26 27 H43 C54 27 60 36 60 50 C60 64 54 73 43 73 H26 V27 Z" 
          stroke="url(#dkGoldGradient)" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Haste interna do D */}
        <line 
          x1="33" 
          y1="27" 
          x2="33" 
          y2="73" 
          stroke="url(#dkGoldGradient)" 
          strokeWidth="4.5" 
          strokeLinecap="round"
        />

        {/* Letra K com entrelaçamento sofisticado */}
        {/* Diagonal superior do K */}
        <path 
          d="M50 50 L68 28" 
          stroke="url(#dkGoldAccent)" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
        {/* Diagonal inferior do K */}
        <path 
          d="M51 47 L72 73" 
          stroke="url(#dkGoldGradient)" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {/* Ponto de brilho de lapidação sutil no centro de união do DK */}
        <circle cx="50" cy="50" r="2.8" fill="#fef08a" />
      </svg>

      {/* Exibição opcional de texto: apenas DK */}
      {showText && (
        <span 
          className={`font-serif-luxury font-bold tracking-wider ${titleClass} ${
            textColor === 'light' ? 'text-amber-200' : 'text-stone-900'
          }`}
        >
          DK
        </span>
      )}
    </div>
  );
};

