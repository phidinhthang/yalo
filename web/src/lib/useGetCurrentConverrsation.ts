import { useChatStore } from '../modules/chat/useChatStore';
import { useTypeSafeQuery } from '../shared-hooks/useTypeSafeQuery';
import { Conversation, User } from './api/entities';

type DetailedConversation = Conversation & {
  typingMembers?: Array<{ typingId: string; user: Omit<User, 'password'> }>;
};

export const useGetCurrentConversation = () => {
  const { conversationOpened } = useChatStore();
  const { data: conversation } = useTypeSafeQuery<
    'getConversation',
    DetailedConversation
  >(['getConversation', conversationOpened!], {
    enabled: !!conversationOpened,
  });
  return conversation;
};
