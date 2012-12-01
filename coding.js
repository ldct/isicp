"use strict";

function focus_callback() {
  //for clients to override
}

//functional functions

function arrayEq(arr1, arr2) {
  return $(arr1).not(arr2).length == 0 && $(arr2).not(arr1).length == 0
}

function cleanCode(code) {
  return code.replace(/^\n/, "").replace(/\n*$/, "").replace(/[ \t]*\n/g, "\n").replace(/\s*$/, "");
}

function check(result) {
  if (result == undefined) {
    return false;
  }
  if (typeof(result) == "object" && result.toString && result.toString() == "#<undef>") {
    return false;
  }
  return true;
}

function $_(s) { // _ to $. _: div id's $: jQuery objects; read _ as #, $_ consumes a hash and adds a $
  var ret = $("#" + s);
  if (!ret[0]) {
    throw "#" + s + " did not match anything";
  } else {
    return ret;
  }
}

////////////////////////////////////////////////////////////////////////////////

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

function beval(c) {

  try {
    return biwascheme.evaluate(c)
  } 
  catch(e) {
    return;
  }
}

var depsOf = {}

function getDeps(_editor) {
  if (depsOf[_editor]) {
    return depsOf[_editor];
  } else {
    return [];
  }
}

function evaluate(_editor) {
  
  for (var deps = getDeps(_editor), i = 0; i < deps.length; i++) {
    evaluate(deps[i]);
  }
  
  return beval(editorOf[_editor].getValue());
}

////////////////////////////////////////////////////////////////////////////////

var editorOf = {};

function makeEditable(_editor) {

  var $editor = $_(_editor);
  var code = cleanCode($editor.text());
  
  $editor.empty();
  
  var editor = CodeMirror($editor[0], {
    'value': code,
    'matchBrackets': true,
    'onFocus': function() {console.log("focus_callback" + _editor); focus_callback(_editor);}
  });
  
  editor.setOption('extraKeys', {'Ctrl-Enter': function() {
    editor.getOption("onBlur")();
  }});
  
  editorOf[_editor] = editor;
}

function makeStatic(_static) {
  makeEditable(_static);
  editorOf[_static].setOption("readOnly", 'nocursor');
  editorOf[_static].setOption("onBlur", function() {});
}

function linkEditor(_editor, _output, func) {

  var editor = editorOf[_editor];

  editor.setOption('onBlur', function() {
    $_(_output).empty().append($("<span>" + func(_editor, editor.getValue()) + "</span>"));
  });
}

////////////////////////////////////////////////////////////////////////////////

focus_callback = function(s) {
  var ts = "";
  for (var i = 0, d = getDeps(s); i < d.length; i++) {
    ts += "<br>" + d[i];
  }
  
  ts += "<br> <b>"+ s + "</b>";

  for (var i = 0, p = getPushes(s); i < p.length; i++) {
    ts += "<br>" + p[i];
  }
  $("#currently-editing").html("<tt>" + ts + "</tt>");
};

////////////////////////////////////////////////////////////////////////////////

var pushesOf = {}

function getPushes(_editor) {
  if (pushesOf[_editor]) {
    return pushesOf[_editor];
  } else {
    return [];
  }
}

///////////////////////////////////////////////////////////////////////////////

function addOutput(_e) {
  $_(_e).after($('<div>', {'id': _e + "-output", 'class': "output"}));
}

function prompt(s) {
  makeEditable(s);
  addOutput(s);
  linkEditor(s, s + "-output", function(x, y) {
    resetTopEnv();
    
    var ret = evaluate(x);
    
    if (pushesOf[s]) {
      for (var pushes = pushesOf[s], i = 0; i < pushes.length; i++) {
        editorOf[pushes[i]].getOption("onBlur")();
      }
    }
    
    var evalx = evaluate(x);
    
    if (evalx && evalx.toString && evalx.toString() == "#<undef>") {
      return "";
    }
    return evalx;
  });
}

////////////////////////////////////////////////////////////////////////////////

function answer(s, a) {
  makeStatic(s);
  $_(s).after($('<div>', {'id': s + "-input", 'class': "input"}));
  makePromptingInput(s + "-input");
  addOutput(s + "-input");
  linkEditor(s + "-input", s + "-input-output", function(x, y) {
    if (y == a) {
      return "<div class='right-answer'> \u2713 </div>";
    } else {
      return "<div class='wrong-answer'> \u2717 </div>";
    }
  });
}

function makePromptingInput(i) {
  makeChangeOnFocusInput(i, "<your input here>", "");
}

function makeChangeOnFocusInput(i, before, after) {

  makeEditable(i);

  var e = editorOf[i];
  e.setValue(before);

  var oldOnFocus = e.getOption("onFocus");
  e.setOption("onFocus", function() {
    oldOnFocus();
    if (e.getValue() == before) {
      e.setValue(after);
    }
  });
}

function makeForm(uid, right_entries, wrong_entries) {

  console.log(right_entries, wrong_entries);

  var form = $('<form>', {'id': uid});

  for (var i = 0; i < right_entries.length; i++) {
    form.append($("<input>", {type: "checkbox", id: uid + "-right-" + i, value: 'right'}));
    form.append($("<label>", {for: uid + "-right-" + i, 'html': right_entries[i]}));
    form.append($('<br>'));
  }
  
  for (var i = 0; i < wrong_entries.length; i++) {
    form.append($("<input>", {type: "checkbox", id: uid + "-wrong-" + i, value: 'wrong'}));
    form.append($("<label>", {for: uid + "-wrong-" + i, 'html': wrong_entries[i]}));
    form.append($('<br>'));
  }
  
  return form;
}

function makeMCQ(_mcq, right_entries, wrong_entries) {
  $_(_mcq).append(makeForm(_mcq + "_form", right_entries, wrong_entries));

  $_(_mcq).append($("<div>", {'class': 'p-link', 'id': _mcq + "-submit", 'html': 'submit'}));  
  addOutput(_mcq + "-submit");
  
  $_(_mcq + "-submit").click(function() {
  
    var checked = [];
    var unchecked = [];
    
    $_(_mcq + "_form").children("input:checked").each(function(i, j) {
      checked.push(j.value);
    });
    
    $_(_mcq + "_form").children("input:not(:checked)").each(function(i, j) {
      unchecked.push(j.value);
    });
    
    var $out = $_(_mcq + "-submit-output");
    
    console.log(checked);
    
    if (arrayEq(checked,["right"]) && arrayEq(unchecked,["wrong"])) {
      $out.empty().append($("<div class='submit-ans right-answer'> \u2713 </div>"));
    } else {
      $out.empty().append($("<div class='submit-ans wrong-answer'> \u2717 </div>"));
    }
  
});
}
