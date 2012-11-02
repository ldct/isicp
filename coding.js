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

function createPrompt(target_string, answer) {
  var $target = $("#" + target_string);
  if (!$target[0]) {
    console.error("$" + target_string + " did not match anything");
    return;
  }
  var code = cleanCode($target.text());
  var $form = $("<textarea>", {text: code});
  $target.empty().append($form);
  var $output = $("#" + target_string + "-output")
  if (!$output[0]) {
    $output = $("<div />", {id: target_string + "-output", 'class':'output'});
    $target.after($output);
  }
  if (answer) {
    var $grade = $("<div />", {id: target_string + "-grade", text: 'hi'});
    $output.after($grade);
  }
  
  var biwascheme = new BiwaScheme.Interpreter( function(e){
    console.log(e.message);
  });
  
  console.log(target_string, biwascheme);

  function update() {
    var str = editor.getValue();
    result = biwascheme.evaluate(str);
    $output.empty().append($("<span>" + result + "</span>"));
    
    if (answer) {
      if (answer == result) {
        $grade.attr({'class': 'correct-answer'}).text('\u2713');
      } else {
        $grade.attr({'class': 'wrong-answer'}).text('\u2717');
      }
    }
    console.log(biwascheme);
  }
  
  var editor = CodeMirror.fromTextArea($form[0],
  {
    "matchBrackets": true, 
    "onBlur": update
  });
  update();
}
