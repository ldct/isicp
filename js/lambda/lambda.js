function format(s, args) {
  if (args.length === 0) {
    return s;
  } else {  
    return format(s.replace("%s", args[0]), args.slice(1));
  }
}

/*
Unbound variables ("constants") are represented as strings
Bound variables are represented as numbers, interpreted as de brujin indexes
*/

/*represents a lambda abstraction term*/
function lambdaTerm(body) {
  this.body = body;
}

lambdaTerm.prototype.toString = function() {
  return format("(%s %s)", ["\u03bb", this.body.toString()]);
}

lambdaTerm.prototype.type = function() {return "lambda"}

/*represents a function application term*/
function applicationTerm(func, body) {
  this.func = func;
  this.body = body;
}

applicationTerm.prototype.toString = function() {
  return "(" + this.func.toString() + " " + this.body.toString() + ")";
}

applicationTerm.prototype.type = function() {return "application"}

function lift(k, n, term) {
  if (typeof term === "number") {
    if (term < k) {
      return term;
    } else {
      return term + n
    }
  } else if (typeof term === "string") {
    return term;
  } else if (term.type() === "application") {
    return new applicationTerm(lift(k, n, term.func), (lift(k, n, term.body)));
  } else if (term.type() === "lambda") {
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
  } else if (term.type() === "lambda") {
    return new lambdaTerm(sub(term.body, k + 1, N));
  } else if (term.type() === "application") {
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
  } else if (term.type() === "lambda") {
    return new lambdaTerm(simplify(term.body));
  } else if (term.type() === "application") {
    var newfunc = simplify(term.func);
    var newbody = simplify(term.body);
    
    if (newfunc.type && newfunc.type() == "lambda") {
      return apply_lambda(newfunc, newbody);
    } else {
      return new applicationTerm(newfunc, newbody);
    }
  } else {
    throw "error: " + term + " matched no types";
  }
}
