import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SvgOutlineChat } from '../../icons/OutlineChat';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { Button } from '../../ui/Button';

const GroupPreviewPage = () => {
  const { i18n } = useTypeSafeTranslation();
  const language = i18n.language || window.localStorage.getItem('i18nextLng');
  const languageText =
    language === 'vi' ? 'Việt Nam' : language === 'en' ? 'English' : 'unknown';
  const params = useParams();
  const inviteLinkToken = params.inviteLinkToken;
  const { data: conversation, isLoading } = useTypeSafeQuery(
    'getGroupPreview',
    { enabled: !!inviteLinkToken },
    [inviteLinkToken!]
  );
  const { mutate: joinGroup } = useTypeSafeMutation('joinGroupByLink');

  return (
    <div className='bg-gray-100 h-screen'>
      <div className='w-full h-16 flex justify-between items-center px-16 shadow-md bg-white'>
        <h1 className='text-[#0068FF] text-4xl font-semibold'>Yalo</h1>
        <div className='flex gap-3'>
          <p>Language:</p>
          <p className='font-semibold text-blue-500'>{languageText}</p>
        </div>
      </div>
      <div className='w-full max-w-[960px] mx-auto p-10 bg-white mt-12 rounded-lg'>
        <div className='flex justify-between'>
          <div className='flex items-start gap-6'>
            <div className='w-20 h-20 overflow-hidden rounded-full'>
              <img src='/img/group-avatar.png' className='object-fit' />
            </div>
            <div>
              <h2 className='text-2xl font-semibold mb-2'>
                {conversation?.title}
              </h2>
              <p className='text-lg'>Group</p>
            </div>
          </div>
          <div className='w-60'>
            <Button
              size='lg'
              fullWidth
              loading={isLoading}
              onClick={() => {
                joinGroup([inviteLinkToken!], {
                  onSuccess: (data: any) => {
                    toast.success('join successfully!');
                    window.location.href = '/';
                  },
                });
              }}
            >
              <div className='flex gap-3 items-center'>
                <SvgOutlineChat />
                <span>Join group</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPreviewPage;
