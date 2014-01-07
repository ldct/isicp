# Interactive SICP

[tree/master/isicp](https://github.com/zodiac/appspot-grading/tree/master/isicp)

![screenshot](https://raw.github.com/zodiac/appspot-grading/master/isicp/images/screenshot.png)

Structure and Interpretation of Computer Programs now in an interactive textbook form! 

Click on (almost) any code fragment to edit. Ctrl-Enter will re-run the script.

## Contributing

This project is a work-in-progress and we need your help!

- Report any bugs, typos etc that you find
- Mark-up more code fragments and exercises! I'm currently up to chapter 2-2
- Write more exercise autograders!
- Add new features!

## todo

- Display hints as to why user did not pass an exercise
- Make code changes persist between page reloads by linking to a google account

## API

Most of the prompts in the book are defined like so.

```html
<div id="scheme-times-size">
(* 5 size)
</div>
<script> 
prompt("scheme-times-size", ["scheme-define-size"]);
</script>
```

the div contains the initial text. The second argument to ``prompt`` is optional and specifies dependencies. Autograded input is written as such

```html
<div class='exercise'>

<p> <b> Exercise 1.2. </b>  Translate the following expression into prefix form.

$$
\frac{5 + 4 + (2 - (3 - (6 + \frac{4}{5})))}{3(6-2)(2-7)}
$$

<div id="scheme-ex-12-input" class='input'></div>

<script>
makePromptingInput("scheme-ex-12-input");
addOutput("scheme-ex-12-input");
var editor = editorOf["scheme-ex-12-input"];
editor.setOption('onBlur', function() {
  var code = "(equal? (quote " + editor.getValue() + ") " + 
      "'(/ (+ 5 4 (- 2 (- 3 (+ 6 (/ 4 5))))) (* 3 (- 6 2) (- 2 7))))";

  eval_scheme(code).then(function(res){
    if (res == "true\n") {
      $_("scheme-ex-12-input-output").empty().append($("<div class='right-answer'> \u2713 </div>"));
    } else {
      $_("scheme-ex-12-input-output").empty().append($("<div class='wrong-answer'> \u2717 </div>"));
    }
  })
});
```

## Internals

Most of the magic happens in [coding.js](https://github.com/zodiac/appspot-grading/tree/master/isicp/coding.js). We use the [CodeMirror](http://codemirror.net/) editor and a custom scheme interpreter.

#### makeEditable

makeEditable(_editor) converts the div with id _editor into a CodeMirror editor. CodeMirror emits a blur event when the editor is unfocused; we additionally emit this event when ctrl-enter is pressed.

#### no_output_frozen_prompt

same as makeEditable, except editing is disabled. Used for exercises and the like where user should not be able to cheat in that way.

#### eval_scheme

This is for running custom autograder code, and returns a jQuery deferred object; consume it by calling its ``.then(function(res){...})`` method and pasing a callback of one argument (the result of the execution).