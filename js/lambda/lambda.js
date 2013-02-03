function format(s) {
  function helper(s, args) {
    if (args.length === 0) {
      return s;
    } else {  
      return helper(s.replace("%s", args[0]), args.slice(1));
    }
  }
  return helper(s, Array.prototype.slice.call(arguments).slice(1));
}

/*
Unbound variables ("constants") are represented as strings
Bound variables are represented as numbers, interpreted as de brujin indexes
*/

function lambdaTerm(body) {
  this.body = body;
}

lambdaTerm.prototype.toString = function() {
  return format("(λ %s)", this.body.toString());
}

function applicationTerm(func, body) {
  this.func = func;
  this.body = body;
}

applicationTerm.prototype.toString = function() {
  return format("(%s %s)", this.func.toString(), this.body.toString());
}

function l(body) {
  return new lambdaTerm(body);
}

function a(func, body) {
  return new applicationTerm(func, body);
}

function lift(k, n, term) {
  if (typeof term === "number") {
    if (term < k) {
      return term;
    } else {
      return term + n
    }
  } else if (typeof term === "string") {
    return term;
  } else if (term instanceof applicationTerm) {
    return new applicationTerm(lift(k, n, term.func), (lift(k, n, term.body)));
  } else if (term instanceof lambdaTerm) {
    return new lambdaTerm(lift(k+1, n, term.body));
  } else {
    throw "lift called with invalid term " + term;
  }
}

function sub(term, k, N) {
  if (typeof term === "number") {
    if (term < k) {
      return term;
    } else if (term === k) {
      return lift(1, k-1, N);
    } else {
      return term - 1;
    }
  } else if (typeof term === "string") {
    return term;
  } else if (term instanceof lambdaTerm) {
    return new lambdaTerm(sub(term.body, k + 1, N));
  } else if (term instanceof applicationTerm) {
    return new applicationTerm(sub(term.func, k, N), sub(term.body, k, N));
  } else {
    throw "error: " + term + " matched no types";
  }
}

function apply_lambda(lambda_term, arg) {
  return sub(lambda_term.body, 1, arg);
}

function simplify(term) {
  if (typeof term === "number") {
    return term;
  } else if (typeof term === "string") {
    return term;
  } else if (term instanceof lambdaTerm) {
    return new lambdaTerm(simplify(term.body));
  } else if (term instanceof applicationTerm) {
    var newfunc = simplify(term.func);
    var newbody = simplify(term.body);
    
    if (newfunc instanceof lambdaTerm) {
      return apply_lambda(newfunc, newbody);
    } else {
      return new applicationTerm(newfunc, newbody);
    }
  } else {
    throw "error: " + term + " matched no types";
  }
}

function to_named_string(term) {
  function helper(term, fresh_vars) {
    if (fresh_vars.length == 0) {
      throw "run out of fresh variables";
    }
    if (typeof term === "number") {
      return String(term);
    } else if (typeof term === "string") {
      return term;
    } else if (term instanceof lambdaTerm) {
      var fresh = fresh_vars[0];
      return format("λ%s.%s", fresh, helper(apply_lambda(term, fresh), fresh_vars.slice(1)));
    } else if (term instanceof applicationTerm) {
      var new_func = helper(term.func, fresh_vars);
      var new_body = helper(term.body, fresh_vars)
      
      if (term.func instanceof lambdaTerm) {
        var left = format("(%s)", new_func);
      } else {
        var left = new_func;
      }
      
      if ((term.body instanceof applicationTerm) || (term.body instanceof lambdaTerm)) {
        var right = format("(%s)", new_body);
      } else {
        var right = new_body;
      }
      
      return left + right;
    } else {
      throw "error: " + term + " matched no types";
    }
  }
  return helper(term, ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"]).replace(/\.λ/g, "");
}
