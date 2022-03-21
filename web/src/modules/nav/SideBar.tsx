import { NavLink } from 'react-router-dom';
import { SvgOutlineChat } from '../../icons/OutlineChat';
import { SvgOutlineClock } from '../../icons/OutlineClock';
import { SvgOutlineCog } from '../../icons/OutlineCog';
import { SvgOutlineContact } from '../../icons/OutlineContact';
import { SvgSolidChat } from '../../icons/SolidChat';
import { SvgSolidClock } from '../../icons/SolidClock';
import { SvgSolidCog } from '../../icons/SolidCog';
import { SvgSolidContact } from '../../icons/SolidContact';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { AvatarMenu } from './AvatarMenu';

export const SideBar = () => {
  const isDesktopScreen = useIsDesktopScreen();

  return (
    <div className='w-16 h-full flex flex-col items-center shadow-md bg-blue-500 dark:bg-gray-800 text-white'>
      <div className='flex items-center justify-center pt-3 mt-2 mb-3'>
        <AvatarMenu />
      </div>

      <NavItem to='/' activeChildren={<SvgSolidChat className='w-8 h-8' />}>
        <SvgOutlineChat className='w-8 h-8' />
      </NavItem>
      <NavItem
        to={isDesktopScreen ? '/f' : '/@f'}
        activeChildren={<SvgSolidContact className='w-7 h-7' />}
      >
        <SvgOutlineContact className='w-7 h-7' />
      </NavItem>
      <NavItem to='/a' activeChildren={<SvgSolidClock className='w-7 h-7' />}>
        <SvgOutlineClock className='w-7 h-7' />
      </NavItem>
      <NavItem to='/s' activeChildren={<SvgSolidCog className='w-7 h-7' />}>
        <SvgOutlineCog className='w-7 h-7' />
      </NavItem>
    </div>
  );
};

interface NavItemProps extends React.ComponentPropsWithoutRef<'a'> {
  to: string;
  activeChildren: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({
  children,
  activeChildren,
  to,
  ...props
}) => {
  return (
    <NavLink
      className={(ctx) =>
        `flex items-center justify-center w-full h-16 hover:bg-blue-400 ${
          ctx.isActive ? 'bg-blue-700 hover:bg-blue-700 dark:bg-gray-900' : ''
        }`
      }
      to={to}
      {...props}
    >
      {(ctx) => (ctx.isActive ? activeChildren : children)}
    </NavLink>
  );
};
