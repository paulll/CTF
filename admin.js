// Just for fun and security, passwords are easy-to-remember and they are random

function genWord() {

    function rand(max) {
        return Math.floor(Math.random() * (max + 1));
    }

    var chars_1 = "qwrtpsdfghjklzxcvnmQWRTPSDFGHJKLZXCVBNM1234567890".split('');
    var chars_2 = "eyuioaEYUIOA".split('');

    var word = '';

    var state = 0;

    var length = 4 + rand(7);

    for (var i = 0; i < length; i++) {
        if (state == 0) {
            word = word + chars_1[rand(chars_1.length - 1)];
            if (rand(5) !== 2) {
                state = 1;
            }
        } else {
            word = word + chars_2[rand(chars_2.length - 1)];
            if (rand(20) !== 2) {
                state = 0;
            }
        }
    }

    return word;
}

if (require('./config').AdminUIPassword) {
    exports.password = require('./config').AdminUIPassword;
} else {
    exports.password = genWord();
}


// start websocket interface //


var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: require('./config').AdminWebSocketsPort});
var peers = [];

wss.on('open', function (ws) {
    peers.push(ws);
    ws.on('message', function (data) {
        var event = JSON.parse(data);

        switch (event.type) {
            case 'news':
                db.get({
                    type: 'news'
                }, function (news) {
                    db.set({
                        type: 'newsInsert',
                        newsdata: {
                            id: news.length,
                            name: data.name,
                            data: data.data
                        }
                    });
                    ws.send(JSON.stringify({success:1}));
                });
                break;
            case 'ban':

                break;
            case 'kick':
                break;
        }

    });

    fs.readFile(__dirname + '/log.log', function (error, data) {
        if (!error) {
            var tmpLog = [];

            data.toString().split('\n').forEach(function(v){
                parts = v.split(' ');
                tmpLog.push({type: parts.shift(), data: parts.join(' ')});
            });

            broadcast({event:'InitLog', data:tmpLog});
        }
    });

    ws.on('close', function () {
        peers.splice(peers.indexOf(ws), 1);
    });
});

var broadcast = function (event) {

    var event_json = JSON.stringify(event);

    peers.forEach(function (ws) {
        setTimeout(function () {
            ws.send(event_json);
        }, 0);
    });
}

var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + '/log.log');
var util = require('util');

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return "[" + hour + ":" + min + ":" + sec + "]";

}

exports.log = function () {

    var str = '';
    var arg = [getDateTime()];

    Array.prototype.forEach.call(arguments, function (argument) {
        arg.push(argument);
        str = argument + ' ';
    });

    var text = util.format.apply(util, arg);

    console.log (text);
    log_file.write(text+'\n');
}

exports.log('[Control]', 'Admin system initialized');
exports.log('[Control]', 'Your password is', exports.password);


