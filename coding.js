//for clients to override

function focus_callback() {
}

//functional functions

function cleanCode(code) {
  return code.replace(/^\n/, "").replace(/\n*$/, "").replace(/[ \t]*\n/g, "\n").replace(/\s*$/, "");
}

function check(result) {
  //console.log(typeof(result), result);
  if (result == undefined) {
    return false;
  }
  if (typeof(result) == "object" && result.toString && result.toString() == "#<undef>") {
    return false;
  }
  return true;
}

//Biwascheme

var biwascheme = new BiwaScheme.Interpreter( function(e){
  console.log(e.message);
});

function resetTopEnv() {
  BiwaScheme.TopEnv = {};
  BiwaScheme.TopEnv["define"] = new BiwaScheme.Syntax("define");
  BiwaScheme.TopEnv["begin"] = new BiwaScheme.Syntax("begin");
  BiwaScheme.TopEnv["quote"] = new BiwaScheme.Syntax("quote");
  BiwaScheme.TopEnv["lambda"] = new BiwaScheme.Syntax("lambda");
  BiwaScheme.TopEnv["if"] = new BiwaScheme.Syntax("if");
  BiwaScheme.TopEnv["set!"] = new BiwaScheme.Syntax("set!");
}

editorOf = {};

function makeEditable(editable_string) {

  var $target = $("#" + editable_string);
  if (!$target[0]) {
    throw "$" + editable_string + " did not match anything";
  }
  
  var code = cleanCode($target.text());
  
  $target.empty();
  
  var editor = CodeMirror($target[0], {
    'value': code,
    'matchBrackets': true
  });
  
  editorOf[editable_string] = editor;
}

function linkEval(editable_string, output_string, deps) {

  var e = editorOf[editable_string];

  e.setOption('onBlur', function() {
    result = biwascheme.evaluate(e.getValue());
    $("#" + output_string).empty().append($("<span>" + result + "</span>"));
  });
}

function evaluate(target_string) {
  
  if (s.deps) {
    for (var i = 0; i < s.deps.length; i++) {
      evaluate(s.deps[i]);
    }
  }
  try {
    return biwascheme.evaluate(sOf[target_string].getCode());
  }
  catch (e) {
    return;
  }
}

function update(target_string) {

  result = evaluate(target_string);

  var s = sOf[target_string];
  
  s.$output.empty();
  
  if (check(result)) {
    s.$output.append($("<span>" + result + "</span>"));
  }
  
  if (s.answer) { //I'm thinking of removing this - haven't seen a use case
    if (s.answer == result) {
      s.$grade.attr({'class': 'correct-answer'}).text('\u2713');
    } else {
      s.$grade.attr({'class': 'wrong-answer'}).text('\u2717');
    }
  }

  if (s.pushes) {
    for (var i = 0; i < s.pushes.length; i++) {
      update(s.pushes[i]); //no cyclic dependencies allowed
    }
  }
}

function update_noeval(target_string) {

  var s = sOf[target_string];

  result = sOf[target_string].getCode();
  
  if (s.answer) {
    if (s.answer == result) {
      s.$grade.attr({'class': 'correct-answer'}).text('\u2713');
    } else {
      s.$grade.attr({'class': 'wrong-answer'}).text('\u2717');
    }
  }
}

//public methods

function createPrompt(target_string) {
  setup(target_string);
}

function createStaticPrompt(target_string) {
  setup(target_string);
  sOf[target_string].editor.setOption("readOnly", true);
}

function attachAnswer(target_string, answer) {
  
  //creates and attaches the DOM for output
  
  var $grade = $("<div />", {id: target_string + "-grade", 'class':'wrong-answer', text: '\u2717'});

  sOf[target_string].$output.after($grade);
  
  sOf[target_string].answer = answer;
  sOf[target_string].$grade = $grade;
}

function createStaticDisplay(target_string) {
//creates a codemirror object but locks it
  setup(target_string);
  
  var S = sOf[target_string];
  
  S.editor.setOption("readOnly", true);
  S.editor.setOption("onBlur", function() {});
  S.$output.hide();
}

function createNoeval(target_string) {
  setup(target_string);
  
  var S = sOf[target_string];
  
  S.editor.setValue("<your answer here>");
  S.editor.setOption("onBlur", function() {update_noeval(target_string)});
  S.editor.setOption("onFocus", function() {
    focus_callback(target_string);
    if (S.getCode() == "<your answer here>") {
      S.editor.setValue("");
    }
  });
  S.$output.hide();
}

function attachDeps(target_string, deps) {
  sOf[target_string].deps = deps;
}

function attachPushes(target_string, pushes) {
  sOf[target_string].pushes = pushes;
}

function updateAll() {
  for (ts in sOf) {
    update(ts);
  } 
}
