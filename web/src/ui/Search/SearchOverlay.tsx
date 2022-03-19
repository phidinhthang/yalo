import React, { forwardRef, ReactElement } from 'react';

export interface SearchOverlayProps {
  children: ReactElement;
  className?: string;
}

export const SearchOverlay = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute flex flex-col py-2 rounded-lg border-2 border-gray-700 border ${className}`}
      style={{
        minHeight: '144px',
        maxHeight: '50vh',
        top: '-10px',
        left: '-10px',
        right: '0px',
        // boxShadow: '-3px 4px 14px rgba(0, 0, 0, 0.7)',
        width: 'calc(100% + 20px)',
        zIndex: -1,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

SearchOverlay.displayName = 'SearchOverlay';
