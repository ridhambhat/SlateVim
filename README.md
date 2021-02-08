![SlateVim](https://socialify.git.ci/ridhambhat/SlateVim/image?description=1&font=Raleway&issues=1&language=1&stargazers=1&theme=Light)

<br>

## 📖 Introduction

> A shared vim editor built on slate.js for the enthusiasts out there!

Collaborative tools are the need of the hour. Services like google docs work great, but developers sometimes need a quick share and an environment they are used to. Here is where <b>SlateVim</b> comes in. 

Used making Slate.js it offers an excellent text editor along with the commands vim is famous for. It packages the power of Vim with the comfort of Google Docs into one.

## ⚙️ Preliminaries

### Installation and set up

1. Ensure that you have [`node`](https://nodejs.org/en/download/) installed.
2. Ensure that you have [`yarn`](https://yarnpkg.com/getting-started/install) installed.

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

## 👨‍💻 Command Summary

### Normal Mode

Adapted from [Vim Cheat Sheet](https://vim.rtorr.com/).

Switch mode

|Action|Command|
|------|-------|
|Change to Insert Mode|`i`|

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
|Delete (cut) from cursor position to end of word|`de`|
|Delete (cut) from cursor position backwards to start of word|`db`|
|Delete (cut) from cursor position to end of line|`D` or `d$`|
|Delete (cut) from cursor position to start of line|`d0`|
|Delete (cut) single character|`x`|
|Cut line and enter Insert mode|`cc`|
|Cut from position to start of next word, then enters Insert Mode|`cw`|
|Cut from position to end of word, then enters Insert Mode|`ce`|
|Delete (cut) from cursor position backwards to start of word, then enters Insert Mode|`cb`|
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
|Indent line one shiftwidth (4 spaces)|`>>`|
|Dedent line one shiftwidth (4 spaces)|`<<`|

Undo, redo

|Action|Command|
|------|-------|
|Undo|`u`|
|Redo|`Ctrl + r`|

### Insert Mode

Switch mode

|Action|Command|
|------|-------|
|Change to Normal Mode|`Escape`|

## 🐱‍👤 Challenges we ran into

- Handling change events in Slate.js to sync text across users.
- GraphQL on AWS Amplify gave some trouble while storing the user data.

## 🏆 Accomplishments that we are proud of

- A working demo at the end of the week while working with new technologies.
- Integrating GraphQL swiftly was a great experience.

## 🧭 What we learnt

- After digging into the documentation and codebase of Slate.js, we are beginning to understand how it works from the inside.
- Have a better understanding of AWS Amplify and serverless technology.
- Using GraphQL firsthand introduced us to a new way of working with the backend.

## 📜 LICENSE

[Apache License](https://github.com/ridhambhat/SlateVim/blob/main/LICENSE)

