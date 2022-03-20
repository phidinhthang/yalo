import { useTypeSafeGetQuery } from '../shared-hooks/useTypeSafeGetQuery';
import { useTypeSafeUpdateQuery } from '../shared-hooks/useTypeSafeUpdateQuery';
import { GetUserInfoResponse, User } from './api/entities';

export const useUpdateRelationship = () => {
  const getQuery = useTypeSafeGetQuery();
  const updateQuery = useTypeSafeUpdateQuery();

  const updateRelationship = (
    userId: number,
    fields: {
      isFriend?: boolean;
      meRequestFriend?: boolean;
      userRequestFriend?: boolean;
    },
    defaultCache?: GetUserInfoResponse
  ) => {
    let user: Omit<User, 'password'>;
    updateQuery(['getUserInfo', userId!], (_user) => {
      if (_user) {
        // @ts-ignore
        Object.entries(fields).map(([key, value]) => (_user[key] = value));
      } else if (!_user && defaultCache) {
        _user = defaultCache;
      }
      user = _user as any;
      return _user;
    });
    const friends = getQuery('getPaginatedFriends');
    const incomingRequests = getQuery(['getPaginatedRequests', 'incoming']);
    const outgoingRequests = getQuery(['getPaginatedRequests', 'outgoing']);
    const queryKeys = Object.keys(fields).map((field) => {
      return field === 'isFriend'
        ? 'getPaginatedFriends'
        : field === 'meRequestFriend'
        ? ['getPaginatedRequests', 'outgoing']
        : ['getPaginatedRequests', 'incoming'];
    });
    const cacheToCheckExisteds = Object.keys(fields).map((field) => {
      return field === 'isFriend'
        ? friends
        : field === 'meRequestFriend'
        ? outgoingRequests
        : incomingRequests;
    });
    queryKeys.forEach((key, index) => {
      if (Array.isArray(cacheToCheckExisteds[index])) {
        updateQuery(key as any, (cache) => {
          if (Object.values(fields)[index] === true) {
            cache.unshift(user);
          } else {
            cache = cache.filter((f: any) => f.id !== user.id);
          }
          return cache;
        });
      }
    });
  };

  return updateRelationship;
};
