import { NavLink } from 'react-router-dom';
import { SvgOutlineChat } from '../../icons/OutlineChat';
import { SvgOutlineContact } from '../../icons/OutlineContact';
import { SvgSolidChat } from '../../icons/SolidChat';
import { SvgSolidContact } from '../../icons/SolidContact';
import { AvatarMenu } from './AvatarMenu';

export const SideBar = () => {
  return (
    <div className='w-16 h-full flex flex-col items-center shadow-md bg-blue-500 dark:bg-gray-800 text-white'>
      <div className='flex items-center justify-center pt-3 mt-2 mb-3'>
        <AvatarMenu />
      </div>

      <NavItem to='/' activeChildren={<SvgSolidChat className='w-8 h-8' />}>
        <SvgOutlineChat className='w-8 h-8' />
      </NavItem>
      <NavItem to='/f' activeChildren={<SvgSolidContact className='w-7 h-7' />}>
        <SvgOutlineContact className='w-7 h-7' />
      </NavItem>
    </div>
  );
};

interface NavItemProps {
  to: string;
  activeChildren: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ children, activeChildren, to }) => {
  return (
    <NavLink
      className={(ctx) =>
        `flex items-center justify-center w-full h-16 hover:bg-blue-400 ${
          ctx.isActive ? 'bg-blue-700 hover:bg-blue-700 dark:bg-gray-900' : ''
        }`
      }
      to={to}
    >
      {(ctx) => (ctx.isActive ? activeChildren : children)}
    </NavLink>
  );
};
