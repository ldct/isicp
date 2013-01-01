onmessage = function(event) {

//READER.JS//
/*This file implements the built-in data types of the Scheme language, along
with a parser for Scheme expressions.

In addition to the types defined in this file, some data types in Scheme are
represented by their corresponding type in JavaScript:
    number:       int or float
    symbol:       string
    boolean:      bool
    unspecified:  null

The valueOf() method of a Scheme value will return a JavaScript expression that
would be evaluated to the value, where possible.

The toString() method of a Scheme value will return a Scheme expression that
would be read to the value, where possible.
*/


/////////////////////
// Data Structures //
/////////////////////

function Pair(first, second) {    
    this.first = first;
    this.second = second;
}

Pair.prototype = {
    valueOf : function() {
	return "Pair(" + this.first.valueOf() + ", " + this.second.valueOf() + ")";
    },
    toString : function() {
	var s = "(" + this.first.toString();
	var second = this.second;
	while (second instanceof Pair) {
	    s += " " + second.first.toString();
	    second = second.second;
	}
	if (second !== nil) {
	    s += " . " + second.toString();
	}
	return s + ")";
    },
    length : function() {
	var n = 1;
	var second = this.second;
	while (second instanceof Pair) {
	    n += 1;
	    second = second.second;
	}
	if (second !== nil) {
	    throw "TypeError: length attempted on improper list";
	}
	return n;
    },
    getitem : function(k) {
	if (k < 0) {
	    throw "IndexError: negative index into list";
	}
	var y = this;
	for (var i = 0; i < k; i++) {
	    if (y.second === nil) {
		throw "IndexError: list out of bounds";
	    } else if (! (y.second instanceof Pair)) {
		throw "TypeError: ill-formed list";
	    }
	    y = y.second;
	}
	return y.first;
    },
    map : function(fn) {
	// Return a Scheme list after mapping JavaScript function FN to THIS
	var mapped = fn(this.first);
	if ((this.second === nil) || (this.second instanceof Pair)) {
	    return new Pair(mapped, this.second.map(fn)) ;
	} else {
	    throw "TypeError : ill-formed list";
	}
    }
}

// nil is a singleton object

var nil = {
    valueOf : function() {
	return 'nil';
    },
    toString : function() {
	return '()';
    },
    length : function() {
	return 0;
    },
    getitem : function(k) {
        if (k < 0) {
            throw "IndexError: negative index into list";
	}
        throw "IndexError: list index out of bounds";
    },
    map : function(fn) {
	return this
    }
};

/*
A Buffer provides a way of accessing a sequence of tokens across lines.

Its constructor takes an array, called "the source", that returns the
next line of tokens as a list each time it is queried, or null to indicate
the end of data.

The Buffer in effect concatenates the sequences returned from its source
and then supplies the items from them one at a time through its pop()
method, calling the source for more sequences of items only when needed.

In addition, Buffer provides a current method to look at the
next item to be supplied, without sequencing past it.
*/

function Buffer(source) {
    this.line_index = 0;
    this.index = 0;
    this.source = source;
    this.current_line = [];
    this.current();
}

Buffer.prototype = {
    pop : function() {
	// Remove the next item from self and return it. If self has
        // exhausted its source, returns null
	var current = this.current();
	this.index += 1;
	return current;
    },
    more_on_line : function() {
	return (this.index < this.current_line.length);
    },
    current : function() {
	while (! this.more_on_line()) {
	    this.index = 0;
	    if (this.line_index < this.source.length) {
		this.current_line = this.source[this.line_index];
		this.line_index += 1;
	    } else {
		this.current_line = [];
		return null;
	    }
	}
	return this.current_line[this.index];
    }
}

////////////////////////
// Scheme list parser //
////////////////////////

function scheme_read(src) {
    // Read the next expression from SRC, a Buffer of tokens
    var val, quoted
    if (src.current() == null) {
	throw "EOFError";
    }
    val = src.pop();
    if (val == "nil") {
        return nil;
    } else if (! (DELIMITERS.inside(val))) {
        return val;
    } else if (val == "'") {
        quoted = scheme_read(src);
        return new Pair('quote', new Pair(quoted, nil));
    } else if (val == "(") {
        return read_tail(src);
    } else {
        throw "SyntaxError: unexpected token: " + val
    }
}


function read_tail(src) {
    // Return the remainder of an array in SRC, starting before an element or )
    var first, rest, end_token, next_token
    if (src.current() == null) {
        throw "SyntaxError: unexpected end of file"
    }
    if (src.current() == ")") {
        src.pop();
        return nil;
    }
    if (src.current() == ".") {
        src.pop();
        end_token = scheme_read(src);
        next_token = src.pop();
        if (next_token != ")") {
            throw "SyntaxError: Expected one element after ."
        }
        return end_token;
    }
    first = scheme_read(src);
    rest = read_tail(src);
    return new Pair(first, rest);
}

//TOKENIZER.JS//

Array.prototype.inside = function (element) {
    if (this.indexOf(element) == -1) {
	return false;
    } else {
	return true;
    }
};

Array.prototype.map = function(fun) {
    var len = this.length;
    var res = new Array(len);
    for (var i = 0; i < len; i++) {
        res[i] = fun(this[i]);
    }
    return res;
};

var DIGITS = "0123456789".split('');
var ASCII_LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split('');
var _SYMBOL_STARTS = '!$%&*/:<=>?@^_~'.split('').concat(ASCII_LOWERCASE);
var _SYMBOL_INNERS = _SYMBOL_STARTS.concat(DIGITS, '+-.'.split(''));
var _NUMERAL_STARTS = DIGITS.concat('+-.'.split(''));
var _WHITESPACE = ' \t\n\r'.split('');
var _SINGLE_CHAR_TOKENS = "()'".split('');
var _TOKEN_END = _WHITESPACE.concat(_SINGLE_CHAR_TOKENS);
var DELIMITERS = _SINGLE_CHAR_TOKENS.concat(['.']);

function valid_symbol(s) {
    //Returns whether s is not a well-formed value.
    if (s.length == 0 || ! _SYMBOL_STARTS.inside(s.charAt(0)) ) {
	return false;
    }
    for (var i = 1; i < s.length; i++) {
	if (! _SYMBOL_INNERS.inside(s.charAt(i)) ) {
	    return false;
	}
    }
    return true;
}

function next_candidate_token(line, k) {
    // A tuple (tok, k'), where tok is the next substring of line at or
    // after position k that could be a token (assuming it passes a validity
    // check), and k' is the position in line following that token.  Returns
    // (None, len(line)) when there are no more tokens.
    while (k < line.length) {
        var c = line[k];

	if (c == ";") {
	    return [null, line.length];
	} else if (_WHITESPACE.inside(c)) {
	    k += 1;
	} else if (_SINGLE_CHAR_TOKENS.inside(c)) {
	    return [c, k + 1];
	} else if (c == '#') { // Boolean values #t and #f
	    return [line.slice(k, k+2), Math.min(k+2, line.length)];
	} else {
	    var j = k;
	    while (j < line.length && (! _TOKEN_END.inside(line[j]))) {
		j += 1;
	    }
	    return [line.slice(k, j), Math.min(j, line.length)];
	}
    }
    return [null, line.length];
}

function tokenize_line (line) {
    var result = [];
    var nct_result = next_candidate_token(line, 0);
    var text = nct_result[0];
    var i = nct_result[1];
    
    while (text != null) {
        if (DELIMITERS.inside(text)) {
            result.push(text);
        } else if (text == "+" || text == "-") {
            result.push(text);
        } else if (text == "#t" || text.toLowerCase() == "true") {
            result.push(true);
        } else if (text == "#f" || text.toLowerCase() == "false") {
            result.push(false);
        } else if (text == "nil") {
            result.push(text);
	} else if (_NUMERAL_STARTS.inside(text[0])) {
	    r = parseFloat(text);
	    if (r == NaN) {
		throw "ValueError: invalid numeral: " + text;
	    } else {
		result.push(r);
	    }
        } else if (_SYMBOL_STARTS.inside(text[0]) && valid_symbol(text)) {
            result.push(text);
        } else {
	    throw "SyntaxError: invalid token :" + text;
        }
        nct_result = next_candidate_token(line, i);
	text = nct_result[0];
	i = nct_result[1];		
    }
    return result;
}

function tokenize_lines(input) {
    // Returns list of lists of tokens, one for each line of the input array
    return input.map(tokenize_line);
}

//PRIMITIVES.JS//

// This file implements the primitives of the Scheme language

function PrimitiveProcedure(fn, use_env) {
    if (typeof use_env === "undefined") {
	use_env = false;
    }
    this.fn = fn;
    this.use_env = use_env;
}


function check_type(val, predicate, k, name) {
    // Returns VAL.  Raises a SchemeError if not PREDICATE(VAL)
    // using "argument K of NAME" to describe the offending value
    if (! predicate(val)) {
	throw "SchemeError: argument "+ k + " of "+ name +
	      " has wrong type ("+ typeof val +")";
    }
    return val;
}

_PRIMITIVES = {}

function scheme_booleanp(x) {
    return (x === true) || (x === false);
}
_PRIMITIVES["boolean?"] = new PrimitiveProcedure(scheme_booleanp);

function scheme_true(val) {
    // All values in Scheme are true except False.
    return (!(val === false));
}

function scheme_false(val) {
    // Only False is false in Scheme
    return (val === false);
}

function scheme_not(x) {
    return ! scheme_true(x);
}
_PRIMITIVES["not"] = new PrimitiveProcedure(scheme_not);

function scheme_eqp(x, y) {
    return x === y;
}
_PRIMITIVES["eq?"] = new PrimitiveProcedure(scheme_eqp);

function scheme_pairp(x) {
    return x instanceof Pair;
}
_PRIMITIVES["pair?"] = new PrimitiveProcedure(scheme_pairp);

function scheme_nullp(x) {
    return x === nil;
}
_PRIMITIVES["null?"] = new PrimitiveProcedure(scheme_nullp);

function scheme_listp(x) {
    // Return whether x is a well-formed list. Assumes no cycles
    while (x !== nil) {
	if (!(x instanceof Pair)) {
	    return false;
	}
	x = x.second;
    }
    return true;
}
_PRIMITIVES["list?"] = new PrimitiveProcedure(scheme_listp);

function scheme_length(x) {
    check_type(x, scheme_listp, 0, "length");
    return x.length();
}
_PRIMITIVES["length"] = new PrimitiveProcedure(scheme_length);

function scheme_cons(x, y) {
    return new Pair(x, y);
}
_PRIMITIVES["cons"] = new PrimitiveProcedure(scheme_cons);

function scheme_car(x) {
    check_type(x, scheme_pairp, 0, 'car');
    return x.first;
}
_PRIMITIVES["car"] = new PrimitiveProcedure(scheme_car);

function scheme_cdr(x) {
    check_type(x, scheme_pairp, 0, 'cdr');
    return x.second;
}
_PRIMITIVES["cdr"] = new PrimitiveProcedure(scheme_cdr);

function scheme_list() {
    var result = nil;
    for (var i = arguments.length - 1; i >= 0; i--) {
	result = new Pair(arguments[i], result);
    }
    return result;
}
_PRIMITIVES["list"] = new PrimitiveProcedure(scheme_list);
function scheme_append() {
    if (arguments.length == 0) {
	return nil;
    }
    var result = arguments[arguments.length - 1];
    for (var i = arguments.length - 2; i >= 0; i--) {
	var v = arguments[i];
	if (v !== nil) {
	    check_type(v, scheme_pairp, i, "append");
	    var r = new Pair(v.first, result);
	    var p = r;
	    var v = v.second;
	    while (scheme_pairp(v)) {
		p.second = new Pair(v.first, result);
		p = p.second;
		v = v.second;
	    }
	    result = r;
	}
    }
    return result;
}
_PRIMITIVES["append"] = new PrimitiveProcedure(scheme_append);

function scheme_symbolp(x) {
    return typeof x === "string";
}
_PRIMITIVES["symbol?"] = new PrimitiveProcedure(scheme_symbolp);

function scheme_numberp(x) {
    return typeof x === "number";
}
_PRIMITIVES["number?"] = new PrimitiveProcedure(scheme_numberp);

function scheme_integerp(x) {
    return (typeof x === "number") && Math.floor(x) === x;
}
_PRIMITIVES["integer?"] = new PrimitiveProcedure(scheme_integerp);

function _check_nums(vals) {
    // Check that all elements in array VALS are numbers
    for (var i = 0; i < vals.length; i++) {
	if (! scheme_numberp(vals[i])) {
	    throw "SchemeError: operand '"+ vals[i] +"' is not a number";
	}
    }
}

function _arith(fn, init, vals) {
    // Perform the fn fneration on the number values of VALS, with INIT as
    // the value when VALS is empty. Returns the result as a Scheme value
    _check_nums(vals);
    var s = init;
    for (var i = 0; i < vals.length; i++) {
	s = fn(s, vals[i]);
    }
    if (Math.round(s) === s) {
	s = Math.round(s);
    }
    return s;
}

function scheme_add() {
    return _arith(function(a, b) {return a+b;}, 0, arguments);
}
_PRIMITIVES["+"] = new PrimitiveProcedure(scheme_add);

function scheme_sub() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length < 1) {
	throw "SchemeError: too few args";
    } else if (args.length == 1) {
	_check_nums([args[0]]);
	return -args[0];
    } else {
	return _arith(function(a, b) {return a-b;}, args[0], 
		      args.slice(1));
    }
}
_PRIMITIVES["-"] = new PrimitiveProcedure(scheme_sub);

