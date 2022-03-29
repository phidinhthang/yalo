export function getTextFromAtToCaret() {
  const range = getRangeFromAtToCaret();

  if (!range) return null;

  const text = range.text.substring(range.begin, range.end);

  return text || null;
}

export function deleteTextFromAtToCaret() {
  const range = getRangeFromAtToCaret();
  if (!range) return;

  // @ts-ignore
  range.element.deleteData(range.begin, range.end - range.begin);
}

function getRangeFromAtToCaret() {
  const elementWithFocus = getElementWithFocus();

  if (!elementWithFocus) {
    return null;
  }

  const { element, caretOffset } = elementWithFocus;
  const text: any = element.textContent;
  const lastAt = text.lastIndexOf('@');

  if (
    lastAt === -1 ||
    lastAt >= caretOffset ||
    (lastAt !== 0 && text[lastAt - 1] !== ' ')
  ) {
    return null;
  }

  return { begin: lastAt, end: caretOffset, text, element };
}

export function getElementWithFocus() {
  const element = getSelectionStart();

  if (element === null) {
    return null;
  }

  let caretOffset = 0;
  if (typeof window.getSelection != 'undefined') {
    const range = window.getSelection()!.getRangeAt(0);
    const preCaretRange = range!.cloneRange();
    preCaretRange?.selectNodeContents(element);
    preCaretRange?.setEnd(range!.endContainer, range!.endOffset);
    caretOffset = preCaretRange!.toString().length;
  } else if (
    // @ts-ignore
    typeof document.selection != 'undefined' &&
    // @ts-ignore
    document.selection.type != 'Control'
  ) {
    // @ts-ignore
    const textRange = document.selection.createRange();
    // @ts-ignore
    const preCaretTextRange = document.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint('EndToEnd', textRange);
    caretOffset = preCaretTextRange.text.length;
  }

  return { element, caretOffset };
}

function getSelectionStart() {
  const node = document.getSelection()?.anchorNode;
  return node?.nodeType == 3 ? node : null;
}
