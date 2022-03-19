import { useMainPanelOpenStore } from '../useMainPanelOpenStore';
import { SearchPanel } from './SearchPanel';

export const FriendMainPanel = () => {
  const open = useMainPanelOpenStore().open;
  return (
    <div>
      {open === 'friend-search' ? <SearchPanel /> : null}
      {open === 'incoming-friend-request' ? 'incoming request' : null}
      {open === 'outgoing-friend-request' ? 'outgoing request' : null}
    </div>
  );
};
