import React from 'react';
import { User } from '../lib/api/entities';

export const avatarSizeMap = {
  default: '80px',
  lg: '60px',
  md: '50px',
  sm: '40px',
  xs: '20px',
  xxs: '30px',
};

export const onlineIndicatorStyleMap = {
  default: {
    width: '15px',
    height: '15px',
    right: '2px',
    bottom: '-4px',
    borderWidth: '4px',
  },
  lg: {
    width: '12px',
    height: '12px',
    right: '2px',
    bottom: '-2px',
    borderWidth: '2px',
  },
  md: {
    width: '10px',
    height: '10px',
    right: '2px',
    bottom: '-2px',
    borderWidth: '2px',
  },
  sm: {
    width: '8px',
    height: '8px',
    right: '2px',
    bottom: '-2px',
    borderWidth: '2px',
  },
  xs: {
    width: '4px',
    height: '4px',
    right: '0px',
    bottom: '-1px',
    borderWidth: '1px',
  },
  xxs: {
    width: '6px',
    height: '6px',
    right: '1px',
    bottom: '-1px',
    borderWidth: '1px',
  },
};

export interface AvatarProps {
  src?: string;
  size?: keyof typeof onlineIndicatorStyleMap;
  className?: string;
  isOnline?: boolean;
  username?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  size = 'default',
  className = '',
  isOnline = false,
  username,
}) => {
  const sizeStyle = onlineIndicatorStyleMap[size];
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: avatarSizeMap[size], height: avatarSizeMap[size] }}
    >
      <img
        src={
          src
            ? src
            : `https://avatars.dicebear.com/api/initials/${username}.svg`
        }
        className='rounded-full w-full h-full object-cover'
      />
      {isOnline && (
        <span
          className={
            'rounded-full absolute box-content bg-green-600 border-primary-800'
          }
          style={sizeStyle}
          data-testid='online-indictor'
        ></span>
      )}
    </div>
  );
};

export const AvatarGroup = ({
  children,
}: {
  children: React.ReactElement<AvatarProps>[];
}) => {
  children = children.slice(0, 4);
  if (children.length === 4)
    return (
      <div className='flex flex-wrap' style={{ width: 50, height: 50 }}>
        {React.Children.map(children, (child, idx) => (
          <div
            key={idx}
            style={{
              flexBasis: '50%',
              marginLeft: idx === 1 || idx === 3 ? -10 : undefined,
              marginTop: idx === 2 || idx === 3 ? -13 : undefined,
            }}
          >
            {React.cloneElement(child, { size: 'xxs' })}
          </div>
        ))}
      </div>
    );

  if (children.length === 3) {
    return (
      <div
        className='flex flex-wrap items-center justify-center'
        style={{ width: 50, height: 50 }}
      >
        {React.Children.map(children, (child, idx) => (
          <div
            key={idx}
            style={{
              flexBasis: '50%',
              marginLeft: idx === 1 ? -10 : undefined,
              marginTop: idx === 2 ? -13 : undefined,
            }}
          >
            {React.cloneElement(child, { size: 'xxs' })}
          </div>
        ))}
      </div>
    );
  }

  if (children.length === 2) {
    return (
      <div
        className='flex flex-wrap justify-between'
        style={{ width: 50, height: 50 }}
      >
        {React.Children.map(children, (child, idx) => (
          <div
            key={idx}
            style={{
              flexBasis: '50%',
              marginLeft: idx === 1 ? -10 : undefined,
              marginTop: idx === 1 ? 13 : undefined,
            }}
          >
            {React.cloneElement(child, { size: 'xxs' })}
          </div>
        ))}
      </div>
    );
  }

  return <>{children}</>;
};
