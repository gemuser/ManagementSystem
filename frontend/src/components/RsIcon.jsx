import React from 'react';

const RsIcon = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 3h8a4 4 0 0 1 0 8h-4l6 6" />
      <path d="M6 11h8" />
      <path d="M6 21V3" />
    </svg>
  );
};

export default RsIcon;