function scheme_mul() {
    return _arith(function(a, b) {return a*b;}, 1, arguments);
}
_PRIMITIVES["*"] = new PrimitiveProcedure(scheme_mul);

function scheme_div(x, y) {
    if (y === 0) {
	throw "SchemeError: division by zero";
    }
    return _arith(function(a, b) {return a/b;}, x, [y]);
}
_PRIMITIVES["/"] = new PrimitiveProcedure(scheme_div);

function scheme_quotient(x, y) {
    return Math.floor(scheme_div(x, y));
}
_PRIMITIVES["quotient"] = new PrimitiveProcedure(scheme_quotient);

function scheme_remainder(x, y) {
    return x - scheme_quotient(x, y);
}
_PRIMITIVES["remainder"] = new PrimitiveProcedure(scheme_remainder);
_PRIMITIVES["modulo"] = _PRIMITIVES["remainder"];

function scheme_floor(x) {
    _check_nums([x]);
    return Math.floor(x);
}
_PRIMITIVES["floor"] = new PrimitiveProcedure(scheme_floor);

function scheme_ceil(x) {
    _check_nums([x]);
    return Math.ceil(x);
}
_PRIMITIVES["ceil"] = new PrimitiveProcedure(scheme_ceil);


function scheme_eq(x, y) {
    _check_nums([x, y]);
    return x === y;
}
_PRIMITIVES["="] = new PrimitiveProcedure(scheme_eq);

