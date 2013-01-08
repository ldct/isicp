function test(str, out) {
    // Runs the test code in a single global environment.
    var test_cases = split_cases(str);
    var worker = new Worker("scheme_worker.js");
    var eval_result = "";
    var code = "";

    out.value += "Running Tests...\n";
    
    worker.onmessage = function(e) {
        if (e.data.end) {
            check_tests(test_cases, eval_result, out);
            worker.terminate();
            return;
        }
        eval_result += e.data;
    }
    
    for (var i = 0; i < test_cases.length; i++) {
        code += test_cases[i][0];
    }
    
    worker.postMessage(code);
}

function check_tests(test_cases, eval_result, out) {
    var code, result, curr_result, result_num_lines;
    var failed = 0;
    var total = test_cases.length;
    var eval_lines = eval_result.split("\n");

    for (var i = 0; i < test_cases.length; i++) {
        code = test_cases[i][0];
        result = test_cases[i][1];
        result_num_lines = result.split("\n").length - 1;
        curr_result = eval_lines.slice(0, result_num_lines).join("\n") + "\n";
        if ( curr_result !== result) {
            out.value +=  "\n################\n\nFAILED TEST:" + code + 
                "\nEXPECTED:\n" + result + "\n\GOT:\n" + curr_result;
            failed += 1;
        }
        eval_lines = eval_lines.slice(result_num_lines);
    }

    out.value += "\nRan "+ total +" test(s). Successful: "+ (total - failed)
         +" Failed: " + failed;
}

function split_cases(code) {
    // Takes in a chunk of code and returns an array containing test cases. 
    // Each test case is an array, with its first entry the code to run, and the
    // second entry is the result to compare with.
    
    var lines = code.split("\n");
    var code_b = "";
    var result_b = "";
    var reading_result = false;
    var test_cases = [];
    
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var result_line = (line.slice(0, 9) === "; expect ");

        if (reading_result && (! result_line)) {
            test_cases.push([code_b, result_b]);
            reading_result = false;
            code_b = "";
            result_b = "";
        }
        
        if (result_line) {
            result_b += line.slice(9) + "\n";
            reading_result = true;
        } else {
            code_b += line + "\n";
        }
    }

    if (reading_result) {
        test_cases.push([code_b, result_b]);
    }

    return test_cases;
}
        
            
