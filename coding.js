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

var biwascheme = new BiwaScheme.Interpreter( function(e){
  console.log(e.message);
});

function init(target_string) {

// check that $target exists, turn it into a $form, attach an $output
// and add $target, $form, and $output to global scope

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

function attachAnswer(target_string, answer) {
  sOf[target_string].answer = answer;
  var $grade = $("<div />", {id: target_string + "-grade", text: 'hi'});

  sOf[target_string].$output.after($grade);
  $grade.attr({'class': 'wrong-answer'}).text('\u2717');
  
  sOf[target_string].$grade = $grade;
}

function update(target_string) {
  resetTopEnv();
  result = biwascheme.evaluate(sOf[target_string].editor.getValue());
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

function createPrompt(target_string) {
  
  init(target_string);
  update(target_string);
}

console.log(sOf);