function scheme_lt(x, y) {
    _check_nums([x, y]);
    return x < y;
}
_PRIMITIVES["<"] = new PrimitiveProcedure(scheme_lt);

function scheme_gt(x, y) {
    _check_nums([x, y]);
    return x > y;
}
_PRIMITIVES[">"] = new PrimitiveProcedure(scheme_gt);

function scheme_le(x, y) {
    _check_nums([x, y]);
    return x <= y;
}
_PRIMITIVES["<="] = new PrimitiveProcedure(scheme_le);

function scheme_ge(x, y) {
    _check_nums([x, y]);
    return x >= y;
}
_PRIMITIVES[">="] = new PrimitiveProcedure(scheme_ge);

function scheme_evenp(x) {
    _check_nums([x]);
    return x % 2 === 0;
}
_PRIMITIVES["even?"] = new PrimitiveProcedure(scheme_evenp);

function scheme_oddp(x) {
    _check_nums([x]);
    return x % 2 === 1;
}
_PRIMITIVES["odd?"] = new PrimitiveProcedure(scheme_oddp);

function scheme_zerop(x) {
    _check_nums([x]);
    return x === 0;
}
_PRIMITIVES["zero?"] = new PrimitiveProcedure(scheme_zerop);

function scheme_atomp(x) {
    return scheme_booleanp(x) || scheme_numberp(x) || scheme_symbolp(x) ||
           scheme_nullp(x);
}
_PRIMITIVES["atom?"] = new PrimitiveProcedure(scheme_atomp);

