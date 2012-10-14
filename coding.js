var biwascheme = new BiwaScheme.Interpreter( function(e){
  console.log(e.message);
});

function getCodeInDiv(target) { //look for an editor
  return;
}

function cleanCode(code) {
  return code.replace(/^\n/, "").replace(/\n*$/, "").replace(/\s*\n/g, "\n");
}

function createPrompt(target_string, answer) {
  var target = $(target_string);
  var code = cleanCode(target.text());
  console.log(target_string, code);
  target.empty();
  var form = $("<textarea>", {text: code});
  target.append(form);
  
  
  if (answer) {
    grade = $("<div />", {id: target_string.replace("#", "") + "-grade", text: 'hi'});
    $(target_string + "-output").after(grade);
  }
  
  function update() {
    var str = editor.getValue();
    target.find(".output").empty();
    result = biwascheme.evaluate(str);
    $(target_string + "-output").empty().append($("<span>" + result + "</span>"));
    
    if (answer && answer == result) {
      $(target_string + "-grade").attr({'class': 'correct-answer'}).text('\u2713');
    } else {
      $(target_string + "-grade").attr({'class': 'wrong-answer'}).text('\u2717');
    }
  }
  
  var editor = CodeMirror.fromTextArea(form[0],
  {
    "matchBrackets": true, 
    "onBlur": update
  });
  update();
}

function attachGrading(target_string, answer) {


  $("#" + target_string).change(function() {
    alert("change!")

  });
}
