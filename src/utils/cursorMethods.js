// Get index of last character of line, as on displayed DOM, not in Slate editor
export const getIndexLastCharOfLine = () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const caretIndex = range.startOffset;
  const rect = range.getBoundingClientRect();
  const container = range.startContainer;
  const lastIndex = container.length;

  for (let i = caretIndex; i < lastIndex; i++) {
    const rangeTest = document.createRange();
    rangeTest.setStart(container, i);
    const rectTest = rangeTest.getBoundingClientRect();
    // if the y is different it means the test range is in a different line
    if (rectTest.y !== rect.y) return i - 1;
  }

  return lastIndex;
};

export const getIndexFirstCharOfLine = () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const caretIndex = range.startOffset;
  const rect = range.getBoundingClientRect();
  const container = range.startContainer;
  const firstIndex = 0;

  for (let i = caretIndex; i > 0; i--) {
    const rangeTest = document.createRange();
    rangeTest.setStart(container, i);
    const rectTest = rangeTest.getBoundingClientRect();
    // if the y is different it means the test range is in a different line
    if (rectTest.y !== rect.y) return i;
  }

  return firstIndex;
};
