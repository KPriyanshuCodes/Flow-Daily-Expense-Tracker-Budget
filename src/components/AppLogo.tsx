import React, { useState } from 'react';
import flowLogoAsset from '@/assets/images/flow_logo_1791016165796.jpg';

interface AppLogoProps {
  className?: string;
  size?: number | string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-9 h-9', size }) => {
  const [imgSrc, setImgSrc] = useState<string>(flowLogoAsset || '/flow-logo.jpg');

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-xs border border-neutral-800 bg-[#111214] flex items-center justify-center shrink-0 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src={imgSrc}
        alt="flow logo"
        className="w-full h-full object-cover scale-100"
        onError={() => {
          if (imgSrc !== '/flow-logo.jpg') {
            setImgSrc('/flow-logo.jpg');
          } else {
            setImgSrc('/pwa-192x192.png');
          }
        }}
      />
    </div>
  );
};

