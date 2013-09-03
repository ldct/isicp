function arrayEq(arr1, arr2) {
  return $(arr1).not(arr2).length == 0 && $(arr2).not(arr1).length == 0
}

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function isarray(e) {
  return (e.length && typeof e !== "string");
}

function shuffle(myArray) {
  var i = myArray.length;
  if ( i == 0 ) return false;
  while ( --i ) {
     var j = Math.floor( Math.random() * ( i + 1 ) );
     var tempi = myArray[i];
     var tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
}

String.prototype.format = function () {
    var o = Array.prototype.slice.call(arguments);
    return this.replace(/{([^{}]*)}/g,
        function (match, capture) {
            var r = o[capture];
            return (typeof r === 'string' || typeof r === 'number') ? r : match;
        }
    );
};