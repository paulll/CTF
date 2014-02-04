var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: require('./config').WebSocketsPort});
var peers = [];
var db;

exports._setDbHandler = function (dbHandler) {
    db = dbHandler;
}

exports.listeners = {};


wss.on('open', function (ws) {

    peers.push(ws);

    db.get({
        type: 'teamBySubnet',
        subnet: ws.upgradeReq.connection.remoteAddress.split('.').splice(0,3).join('.')
    }, function (teamid) {

        if (!teamid) {
            return;
        }

        ws.on('message', function (data) {
            try {
                var event = JSON.parse(data);

                if (exports.listeners[event.type]) {
                    exports.listeners[event.type](event, teamid, function (rdata) {
                        rdata.rid = event.rid;
                        ws.send(JSON.stringify(rdata))
                    });
                }
            } catch (e) {
                require('./admin').log('[ClientError]', e);
            }
        });
    });

    ws.on('close', function () {
        peers.splice(peers.indexOf(ws), 1);
    });
});

exports.broadcast = function (event) {

    var event_json = JSON.stringify(event);

    peers.forEach(function (ws) {
        setTimeout(function () {
            ws.send(event_json);
        }, 0);
    });
}