function scheme_display(val) {
    this.postMessage(val.toString());
}
_PRIMITIVES["display"] = new PrimitiveProcedure(scheme_display);

function scheme_print(val) {
    this.postMessage(val.toString() + "\n");
}
_PRIMITIVES["print"] = new PrimitiveProcedure(scheme_print);

function scheme_newline() {
    this.postMessage(form_out.writearea.value += "\n");
}
_PRIMITIVES["newline"] = new PrimitiveProcedure(scheme_newline);

function scheme_error(msg) {
    if (msg === undefined) {
	throw "SchemeError";
    } else {
	throw "SchemeError: " + msg;
    }
}
_PRIMITIVES["error"] = new PrimitiveProcedure(scheme_error);

function scheme_exit() {
    throw "EOFError";
}
_PRIMITIVES["exit"] = new PrimitiveProcedure(scheme_exit);
  
//SCHEME.JS//

/*
This file implements the core Scheme interpreter functions, including the
eval/apply mutual recurrence, environment model, and read-eval-print loop
*/

function read(form) {
    var lines = form.readarea.value.split('\n');
    var codebuffer = new Buffer(tokenize_lines(lines));
    var env = create_global_frame();
    
    while (codebuffer.current() != null) {
	try {
	    var result = scheme_eval(scheme_read(codebuffer), env);
	    if (! (result === null || result === undefined)) {
		    console.log(result);
		    form.writearea.value += result.toString() + "\n";
	    }
	} catch(e) {
	    console.log(e);
	    break;
	}
    }
}

