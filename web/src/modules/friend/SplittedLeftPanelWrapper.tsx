import React from 'react';
import { SvgSolidChevronDown } from '../../icons/SolidChevronDown';
import { SvgSolidChevronUp } from '../../icons/SolidChevronUp';
import { IconButton } from '../../ui/IconButton';

interface SplittedLeftPanelWrapperProps {
  children: React.ReactNode;
  label?: string;
  collapsible?: boolean;
}

export const SplittedLeftPanelWrapper = ({
  children,
  label,
  collapsible,
}: SplittedLeftPanelWrapperProps) => {
  const [isCollapsed, setCollapsed] = React.useState(false);
  return (
    <div className='border-b'>
      <div className='flex items-center'>
        {label ? <h4 className='pl-2 py-2'>{label}</h4> : null}
        {collapsible ? (
          <IconButton
            className='ml-auto'
            onClick={() => setCollapsed((collapsed) => !collapsed)}
          >
            {isCollapsed ? <SvgSolidChevronDown /> : <SvgSolidChevronUp />}
          </IconButton>
        ) : null}
      </div>
      {!isCollapsed ? <div>{children}</div> : null}
    </div>
  );
};
