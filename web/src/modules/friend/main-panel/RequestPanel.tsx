import { useUpdateRelationship } from '../../../lib/useUpdateRelationship';
import { useTypeSafeMutation } from '../../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../../ui/Avatar';
import { Button } from '../../../ui/Button';

interface FriendRequestPanelProps {
  type: 'incoming' | 'outgoing';
}

export const FriendRequestPanel = ({ type }: FriendRequestPanelProps) => {
  const { data: requests, isLoading } = useTypeSafeQuery(
    ['getPaginatedRequests', type],
    {},
    [type]
  );
  const updateRelationship = useUpdateRelationship();
  const { mutate: acceptFriendRequest } = useTypeSafeMutation(
    'acceptFriendRequest'
  );
  const { mutate: cancelFriendRequest } = useTypeSafeMutation(
    'cancelFriendRequest'
  );
  return (
    <div className='p-5 flex flex-wrap justify-center'>
      {!requests?.length && !isLoading ? (
        <h4 className='font-bold text-xl'>No results</h4>
      ) : null}
      {requests?.map((r) => (
        <div className='flex gap-3 basis-11/12 md:basis-1/2'>
          <Avatar username={r.username} src={r.avatarUrl} size='lg' />
          <div className='flex justify-between flex-auto'>
            <div>
              <p>{r.username}</p>
            </div>
            <div className='flex gap-3 items-center'>
              {type === 'incoming' ? (
                <Button
                  onClick={() => {
                    acceptFriendRequest([r.id], {
                      onSuccess: () => {
                        updateRelationship(
                          r.id,
                          {
                            isFriend: true,
                            userRequestFriend: false,
                            meRequestFriend: false,
                          },
                          {
                            ...r,
                            meRequestFriend: false,
                            userRequestFriend: false,
                            isFriend: true,
                          }
                        );
                      },
                    });
                  }}
                >
                  Accept
                </Button>
              ) : null}
              <Button
                variant='secondary'
                onClick={() => {
                  cancelFriendRequest([r.id], {
                    onSuccess: () => {
                      updateRelationship(
                        r.id,
                        {
                          isFriend: false,
                          userRequestFriend: false,
                          meRequestFriend: false,
                        },
                        {
                          ...r,
                          meRequestFriend: false,
                          userRequestFriend: false,
                          isFriend: true,
                        }
                      );
                    },
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
