import { useMainPanelOpenStore } from '../useMainPanelOpenStore';
import { FriendRequestPanel } from './RequestPanel';
import { SearchPanel } from './SearchPanel';

export const FriendMainPanel = () => {
  const open = useMainPanelOpenStore().open;
  return (
    <div>
      {open === 'friend-search' ? <SearchPanel /> : null}
      {open === 'incoming-friend-request' ? (
        <FriendRequestPanel type='incoming' />
      ) : null}
      {open === 'outgoing-friend-request' ? (
        <FriendRequestPanel type='outgoing' />
      ) : null}
    </div>
  );
};
