
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
    return val.toString();
}
_PRIMITIVES["display"] = new PrimitiveProcedure(scheme_display);

function scheme_print(val) {
    return val.toString() + "\n";
}
_PRIMITIVES["print"] = new PrimitiveProcedure(scheme_print);

function scheme_newline() {
    return "\n";
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