/////////////////////
// Data Structures //
/////////////////////

function Frame(parent) {
    this.bindings = {};
    this.parent = parent;
}
Frame.prototype = {
    lookup : function(symbol) {
	// Return the value bound to SYMBOL.  Errors if SYMBOL is not found
	if (symbol in this.bindings) {
	    return this.bindings[symbol];
	} else if (this.parent !== null) {
	    return this.parent.lookup(symbol);
	} else {
	    throw "SchemeError: unknown identifier: " + symbol.toString();
	}
    },
    global_frame : function() {
	// The global environment at the root of the parent chain
	var e = this;
	while (e.parent !== null) {
	    e = e.parent;
	}
	return e;
    },
    make_call_frame : function(formals, vals) {
	// Return a new local frame whose parent is SELF, in which the symbols
        // in the Scheme formal parameter list FORMALS are bound to the Scheme
        // values in the Scheme value list VALS
	var frame = new Frame(this);
	var formals = pair_to_array(formals);
	var vals = pair_to_array(vals);
	if (formals.length != vals.length) {
	    throw "SchemeError: Invalid number of arguments";
	}
	for (var i = 0; i < formals.length; i++) {
	    frame.bindings[formals[i]] = vals[i];
	}
	return frame;
    },
    define : function(sym , val) {
	// Define Scheme symbol SYM to have value VAL in SELF
	this.bindings[sym] = val;
    }
}

// A procedure defined by a lambda expression or the complex define form
function LambdaProcedure(formals, body, env) {
    // A procedure whose formal parameter list is FORMALS (a Scheme list),
    // whose body is the single Scheme expression BODY, and whose parent
    // environment is the Frame ENV.  A lambda expression containing multiple
    // expressions, such as (lambda (x) (display x) (+ x 1)) can be handled by
    // using (begin (display x) (+ x 1)) as the body
    this.formals = formals;
    this.body = body;
    this.env = env;
}

LambdaProcedure.prototype = {
    toString : function() {
	return "(lambda "+ this.formals.toString() +" "+ 
	       this.body.toString() +")" ;
    }
}

/////////////////////
// Eval-Apply Loop //
/////////////////////

