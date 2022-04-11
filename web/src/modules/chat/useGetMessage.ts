import React from 'react';
import { Message } from '../../lib/api/entities';
import {
  useTypeSafeInfiniteQuery,
  useTypeSafeQuery,
} from '../../shared-hooks/useTypeSafeQuery';

export const useGetMessage = (
  conversationId?: number | null,
  messageId?: number | null
) => {
  const { data } = useTypeSafeInfiniteQuery(
    ['getPaginatedMessages', conversationId!],
    { enabled: !!conversationId }
  );
  const { data: conversation } = useTypeSafeQuery(
    ['getConversation', conversationId!],
    { enabled: !!conversationId }
  );
  const members = conversation?.members;
  const message = React.useMemo(() => {
    if (conversationId && messageId) {
      let result: Message | undefined;
      data?.pages?.forEach((page) => {
        result = page.data?.find((message) => {
          return message.id === messageId;
        });
      });
      return result;
    }

    return null;
  }, [conversationId, messageId]);

  const creator = React.useMemo(() => {
    if (conversationId && messageId && message) {
      return members?.find((m) => m.user.id === message?.creator);
    }
    return null;
  }, [conversationId, messageId, message]);

  return { message, creator };
};
