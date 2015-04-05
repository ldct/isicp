# Interactive SICP

![screenshot](https://raw.github.com/zodiac/isicp/master/images/screenshot.png)

Structure and Interpretation of Computer Programs now in an interactive textbook form!

Click on (almost) any code fragment to edit. Ctrl-Enter will re-run the script.

## Contributing

NOTE: a lot of the code lives in a separate repository, [web-worker-interpreter](https://github.com/yuanchenyang/web-worker-interpreter)

This project is a work-in-progress and we need your help!

- Report any bugs, typos etc that you find
- Mark-up more code fragments and exercises! I'm currently in the middle of chapter 2-2
- Write more exercise autograders!
- Add new features!

## todo

- Display hints as to why user did not pass an exercise
- Make code changes persist between page reloads by linking to a google account

## Contributing

iSICP is built on the [web-worker-interpreter/coding.js](https://github.com/yuanchenyang/web-worker-interpreter) library. We use the [CodeMirror](http://codemirror.net/) editor and a custom scheme interpreter.

If you just wish to help port more of SICP to this site, here is how to create an interactive code fragment.

```html
<div id="scheme-times-size">
(* 5 size)
</div>
<script>
prompt("scheme-times-size", ["scheme-define-size"]);
</script>
```

the div contains the initial text. The second argument to ``prompt`` is optional and specifies dependencies.
