// Some Constants
export const LINE_MAX_CHAR = 83;

// Vim Modes
export const INSERT_MODE = "insert";
export const NORMAL_MODE = "normal";

// Initial document value(s), [Node]
export const initialValue = [
  {
    type: "paragraph",
    children: [
      {
        text:
          "In Insert Mode, you can edit plaintext, just as you would in Vim!",
      },
    ],
  },
];