function scheme_eval(expr, env) {
    // Evaluate Scheme expression EXPR in environment ENV
    // This version of scheme_eval supports tail-call optimization
    while (true) {
        if (expr === null) {
            throw 'SchemeError: Cannot evaluate an undefined expression.';
        }
	// Evaluate Atoms
        if (scheme_symbolp(expr)) {
            return env.lookup(expr);
        } else if (scheme_atomp(expr)) {
            return expr;
        }
        if (! scheme_listp(expr)) {
            throw "SchemeError: malformed list: " + expr.toString();
        }
        var first = expr.first;
        var rest = expr.second;

        if (first in LOGIC_FORMS) {
            expr = LOGIC_FORMS[first](rest, env);
        } else if (first === 'lambda') {
            return do_lambda_form(rest, env);
        } else if (first === 'mu') {
            return do_mu_form(rest);
	} else if (first === 'define') {
            return do_define_form(rest, env);
        } else if (first === 'quote') {
            return do_quote_form(rest);
        } else if (first === 'let') {
            var l = do_let_form(rest, env);
            expr = l[0];
            env = l[1];
        } else {
            var procedure = scheme_eval(first, env);
	    var args = rest.map(function(operand) 
				{return scheme_eval(operand, env);});
            if (procedure instanceof LambdaProcedure) {
                env = procedure.env.make_call_frame(procedure.formals, args);
                expr = procedure.body;
	    } else {
                return scheme_apply(procedure, args, env);
            }
        }
    }
}

function scheme_apply(procedure, args, env) {
    // Apply Scheme PROCEDURE to argument values ARGS in environment ENV
    if (procedure instanceof PrimitiveProcedure) {
        return apply_primitive(procedure, args, env);
    } else if (procedure instanceof LambdaProcedure) {
        var call_frame = procedure.env.make_call_frame(procedure.formals, args);
        return scheme_eval(procedure.body, call_frame);
    } else {
        throw "SchemeError: Cannot call" + procedure.toString();
    }
}

function apply_primitive(procedure, args, env) {
    // Apply PrimitiveProcedure PROCEDURE to a Scheme list of ARGS in ENV
    args = pair_to_array(args);
    if (procedure.use_env) {
        args.concat(env);
    }
    try {
        return procedure.fn.apply(this, args);
    } catch(e) {
        throw "SchemeError: Invalid number of arguments"
    }
}

function pair_to_array(list) {
    if (list === nil) {
        return [];
    }
    return [list.first].concat(pair_to_array(list.second));
}


///////////////////
// Special Forms //
///////////////////

function do_lambda_form(vals, env) {
    // Evaluate a lambda form with parameters VALS in environment ENV
    var value, formals
    check_form(vals, 2);
    formals = vals.getitem(0);
    check_formals(formals);
    if (vals.length() == 2) {
        value = vals.getitem(1);
    } else {
        value = new Pair('begin', vals.second);
    }
    return new LambdaProcedure(formals, value, env);
}

function do_define_form(vals, env) {
    // Evaluate a define form with parameters VALS in environment ENV
    var target, value, t, v
    check_form(vals, 2);
    target = vals.getitem(0);
    if (scheme_symbolp(target)) {
        check_form(vals, 2, 2);
        value = scheme_eval(vals.getitem(1), env);
        env.define(target, value);
    } else if (target instanceof Pair) {
        t = target.getitem(0);
        if (! scheme_symbolp(t)) {
            throw "SchemeError: not a variable: " + t.toString();
        }
        v = new Pair(vals.first.second, vals.second);
        value = do_lambda_form(v, env);
        env.define(t, value);
    } else {
        throw "SchemeError: bad argument to define"
    }
}

function do_quote_form(vals) {
    // Evaluate a quote form with parameters VALS
    check_form(vals, 1, 1);
    return vals.getitem(0);
}

function do_let_form(vals, env) {
    // Evaluate a let form with parameters VALS in environment ENV
    check_form(vals, 2);
    var bindings = vals.getitem(0);
    var exprs = vals.second;
    if (! scheme_listp(bindings)) {
        throw "SchemeError: bad bindings list in let form";
    }
    // Add a frame containing bindings
    var names = nil
    vals = nil
    var new_env = env.make_call_frame(names, vals);
    for (var i = 0; i < bindings.length(); i++) {
	var binding = bindings.getitem(i);
        check_form(binding, 2, 2);
        if (! scheme_symbolp(binding.getitem(0))) {
            throw "SchemeError: bad binding: " + binding.toString();
        }
        var name = binding.getitem(0);
        var value = scheme_eval(binding.getitem(1), env);
        new_env.define(name, value);
    } 
    // Evaluate all but the last expression after bindings, and return the last
    var last = exprs.length() - 1;
    for (i = 0; i < last; i++) {
        scheme_eval(exprs.getitem(i), new_env);
    }
    return [exprs.getitem(last), new_env];
}

/////////////////
// Logic Forms //
/////////////////

