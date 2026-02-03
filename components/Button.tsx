
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-8 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 active:scale-95 overflow-hidden";
  
  const variants = {
    primary: "bg-[#800000] text-white shadow-lg shadow-[#800000]/20 hover:shadow-[#800000]/40",
    secondary: "bg-[#fbbf24] text-[#800000] shadow-lg shadow-[#fbbf24]/20 hover:shadow-[#fbbf24]/40",
    outline: "bg-transparent border-2 border-[#800000] text-[#800000] hover:bg-[#800000]/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {variant === 'primary' && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-shimmer"></div>
      )}
      {children}
    </button>
  );
};
