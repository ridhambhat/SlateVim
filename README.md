# SlateVim

A shared Vim editor built on Slate.js for enthusiasts out there!
## Introduction

A simple collaborative Vim editor built using Slate.js, on React.

## Preliminaries

### Installation and set up

1. Ensure that you have [`node`](https://nodejs.org/en/download/) installed.
2. Ensure that you have [`yarn](https://yarnpkg.com/getting-started/install) installed.

```sh
> npm install yarn
> yarn --version
1.22.4
```

3. Clone the repository.

```sh
> git clone https://github.com/ridhambhat/SlateVim.git && cd SlateVim
```

4. Install required dependencies with `yarn`.

```sh
> yarn install
```

5. Start development client.

```sh
> npm start
```

6. Navigate to http://localhost:3000.

## Command Summary

### Normal Mode

Adapted from [Vim Cheat Sheet](https://vim.rtorr.com/).

Copy, cut, paste

|Action|Command|
|------|-------|
|Yank (copy) line|`yy`|
|Yank (copy) from cursor position to start of next word|`yw`|
|Yank (copy) from cursor position to end of line|`y$`|
|Yank (copy) from cursor position to start of line|`y0`|
|Paste after cursor|`p`|
|Paste before cursor|`P`|
|Delete (cut) line|`dd`|
|Delete (cut) from cursor position to start of next word|`dw`|
|Delete (cut) from cursor position to end of line|`D` or `d$`|
|Delete (cut) from cursor position to start of line|`d0`|
|Delete (cut) single character|`x`|
|Cut line and enter Insert mode|`cc`|
|Cut to end of line and enter Insert mode|`C`|

Cursor movement

|Action|Command|
|------|-------|
|Move cursor left|`h`|
|Move cursor down|`j`|
|Move cursor up|`k`|
|Move cursor right|`l`|
|Jump forwards to start of word|`w`|
|Jump forwards to end of word|`e`|
|Jump backward to start of word|`b`|
|Jump to start of line|`0`|
|Jump to end of line|`$`|
|Jump to start of document|`gg`|
|Jump to start of last line|`G`|

Indenting, dedenting

|Action|Command|
|------|-------|
|Indent line one shiftwidth|`>>`|
|Dedent line one shiftwidth|`<<`|

Undo, redo
|Action|Command|
|------|-------|
|Undo|`u`|
|Redo|`Ctrl + r`|

### Insert Mode

TBC