function do_if_form(vals, env) {
    // Evaluate if form with parameters VALS in environment ENV
    check_form(vals, 3, 3);
    var pred = scheme_eval(vals.getitem(0), env);
    var cons = vals.getitem(1);
    var alt = vals.getitem(2);
    if (scheme_true(pred)) {
	return cons;
    } else {
	return alt;
    }
}

function do_and_form(vals, env) {
    // Evaluate short-circuited and with parameters VALS in environment ENV
    if (vals.length() == 0) {return true;}
    for (var i = 0; i < vals.length(); i++) {
	var pred = scheme_eval(vals.getitem(i), env);
	if (scheme_false(pred)) {return false;}
    }
    return pred;
}

function do_or_form(vals, env) {
    // Evaluate short-circuited or with parameters VALS in environment ENV
    for (var i = 0; i < vals.length(); i++) {
	var pred = scheme_eval(vals.getitem(i), env);
	if (scheme_true(pred)) {return pred;}
    }
    return false;
}

function do_cond_form(vals, env) {
    // Evaluate cond form with parameters VALS in environment ENV
    var num_clauses = vals.length();
    for (var i = 0; i < vals.length(); i++) {
	var clause = vals.getitem(i);
	check_form(clause, 1);
	if (clause.first === "else") {
	    if (i < num_clauses - 1) {
		throw "SchemeError: else must be last";
	    }
	    var test = true;
	    if (clause.second === nil) {
		throw "SchemeError: badly formed else clause";
	    }
	} else {
	    test = scheme_eval(clause.first, env);
	}
	if (scheme_true(test)) {
	    if (clause.second.length() == 0) {return test;}
	    return new Pair('begin', clause.second);
	}
    }
    return null;
}
function do_begin_form(vals, env) {
    // Evaluate begin form with parameters VALS in environment ENV
    check_form(vals, 1);
    var eval_length = vals.length() - 1;
    for (var l = 0; l < eval_length; l++) {
	scheme_eval(vals.getitem(l), env);
    }
    return vals.getitem(eval_length);
}

LOGIC_FORMS = {
        "and": do_and_form,
        "or": do_or_form,
        "if": do_if_form,
        "cond": do_cond_form,
        "begin": do_begin_form,
        };

//////////////////////
// Helper Functions //
//////////////////////

function create_global_frame() {
    // Initialize and return a single-frame environment with built-in names
    var env = new Frame(null);
    env.define("eval", new PrimitiveProcedure(scheme_eval, true));
    env.define("apply", new PrimitiveProcedure(scheme_apply, true));
    add_primitives(env);
    return env;
}

function add_primitives(frame) {
    for (var name in _PRIMITIVES) {
	frame.define(name, _PRIMITIVES[name]);
    }
}

// Utility methods for checking the structure of Scheme programs

function check_form(expr, min, max) {
    // Check EXPR (default SELF.expr) is a proper list whose length is
    // at least MIN and no more than MAX (default: no maximum). Raises
    // a SchemeError if this is not the case
    if (! scheme_listp(expr)) {
	throw "SchemeError: badly formed expression: " + expr.toString();
    }
    var length = expr.length();
    if (length < min) {
	throw "SchemeError: too few operands in form";
    } else if ( (! (max === undefined)) && (length > max) ) {
	throw "SchemeError: too many operands in form";
    }
}

function check_formals(formals) {
    // Check that FORMALS is a valid parameter list, a Scheme list of symbols
    // in which each symbol is distinct
    check_form(formals, 0);
    var symbols = [];
    for (var i = 0; i < formals.length(); i++) {
	var symbol = formals.getitem(i);
	if (! scheme_symbolp(symbol)) {
	    throw "SchemeError: not a symbol: " + symbol.toString();
	}
	if (symbols.inside(symbol)) {
	    throw "SchemeError: repeated symbol in formal parameters: "
	          + symbol;
	} else {
	    symbols.push(symbol);
	}
    }
}

  var env = create_global_frame();
  var codebuffer = new Buffer(tokenize_lines([event.data]));
  
  while (codebuffer.current() != null) {
	
    var result = scheme_eval(scheme_read(codebuffer), env);
    if (! (result === null || result === undefined)) {
	  this.postMessage(result.toString());
    }
  }
    
  
};
