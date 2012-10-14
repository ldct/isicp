var biwascheme = new BiwaScheme.Interpreter( function(e){
  console.log(e.message);
});

function getCodeInDiv(target) { //look for an editor
  return;
}

function cleanCode(code) {
  return code.replace(/^\n/, "").replace(/\n*$/, "").replace(/\s*\n/g, "\n");
}

function createPrompt(target_string) {
  var target = $(target_string);
  var code = cleanCode(target.text());
  console.log(target_string, code);
  target.empty();
  var form = $("<textarea>", {text: code});
  target.append(form);
  
  function update() {
    var str = editor.getValue();
    target.find(".output").empty();
    result = biwascheme.evaluate(str);
    $(target_string + "-output").empty().append($("<span>" + result + "</span>"));
  }
  
  var editor = CodeMirror.fromTextArea(form[0],
  {
    "matchBrackets": true, 
    "onBlur": update
  });
  update();
}
