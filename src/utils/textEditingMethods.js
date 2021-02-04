import { Transforms } from "slate";

export const paste = (editor) => {
  navigator.clipboard
    .readText()
    .then((text) => Transforms.insertText(editor, text))
    .catch((err) => console.log(err));
};

export const copy = (text) => {
  navigator.clipboard.writeText(text);
};
