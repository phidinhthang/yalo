import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useChatStore } from './useChatStore';

export const ChatBox = () => {
  const { conversationOpened, message, setMessage } = useChatStore();
  const { data: messages } = useTypeSafeQuery(
    ['getPaginatedMessages', conversationOpened!],
    { enabled: !!conversationOpened },
    [{ conversationId: conversationOpened! }]
  );
  if (!conversationOpened) {
    return <div>not opened</div>;
  }
  return (
    <div>
      <div>
        {messages?.map((m) => (
          <div className='flex'>
            <div>{m.creator}</div>
            <div>{m.text}</div>
            <div>{m.createdAt}</div>
          </div>
        ))}
      </div>
      <div>
        <input value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
    </div>
  );
};
