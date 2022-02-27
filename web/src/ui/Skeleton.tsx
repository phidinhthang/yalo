import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  count?: number;
  circle?: boolean;
  wrapperClass?: string;
  wrapperStyle?: React.CSSProperties;
  wrapper?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  style,
  count = 1,
  circle,
  wrapperClass,
  wrapperStyle,
}) => {
  const circleSkeleton = Array.from({ length: count }).map((_, idx) => (
    <div
      key={idx}
      className={`bg-gray-300 rounded-full ${className}`}
      style={style}
    ></div>
  ));
  const rectSkeleton = Array.from({ length: count }).map((_, idx) => (
    <div
      className={`bg-gray-300 rounded-md ${className}`}
      style={style}
      key={idx}
    ></div>
  ));

  return (
    <div
      className={`flex animate-pulse flex-col gap-1 ${wrapperClass}`}
      style={wrapperStyle}
    >
      <>{circle ? circleSkeleton : rectSkeleton}</>
    </div>
  );
};
