import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { useChatStore } from './useChatStore';

export const ChatBox = () => {
  const { conversationOpened, message, setMessage } = useChatStore();
  const { data: messages } = useTypeSafeQuery(
    ['getPaginatedMessages', conversationOpened!],
    { enabled: !!conversationOpened },
    [{ conversationId: conversationOpened! }]
  );
  const { mutate } = useTypeSafeMutation('createMessage');
  const updateQuery = useTypeSafeUpdateQuery();
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
        <button
          onClick={() => {
            mutate([{ conversationId: conversationOpened, text: message }], {
              onSuccess: (data) => {
                if ('id' in data) {
                  updateQuery(
                    ['getPaginatedMessages', conversationOpened],
                    (messages) => {
                      if (!messages) return messages;
                      messages.push(data);
                      return messages;
                    }
                  );
                  updateQuery('getPaginatedConversations', (conversations) => {
                    conversations
                      ?.filter((c) => c.id === data.conversation)
                      .map((c) => {
                        c.lastMessage = data;
                        return c;
                      });

                    return conversations;
                  });
                }
                setMessage('');
              },
            });
          }}
        >
          send
        </button>
      </div>
    </div>
  );
};
