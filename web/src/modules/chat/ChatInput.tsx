import * as React from 'react';
import {
  Editor,
  Transforms,
  Range,
  createEditor,
  Descendant,
  Text,
  NodeEntry,
  Node,
} from 'slate';
import {
  Slate,
  Editable,
  ReactEditor,
  withReact,
  RenderElementProps,
  useSlateStatic,
  RenderLeafProps,
} from 'slate-react';
import { Prism } from '../../utils/Prism';

import { CustomEmote, CustomText, MentionElement } from '../../global';
import { Portal } from '../../ui/Portal';
import { css } from '@emotion/css';
import { Button } from '../../ui/Button';
import { emojiData } from './EmojiData';
import { EmojiPicker } from './EmojiPicker';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useChatStore } from './useChatStore';

const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }];

export const ChatInput = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState<Descendant[]>(initialValue as any);
  const [target, setTarget] = React.useState<Range | undefined>();
  const [index, setIndex] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [isEmojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const { data: conversations } = useTypeSafeQuery('getPaginatedConversations');
  const { conversationOpened, message, setMessage } = useChatStore();
  const conversation = conversations?.find((c) => c.id === conversationOpened);
  const members = conversation?.members;
  const { data: me } = useTypeSafeQuery('me');
  const renderElement = React.useCallback(
    (props) => <Element {...props} />,
    []
  );
  const renderLeaf = React.useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );
  const editor = React.useMemo(
    () => withImages(withMentions(withReact(createEditor()))),
    []
  );
  const clearMsg = () => {
    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      },
    });
  };
  const decorate = React.useCallback(([node, path]: NodeEntry<Node>) => {
    const ranges: any[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = (token: any) => {
      if (typeof token === 'string') {
        return token.length;
      } else if (typeof token.content === 'string') {
        return token.content.length;
      } else {
        return token.content.reduce((l: any, t: any) => l + getLength(t), 0);
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== 'string') {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  const chars = members
    ?.map((m) => m.user.username)
    .filter((name) => name !== me?.username)
    .filter((c) => c.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, 10);

  React.useEffect(() => {
    try {
      if (target && chars && chars.length > 0) {
        const el = ref.current;
        const domRange = ReactEditor.toDOMRange(editor, target);
        const rect = domRange.getBoundingClientRect();
        if (el) {
          el.style.bottom = `${24}px`;
          el.style.left = `${rect.left + window.pageXOffset}px`;
        }
      }
    } catch (e) {
      console.log('hello ', e);
    }
  }, [chars?.length, editor, index, search, target]);
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent, editor: ReactEditor) => {
      const { selection } = editor;
      if (target && chars) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          case 'ArrowUp':
            event.preventDefault();
            const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          case 'Tab':
          case 'Enter':
            event.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, chars[index]);
            setTarget(undefined);
            break;
          case 'Escape':
            event.preventDefault();
            setTarget(undefined);
            break;
        }
      }

      if (event.key === 'Enter') event.preventDefault();
    },
    [index, search, target]
  );

  return (
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: 'word' });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText =
              beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
            const after = Editor.after(editor, start);
            const afterRange = Editor.range(editor, start, after);
            const afterText = Editor.string(editor, afterRange);
            const afterMatch = afterText.match(/^(\s|$)/);

            if (beforeMatch && afterMatch) {
              setTarget(beforeRange);
              setSearch(beforeMatch[1]);
              setIndex(0);
              return;
            }
          }

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            let charBefore = Editor.before(editor, start, {
              unit: 'character',
            });
            const endColonRange =
              charBefore && Editor.range(editor, charBefore, start);
            const endColon =
              endColonRange && Editor.string(editor, endColonRange);
            if (endColon !== ':') return;
            console.log('end colon ', endColon);
            const wordBefore = Editor.before(editor, charBefore!, {
              unit: 'word',
            });
            const emojiNameRange =
              wordBefore && Editor.range(editor, wordBefore, charBefore);
            const emojiName =
              emojiNameRange && Editor.string(editor, emojiNameRange);
            console.log('emojiName ', emojiName);
            const _charBefore = Editor.before(editor, wordBefore!, {
              unit: 'character',
            });
            const startColonRange =
              _charBefore && Editor.range(editor, _charBefore, wordBefore);
            const startColon =
              startColonRange && Editor.string(editor, startColonRange);
            if (startColon !== ':') return;
            const emoji = emojiData.find((e) => e.name === emojiName);
            if (!emoji) return;
            const emoteElement: CustomEmote = {
              type: 'emote',
              children: [{ text: '' }],
              imageUrl: `/public${emoji.imageUrl}`,
              name: emoji.name,
            };
            Transforms.insertNodes(editor, emoteElement);
            Transforms.delete(editor, {
              at: { anchor: start, focus: _charBefore! },
            });
          }

          setTarget(undefined);
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          decorate={decorate}
          onKeyDown={(e) => onKeyDown(e, editor)}
          className='block flex-auto break-all p-1'
          placeholder='Enter some text...'
        />
        {target && chars && chars.length > 0 && (
          <Portal>
            <div
              ref={ref}
              style={{
                position: 'absolute',
                zIndex: 1,
                padding: '3px',
                background: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 5px rgba(0,0,0,.2)',
              }}
              data-cy='mentions-portal'
            >
              {chars.map((char, i) => (
                <div
                  key={char}
                  style={{
                    padding: '1px 3px',
                    borderRadius: '3px',
                    background: i === index ? '#B4D5FF' : 'transparent',
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </Portal>
        )}
        <div className='relative'>
          <Button
            onClick={() => {
              setEmojiPickerOpen(true);
            }}
            size='sm'
          >
            add
          </Button>
          {isEmojiPickerOpen ? (
            <div className='absolute bottom-full right-0 w-80'>
              <EmojiPicker
                onPicked={(emoji) => {
                  const text = { text: '' };
                  const emote: CustomEmote = {
                    type: 'emote',

                    children: [text],
                    ...emoji,
                  };
                  Transforms.insertNodes(editor, emote);
                  setEmojiPickerOpen(false);
                }}
              />
            </div>
          ) : null}
        </div>
        <Button
          size='sm'
          className='ml-2'
          onClick={() => {
            console.log(value);
            const serialized = value.map((v) => serialize(v)).join(' ');
            console.log('serialized ', serialized);
          }}
        >
          save
        </Button>
      </Slate>
  );
};

const withMentions = (editor: Editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element: RenderElementProps['element']) => {
    return element.type === 'mention' ? true : isInline(element);
  };

  editor.isVoid = (element: RenderElementProps['element']) => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  return editor;
};

const insertMention = (editor: Editor, character: string) => {
  const mention: MentionElement = {
    type: 'mention',
    character,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'mention':
      return <Mention {...props} />;

    case 'emote':
      return <Emote {...props} />;

    default:
      return (
        <div {...attributes}>
          <div
            style={{ userSelect: 'none', fontFamily: 'var(--font-primary)' }}
            contentEditable={false}
          ></div>
          <p>{children}</p>
        </div>
      );
  }
};

const Emote = ({ attributes, element, children }: RenderElementProps) => {
  element = element as Extract<
    RenderElementProps['element'],
    { type: 'emote' }
  >;

  return (
    <div style={{ display: 'inline-block' }} {...attributes}>
      {children}
      <div
        style={{
          display: 'inline-block',
          userSelect: 'none',
          width: 32,
          height: 32,
          marginLeft: 4,
          marginRight: 4,
        }}
        contentEditable={false}
      >
        <img
          style={{ objectFit: 'cover', width: 32, height: 32 }}
          src={element.imageUrl}
          alt=''
        />
      </div>
    </div>
  );
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return (
    <span
      {...attributes}
      className={css`
        font-family: var(--font-primary);
        font-weight: ${leaf.bold && 'bold'};
        font-style: ${leaf.italic && 'italic'};
        text-decoration: ${leaf.underlined && 'underline'};
        ${leaf.title &&
        css`
          display: inline-block;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0 10px 0;
        `}
        ${leaf.list &&
        css`
          padding-left: 10px;
          font-size: 20px;
          line-height: 10px;
        `}
        ${leaf.hr &&
        css`
          display: block;
          text-align: center;
          border-bottom: 2px solid #ddd;
        `}
        ${leaf.blockquote &&
        css`
          display: inline-block;
          border-left: 2px solid #ddd;
          padding-left: 10px;
          color: #aaa;
          font-style: italic;
        `}
        ${leaf.code &&
        css`
          padding: 3px;
        `}
      `}
    >
      {children}
    </span>
  );
};

const Mention = ({ attributes, children, element }: RenderElementProps) => {
  element = element as Extract<
    RenderElementProps['element'],
    { type: 'mention' }
  >;
  return (
    <span
      {...attributes}
      contentEditable={false}
      style={{
        padding: '3px 3px 2px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        borderRadius: 4,
        backgroundColor: '#eee',
        fontSize: '0.9em',
      }}
    >
      @{element.character}
      {children}
    </span>
  );
};

const withImages = (editor: Editor) => {
  const { isVoid, isInline } = editor;

  editor.isVoid = (element) => {
    return element.type === 'emote' ? true : isVoid(element);
  };
  editor.isInline = (element) => {
    return element.type === 'emote' ? true : isInline(element);
  };

  return editor;
};

const serialize = (node: RenderElementProps['element'] | CustomText) => {
  if (Text.isText(node)) {
    let string = node.text;
    return string;
  }

  const children = (node as any)?.children
    ?.filter((n: any) => typeof n.text === 'undefined' || n.text !== '')
    ?.map((n: any) => serialize(n))
    .join(' ');

  switch (node.type) {
    case 'emote':
      return `:${node.name}:`;
    case 'paragraph':
      return `${children}`;
    case 'mention':
      return `@${node.character}`;
    default:
      return `${children}`;
  }
};
