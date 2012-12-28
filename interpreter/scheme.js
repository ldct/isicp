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
	    form.writearea.value += 
	      scheme_eval(scheme_read(codebuffer), env).toString() + "\n";
	} catch(e) {
	    console.log(e);
	    break
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
	} else if (this.parent === null) {
	    return this.parent.lookup(symbol);
	} else {
	    throw "SchemeError: unknown identifier: " + symbol.toString;
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

function do_and_form() {}
function do_or_form() {}
function do_if_form() {}
function do_cond_form() {}
function do_begin_form() {}

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
