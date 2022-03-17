import { useDarkMode } from '../../shared-hooks/useDarkMode';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { MainLayout } from '../../ui/MainLayout';
import { Switch } from '../../ui/Switch';
import { CreateGroupConversationWidget } from '../conversation/CreateGroupConversationWidget';

export const FriendPage = () => {
  const { t } = useTypeSafeTranslation();
  const [enabled, setEnabled] = useDarkMode();
  return (
    <MainLayout
      leftPanel={
        <div className='flex flex-col h-full dark:bg-dark-500'>
          <div className='pb-1 pl-2 pt-4 flex justify-between'>
            <p>{t('common.conversations')}</p>
            <div className='flex gap-1 items-center'>
              <Switch
                onClick={(on) => {
                  if (typeof setEnabled === 'function') setEnabled(on);
                }}
                initialValue={enabled as boolean}
              />
              <CreateGroupConversationWidget />
            </div>
          </div>
          <div className='overflow-y-auto'></div>
        </div>
      }
    >
      <div className='h-full border-l-2 dark:border-gray-700'>
        friend main panel
      </div>
    </MainLayout>
  );
};
