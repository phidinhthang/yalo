import { CustomEmoji, BaseEmoji } from 'emoji-mart';
export interface MentionUser {
  id: string;
  name: string;
  image: string;
}

export interface EmojiMartItem extends CustomEmoji, BaseEmoji {
  emoticons: string[];
  colons: string;
  id: string;
}

export type Listener<T> = (event?: T) => void;

export type ListenerObj<T> = {
  subscribe: (listener: Listener<T>) => () => void;
  publish: (event?: T) => void;
  currentListeners: Listener<T>[];
};

export type TextInputListeners = {
  keyDown: ListenerObj<any>;
  keyUp: ListenerObj<any>;
  arrowUp: ListenerObj<any>;
  arrowDown: ListenerObj<any>;
  enter: ListenerObj<any>;
  focus: ListenerObj<any>;
};

export type SanitizeFn = (html: string) => string;
export type PolluteFn = (text: string) => string;
