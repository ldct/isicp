function resetTopEnv() {
  BiwaScheme.TopEnv = {};
  BiwaScheme.TopEnv["define"] = new BiwaScheme.Syntax("define");
  BiwaScheme.TopEnv["begin"] = new BiwaScheme.Syntax("begin");
  BiwaScheme.TopEnv["quote"] = new BiwaScheme.Syntax("quote");
  BiwaScheme.TopEnv["lambda"] = new BiwaScheme.Syntax("lambda");
  BiwaScheme.TopEnv["if"] = new BiwaScheme.Syntax("if");
  BiwaScheme.TopEnv["set!"] = new BiwaScheme.Syntax("set!");
}

function cleanCode(code) {
  return code.replace(/^\n/, "").replace(/\n*$/, "").replace(/\s*\n/g, "\n").replace(/\s*$/, "");
}

var sOf = {};

function S($target, $output, editor) {
  this.$target = $target;
  this.$output = $output;
  this.editor = editor;
}

S.prototype.getCode = function() {
  return this.editor.getValue();
}

var biwascheme = new BiwaScheme.Interpreter( function(e){
  console.log(e.message);
});

function setup(target_string) {

// check that $target exists, turn it into a $form, attach an $output
// and add $target, $output and editor to sOf

  var $target = $("#" + target_string);
  if (!$target[0]) {
    throw "$" + target_string + " did not match anything";
  }
  
  var code = cleanCode($target.text());
  var $form = $("<textarea>", {text: code});
  $target.empty().append($form);
  
  var $output = $("#" + target_string + "-output")
  if (!$output[0]) {
    $output = $("<div />", {id: target_string + "-output", 'class':'output'});
    $target.after($output);
  }
  
  var editor = CodeMirror.fromTextArea($form[0],
  {
    "matchBrackets": true, 
    "onBlur": function() {update(target_string);}
  });
  
  sOf[target_string] = new S($target, $output, editor);
}

function update(target_string) {
  resetTopEnv();
  if (deps = sOf[target_string].deps) {
    for (var i = 0; i < deps.length; i++) {
      biwascheme.evaluate(sOf[deps[i]].getCode());
    }
  }
  result = biwascheme.evaluate(sOf[target_string].getCode());
  sOf[target_string].$output.empty().append($("<span>" + result + "</span>"));
  
  if (answer = sOf[target_string].answer) {
    var $grade = sOf[target_string].$grade;
    if (answer == result) {
      $grade.attr({'class': 'correct-answer'}).text('\u2713');
    } else {
      $grade.attr({'class': 'wrong-answer'}).text('\u2717');
    }
  }
}

//public methods

function createPrompt(target_string) {
  setup(target_string);
  update(target_string);
}

function attachAnswer(target_string, answer) {
  var $grade = $("<div />", {id: target_string + "-grade", text: 'hi'});

  sOf[target_string].$output.after($grade);
  $grade.attr({'class': 'wrong-answer'}).text('\u2717');
  
  sOf[target_string].answer = answer;
  sOf[target_string].$grade = $grade;
}

function attachDeps(target_string, deps) {
  sOf[target_string].deps = deps;
  update(target_string);
}

console.log(sOf);
