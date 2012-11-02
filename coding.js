var biwascheme = new BiwaScheme.Interpreter( function(e){
  console.log(e.message);
});

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
  $target.empty();
  var $form = $("<textarea>", {text: code});
  $target.append($form);
  var $output = $("#" + target_string + "-output")
  
  
  if (answer) {
    var $grade = $("<div />", {id: target_string + "-grade", text: 'hi'});
    $output.after($grade);
  }
  
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
  }
  
  var editor = CodeMirror.fromTextArea($form[0],
  {
    "matchBrackets": true, 
    "onBlur": update
  });
  update();
}
