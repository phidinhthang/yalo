import React from 'react';

interface SwitchProps {
  onClick?: (isOn: boolean) => void;
  initialValue?: boolean;
}

export const Switch = ({ onClick, initialValue }: SwitchProps) => {
  const [onMode, setOnMode] = React.useState(initialValue);
  const toggleClass = ' transform translate-x-6';
  return (
    <div
      className='md:w-14 md:h-7 w-12 h-6 flex items-center bg-gray-200 dark:bg-dark-300 rounded-full p-1 cursor-pointer'
      onClick={() => {
        onClick?.(!onMode);
        setOnMode((on) => !on);
      }}
    >
      {/* Switch */}
      <div
        className={
          'bg-white dark:bg-dark-200 md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform duration-300 ease-in-out' +
          (!onMode ? null : toggleClass)
        }
      ></div>
    </div>
  );
};
