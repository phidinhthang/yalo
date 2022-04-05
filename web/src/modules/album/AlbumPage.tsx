import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../ui/Avatar';
import { MainLayout } from '../../ui/MainLayout';

const AlbumPage = () => {
  const { data: notifications } = useTypeSafeQuery('getPaginatedNotifications');
  const { mutate } = useTypeSafeMutation('markReadNotifications');
  console.log('notifications ', notifications);
  const readNotifications = notifications?.filter((n) => n.status === 1);
  const unreadNotifications = notifications?.filter((n) => n.status === 0);

  React.useEffect(() => {
    setTimeout(() => {
      mutate([], {
        onSuccess: () => console.log('read notifications'),
      });
    }, 5000);
  }, []);

  return (
    <MainLayout
      leftPanel={
        <div className=''>
          <h3 className='font-semibold text-2xl p-3'>Notification</h3>
          {readNotifications?.length ? <p>read</p> : null}
          <div>
            {readNotifications?.map((n) => (
              <div key={n.id} className='flex gap-2 p-2'>
                <div>
                  {n.actors.map((a) => (
                    <Avatar
                      src={a.avatarUrl}
                      username={a.username}
                      key={a.id}
                      size='md'
                    />
                  ))}
                </div>
                <div>
                  <div>
                    <span className='font-semibold'>
                      {n.actors.map((a) => a.username).join(', ')} &nbsp;
                    </span>
                    {n.entityType.entity === 'post' &&
                    n.entityType.description === 'new_post_created' ? (
                      <span>create at post</span>
                    ) : null}
                  </div>
                  <div>{n.display}</div>
                </div>
              </div>
            ))}
            {unreadNotifications?.length ? <p>unread</p> : null}
            <div>
              {unreadNotifications?.map((n) => (
                <div key={n.id} className='flex gap-2 p-2'>
                  <div>
                    {n.actors.map((a) => (
                      <Avatar
                        src={a.avatarUrl}
                        username={a.username}
                        key={a.id}
                        size='md'
                      />
                    ))}
                  </div>
                  <div>
                    <div>
                      <span className='font-semibold'>
                        {n.actors.map((a) => a.username).join(', ')} &nbsp;
                      </span>
                      {n.entityType.entity === 'post' &&
                      n.entityType.description === 'new_post_created' ? (
                        <span>create at post</span>
                      ) : null}
                    </div>
                    <div>{n.display}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <Outlet />
    </MainLayout>
  );
};

export default AlbumPage;
