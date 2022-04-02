import React from 'react';
import { Icon } from './ReactionPicker';

interface ReactionIconProps {
  icon: string;
  label: Icon;
  onSelect: (label: Icon) => void;
  className?: string;
}

export const ReactionIcon: React.FC<ReactionIconProps> = ({
  icon,
  label,
  onSelect,
  className = '',
}) => {
  const [isHovered, setHovered] = React.useState(false);

  return (
    <div
      className='relative py-[1px]'
      onMouseLeave={() => setHovered(false)}
      onMouseEnter={() => setHovered(true)}
    >
      {/* <div
        className={`absolute top-[-22px] rounded-[14px] text-[11px] font-bold capitalize left-1/2 pt-1 pb-[3px] px-[7px] text-white bg-gray-700 transform -translate-x-1/2 transition-transform duration-200 ease-in-out ${
          isHovered ? 'translate-y-[-10px] opacity-1' : 'opacity-0'
        }`}
        style={{ transition: '200ms transform cubic-bezier(0.23, 1, 0.32, 1)' }}
      >
        {label}
      </div> */}
      <div
        className={`cursor-pointer transition-transform duration-200 ease-in-out origin-bottom p-[6px] rounded-2xl ${className}`}
        onClick={() => onSelect(label)}
      >
        <div
          className='pb-[100%]'
          style={{
            backgroundImage: `url(${icon})`,
            backgroundSize: '100% 100%',
            transform: isHovered ? 'scale(1.3)' : undefined,
          }}
        ></div>
      </div>
    </div>
  );
};
