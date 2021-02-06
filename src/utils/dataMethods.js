import { Node } from "slate";

// Serialize JSON to string
export const serialize = (value) => {
  return value.map((node) => Node.string(node)).join("\n");
};

// Deserialize string to JSON
export const deserialize = (string) => {
  return string.split("\n").map((line) => {
    return {
      children: [{ text: line }],
    };
  });
};
