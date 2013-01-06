function test(code) {
}

function split_cases(code) {
    var lines = code.split("\n");
    var code_b = "";
    var result_b = "";
    var reading_result = false;
    var test_cases = {};
    
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.slice(0, 9) === "; expect ") {
            
