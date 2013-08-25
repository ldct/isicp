"use strict";

function focus_callback() {
  //for clients to override
}

function cleanCode(code) {
  //cleans extra newlines that exist to make in-html code look better
  return code.replace(/^\n/, "").replace(/\n*$/, "").replace(/[ \t]*\n/g, "\n").replace(/\s*$/, "");
}

function $_(s) { 
  // _ to $ where _ = div id's, $ = jQuery objects; read _ as #, $_ consumes a hash and adds a $
  var ret = $("#" + s);
  if (!ret[0]) {
    throw "#" + s + " did not match anything";
  } else {
    return ret;
  }
}

////////////////////////////////////////////////////////////////////////////////

var biwascheme = new BiwaScheme.Interpreter( function(e){
  console.log("Biwascheme ", e.message);
});

function resetTopEnv() {
  BiwaScheme.TopEnv = {};
  
  for (var s in ["define", "begin", "quote", "lambda", "if", "set!"]) {
    BiwaScheme.TopEnv[s] = new BiwaScheme.Syntax(s);
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

function getDependedOnCode(_editor) {
  var code = "";
  
  for (var deps = getDeps(_editor), i = 0; i < deps.length; i++) {
    code += getDependedOnCode(deps[i]);
  }
  
  return code + editorOf[_editor].getValue();
}

function eval_editor(_editor) {
  
  return eval_scheme(getDependedOnCode(_editor));
}

////////////////////////////////////////////////////////////////////////////////

var editorOf = {};

function makeEditable(_editor) {

  if (editorOf[_editor]) {
    console.log("Error: makeEditable called with " + _editor + " which already exists!");
    return;
  }

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

function linkEditor(_editor, _output, func) { //sync

  var editor = editorOf[_editor];

  editor.setOption('onBlur', function() {
    $_(_output).empty().append($("<span>" + func(_editor, editor.getValue()) + "</span>"));
  });
}

////////////////////////////////////////////////////////////////////////////////

function getAllDeps(s) {
  var ret = [];
  for (var i = 0, d = getDeps(s); i < d.length; i++) {  
    ret = ret.concat(getAllDeps(d[i]));
    ret.push(d[i]);
  }
  return ret;
}

function getAllPushes(s) {
  var ret = [];
  for (var i = 0, d = getPushes(s); i < d.length; i++) {  
    ret.push(d[i]);
    ret = ret.concat(getAllPushes(d[i]));
  }
  return ret;
}

focus_callback = function(s) {
  var ts = "";
  for (var i = 0, d = getAllDeps(s); i < d.length; i++) {  //TODO list all deps
    ts += editorOf[d[i]].getValue() + "\n\n";
  }
  
  ts += "<b>" + editorOf[s].getValue() + "</b>";

  $("#currently-editing").html("<pre>" + ts + "</pre>");
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

function addDep(_e, deps) {
  if (!isArray(deps)) {
    throw "deps is not an array: addDep " + _a
  }
  depsOf[_e] = deps;
  for (var i in deps) {
    var p = pushesOf[deps[i]];
    if (p) {
      p.push(_e);
    } else {
      pushesOf[deps[i]] = [_e];
    }
  }
}

function promptDep(_a, deps) {
  prompt(_a);
  addDep(_a, deps);
}

///////////////////////////////////////////////////////////////////////////////

function addOutput(_e) {
  $_(_e).after($('<div>', {'id': _e + "-output", 'class': "output"}));
}

function compute(s) {
  var def = $.Deferred();

  var _output = s + "-output";
  var output_fragment = [];

  var w = new Worker("js/interpreter/scheme_worker.js");
  w.onmessage = function(e) {
    if (e.data.end) {
      if (output_fragment.length == 0) {
        $_(_output).empty();
      }
      w.terminate();
      def.resolve(); //todo: switch    
      return;
    } else if (e.data.suppress_newline) {
      output_fragment.push($("<span>" + e.data.value + "</span>"));
      $_(_output).empty().append(output_fragment);
    } else {
      output_fragment.push($("<span>" + e.data + "<br> </span>"));
      $_(_output).empty().append(output_fragment);
    }
  }
  
  w.postMessage(getDependedOnCode(s));
  
  for (var pushes = getPushes(s), i = 0; i < pushes.length; i++) {
    compute(pushes[i]);
  }
  return def; //for template code to chain
}

function eval_scheme(code) { //deferred

  var def = $.Deferred();

  var w = new Worker("js/interpreter/scheme_worker.js");
  var out = "";
  w.onmessage = function(e) {
    if (e.data.end) {
      def.resolve(out); //using eval here might throw errors
      w.terminate();
    } else if (e.data.suppress_newline) { //eval_scheme should not be used with
      return; //e.data.value actually contains something
    } else {
      out += e.data;
      return;
    }
  }
  
  console.log(code)
  w.postMessage(code);

  return def;

}

function prompt(s) {

  makeEditable(s);
  addOutput(s);
  
  editorOf[s].setOption('onBlur', function() {
    return compute(s);
  });
}

function hidden_prompt(s) {
  makeEditable(s);

  $_(s).hide()
}

function no_output_prompt(s) {
  makeEditable(s);
}

function no_output_frozen_prompt(s) {
  makeEditable(s);
  $_(s).children("CodeMirror-scroll").addClass("static")
  editorOf[s].setOption("readOnly", 'nocursor');
}

function makeStatic(_static) { //and no output
  no_output_frozen_prompt(_static);

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

  var form = $('<form>', {'id': uid});
  
  var entries = [];
  for (var i in right_entries) {
    entries.push({text: right_entries[i], score: 'right'});
  }
  for (var i in wrong_entries) {
    entries.push({text: wrong_entries[i], score: 'wrong'});
  }
  
  shuffle(entries);
  
  for (var i in entries) {
    var e = entries[i];
    form.append($("<input>", {type: "checkbox", id: uid + "-" + i, value: e.score}));
    form.append($("<label>", {for: uid + "-" + i, 'html': e.text}));
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

////////////////////////////////////////////////////////////////////////////////
function createTOC() {
  $("h3, h4").each(function(i) {
  
      var current = $(this);
      
      var title = current.text().slice(0,50).replace(/^\s+/, "").replace(/\s+$/, "").replace(/:/, "").replace(/\s+/g, "-").replace(/\./g, "-").replace(/\-+/g, "-").replace(/[\(\)]/g, "").replace(/\?/, "").replace(/'/g, "");
      
      current.attr("id", title);
      
      var a = $("<a>", {href: "#" + title, html: current.text().slice(0,50), 'class': current[0].nodeName.toLowerCase()});
      
      a.click(function() {
        $('html, body').animate({
            'scrollTop':   $('#' + title).offset().top
        }, 250);
      });
      
      $("#toc").append(a).append($('<br>'));
  });
  
  $('#sidebox').animate({'right':'0%'});
}
