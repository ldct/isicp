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

pushesOf = {}

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
    
    return evaluate(x);
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
      return "<div class='correct-answer'> \u2713 </div>";
    } else {
      return "<div class='wrong-answer'> \u2717 </div>";
    }
  });
}

function makePromptingInput(i) {

  makeEditable(i);
  
  var e = editorOf[i];
  e.setValue("<your input here>");
  
  var oldSetOption = e.getOption("onFocus");
  e.setOption("onFocus", function() {
    oldSetOption();
    if (e.getValue() == "<your input here>") {
      e.setValue("");
    }
  });
}
