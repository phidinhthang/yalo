import { EmojiMartItem } from '../types/types';

export const TRANSPARENT_GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function replaceAllTextEmojis(text: string) {
  let allEmojis = getAllEmojisFromText(text);

  const allEmojiStyle = {};

  if (allEmojis) {
    allEmojis = [...new Set(allEmojis)];

    allEmojis.forEach((emoji) => {
      // @ts-ignore
      const style = allEmojiStyle[emoji];

      if (!style) return;

      text = replaceAll(
        text,
        emoji,
        `<img
            style="${style}"
            data-emoji="${emoji}"
            src="${TRANSPARENT_GIF}"
          />`
      );
    });
  }

  return text;
}

function getAllEmojisFromText(text: string) {
  return text.match(
    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g
  );
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export function getImageEmoji(emoji: EmojiMartItem) {
  let shortNames = `${emoji.short_names}`;

  shortNames = replaceAll(shortNames, ',', ', ');

  const emojiSpanEl =
    document.querySelector(
      `[aria-label="${emoji.native}, ${shortNames}"] > span`
    ) || document.querySelector(`[aria-label="${emoji.id}"] > span`);

  if (!emojiSpanEl) return '';

  // @ts-ignore
  const style = replaceAll(emojiSpanEl.style.cssText, '"', "'");

  let dataEmoji = emoji.native;

  if (!dataEmoji && emoji.emoticons && emoji.emoticons.length > 0) {
    dataEmoji = emoji.emoticons[0];
  }

  return `<img style="${style}" data-emoji="${dataEmoji}" src="${TRANSPARENT_GIF}" />`;
}

export function replaceAllTextEmojiToString(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;

  const images = Array.prototype.slice.call(container.querySelectorAll('img'));

  images.forEach((image) => {
    container.innerHTML = container.innerHTML.replace(
      image.outerHTML,
      image.dataset.emoji
    );
  });

  return container.innerHTML;
}
