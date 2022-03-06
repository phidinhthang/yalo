import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomElement = { type: 'paragraph'; children: CustomText[] };
export type CustomEmote = {
  type: 'emote';
  children: CustomText[];
  imageUrl: string;
  name: string;
};
export type MentionElement = {
  type: 'mention';
  character: string;
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  title?: boolean;
  list?: boolean;
  hr?: boolean;
  blockquote?: boolean;
  code?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement | CustomEmote | MentionElement;
    Text: CustomText;
  }
}
