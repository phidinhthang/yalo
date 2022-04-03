import { ReactionIcon } from './ReactionIcon';
import { Icon, icons } from './ReactionPicker';

interface ReactionStatsProps extends React.ComponentPropsWithoutRef<'div'> {
  reactions: Icon[];
  numReactions: number;
  placement?: 'left' | 'right';
}

export const ReactionStats: React.FC<ReactionStatsProps> = ({
  numReactions,
  reactions,
  placement = 'left',
  className = '',
  ...props
}: ReactionStatsProps) => {
  return (
    <div
      className={`rounded-2xl border inline-flex px-[6px] py-[2px] cursor-pointer bg-white hover:bg-gray-100 gap-1 items-center ${
        placement === 'right' ? 'flex-row-reverse' : ''
      } ${className}`}
      {...props}
    >
      <div className='flex relative gap-1'>
        {reactions.map((r) => (
          <div key={r} className='w-5 h-5'>
            <div
              className='w-full h-full'
              style={{
                backgroundImage: `url(${icons[r]})`,
                backgroundSize: '100% 100%',
              }}
            ></div>
          </div>
        ))}
      </div>
      <div>{numReactions}</div>
    </div>
  );
};
