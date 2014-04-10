# Interactive SICP

![screenshot](https://raw.github.com/zodiac/isicp/master/images/screenshot.png)

Structure and Interpretation of Computer Programs now in an interactive textbook form! 

Click on (almost) any code fragment to edit. Ctrl-Enter will re-run the script.

## Contributing

NOTE: a lot of the code lives in a separate repository, [web-worker-interpreter](github.com/yuanchenyang/web-worker-interpreter)

This project is a work-in-progress and we need your help!

- Report any bugs, typos etc that you find
- Mark-up more code fragments and exercises! I'm currently up to chapter 2-2
- Write more exercise autograders!
- Add new features!

## todo

- Display hints as to why user did not pass an exercise
- Make code changes persist between page reloads by linking to a google account

## Contributing

iSICP is built on the [web-worker-interpreter/coding.js](https://github.com/yuanchenyang/web-worker-interpreter) library. We use the [CodeMirror](http://codemirror.net/) editor and a custom scheme interpreter.

Most of the prompts in the book are defined like so.

```html
<div id="scheme-times-size">
(* 5 size)
</div>
<script> 
prompt("scheme-times-size", ["scheme-define-size"]);
</script>
```

the div contains the initial text. The second argument to ``prompt`` is optional and specifies dependencies.

## Internals



#### makeEditable

makeEditable(_editor) converts the div with id _editor into a CodeMirror editor. CodeMirror emits a blur event when the editor is unfocused; we additionally emit this event when ctrl-enter is pressed.

#### no_output_frozen_prompt

same as makeEditable, except editing is disabled. Used for exercises and the like where user should not be able to cheat in that way.

#### eval_scheme

This is for running custom autograder code, and returns a jQuery deferred object; consume it by calling its ``.then(function(res){...})`` method and pasing a callback of one argument (the result of the execution).
